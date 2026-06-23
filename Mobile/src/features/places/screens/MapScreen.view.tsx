import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Search, Star, MapPin } from 'lucide-react-native';
import { styles, COLORS } from './MapScreen.styles';

let MapView: any;
let Marker: any;
try {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
} catch (e) {
  console.log('react-native-maps is not available in this environment');
}

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
  onMarkerPress: (place: MapPlace) => void;
}

export default function MapScreenView({
  places,
  selectedPlace,
  onSelectPlace,
  searchQuery,
  onSearchChange,
  onMarkerPress,
}: MapScreenViewProps) {
  const hasMap = !!MapView && !!Marker;

  // Initial region centered around Jeju (as our mock data points are in Jeju)
  const initialRegion = {
    latitude: 33.4996213,
    longitude: 126.5311884,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  return (
    <View style={styles.container}>
      {/* Map or Fallback */}
      {hasMap ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.title}
              description={place.category}
              onPress={() => onMarkerPress(place)}
              pinColor={selectedPlace?.id === place.id ? '#1344FF' : '#FF3B30'}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.fallbackMapContainer}>
          <MapPin size={48} color={COLORS.textTertiary} />
          <Text style={styles.fallbackMapText}>지도 서비스를 불러올 수 없습니다</Text>
          <Text style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>
            (에뮬레이터 또는 네이티브 모듈 로드 실패)
          </Text>
        </View>
      )}

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
                  <Image
                    source={{ uri: place.imageUrl }}
                    style={{ width: '100%', height: '100%', borderRadius: 12 }}
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
