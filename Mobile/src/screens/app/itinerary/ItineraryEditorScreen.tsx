// src/screens/app/itinerary/ItineraryEditorScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList, // ⭐️ ScrollView 대신 FlatList 사용
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

// ⭐️ 새로 만든 컴포넌트들 불러오기
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
  lightGray: '#F5F5F7', // Added lightGray color
};

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

// 날짜별 일정 데이터 타입
interface Day {
  date: Date;
  dayNumber: number;
  places: Place[]; // 각 날짜는 Place 객체의 배열을 가짐
}

// ⭐️ UI 확인을 위한 임시 데이터
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
  {
    id: '3',
    name: '서울식물원',
    type: '식당',
    time: '11:15',
    address: '서울특별시 강서구',
    rating: 4.3,
    imageUrl: 'https://picsum.photos/id/13/100/100',
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

  const [days, setDays] = useState<Day[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // ⭐️ 여행 이름 수정을 위한 State
  const [tripName, setTripName] = useState('강서구 1');

  useEffect(() => {
    // 이전과 동일한 날짜 탭 생성 로직
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const tripDays: Day[] = [];
    let currentDate = new Date(start);
    let dayCounter = 1;

    while (currentDate <= end) {
      // ⭐️ 임시 데이터 할당
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

    // 네비게이션 헤더 제목 설정
    navigation.setOptions({ title: tripName });
  }, [tripData.startDate, tripData.endDate, navigation, tripName]);

  const selectedDay = days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 날짜 탭 스크롤 */}
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

      {/* ⭐️ 선택된 날짜의 타임라인을 FlatList로 렌더링 */}
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

      {/* ⭐️ 플로팅 액션 버튼 */}
      <FloatingActionButton onPress={() => alert('장소 추가 화면으로 이동!')} />
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
