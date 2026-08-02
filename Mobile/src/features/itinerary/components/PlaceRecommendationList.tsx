import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faBed,
  faCircleInfo,
  faMagnifyingGlass,
  faPencil,
  faUmbrellaBeach,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';
import { X } from 'lucide-react-native';
import { Place } from './TimelineItem';
import KakaoMapView from './KakaoMapView';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { usePlaces } from '../../../contexts/PlacesContext';
import { PlaceVO } from '../../../api/trips';
import { GoogleMapsIcon } from '../../../components/common';
const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// ────────────────────────────────────────────────
// Category helpers (matching Frontend)
// ────────────────────────────────────────────────

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
  검색: '#6b7280',
};

type PlaceTab = '관광지' | '숙소' | '식당' | '직접 추가' | '검색';

/** 탭 라벨 → PlacesContext의 페이지네이션 필드 */
const TAB_TO_PLACES_FIELD: Record<
  PlaceTab,
  'tour' | 'lodging' | 'restaurant' | 'search'
> = {
  관광지: 'tour',
  숙소: 'lodging',
  식당: 'restaurant',
  '직접 추가': 'search',
  검색: 'search',
};

type EmptyStateConfig = {
  icon: IconDefinition;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  note?: string;
};

const EMPTY_STATE_CONFIG: Record<PlaceTab, EmptyStateConfig> = {
  관광지: {
    icon: faUmbrellaBeach,
    iconColor: '#84cc16',
    iconBackground: '#ecfccb',
    title: '관광지 추천장소가 존재하지 않아요.',
    subtitle: '검색 탭에서 장소를 직접 찾아볼 수 있어요!',
  },
  숙소: {
    icon: faBed,
    iconColor: '#f97316',
    iconBackground: '#ffedd5',
    title: '숙소 추천장소가 존재하지 않아요.',
    subtitle: '검색 탭에서 장소를 직접 찾아볼 수 있어요!',
  },
  식당: {
    icon: faUtensils,
    iconColor: '#3b82f6',
    iconBackground: '#dbeafe',
    title: '식당 추천장소가 존재하지 않아요.',
    subtitle: '검색 탭에서 장소를 직접 찾아볼 수 있어요!',
  },
  '직접 추가': {
    icon: faPencil,
    iconColor: '#8b5cf6',
    iconBackground: '#ede9fe',
    title: "위 일정에 맞춰 장소 이름을 입력하고 '추가' 버튼을 눌러보세요.",
    subtitle: '추가된 장소는 일정에 바로 반영돼요.',
    note: '추가된 장소는 순서에 따라 자동 저장돼요.',
  },
  검색: {
    icon: faMagnifyingGlass,
    iconColor: '#9ca3af',
    iconBackground: '#f3f4f6',
    title: '검색 결과가 없습니다.',
    subtitle: '다른 키워드로 장소를 다시 찾아보세요.',
  },
};

// ────────────────────────────────────────────────
// Convert PlaceVO to Place (for TimelineItem compat)
// ────────────────────────────────────────────────

/**
 * Normalize raw categoryId to 0-4 range used by the app's display components.
 */
const normalizeCategoryId = (
  rawId: number | undefined,
  type?: string,
): number => {
  const id = rawId ?? 4;
  if ([0, 1, 2, 3, 4].includes(id)) return id;
  if ([12, 14, 15, 28].includes(id)) return 0;
  if (id === 32) return 1;
  if (id === 39) return 2;
  switch (type) {
    case '관광지':
      return 0;
    case '숙소':
      return 1;
    case '식당':
      return 2;
    default:
      return 4;
  }
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

// ────────────────────────────────────────────────
// PlaceImage with fallback (matching Frontend pattern)
// ────────────────────────────────────────────────

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

// ────────────────────────────────────────────────
// PlaceMapModal — shows single place on Kakao Map
// ────────────────────────────────────────────────

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
              <X size={16} color="#9CA3AF" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <KakaoMapView places={mapPlaces} style={plStyles.mapModalMap} />
        </View>
      </Modal>
    );
  },
);

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

interface PlaceRecommendationListProps {
  planId: string | null;
  destination?: string;
  travelId: number | null;
  onAddPlace: (place: Omit<Place, 'startTime' | 'endTime'>) => void;
}

export default function PlaceRecommendationList({
  planId,
  destination,
  travelId,
  onAddPlace,
}: PlaceRecommendationListProps) {
  const {
    tour,
    lodging,
    restaurant,
    search,
    searchNext,
    tourHasNext,
    lodgingHasNext,
    restaurantHasNext,
    isLoading,
    doSearchPlaces,
    loadMorePlaces,
    fetchAllRecommendations,
    isPetFriendly,
    setPetFriendly,
  } = usePlaces();

  const [selectedTab, setSelectedTab] = useState<PlaceTab>('관광지');
  const [searchQuery, setSearchQuery] = useState('');
  const [customPlaceName, setCustomPlaceName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const normalizedSearchQuery = searchQuery.trim();
  const isSearchReady =
    selectedTab === '검색' && normalizedSearchQuery.length >= 2;

  // Reset pet friendly filter on mount
  useEffect(() => {
    setPetFriendly(false);
  }, [setPetFriendly]);

  // ─── 당겨서 새로고침 ───
  const handleRefresh = useCallback(async () => {
    const destId = travelId || planId;
    if (!destId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchAllRecommendations(Number(destId), true);
    } finally {
      setIsRefreshing(false);
    }
  }, [planId, travelId, isRefreshing, fetchAllRecommendations]);


  // ─── Debounced search ───
  const handleSearchSubmit = useCallback(() => {
    if (!normalizedSearchQuery || normalizedSearchQuery.length < 2) {
      return;
    }
    const fullQuery = destination
      ? `${destination} ${normalizedSearchQuery}`
      : normalizedSearchQuery;
    doSearchPlaces(planId, fullQuery);
    setSelectedTab('검색');
  }, [normalizedSearchQuery, destination, planId, doSearchPlaces]);

  const handleSearchTextChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (text.trim().length >= 2) {
        debounceRef.current = setTimeout(() => {
          const fullQuery = destination
            ? `${destination} ${text.trim()}`
            : text.trim();
          doSearchPlaces(planId, fullQuery);
          setSelectedTab('검색');
        }, 400);
      }
    },
    [destination, planId, doSearchPlaces],
  );

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // ─── Data ───
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
      case '검색':
        rawData = isSearchReady ? search : [];
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
      case '검색':
        return isSearchReady ? searchNext.length > 0 : false;
      default:
        return false;
    }
  };

  const tabData = getTabData();
  const hasMoreData = checkHasMoreData();

  const handleLoadMore = useCallback(() => {
    if (!hasMoreData || isLoading) return;
    loadMorePlaces(TAB_TO_PLACES_FIELD[selectedTab]);
  }, [hasMoreData, isLoading, loadMorePlaces, selectedTab]);

  // ─── Map modal state ───
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
      Alert.alert('오류', '위치 정보가 없습니다.');
      return;
    }

    // Google Maps Universal Link (works on both iOS and Android)
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${item.placeId}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback for cases where the link can't be opened
        Alert.alert('오류', '구글 지도를 열 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to open Google Maps:', error);
    }
  }, []);

  // ─── Render ───
  const renderPlaceItem = useCallback(({ item }: { item: PlaceVO }) => {
    const type = getCategoryType(item.categoryId);

    return (
      <TouchableOpacity
        style={plStyles.placeCard}
        activeOpacity={0.7}
        onPress={() => onAddPlace(placeVOToPlace(item, type))}
      >
        {/* Image */}
        <PlaceImage
          placeId={item.placeId}
          iconUrl={item.iconUrl}
          name={item.name}
        />

        {/* Info */}
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

        {/* Action Buttons */}
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
          <ActivityIndicator size="small" color="#1344FF" />
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

    if (selectedTab === '검색' && normalizedSearchQuery.length < 2) {
      return (
        <View style={plStyles.emptyContainer}>
          <View style={[plStyles.emptyIconWrapper, plStyles.emptyIconSearch]}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size={28}
              color="#9CA3AF"
            />
          </View>
          <Text style={plStyles.emptyTitle}>장소를 검색해보세요.</Text>
          <Text style={plStyles.emptySubtitle}>
            두 글자 이상 입력하면 결과를 바로 확인할 수 있어요.
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
          <FontAwesomeIcon
            icon={config.icon}
            size={28}
            color={config.iconColor}
          />
        </View>
        <Text style={plStyles.emptyTitle}>{config.title}</Text>
        <Text style={plStyles.emptySubtitle}>{config.subtitle}</Text>
        {config.note && (
          <View style={plStyles.emptyNotePill}>
            <FontAwesomeIcon icon={faCircleInfo} size={12} color="#6B7280" />
            <Text style={plStyles.emptyNoteText}>{config.note}</Text>
          </View>
        )}
      </View>
    );
  }, [isLoading, selectedTab, normalizedSearchQuery]);

  const renderHeader = useCallback(() => {
    if (selectedTab === '검색') {
      return (
        <View style={plStyles.searchContainer}>
          <View style={plStyles.searchField}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size={16}
              color="#9CA3AF"
            />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchTextChange}
              onSubmitEditing={handleSearchSubmit}
              placeholder="장소를 입력하세요 (2글자 이상)"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              style={plStyles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[
              plStyles.searchActionButton,
              !normalizedSearchQuery || normalizedSearchQuery.length < 2
                ? plStyles.searchActionButtonDisabled
                : plStyles.searchActionButtonActive,
            ]}
            onPress={handleSearchSubmit}
            disabled={
              !normalizedSearchQuery || normalizedSearchQuery.length < 2
            }
            activeOpacity={0.85}
          >
            <Text style={plStyles.searchActionButtonText}>검색</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (selectedTab === '직접 추가') {
      return (
        <View style={plStyles.searchContainer}>
          <View style={plStyles.searchField}>
            <FontAwesomeIcon icon={faPencil} size={16} color="#8B5CF6" />
            <TextInput
              value={customPlaceName}
              onChangeText={setCustomPlaceName}
              onSubmitEditing={handleDirectAdd}
              placeholder="장소 이름을 입력하세요"
              placeholderTextColor="#9CA3AF"
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
  }, [selectedTab, searchQuery, normalizedSearchQuery, customPlaceName, handleSearchTextChange, handleSearchSubmit, handleDirectAdd]);

  return (
    <View style={plStyles.container}>
      {/* Category Tabs */}
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
                  {
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderBottomWidth: 0,
                    marginBottom: -1,
                  },
                  isSelected && {
                    backgroundColor: tabColor,
                    borderColor: tabColor,
                  },
                ]}
              >
                <Text
                  style={[
                    plStyles.tabText,
                    { fontSize: 13 },
                    isSelected && { color: '#FFFFFF', fontFamily: FONTS.bold },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>



      {/* Place List */}
      <FlatList
        data={tabData}
        keyExtractor={(item, index) => `${item.placeId}_${index}`}
        renderItem={renderPlaceItem}
        // 컴포넌트가 아니라 엘리먼트로 넘긴다. 함수로 넘기면 렌더마다 타입이 바뀌어
        // 헤더가 통째로 리마운트되고, 헤더 안의 검색 TextInput이 포커스를 잃는다.
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
            colors={['#1344FF']}
            tintColor="#1344FF"
          />
        }
      />

      {/* Map Modal */}
      <PlaceMapModal
        visible={isMapVisible}
        place={mapPlace}
        onClose={handleCloseMap}
      />
    </View>
  );
}

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────

const plStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    borderBottomColor: '#1344FF',
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
    color: '#9CA3AF',
  },
  tabTextSelected: {
    color: '#1344FF',
    fontFamily: FONTS.bold,
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  searchField: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    color: '#111827',
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
  searchActionButtonActive: {
    backgroundColor: '#1344FF',
  },
  searchActionButtonPurple: {
    backgroundColor: '#8B5CF6',
  },
  searchActionButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  searchActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
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
    color: '#9CA3AF',
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
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  mapModalTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    color: '#111827',
    marginRight: 12,
  },
  mapModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#1344FF',
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
    backgroundColor: '#F3F4F6',
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 25,
    color: '#111827',
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9CA3AF',
    fontFamily: FONTS.regular,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyNotePill: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyNoteText: {
    color: '#6B7280',
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
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterLabelRow: {
    flexDirection: 'column',
    gap: 2,
  },
  filterLabelText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#111827',
  },
  filterSubText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
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
