import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '@env';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../../../components/itinerary/TimelineItem';
import { useItinerary } from '../../../contexts/ItineraryContext';

const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  lightGray: '#F0F2F5',
  error: '#FF3B30',
};

// 백엔드 PlaceVO 구조
interface PlaceVO {
  placeId: string;
  categoryId: number;
  url: string;
  name: string;
  formatted_address: string;
  rating: number;
  xlocation: number; // longitude
  ylocation: number; // latitude
  iconUrl: string;
}

type Props = NativeStackScreenProps<AppStackParamList, 'AddPlace'>;

// 카테고리 ID 매핑 함수
const getCategoryType = (id: number): '관광지' | '숙소' | '식당' | '기타' => {
  if ([12, 14, 15, 28].includes(id)) return '관광지';
  if (id === 32) return '숙소';
  if (id === 39) return '식당';
  return '기타'; // 38(쇼핑) 등
};

const PlaceSearchResultItem = ({
  item,
  onSelect,
}: {
  item: Place;
  onSelect: () => void;
}) => (
  <TouchableOpacity style={styles.resultItem} onPress={onSelect}>
    <View style={styles.imageContainer}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.placeImage} />
      ) : (
        <View style={[styles.placeImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>{item.type[0]}</Text>
        </View>
      )}
    </View>
    <View style={styles.infoContainer}>
      <Text style={styles.resultName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.resultMeta} numberOfLines={1}>
        {item.type} · ⭐ {item.rating > 0 ? item.rating : '-'}
      </Text>
      <Text style={styles.addressText} numberOfLines={1}>
        {item.address}
      </Text>
    </View>
    <Pressable style={styles.addButton} onPress={onSelect}>
      <Text style={styles.addButtonText}>추가</Text>
    </Pressable>
  </TouchableOpacity>
);

export default function AddPlaceScreen({ route, navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'관광지' | '숙소' | '식당'>(
    '관광지',
  );
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { addPlaceToDay } = useItinerary();
  // route.params에서 여행지 정보 등을 가져올 수 있다고 가정 (없으면 빈 문자열)
  // @ts-ignore (params 타입 정의가 안 되어 있을 수 있어서 임시 처리)
  const { dayIndex, destination } = route.params || {};

  // 검색 함수
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // 여행지와 검색어를 조합하여 검색 (예: "제주 스타벅스")
      const query = destination ? `${destination} ${searchQuery}` : searchQuery;
      console.log(`Searching for: ${query}`);

      const response = await axios.get(
        `${API_URL}/api/plan/place/${encodeURIComponent(query)}`,
      );

      if (response.data && response.data.places) {
        const mappedPlaces: Place[] = response.data.places.map(
          (p: PlaceVO) => ({
            id: p.placeId,
            name: p.name,
            type: getCategoryType(p.categoryId),
            address: p.formatted_address,
            rating: p.rating,
            imageUrl: p.iconUrl,
            latitude: p.ylocation, // y -> lat
            longitude: p.xlocation, // x -> lng
            time: '10:00', // 기본 시간
          }),
        );

        setSearchResults(mappedPlaces);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('오류', '장소 검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 탭에 따라 결과 필터링
  const filteredPlaces = searchResults.filter(place => {
    if (selectedTab === '관광지') {
      // 관광지 탭에서는 '기타' 카테고리도 포함해서 보여줄 수 있음
      return place.type === '관광지' || place.type === '기타';
    }
    // '숙소' 또는 '식당' 탭에서는 정확히 일치하는 것만 필터
    return place.type === selectedTab;
  });

  const handleSelectPlace = (place: Place) => {
    addPlaceToDay(dayIndex, place);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 & 검색창 */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder={
              destination ? `${destination} 근처 장소 검색` : '장소 검색'
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch} // 엔터 키 누르면 검색
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        {(['관광지', '숙소', '식당'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab && styles.tabSelected]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextSelected,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 검색 결과 리스트 */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PlaceSearchResultItem
              item={item}
              onSelect={() => handleSelectPlace(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchResults.length === 0
                  ? '검색 결과가 없습니다.'
                  : `${selectedTab} 카테고리에 해당하는 장소가 없습니다.`}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  searchButton: {
    padding: 4,
  },
  searchButtonIcon: {
    fontSize: 18,
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.placeholder,
  },
  tabTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  imageContainer: {
    marginRight: 12,
  },
  placeImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  resultMeta: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  addButton: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
  },
  addButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.placeholder,
  },
});
