import React, { useState, useCallback, useEffect } from 'react';
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,

  ActivityIndicator,
  StyleSheet,
  Modal,
  RefreshControl,
  Linking,
} from 'react-native';
import X from 'lucide-react-native/dist/esm/icons/x';
import Bed from 'lucide-react-native/dist/esm/icons/bed';
import InfoIcon from 'lucide-react-native/dist/esm/icons/info';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import SearchIcon from 'lucide-react-native/dist/esm/icons/search';
import Umbrella from 'lucide-react-native/dist/esm/icons/umbrella';
import Utensils from 'lucide-react-native/dist/esm/icons/utensils';
import { Place } from './TimelineItem';
import KakaoMapView from './KakaoMapView';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { usePlaces } from '../../../contexts/PlacesContext';
import { useAlert } from '../../../contexts/AlertContext';
import { PlaceVO } from '../../../api/trips';
import { GoogleMapsIcon } from '../../../components/common';
import { tokens } from '../../../theme/tokens';
import { normalizeCategoryId } from '../../../utils/placeCategory';
const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

const getCategoryType = (
  id: number,
): '관광지' | '숙소' | '식당' | '직접 추가' | '검색' | '기타' => {
  if ([0, 12, 14, 15, 28].includes(id)) return '관광지';
  if (id === 1 || id === 32) return '숙소';
  if (id === 2 || id === 39) return '식당';
  if (id === 3) return '직접 추가';
  if (id === 4) return '검색';
  return '기타';
};

const TAB_COLORS: { [key in PlaceTab]: string } = {
  관광지: '#84cc16',
  숙소: '#f97316',
  식당: '#3b82f6',
  '직접 추가': '#8b5cf6',
  검색: tokens.colors.textSecondary,
};

type PlaceTab = '관광지' | '숙소' | '식당' | '직접 추가' | '검색';

const TAB_TO_PLACES_FIELD: Partial<
  Record<PlaceTab, 'tour' | 'lodging' | 'restaurant'>
> = {
  관광지: 'tour',
  숙소: 'lodging',
  식당: 'restaurant',
};

type EmptyStateConfig = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  note?: string;
};

const EMPTY_STATE_CONFIG: Record<
  Exclude<PlaceTab, '검색'>,
  EmptyStateConfig
> = {
  관광지: {
    icon: Umbrella,
    iconColor: '#84cc16',
    iconBackground: '#ecfccb',
    title: '관광지 추천장소가 존재하지 않아요.',
    subtitle: "'직접 추가' 탭에서 장소를 직접 넣을 수 있어요!",
  },
  숙소: {
    icon: Bed,
    iconColor: '#f97316',
    iconBackground: '#ffedd5',
    title: '숙소 추천장소가 존재하지 않아요.',
    subtitle: "'직접 추가' 탭에서 장소를 직접 넣을 수 있어요!",
  },
  식당: {
    icon: Utensils,
    iconColor: '#3b82f6',
    iconBackground: '#dbeafe',
    title: '식당 추천장소가 존재하지 않아요.',
    subtitle: "'직접 추가' 탭에서 장소를 직접 넣을 수 있어요!",
  },
  '직접 추가': {
    icon: Pencil,
    iconColor: '#8b5cf6',
    iconBackground: '#ede9fe',
    title: "위 일정에 맞춰 장소 이름을 입력하고 '추가' 버튼을 눌러보세요.",
    subtitle: '추가된 장소는 일정에 바로 반영돼요.',
    note: '추가된 장소는 순서에 따라 자동 저장돼요.',
  },
};

function placeVOToPlace(
  p: PlaceVO,
  tabOverride?: string,
): Omit<Place, 'startTime' | 'endTime'> {
  const type = tabOverride
    ? (tabOverride as Place['type'])
    : getCategoryType(p.categoryId);
  return {
    id: p.placeId,
    placeRefId: p.placeId,
    categoryId: normalizeCategoryId(p.categoryId, type),
    name: p.name,
    type,
    address: p.formatted_address,
    rating: p.rating,
    imageUrl: p.photoUrl || p.iconUrl || '',
    latitude: p.yLocation ?? p.ylocation ?? 0,
    longitude: p.xLocation ?? p.xlocation ?? 0,
    contentTypeId: p.contentTypeId || '',
    copyrightDivCd: p.copyrightDivCd || '',
  };
}

const PlaceImage = React.memo(
  ({
    placeId,
    iconUrl,
    name,
  }: {
    placeId: string;
    iconUrl?: string;
    name: string;
  }) => {
    const [hasError, setHasError] = useState(false);

    const primaryUrl = placeId
      ? resolveApiUrl(`/image/place/${encodeURIComponent(placeId)}`)
      : '';
    const fallbackUrl = iconUrl || '';
    const currentUrl = hasError ? fallbackUrl : primaryUrl;

    if (!currentUrl) {
      return (
        <View style={[plStyles.placeImage, plStyles.placeholderImage]}>
          <Text style={plStyles.placeholderText}>{name?.charAt(0) || '?'}</Text>
        </View>
      );
    }

    return (
      <FastImage
        source={{
          uri: currentUrl,
          priority: FastImage.priority.normal,
        }}
        style={plStyles.placeImage}
        resizeMode={FastImage.resizeMode.cover}
        onError={() => {
          if (!hasError) {
            setHasError(true);
          }
        }}
      />
    );
  },
);

const PlaceMapModal = React.memo(
  ({
    visible,
    place,
    onClose,
  }: {
    visible: boolean;
    place: PlaceVO | null;
    onClose: () => void;
  }) => {
    if (!place) return null;

    const lat = place.yLocation ?? place.ylocation ?? 0;
    const lng = place.xLocation ?? place.xlocation ?? 0;

    if (lat === 0 && lng === 0) return null;

    const mapPlaces = [
      {
        id: place.placeId,
        name: place.name,
        address: place.formatted_address,
        latitude: lat,
        longitude: lng,
      },
    ];

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        <View style={plStyles.mapModalContainer}>
          <View style={plStyles.mapModalHeader}>
            <Text style={plStyles.mapModalTitle} numberOfLines={1}>
              {place.name}
            </Text>
            <TouchableOpacity onPress={onClose} style={plStyles.mapModalClose}>
              <X size={16} color={tokens.colors.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <KakaoMapView places={mapPlaces} style={plStyles.mapModalMap} />
        </View>
      </Modal>
    );
  },
);

interface PlaceRecommendationListProps {
  destination?: string;

  travelId: number | null;
  onAddPlace: (place: Omit<Place, 'startTime' | 'endTime'>) => void;
}

export default function PlaceRecommendationList({
  destination,
  travelId,
  onAddPlace,
}: PlaceRecommendationListProps) {
  const {
    tour,
    lodging,
    restaurant,
    tourHasNext,
    lodgingHasNext,
    restaurantHasNext,
    isLoading,
    loadMorePlaces,
    fetchAllRecommendations,
    isPetFriendly,
    setPetFriendly,
  } = usePlaces();

  const { showAlert } = useAlert();
  const [selectedTab, setSelectedTab] = useState<PlaceTab>('관광지');
  const [customPlaceName, setCustomPlaceName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setPetFriendly(false);
  }, [setPetFriendly]);

  const handleRefresh = useCallback(async () => {
    if (!travelId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchAllRecommendations(travelId, true);
    } finally {
      setIsRefreshing(false);
    }
  }, [travelId, isRefreshing, fetchAllRecommendations]);

  const handleDirectAdd = useCallback(() => {
    const trimmedName = customPlaceName.trim();

    if (!trimmedName) {
      return;
    }

    const placeId = `custom_${Date.now()}`;
    onAddPlace({
      id: placeId,
      placeRefId: placeId,
      name: trimmedName,
      type: '직접 추가',
      categoryId: 3,
      address: destination ?? '',
      rating: 0,
      imageUrl: '',
      latitude: 0,
      longitude: 0,
    });
    setCustomPlaceName('');
  }, [customPlaceName, destination, onAddPlace]);

  const getTabData = (): PlaceVO[] => {
    let rawData: PlaceVO[] = [];
    switch (selectedTab) {
      case '관광지':
        rawData = tour;
        break;
      case '숙소':
        rawData = lodging;
        break;
      case '식당':
        rawData = restaurant;
        break;
      default:
        rawData = [];
    }

    if (isPetFriendly) {
      const keywords = ['반려', '애견', '동반', '펫', 'pet', 'dog', '동물', '카페', '펜션', '공원', '해수욕장', '캠핑'];
      return rawData.filter(item => {
        const name = item.name || '';
        const address = item.formatted_address || '';
        return keywords.some(keyword => name.toLowerCase().includes(keyword) || address.toLowerCase().includes(keyword));
      });
    }
    return rawData;
  };

  const checkHasMoreData = (): boolean => {
    switch (selectedTab) {
      case '관광지':
        return tourHasNext;
      case '숙소':
        return lodgingHasNext;
      case '식당':
        return restaurantHasNext;
      default:
        return false;
    }
  };

  const tabData = getTabData();
  const hasMoreData = checkHasMoreData();

  const handleLoadMore = useCallback(() => {
    if (!hasMoreData || isLoading) return;
    const field = TAB_TO_PLACES_FIELD[selectedTab];
    if (!field) return;
    loadMorePlaces(field);
  }, [hasMoreData, isLoading, loadMorePlaces, selectedTab]);

  const [mapPlace, setMapPlace] = useState<PlaceVO | null>(null);
  const [isMapVisible, setMapVisible] = useState(false);

  const handleCloseMap = useCallback(() => {
    setMapVisible(false);
    setMapPlace(null);
  }, []);

  const handleOpenGoogleMaps = useCallback(async (item: PlaceVO) => {
    const lat = item.yLocation ?? item.ylocation;
    const lng = item.xLocation ?? item.xlocation;

    if (!lat || !lng) {
      showAlert({
        title: '지도를 열 수 없음',
        message: '이 장소의 위치 정보가 없어요.',
        type: 'error',
      });
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${item.placeId}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {

        showAlert({
          title: '지도를 열 수 없음',
          message: '이 기기에서 구글 지도를 열 수 없어요.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to open Google Maps:', error);
    }
  }, [showAlert]);

  const renderPlaceItem = useCallback(({ item }: { item: PlaceVO }) => {
    const type = getCategoryType(item.categoryId);

    return (
      <TouchableOpacity
        style={plStyles.placeCard}
        activeOpacity={0.7}
        onPress={() => onAddPlace(placeVOToPlace(item, type))}
      >

        <PlaceImage
          placeId={item.placeId}
          iconUrl={item.iconUrl}
          name={item.name}
        />

        <View style={plStyles.placeInfo}>
          <Text style={plStyles.placeName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={plStyles.metaRow}>
            {item.rating > 0 && (
              <View style={plStyles.ratingContainer}>
                <Text style={plStyles.starIcon}>★</Text>
                <Text style={plStyles.ratingText}>{item.rating}</Text>
              </View>
            )}
            <Text style={plStyles.addressText} numberOfLines={1}>
              {item.formatted_address}
            </Text>
          </View>
        </View>

        <View style={plStyles.actionGroup}>
          <TouchableOpacity
            style={plStyles.mapButton}
            onPress={e => {
              e.stopPropagation?.();
              handleOpenGoogleMaps(item);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <GoogleMapsIcon size={20} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [onAddPlace, handleOpenGoogleMaps]);

  const renderFooter = useCallback(() => {
    if (isLoading) {
      return (
        <View style={plStyles.footerLoading}>
          <ActivityIndicator size="small" color={tokens.colors.primary} />
        </View>
      );
    }
    if (hasMoreData) {
      return (
        <TouchableOpacity
          style={plStyles.loadMoreButton}
          onPress={handleLoadMore}
        >
          <Text style={plStyles.loadMoreText}>더 불러오기</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }, [isLoading, hasMoreData, handleLoadMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    if (selectedTab === '검색') {
      return (
        <View style={plStyles.emptyContainer}>
          <View style={[plStyles.emptyIconWrapper, plStyles.emptyIconSearch]}>
            <SearchIcon size={28} color={tokens.colors.textTertiary} />
          </View>
          <Text style={plStyles.emptyTitle}>장소 검색은 준비 중이에요.</Text>
          <Text style={plStyles.emptySubtitle}>
            지금은 관광지·숙소·식당 탭에서 추천 장소를 담을 수 있어요.
          </Text>
          <Text style={plStyles.emptySubtitle}>
            찾는 장소가 없다면 '직접 추가' 탭을 이용해보세요.
          </Text>
        </View>
      );
    }

    const config = EMPTY_STATE_CONFIG[selectedTab];

    return (
      <View style={plStyles.emptyContainer}>
        <View
          style={[
            plStyles.emptyIconWrapper,
            { backgroundColor: config.iconBackground },
          ]}
        >
          <config.icon size={28} color={config.iconColor} />
        </View>
        <Text style={plStyles.emptyTitle}>{config.title}</Text>
        <Text style={plStyles.emptySubtitle}>{config.subtitle}</Text>
        {config.note && (
          <View style={plStyles.emptyNotePill}>
            <InfoIcon size={12} color={tokens.colors.textSecondary} />
            <Text style={plStyles.emptyNoteText}>{config.note}</Text>
          </View>
        )}
      </View>
    );
  }, [isLoading, selectedTab]);

  const renderHeader = useCallback(() => {

    if (selectedTab === '검색') {
      return null;
    }

    if (selectedTab === '직접 추가') {
      return (
        <View style={plStyles.searchContainer}>
          <View style={plStyles.searchField}>
            <Pencil size={16} color="#8B5CF6" />
            <TextInput
              value={customPlaceName}
              onChangeText={setCustomPlaceName}
              onSubmitEditing={handleDirectAdd}
              placeholder="장소 이름을 입력하세요"
              placeholderTextColor={tokens.colors.textTertiary}
              returnKeyType="done"
              style={plStyles.searchInput}
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={[
              plStyles.searchActionButton,
              !customPlaceName.trim()
                ? plStyles.searchActionButtonDisabled
                : plStyles.searchActionButtonPurple,
            ]}
            onPress={handleDirectAdd}
            disabled={!customPlaceName.trim()}
            activeOpacity={0.85}
          >
            <Text style={plStyles.searchActionButtonText}>추가</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }, [selectedTab, customPlaceName, handleDirectAdd]);

  return (
    <View style={plStyles.container}>

      <View style={plStyles.tabContainer}>
        {(['관광지', '숙소', '식당', '직접 추가', '검색'] as PlaceTab[]).map(
          tab => {
            const isSelected = selectedTab === tab;
            const tabColor = TAB_COLORS[tab];
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  plStyles.tab,
                  plStyles.categoryTabBase,
                  isSelected && {
                    backgroundColor: tabColor,
                    borderColor: tabColor,
                  },
                ]}
              >
                <Text
                  style={[
                    plStyles.tabText,
                    plStyles.categoryTabText,
                    isSelected && { color: tokens.colors.white, fontFamily: FONTS.bold },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>

      <FlatList
        data={tabData}
        keyExtractor={(item, index) => `${item.placeId}_${index}`}
        renderItem={renderPlaceItem}

        ListEmptyComponent={renderEmpty()}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter()}
        contentContainerStyle={plStyles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[tokens.colors.primary]}
            tintColor={tokens.colors.primary}
          />
        }
      />

      <PlaceMapModal
        visible={isMapVisible}
        place={mapPlace}
        onClose={handleCloseMap}
      />
    </View>
  );
}

const plStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    borderBottomColor: tokens.colors.primary,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabDotInactive: {
    backgroundColor: '#D1D5DB',
  },
  tabText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: tokens.colors.textTertiary,
  },
  tabTextSelected: {
    color: tokens.colors.primary,
    fontFamily: FONTS.bold,
  },
  categoryTabBase: {
    backgroundColor: tokens.colors.white,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  categoryTabText: {
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    gap: 10,
  },
  searchField: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    color: tokens.colors.text,
    fontFamily: FONTS.regular,
  },
  searchActionButton: {
    minWidth: 74,
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  searchActionButtonPurple: {
    backgroundColor: '#8B5CF6',
  },
  searchActionButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  searchActionButtonText: {
    color: tokens.colors.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  placeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: tokens.colors.textTertiary,
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    gap: 4,
  },
  placeName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    color: '#FACC15',
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: FONTS.regular,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.textSecondary,
    fontFamily: FONTS.regular,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  mapModalTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    color: tokens.colors.text,
    marginRight: 12,
  },
  mapModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapModalMap: {
    flex: 1,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: tokens.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: tokens.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 360,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyIconSearch: {
    backgroundColor: tokens.colors.borderLight,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 25,
    color: tokens.colors.text,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: tokens.colors.textTertiary,
    fontFamily: FONTS.regular,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyNotePill: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: tokens.colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyNoteText: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONTS.medium,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  filterLabelRow: {
    flexDirection: 'column',
    gap: 2,
  },
  filterLabelText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: tokens.colors.text,
  },
  filterSubText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: tokens.colors.textSecondary,
  },
  filterToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  filterToggleActive: {
    backgroundColor: '#10B981',
  },
  filterToggleInactive: {
    backgroundColor: '#D1D5DB',
  },
  filterToggleBall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterToggleBallActive: {
    alignSelf: 'flex-end',
  },
  filterToggleBallInactive: {
    alignSelf: 'flex-start',
  },
});
