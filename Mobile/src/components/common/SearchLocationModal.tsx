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
import { isRegionMatch, getRegionBase } from '../../utils/regionMatcher';
import { resolveApiUrl } from '../../utils/apiUrl';

interface DestinationDto {
  destinationId: number;
  destinationName: string;
}

interface TravelVO {
  travelId: number;
  travelName: string;
  travelCategoryId?: number;
  travelCategoryName?: string;
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
      const response = await axios.get(resolveApiUrl('/api/destination'));
      const rawList: DestinationDto[] =
        response.data.destinations || response.data.travels || [];

      if (__DEV__) {
        console.log('Fetched Destinations:', rawList);
      }

      const serverData: TravelVO[] = rawList.map((item: any) => ({
        travelId: item.destinationId ?? item.travelId ?? -1,
        travelName: item.destinationName ?? item.travelName ?? '',
        travelCategoryId: item.travelCategoryId ?? 0,
        travelCategoryName: item.travelCategoryName ?? '',
        travelImg: item.travelImg,
      }));

      setRawDestinations(serverData);

      // Filter parent regions to only those that match or whose sub-regions match backend destinations
      const formattedList = TARGET_REGIONS.filter(parentName => {
        const isDirectMatch = serverData.some(dest => isRegionMatch(dest.travelName, parentName));
        if (isDirectMatch) return true;
        const subRegions = SUB_REGIONS[parentName] || [];
        return subRegions.some(sub => serverData.some(dest => isRegionMatch(dest.travelName, sub)));
      }).map(parentName => {
        const matched = serverData.find(item => isRegionMatch(item.travelName, parentName));
        return {
          travelId: matched ? matched.travelId : -1,
          travelName: parentName,
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

  /** Helper to get sub regions supported by current rawDestinations */
  const getSupportedSubRegions = (parentRegion: string): string[] => {
    const rawSubs = SUB_REGIONS[parentRegion] || [];
    if (rawDestinations.length === 0) return rawSubs;

    // Check if parent region itself is a direct single-city destination (e.g. 서울, 부산, 대구, 인천, 광주, 대전)
    const isDirectParentDest = rawDestinations.some(d => {
      const baseD = getRegionBase(d.travelName);
      const baseP = getRegionBase(parentRegion);
      return baseD.length > 0 && baseD === baseP;
    });

    if (isDirectParentDest) {
      return rawSubs;
    }

    // For province categories (도 단위), strictly filter to only sub-regions matching backend destinations
    return rawSubs.filter(sub =>
      rawDestinations.some(d => isRegionMatch(d.travelName, sub)),
    );
  };

  const handleConfirmDestination = () => {
    if (!selectedParentRegion || !selectedSubRegion) return;

    const fullLocation = `${selectedParentRegion} ${selectedSubRegion}`;

    // 1. First, check if any travel matches the parent region (e.g. "서울특별시" -> "서울")
    let matched = rawDestinations.find(d => isRegionMatch(d.travelName, selectedParentRegion));

    // 2. Next, check if any travel matches the sub-region (e.g. "공주시" -> "공주", "가평군" -> "가평")
    if (!matched) {
      matched = rawDestinations.find(d => isRegionMatch(d.travelName, selectedSubRegion));
    }

    // 3. Fallback to check the full location
    if (!matched) {
      matched = rawDestinations.find(d => isRegionMatch(d.travelName, fullLocation));
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
                  {getSupportedSubRegions(selectedParentRegion).map(subRegion => {
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
