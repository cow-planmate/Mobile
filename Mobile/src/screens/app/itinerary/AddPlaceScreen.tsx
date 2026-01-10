import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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

import { styles, COLORS } from './AddPlaceScreen.styles';

interface PlaceVO {
  placeId: string;
  categoryId: number;
  url: string;
  name: string;
  formatted_address: string;
  rating: number;
  xlocation: number;
  ylocation: number;
  iconUrl: string;
}

type Props = NativeStackScreenProps<AppStackParamList, 'AddPlace'>;

const getCategoryType = (id: number): '관광지' | '숙소' | '식당' | '기타' => {
  if ([12, 14, 15, 28].includes(id)) return '관광지';
  if (id === 32) return '숙소';
  if (id === 39) return '식당';
  return '기타';
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

  const { dayIndex, destination } = route.params || {};

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = '';
      if (!searchQuery.trim()) {
        const categoryMap: { [key: string]: string } = {
          관광지: 'tour',
          숙소: 'lodging',
          식당: 'restaurant',
        };
        // const endpoint = categoryMap[selectedTab];

        // Use generic travel name if no destination specified, or implement logic to get travelName from context
        // Assuming destination is provided like "Busan", and matching logic exists.
        // For now, if no destination, we can't search by category/travelName easily without extra context.
        // But if destination exists, we try to use the category endpoint.

        // NOTE: The backend requires travelCategoryName/travelName.
        // We will default to generic query search if we don't have enough info,
        // OR we can't implement category-only browsing effectively without known travelName.
        // However, the spec provides: /api/plan/{type}/{travelCategoryName}/{travelName}

        if (destination) {
          // We need to know the category name (e.g. 'CityName'). Assuming destination IS the travelName.
          // We might need a hardcoded 'area' or similar if backend requires it.
          // Let's assume 'default' or similar if not known, or just use the query endpoint with the category name as query.

          // BUT, to strictly follow spec for "Listing" without query:
          // url = `${API_URL}/api/plan/${endpoint}/전체/${destination}`;
          // (This is risky if '전체' isn't valid. Using query search is safer if user hasn't typed anything yet but we want results.)

          // Fallback to query search with destination name to get general results
          url = `${API_URL}/api/plan/place/${encodeURIComponent(
            destination + ' ' + selectedTab,
          )}`;
        } else {
          // user must type something
          setIsLoading(false);
          return;
        }
      } else {
        const query = destination
          ? `${destination} ${searchQuery}`
          : searchQuery;
        url = `${API_URL}/api/plan/place/${encodeURIComponent(query)}`;
      }

      const response = await axios.get(url);

      if (response.data && response.data.places) {
        const mappedPlaces: Place[] = response.data.places.map(
          (p: PlaceVO) => ({
            id: p.placeId,
            name: p.name,
            type: getCategoryType(p.categoryId),
            address: p.formatted_address,
            rating: p.rating,
            imageUrl: p.iconUrl,
            latitude: p.ylocation,
            longitude: p.xlocation,
            time: '10:00',
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

  // Re-trigger search when tab changes if query is empty (browsing mode)
  React.useEffect(() => {
    if (!searchQuery.trim() && destination) {
      handleSearch();
    }
  }, [selectedTab, handleSearch, destination, searchQuery]);

  const filteredPlaces = searchResults.filter(place => {
    if (selectedTab === '관광지') {
      return place.type === '관광지' || place.type === '기타';
    }

    return place.type === selectedTab;
  });

  const handleSelectPlace = (place: Place) => {
    addPlaceToDay(dayIndex, place);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder={
              destination ? `${destination} 근처 장소 검색` : '장소 검색'
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
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

      {}
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

      {}
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
