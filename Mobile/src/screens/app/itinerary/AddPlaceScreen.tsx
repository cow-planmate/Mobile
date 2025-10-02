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
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../../../components/itinerary/TimelineItem';
import { useItinerary } from '../../../contexts/ItineraryContext'; // ⭐️ 1. Context 훅 가져오기

const COLORS = {
  primary: '#007AFF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  lightGray: '#F0F2F5',
};

// 임시 검색 결과 데이터
const DUMMY_SEARCH_RESULTS: Omit<Place, 'time'>[] = [
  {
    id: '10',
    name: '새로운 관광지 1',
    type: '관광지',
    address: '서울 영등포구',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/id/20/100/100',
  },
  {
    id: '11',
    name: '새로운 맛집 2',
    type: '식당',
    address: '서울 영등포구',
    rating: 4.5,
    imageUrl: 'https://picsum.photos/id/22/100/100',
  },
  {
    id: '12',
    name: '새로운 숙소 3',
    type: '숙소',
    address: '서울 영등포구',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/id/21/100/100',
  },
];

type Props = NativeStackScreenProps<AppStackParamList, 'AddPlace'>;

// 검색 결과 항목을 위한 컴포넌트
const PlaceSearchResultItem = ({
  item,
  onSelect,
}: {
  item: Omit<Place, 'time'>;
  onSelect: () => void;
}) => (
  <TouchableOpacity style={styles.resultItem} onPress={onSelect}>
    <View style={{ flex: 1 }}>
      <Text style={styles.resultName}>{item.name}</Text>
      <Text style={styles.resultMeta}>
        ⭐️ {item.rating} · {item.address}
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

  const { addPlaceToDay } = useItinerary(); // ⭐️ 2. Context에서 함수 가져오기
  const { dayIndex } = route.params; // ⭐️ 3. 몇 번째 날에 추가할지 인덱스 받기

  const filteredPlaces = DUMMY_SEARCH_RESULTS.filter(
    place => place.type === selectedTab,
  );

  const handleSelectPlace = (place: Omit<Place, 'time'>) => {
    // ⭐️ 4. Context의 함수를 호출하여 데이터 업데이트
    addPlaceToDay(dayIndex, place);
    // ⭐️ 5. 뒤로가기
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="장소를 검색하세요"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setSelectedTab('관광지')}
          style={[styles.tab, selectedTab === '관광지' && styles.tabSelected]}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === '관광지' && styles.tabTextSelected,
            ]}
          >
            관광지
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('숙소')}
          style={[styles.tab, selectedTab === '숙소' && styles.tabSelected]}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === '숙소' && styles.tabTextSelected,
            ]}
          >
            숙소
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('식당')}
          style={[styles.tab, selectedTab === '식당' && styles.tabSelected]}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === '식당' && styles.tabTextSelected,
            ]}
          >
            식당
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPlaces}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PlaceSearchResultItem
            item={item}
            onSelect={() => handleSelectPlace(item)}
          />
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
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 15,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: COLORS.card,
  },
  tab: {
    marginRight: 15,
    paddingVertical: 10,
  },
  tabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.placeholder,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: COLORS.primary,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultMeta: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
