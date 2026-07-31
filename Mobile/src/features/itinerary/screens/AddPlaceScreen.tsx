import React, { useState, useEffect, useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import {
  useItinerary,
  categoryMapping,
} from '../../../contexts/ItineraryContext';
import { useSearchPlaces } from '../../../hooks/usePlanQueries';
import { PlaceVO } from '../../../api/trips';
import AddPlaceScreenView from './AddPlaceScreen.view';
import { Place } from '../components/TimelineItem';

type Props = NativeStackScreenProps<AppStackParamList, 'AddPlace'>;

export default function AddPlaceScreen({ route, navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'관광지' | '숙소' | '식당'>(
    '관광지',
  );

  const { addPlaceToDay } = useItinerary();
  const { dayIndex, destination, planId } = route.params || {};

  // Formulate search keyword
  const effectiveQuery = useMemo(() => {
    const q = activeQuery.trim();
    if (!q) {
      return destination ? `${destination} ${selectedTab}` : '';
    }
    return destination ? `${destination} ${q}` : q;
  }, [activeQuery, destination, selectedTab]);

  // Hook in React Query (pass planId as string)
  const { data, isLoading } = useSearchPlaces(effectiveQuery, planId);

  // Trigger search on submit
  const handleSearch = () => {
    setActiveQuery(searchQuery);
  };

  // Reset active query when tab changes or search query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setActiveQuery('');
    }
  }, [selectedTab, searchQuery]);

  // Map API response to local View interface
  const searchResults = useMemo(() => {
    if (!data || !data.places) return [];
    return data.places.map((p: PlaceVO) => ({
      id: p.placeId,
      name: p.name,
      type: categoryMapping(p.categoryId),
      categoryId: p.categoryId,
      address: p.formatted_address,
      rating: p.rating,
      imageUrl: p.photoUrl || p.iconUrl || '',
      latitude: p.yLocation ?? p.ylocation ?? 0,
      longitude: p.xLocation ?? p.xlocation ?? 0,
    }));
  }, [data]);

  const filteredPlaces = useMemo(() => {
    return searchResults.filter((place) => {
      if (selectedTab === '관광지') {
        return place.type === '관광지' || place.type === '기타';
      }
      return place.type === selectedTab;
    });
  }, [searchResults, selectedTab]);

  const handleSelectPlace = (place: Omit<Place, 'startTime' | 'endTime'>) => {
    navigation.navigate('ItineraryEditor', {
      planId,
      pendingPlace: place,
    });
  };

  return (
    <AddPlaceScreenView
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      isLoading={isLoading}
      filteredPlaces={filteredPlaces as any}
      destination={destination}
      handleSearch={handleSearch}
      handleSelectPlace={handleSelectPlace}
      goBack={() => navigation.goBack()}
      searchResultsLength={searchResults.length}
    />
  );
}
