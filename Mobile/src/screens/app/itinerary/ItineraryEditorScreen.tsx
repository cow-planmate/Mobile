// src/screens/app/itinerary/ItineraryEditorScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

import TimelineItem, {
  Place,
} from '../../../components/itinerary/TimelineItem';
import FloatingActionButton from '../../../components/common/FloatingActionButton';

const COLORS = {
  primary: '#007AFF',
  background: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
  lightGray: '#F5F5F7',
};

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

interface Day {
  date: Date;
  dayNumber: number;
  places: Place[];
}

const DUMMY_PLACES_DAY1: Place[] = [
  {
    id: '1',
    name: '소악루',
    type: '관광지',
    time: '09:00',
    address: '서울특별시 강서구',
    rating: 4.4,
    imageUrl: 'https://picsum.photos/id/11/100/100',
  },
  {
    id: '2',
    name: '강서한강공원',
    type: '관광지',
    time: '10:15',
    address: '서울특별시 강서구',
    rating: 4.1,
    imageUrl: 'https://picsum.photos/id/12/100/100',
  },
];
const DUMMY_PLACES_DAY2: Place[] = [
  {
    id: '4',
    name: '김포공항',
    type: '관광지',
    time: '13:00',
    address: '서울특별시 강서구',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/id/14/100/100',
  },
];

export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const tripData = route.params;
  const newPlace = route.params?.newPlace; // ⭐️ 1. AddPlaceScreen에서 전달받은 데이터

  const [days, setDays] = useState<Day[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tripName, setTripName] = useState('강서구 1');

  useEffect(() => {
    // ... (날짜 탭 생성 로직은 동일)
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const tripDays: Day[] = [];
    let currentDate = new Date(start);
    let dayCounter = 1;

    while (currentDate <= end) {
      let placesForDay: Place[] = [];
      if (dayCounter === 1) placesForDay = DUMMY_PLACES_DAY1;
      if (dayCounter === 2) placesForDay = DUMMY_PLACES_DAY2;

      tripDays.push({
        date: new Date(currentDate),
        dayNumber: dayCounter,
        places: placesForDay,
      });
      currentDate.setDate(currentDate.getDate() + 1);
      dayCounter++;
    }
    setDays(tripDays);

    navigation.setOptions({ title: tripName });
  }, [tripData.startDate, tripData.endDate, navigation, tripName]);

  // ⭐️ 2. AddPlaceScreen에서 장소를 선택하고 돌아왔을 때 실행되는 로직
  useEffect(() => {
    if (newPlace) {
      alert(
        `'${newPlace.name}'이(가) Day ${
          selectedDayIndex + 1
        }에 추가됩니다! (실제 추가 로직 필요)`,
      );
      // 여기에 실제로 days State를 업데이트하는 로직을 추가해야 합니다.

      // 데이터를 한번 사용한 뒤에는 params를 초기화하여 중복 실행 방지
      navigation.setParams({ newPlace: undefined });
    }
  }, [newPlace, navigation, selectedDayIndex]);

  const selectedDay = days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContainer}
        >
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayTab,
                selectedDayIndex === index && styles.dayTabSelected,
              ]}
              onPress={() => setSelectedDayIndex(index)}
            >
              <Text
                style={[
                  styles.dayTabText,
                  selectedDayIndex === index && styles.dayTabTextSelected,
                ]}
              >
                Day {day.dayNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedDay && (
        <FlatList
          data={selectedDay.places}
          renderItem={({ item }) => <TimelineItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.timelineContainer}
          ListHeaderComponent={
            <Text style={styles.timelineDateText}>
              {selectedDay.date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </Text>
          }
        />
      )}

      {/* ⭐️ 3. 플로팅 버튼을 누르면 AddPlace 화면으로 이동 */}
      <FloatingActionButton onPress={() => navigation.navigate('AddPlace')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dayTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.lightGray,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
  },
  dayTabText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  dayTabTextSelected: {
    color: COLORS.white,
  },
  timelineContainer: {
    padding: 20,
  },
  timelineDateText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
