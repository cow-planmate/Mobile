// src/screens/app/itinerary/AddPlaceScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';

const COLORS = {
  primary: '#007AFF',
  background: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  lightGray: '#F0F0F0', // Renamed from '#F5F5F7' for consistency
};

// 임시 검색 결과 데이터
const DUMMY_SEARCH_RESULTS = [
  { id: '10', name: '새로운 관광지 1' },
  { id: '11', name: '새로운 맛집 2' },
  { id: '12', name: '새로운 숙소 3' },
];

export default function AddPlaceScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectPlace = (place: { id: string; name: string }) => {
    // ⭐️ 1. 장소를 선택하면 이전 화면으로 데이터를 가지고 돌아갑니다.
    navigation.navigate('ItineraryEditor', { newPlace: place });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="장소, 숙소, 식당 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>취소</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DUMMY_SEARCH_RESULTS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectPlace(item)}
          >
            <Text style={styles.resultText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
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
    padding: 15,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 15,
  },
  resultItem: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultText: {
    fontSize: 16,
  },
});
