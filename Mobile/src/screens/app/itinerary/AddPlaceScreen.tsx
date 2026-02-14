import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '@env';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../../../components/itinerary/TimelineItem';
import { useItinerary } from '../../../contexts/ItineraryContext';
import AddPlaceScreenView from './AddPlaceScreen.view';

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
        if (destination) {
          url = `${API_URL}/api/plan/place/${encodeURIComponent(
            destination + ' ' + selectedTab,
          )}`;
        } else {
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
            categoryId: p.categoryId,
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
  }, [searchQuery, destination, selectedTab]);

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
    <AddPlaceScreenView
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      isLoading={isLoading}
      filteredPlaces={filteredPlaces}
      destination={destination}
      handleSearch={handleSearch}
      handleSelectPlace={handleSelectPlace}
      goBack={() => navigation.goBack()}
      searchResultsLength={searchResults.length}
    />
  );
}
