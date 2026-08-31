import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';

import PopupModal from './PopupModal';
import { styles, COLORS } from './SearchLocationModal.styles';
import { DESTINATIONS_28 } from '../../constants/regions';
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
  onDone?: () => void;
};

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

const fetchDestinations = async (signal?: AbortSignal): Promise<TravelVO[]> => {
  try {
    const response = await axios.get(resolveApiUrl('/api/destination'), { signal });

    const rawList: DestinationDto[] = response.data.destinations || [];

    const serverData = rawList.map(toTravelVO);

    return serverData.length > 0 ? serverData : FALLBACK_DESTINATIONS;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    console.error('Failed to fetch destinations:', error);
    return FALLBACK_DESTINATIONS;
  }
};

const useDestinations = (enabled: boolean) =>
  useQuery({
    queryKey: ['destinations'],
    queryFn: ({ signal }) => fetchDestinations(signal),
    enabled,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });

export default function SearchLocationModal({
  visible,
  onClose,
  onSelect,
  currentValue,
  onDone,
}: Props) {
  const [selectedDestination, setSelectedDestination] = useState<TravelVO | null>(null);

  const { data, isLoading } = useDestinations(visible);
  const destinations = data ?? [];

  useEffect(() => {
    if (visible) {
      setSelectedDestination(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !currentValue || !data) return;
    const initialMatch = data.find(d => isRegionMatch(d.travelName, currentValue));
    if (initialMatch) {
      setSelectedDestination(initialMatch);
    }
  }, [visible, currentValue, data]);

  // 탭이 곧 선택이다. 팝업은 열린 채로 두어 뒤쪽 명소 사진이 바뀌는 것을 바로 보여준다.
  const handleDestinationSelect = (item: TravelVO) => {
    setSelectedDestination(item);
    onSelect(item.travelName, item.travelId);
  };

  // 아무것도 고르지 않고 닫으면 다음 단계로 넘기지 않는다.
  const handleDone = () => {
    if (selectedDestination) onDone?.();
  };

  return (
    <PopupModal
      visible={visible}
      title="여행지 선택"
      onClose={onClose}
      onDone={handleDone}
      doneAction="next"
    >
      {isLoading ? (
        <View style={styles.inlineLoaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridScroll}
        >
          <View style={styles.grid}>
            {destinations.map(item => {
              const isSelected = selectedDestination?.travelId === item.travelId;
              return (
                <TouchableOpacity
                  key={item.travelId > 0 ? item.travelId : item.travelName}
                  style={styles.gridCell}
                  onPress={() => handleDestinationSelect(item)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.cell, isSelected && styles.cellSelected]}>
                    <Text
                      style={[
                        styles.cellText,
                        isSelected && styles.cellTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {item.travelName}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </PopupModal>
  );
}
