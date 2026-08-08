import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import {
  X,
  MapPin,
  Map,
} from 'lucide-react-native';

import { styles, COLORS } from './SearchLocationModal.styles';
import { DESTINATIONS_28, REGION_GROUPS } from '../../constants/regions';
import { isRegionMatch } from '../../utils/regionMatcher';
import { resolveApiUrl } from '../../utils/apiUrl';

interface DestinationDto {
  destinationId: number;
  destinationName: string;
}

interface TravelVO {
  travelId: number;
  travelName: string;
  region?: string;
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

/** 서버 응답과 폴백을 합쳐 화면에서 쓰는 형태로 정규화한다. */
const toTravelVO = (item: any): TravelVO => {
  const dId = item.destinationId ?? item.travelId ?? -1;
  const dName = item.destinationName ?? item.travelName ?? '';
  const fallbackObj = DESTINATIONS_28.find(d => isRegionMatch(d.name, dName));
  return {
    travelId: dId,
    travelName: dName,
    region: fallbackObj?.region || '기타',
    travelCategoryId: item.travelCategoryId ?? 0,
    travelCategoryName: item.travelCategoryName ?? '',
    travelImg: item.travelImg,
  };
};

const FALLBACK_DESTINATIONS: TravelVO[] = DESTINATIONS_28.map(d => ({
  travelId: d.id,
  travelName: d.name,
  region: d.region,
}));

const fetchDestinations = async (): Promise<TravelVO[]> => {
  try {
    const response = await axios.get(resolveApiUrl('/api/destination'));
    // DestinationListResponse는 destinations 하나뿐이다.
    const rawList: DestinationDto[] = response.data.destinations || [];

    const serverData = rawList.map(toTravelVO);
    // 서버가 빈 목록을 주면 내장 28개 목록으로 대체한다.
    return serverData.length > 0 ? serverData : FALLBACK_DESTINATIONS;
  } catch (error) {
    console.error('Failed to fetch destinations:', error);
    return FALLBACK_DESTINATIONS;
  }
};

/**
 * 여행지 목록.
 *
 * 28개 고정 데이터라 사실상 변하지 않는데 모달을 열 때마다 다시 불러오고 있었다.
 * 앱 실행 중에는 캐시를 재사용한다.
 */
const useDestinations = (enabled: boolean) =>
  useQuery({
    queryKey: ['destinations'],
    queryFn: fetchDestinations,
    enabled,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });

export default function SearchLocationModal({
  visible,
  onClose,
  onSelect,
  currentValue,
}: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string>('전체');
  const [selectedDestination, setSelectedDestination] = useState<TravelVO | null>(null);

  const { data, isLoading } = useDestinations(visible);
  const destinations = data ?? [];

  useEffect(() => {
    if (visible) {
      setSelectedGroup('전체');
      setSelectedDestination(null);
    }
  }, [visible]);

  // 목록이 준비되면 현재 값과 일치하는 항목을 미리 골라 둔다.
  useEffect(() => {
    if (!visible || !currentValue || !data) return;
    const initialMatch = data.find(d => isRegionMatch(d.travelName, currentValue));
    if (initialMatch) {
      setSelectedDestination(initialMatch);
    }
  }, [visible, currentValue, data]);

  const handleDestinationSelect = (item: TravelVO) => {
    setSelectedDestination(item);
  };

  const handleConfirmDestination = () => {
    if (!selectedDestination) return;

    if (__DEV__) {
      console.log(
        `Selection: ${selectedDestination.travelName}, Mapped ID: ${selectedDestination.travelId}`,
      );
    }

    onSelect(selectedDestination.travelName, selectedDestination.travelId);
    onClose();
  };

  const filteredDestinations = selectedGroup === '전체'
    ? destinations
    : destinations.filter(d => d.region === selectedGroup);

  const title = '여행지 선택';
  const subtitle = '여행할 지역을 선택해주세요 (28개 도시)';

  const isConfirmDisabled = !selectedDestination;

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
            {/* 권역 선택 카테고리 칩 */}
            <View style={styles.chipSectionContainer}>
              <View style={styles.sectionHeader}>
                <Map size={16} color={COLORS.primary} strokeWidth={1.5} />
                <Text style={styles.sectionTitle}>권역 필터</Text>
              </View>
              <View style={styles.chipContainer}>
                {REGION_GROUPS.map(group => {
                  const isSelected = selectedGroup === group;
                  return (
                    <TouchableOpacity
                      key={group}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setSelectedGroup(group)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {group}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 28개 여행지 목록 칩 */}
            <View style={styles.chipSectionContainer}>
              <View style={styles.sectionHeader}>
                <MapPin size={16} color={COLORS.primary} strokeWidth={1.5} />
                <Text style={styles.sectionTitle}>
                  여행지 목록 ({filteredDestinations.length}개)
                </Text>
              </View>
              <View style={styles.chipContainer}>
                {filteredDestinations.map(item => {
                  const isSelected = selectedDestination?.travelId === item.travelId;
                  return (
                    <TouchableOpacity
                      key={item.travelId > 0 ? item.travelId : item.travelName}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleDestinationSelect(item)}
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
          </>
        )}
      </ScrollView>

      {/* 확인 버튼 */}
      <View style={styles.confirmFooter}>
        <Pressable
          style={[
            styles.confirmButton,
            isConfirmDisabled && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmDestination}
          disabled={isConfirmDisabled}
        >
          <Text
            style={[
              styles.confirmButtonText,
              isConfirmDisabled && styles.confirmButtonTextDisabled,
            ]}
          >
            {selectedDestination
              ? `${selectedDestination.travelName} 선택`
              : '여행지를 선택해주세요'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
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
