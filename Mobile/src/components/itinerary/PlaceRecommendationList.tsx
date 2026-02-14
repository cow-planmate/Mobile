import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Place} from './TimelineItem';
import {usePlaces} from '../../contexts/PlacesContext';
import {PlaceVO} from '../../api/trips';

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

const CATEGORY_COLORS: {[key: string]: string} = {
  관광지: '#84cc16',
  숙소: '#f97316',
  식당: '#3b82f6',
  '직접 추가': '#8b5cf6',
  검색: '#6b7280',
  기타: '#6b7280',
};

type PlaceTab = '관광지' | '숙소' | '식당' | '검색';

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
    case '관광지': return 0;
    case '숙소': return 1;
    case '식당': return 2;
    default: return 4;
  }
};

function placeVOToPlace(p: PlaceVO, tabOverride?: string): Omit<Place, 'startTime' | 'endTime'> {
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
  };
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

interface PlaceRecommendationListProps {
  planId: number | null;
  destination?: string;
  onAddPlace: (place: Omit<Place, 'startTime' | 'endTime'>) => void;
}

export default function PlaceRecommendationList({
  planId,
  destination,
  onAddPlace,
}: PlaceRecommendationListProps) {
  const {
    tour,
    lodging,
    restaurant,
    search,
    tourNext,
    lodgingNext,
    restaurantNext,
    searchNext,
    isLoading,
    doSearchPlaces,
    loadMorePlaces,
  } = usePlaces();

  const [selectedTab, setSelectedTab] = useState<PlaceTab>('관광지');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Debounced search ───
  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return;
    }
    const fullQuery = destination
      ? `${destination} ${searchQuery.trim()}`
      : searchQuery.trim();
    doSearchPlaces(planId, fullQuery);
    setSelectedTab('검색');
  }, [searchQuery, destination, planId, doSearchPlaces]);

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // ─── Data ───
  const getTabData = (): PlaceVO[] => {
    switch (selectedTab) {
      case '관광지':
        return tour;
      case '숙소':
        return lodging;
      case '식당':
        return restaurant;
      case '검색':
        return search;
      default:
        return [];
    }
  };

  const getTabTokens = (): string[] => {
    switch (selectedTab) {
      case '관광지':
        return tourNext;
      case '숙소':
        return lodgingNext;
      case '식당':
        return restaurantNext;
      case '검색':
        return searchNext;
      default:
        return [];
    }
  };

  const tabData = getTabData();
  const hasMoreData = getTabTokens().length > 0;

  const handleLoadMore = () => {
    if (!hasMoreData || isLoading) return;
    const fieldMap: {[key: string]: 'tour' | 'lodging' | 'restaurant' | 'search'} = {
      관광지: 'tour',
      숙소: 'lodging',
      식당: 'restaurant',
      검색: 'search',
    };
    loadMorePlaces(fieldMap[selectedTab]);
  };

  // ─── Render ───
  const renderPlaceItem = ({item}: {item: PlaceVO}) => {
    const type = getCategoryType(item.categoryId);
    const color = CATEGORY_COLORS[type] || CATEGORY_COLORS['기타'];

    return (
      <View style={plStyles.placeCard}>
        {/* Image */}
        {item.photoUrl || item.iconUrl ? (
          <Image
            source={{uri: item.photoUrl || item.iconUrl}}
            style={plStyles.placeImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[plStyles.placeImage, plStyles.placeholderImage]}>
            <Text style={plStyles.placeholderText}>
              {item.name?.charAt(0) || '?'}
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={plStyles.placeInfo}>
          <Text style={plStyles.placeName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={plStyles.metaRow}>
            <View
              style={[plStyles.typeBadge, {backgroundColor: color + '20'}]}>
              <Text style={[plStyles.typeBadgeText, {color}]}>{type}</Text>
            </View>
            {item.rating > 0 && (
              <Text style={plStyles.ratingText}>⭐ {item.rating}</Text>
            )}
          </View>
          <Text style={plStyles.addressText} numberOfLines={1}>
            {item.formatted_address}
          </Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={plStyles.addButton}
          onPress={() => onAddPlace(placeVOToPlace(item, type))}>
          <Text style={plStyles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
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
          onPress={handleLoadMore}>
          <Text style={plStyles.loadMoreText}>더 불러오기</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={plStyles.emptyContainer}>
        <Text style={plStyles.emptyIcon}>🏖️</Text>
        <Text style={plStyles.emptyText}>
          {selectedTab === '검색'
            ? '검색 결과가 없습니다.'
            : `추천 ${selectedTab}이(가) 없습니다.`}
        </Text>
      </View>
    );
  };

  return (
    <View style={plStyles.container}>
      {/* Search Bar */}
      <View style={plStyles.searchContainer}>
        <TextInput
          style={plStyles.searchInput}
          placeholder={
            destination
              ? `${destination} 근처 장소 검색`
              : '장소를 검색하세요'
          }
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={handleSearchTextChange}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={handleSearchSubmit}
          style={plStyles.searchButton}>
          <Text style={plStyles.searchButtonIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={plStyles.tabContainer}>
        {(['관광지', '숙소', '식당', '검색'] as PlaceTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[
              plStyles.tab,
              selectedTab === tab && plStyles.tabSelected,
            ]}>
            <Text
              style={[
                plStyles.tabText,
                selectedTab === tab && plStyles.tabTextSelected,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Place List */}
      <FlatList
        data={tabData}
        keyExtractor={(item, index) => `${item.placeId}_${index}`}
        renderItem={renderPlaceItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={plStyles.listContent}
        showsVerticalScrollIndicator={false}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1C1C1E',
    marginRight: 8,
  },
  searchButton: {
    padding: 8,
  },
  searchButtonIcon: {
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: '#1344FF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  tabTextSelected: {
    color: '#1344FF',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  placeImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F0F0F5',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 12,
    color: '#1C1C1E',
  },
  addressText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1344FF',
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
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1344FF',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
});
