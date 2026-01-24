import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Place } from '../../../components/itinerary/TimelineItem';
import { styles, COLORS } from './AddPlaceScreen.styles';

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

export interface AddPlaceScreenViewProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedTab: '관광지' | '숙소' | '식당';
  setSelectedTab: (tab: '관광지' | '숙소' | '식당') => void;
  isLoading: boolean;
  filteredPlaces: Place[];
  destination?: string;
  handleSearch: () => void;
  handleSelectPlace: (place: Place) => void;
  goBack: () => void;
  searchResultsLength: number;
}

export default function AddPlaceScreenView({
  searchQuery,
  setSearchQuery,
  selectedTab,
  setSelectedTab,
  isLoading,
  filteredPlaces,
  destination,
  handleSearch,
  handleSelectPlace,
  goBack,
  searchResultsLength,
}: AddPlaceScreenViewProps) {
  return (
    <SafeAreaView style={styles.container}>
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
        <TouchableOpacity onPress={goBack} style={styles.cancelButton}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>

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
                {searchResultsLength === 0
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
