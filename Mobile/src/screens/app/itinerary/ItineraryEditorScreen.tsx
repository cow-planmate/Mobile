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
  const newPlaceData = route.params?.newPlace;

  const [days, setDays] = useState<Day[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tripName, setTripName] = useState('강서구 1');

  useEffect(() => {
    if (days.length > 0) return;

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
  }, [tripData, days.length]);

  useEffect(() => {
    navigation.setOptions({ title: tripName });
  }, [navigation, tripName]);

  useEffect(() => {
    if (newPlaceData) {
      setDays(currentDays => {
        // ⭐️⭐️⭐️ 여기가 수정된 부분입니다! ⭐️⭐️⭐️
        // days 배열이 아직 준비되지 않았다면 아무것도 하지 않고 반환합니다.
        if (currentDays.length === 0) {
          return currentDays;
        }

        const placeToAdd: Place = { ...newPlaceData, time: '미정' };

        const updatedDays = [...currentDays];
        const updatedPlaces = [
          ...updatedDays[selectedDayIndex].places,
          placeToAdd,
        ];

        updatedPlaces.sort((a, b) => a.time.localeCompare(b.time));

        updatedDays[selectedDayIndex].places = updatedPlaces;
        return updatedDays;
      });

      navigation.setParams({ newPlace: undefined });
    }
  }, [newPlaceData, navigation, selectedDayIndex]);

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
