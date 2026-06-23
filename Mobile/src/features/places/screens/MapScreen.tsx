import React, { useState } from 'react';
import { useAlert } from '../../../contexts/AlertContext';
import MapScreenView, { MapPlace } from './MapScreen.view';

const MOCK_PLACES: MapPlace[] = [
  {
    id: '1',
    title: '우진해장국 🍲',
    category: '한식 / 맛집',
    rating: 4.7,
    reviews: 3840,
    address: '제주특별자치도 제주시 서사로 11',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
    latitude: 33.5115,
    longitude: 126.5202,
  },
  {
    id: '2',
    title: '카페 델문도 ☕',
    category: '카페 / 오션뷰',
    rating: 4.5,
    reviews: 2150,
    address: '제주특별자치도 제주시 조천읍 조함해안로 519-10',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80',
    latitude: 33.5433,
    longitude: 126.6690,
  },
  {
    id: '3',
    title: '성산일출봉 ⛰️',
    category: '관광명소 / 자연',
    rating: 4.9,
    reviews: 5820,
    address: '제주특별자치도 서귀포시 성산읍 일출로 284-12',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    latitude: 33.4583,
    longitude: 126.9426,
  },
  {
    id: '4',
    title: '한라산 국립공원 🥾',
    category: '관광명소 / 등산',
    rating: 4.8,
    reviews: 1980,
    address: '제주특별자치도 제주시 1100로 2070-61',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
    latitude: 33.3617,
    longitude: 126.5292,
  },
];

export default function MapScreen() {
  const { showAlert } = useAlert();
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(MOCK_PLACES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectPlace = (place: MapPlace) => {
    setSelectedPlace(place);
  };

  const handleMarkerPress = (place: MapPlace) => {
    setSelectedPlace(place);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const filteredPlaces = MOCK_PLACES.filter((place) => {
    const query = searchQuery.toLowerCase();
    return (
      place.title.toLowerCase().includes(query) ||
      place.category.toLowerCase().includes(query) ||
      place.address.toLowerCase().includes(query)
    );
  });

  return (
    <MapScreenView
      places={filteredPlaces}
      selectedPlace={selectedPlace}
      onSelectPlace={handleSelectPlace}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onMarkerPress={handleMarkerPress}
    />
  );
}
