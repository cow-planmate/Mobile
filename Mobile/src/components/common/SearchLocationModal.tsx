import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import {
  X,
  MapPin,
  Map,
} from 'lucide-react-native';

import { styles, COLORS } from './SearchLocationModal.styles';
import { TARGET_REGIONS, SUB_REGIONS } from '../../constants/regions';

interface TravelVO {
  travelId: number;
  travelName: string;
  travelCategoryId: number;
  travelCategoryName: string;
  travelImg?: string;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: string, id?: number) => void;
  currentValue?: string;
};

export default function SearchLocationModal({
  visible,
  onClose,
  onSelect,
}: Props) {
  const [destinationList, setDestinationList] = useState<TravelVO[]>([]);
  const [rawDestinations, setRawDestinations] = useState<TravelVO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedParentRegion, setSelectedParentRegion] = useState<
    string | null
  >(null);
  const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (visible) {
      setSelectedParentRegion(null);
      setSelectedSubRegion(null);
      fetchDestinations();
    }
  }, [visible]);

  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/travel`);
      const serverData: TravelVO[] = response.data.travels || [];

      if (__DEV__) {
        console.log('Fetched Travels:', serverData);
      }

      setRawDestinations(serverData);

      const formattedList = TARGET_REGIONS.map((regionName) => {
        const matched = serverData.find(item => {
          const sName = item.travelName.replace(/\s+/g, '');
          const rName = regionName.replace(/\s+/g, '');
          return sName.includes(rName) || rName.includes(sName);
        });

        return {
          travelId: matched ? matched.travelId : -1,
          travelName: regionName,
          travelImg: matched?.travelImg,
          travelCategoryId: matched ? matched.travelCategoryId : 0,
          travelCategoryName: matched ? matched.travelCategoryName : '',
        };
      });

      setDestinationList(formattedList);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);

      const fallbackList = TARGET_REGIONS.map((name, index) => ({
        travelId: index,
        travelName: name,
        travelCategoryId: 0,
        travelCategoryName: '',
      }));
      setDestinationList(fallbackList);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentRegionClick = (regionName: string) => {
    if (selectedParentRegion === regionName) {
      setSelectedParentRegion(null);
      setSelectedSubRegion(null);
    } else {
      setSelectedParentRegion(regionName);
      setSelectedSubRegion(null);
    }
  };

  const handleSubRegionSelect = (parentRegion: string, subRegion: string) => {
    setSelectedSubRegion(subRegion);
  };

  const handleConfirmDestination = () => {
    if (!selectedParentRegion || !selectedSubRegion) return;

    const fullLocation = `${selectedParentRegion} ${selectedSubRegion}`;

    let matched = rawDestinations.find(d => {
      const sName = d.travelName.replace(/\s+/g, '');
      const target = selectedSubRegion.replace(/\s+/g, '');
      return sName === target;
    });

    if (!matched) {
      matched = rawDestinations.find(d => {
        const sName = d.travelName.replace(/\s+/g, '');
        const target = selectedSubRegion.replace(/\s+/g, '');
        return sName.includes(target) || target.includes(sName);
      });
    }

    if (!matched) {
      matched = rawDestinations.find(d => {
        const sName = d.travelName.replace(/\s+/g, '');
        const target = selectedParentRegion.replace(/\s+/g, '');
        return sName.includes(target) || target.includes(sName);
      });
    }

    const travelId = matched ? matched.travelId : -1;

    if (__DEV__) {
      console.log(
        `Selection: ${fullLocation}, Mapped ID: ${travelId}, Matched Name: ${matched?.travelName}`,
      );
    }

    onSelect(fullLocation, travelId);
    onClose();
  };

  const title = '여행지 선택';
  const subtitle = '여행할 지역을 선택해주세요';

  const renderDestinationContent = () => (
    <View style={styles.destinationWrapper}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.destinationScrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.inlineLoaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>불러오는 중...</Text>
          </View>
        ) : (
          <>
            {/* 상위 지역 칩 */}
            <View style={styles.chipSectionContainer}>
              <View style={styles.sectionHeader}>
                <Map size={16} color={COLORS.primary} strokeWidth={1.5} />
                <Text style={styles.sectionTitle}>지역 선택</Text>
              </View>
              <View style={styles.chipContainer}>
                {destinationList.map(item => {
                  const isSelected = selectedParentRegion === item.travelName;
                  return (
                    <TouchableOpacity
                      key={item.travelName}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleParentRegionClick(item.travelName)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {item.travelName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 하위 지역 칩 */}
            {selectedParentRegion && (
              <View style={styles.chipSectionContainer}>
                <View style={styles.sectionHeader}>
                  <MapPin size={16} color={COLORS.primary} strokeWidth={1.5} />
                  <Text style={styles.sectionTitle}>
                    {selectedParentRegion}
                  </Text>
                </View>
                <View style={styles.chipContainer}>
                  {(SUB_REGIONS[selectedParentRegion] || []).map(subRegion => {
                    const isSelected = selectedSubRegion === subRegion;
                    return (
                      <TouchableOpacity
                        key={subRegion}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() =>
                          handleSubRegionSelect(selectedParentRegion, subRegion)
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {subRegion}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 확인 버튼 */}
      <View style={styles.confirmFooter}>
        <Pressable
          style={[
            styles.confirmButton,
            !(selectedParentRegion && selectedSubRegion) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmDestination}
          disabled={!(selectedParentRegion && selectedSubRegion)}
        >
          <Text
            style={[
              styles.confirmButtonText,
              !(selectedParentRegion && selectedSubRegion) &&
                styles.confirmButtonTextDisabled,
            ]}
          >
            {selectedSubRegion
              ? `${selectedParentRegion} ${selectedSubRegion} 선택`
              : '지역을 선택해주세요'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalView}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={20} color={COLORS.subtext} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {renderDestinationContent()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
