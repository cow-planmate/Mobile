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
import { useItinerary } from '../../../contexts/ItineraryContext';

const COLORS = {
  primary: '#007AFF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  lightGray: '#F0F2F5',
};

const DUMMY_PLACES: Omit<Place, 'time'>[] = [
  {
    id: '10',
    name: '더현대 서울',
    type: '관광지',
    address: '서울 영등포구',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/id/20/100/100',
  },
  {
    id: '11',
    name: '콘래드 서울',
    type: '숙소',
    address: '서울 영등포구',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/id/21/100/100',
  },
  {
    id: '12',
    name: '세상의모든아침',
    type: '식당',
    address: '서울 영등포구',
    rating: 4.5,
    imageUrl: 'https://picsum.photos/id/22/100/100',
  },
  {
    id: '13',
    name: '63빌딩',
    type: '관광지',
    address: '서울 영등포구',
    rating: 4.6,
    imageUrl: 'https://picsum.photos/id/23/100/100',
  },
  {
    id: '14',
    name: 'IFC몰',
    type: '관광지',
    address: '서울 영등포구',
    rating: 4.7,
    imageUrl: 'https://picsum.photos/id/24/100/100',
  },
  {
    id: '15',
    name: '영등포 타임스퀘어',
    type: '관광지',
    address: '서울 영등포구',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/id/25/100/100',
  },
];

type Props = NativeStackScreenProps<AppStackParamList, 'AddPlace'>;

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

  const { addPlaceToDay } = useItinerary();
  const { dayIndex } = route.params;

  // ⭐️⭐️⭐️ 여기가 수정된 부분입니다! ⭐️⭐️⭐️
  // 선택된 탭과 검색어를 모두 사용하여 목록을 필터링합니다.
  const filteredPlaces = DUMMY_PLACES.filter(place => {
    // 1. 탭 필터링
    const matchesTab = place.type === selectedTab;
    // 2. 검색어 필터링 (대소문자 구분 없이)
    const matchesSearch = place.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleSelectPlace = (place: Omit<Place, 'time'>) => {
    addPlaceToDay(dayIndex, place);
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
          autoFocus={true} // 화면이 열리면 자동으로 키보드 포커스
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
        // ⭐️ 검색 결과가 없을 때 보여줄 UI
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
          </View>
        }
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
  emptyContainer: {
    flex: 1,
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.placeholder,
  },
});
