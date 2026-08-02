import React from 'react';
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  TextInput,
  ScrollView,

  TouchableOpacity,
} from 'react-native';
import { Search, Star, MapPin } from 'lucide-react-native';
import { styles, COLORS } from './MapScreen.styles';

import KakaoMapView from '../../itinerary/components/KakaoMapView';

export interface MapPlace {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  address: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
}

export interface MapScreenViewProps {
  places: MapPlace[];
  selectedPlace: MapPlace | null;
  onSelectPlace: (place: MapPlace) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  /** 지도 마커 탭 콜백. 현재 뷰는 목록 선택만 처리한다. */
  onMarkerPress?: (place: MapPlace) => void;
}

export default function MapScreenView({
  places,
  selectedPlace,
  onSelectPlace,
  searchQuery,
  onSearchChange,
}: MapScreenViewProps) {
  const kakaoPlaces = places.map((p) => ({
    id: p.id,
    name: p.title,
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  return (
    <View style={styles.container}>
      {/* Kakao Map */}
      <KakaoMapView
        places={kakaoPlaces}
        style={styles.map}
      />

      {/* Floating Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="주변 장소, 맛집을 검색해 보세요"
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      {/* Horizontal Carousel of Places */}
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselScroll}
          snapToInterval={280} // Approx width of card + spacing
          decelerationRate="fast"
        >
          {places.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.card,
                selectedPlace?.id === place.id && { borderColor: COLORS.primary, borderWidth: 2 },
              ]}
              onPress={() => onSelectPlace(place)}
              activeOpacity={0.9}
            >
              {/* Place Image */}
              <View style={styles.cardImage}>
                {place.imageUrl ? (
                  <FastImage
                    source={{ uri: place.imageUrl, priority: FastImage.priority.normal }}
                    style={{ width: '100%', height: '100%', borderRadius: 12 }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <MapPin size={24} color={COLORS.primary} />
                  </View>
                )}
              </View>

              {/* Place Info */}
              <View style={styles.cardInfo}>
                <View>
                  <Text style={styles.cardCategory}>{place.category}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {place.title}
                  </Text>
                  <View style={styles.cardRatingRow}>
                    <Star size={14} color="#FF9500" fill="#FF9500" />
                    <Text style={styles.cardRating}>{place.rating}</Text>
                    <Text style={styles.cardReviews}>({place.reviews})</Text>
                  </View>
                </View>
                <Text style={styles.cardAddress} numberOfLines={1}>
                  {place.address}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
