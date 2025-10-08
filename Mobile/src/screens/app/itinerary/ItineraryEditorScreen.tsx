// src/screens/app/itinerary/ItineraryEditorScreen.tsx
import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Button,
  TextInput, // ⭐️ 1. TextInput을 import 합니다.
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import TimelineItem, {
  Place,
} from '../../../components/itinerary/TimelineItem';
import FloatingActionButton from '../../../components/common/FloatingActionButton';
import { useItinerary, Day } from '../../../contexts/ItineraryContext';
import TimePickerModal from '../../../components/common/TimePickerModal';
import MapView, { Marker } from 'react-native-maps';

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

const DUMMY_PLACES_DAY1: Place[] = [
  {
    id: '1',
    name: '소악루',
    type: '관광지',
    time: '09:00',
    address: '서울특별시 강서구',
    rating: 4.4,
    imageUrl: 'https://picsum.photos/id/11/100/100',
    latitude: 37.56,
    longitude: 126.83,
  },
  {
    id: '2',
    name: '강서한강공원',
    type: '관광지',
    time: '10:15',
    address: '서울특별시 강서구',
    rating: 4.1,
    imageUrl: 'https://picsum.photos/id/12/100/100',
    latitude: 37.57,
    longitude: 126.82,
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
    latitude: 37.55,
    longitude: 126.8,
  },
];

export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const { days, setDays, deletePlaceFromDay, updatePlaceTime } = useItinerary();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tripName, setTripName] = useState('강서구 1');
  const [isEditingTripName, setIsEditingTripName] = useState(false); // ⭐️ 2. 이름 수정 모드 상태

  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  useEffect(() => {
    if (days.length > 0) return;
    const start = new Date(route.params.startDate);
    const end = new Date(route.params.endDate);
    // ... (날짜 탭 생성 로직은 동일)
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
  }, []);

  // ⭐️ 3. 헤더 렌더링을 위한 useLayoutEffect 사용
  useLayoutEffect(() => {
    navigation.setOptions({
      // 이름 수정 모드일 때는 TextInput을, 아닐 때는 Text를 헤더 제목으로 사용
      headerTitle: () =>
        isEditingTripName ? (
          <TextInput
            value={tripName}
            onChangeText={setTripName}
            autoFocus={true}
            onBlur={() => setIsEditingTripName(false)} // 입력창 포커스를 잃으면 수정 모드 해제
            style={styles.headerInput}
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingTripName(true)}>
            <Text style={styles.headerTitle}>{tripName}</Text>
          </TouchableOpacity>
        ),
      headerRight: () => (
        <Button
          onPress={() =>
            navigation.navigate('ItineraryView', { days, tripName })
          }
          title="완료"
        />
      ),
    });
  }, [navigation, tripName, days, isEditingTripName]);

  const handleEditTime = (place: Place) => {
    /* ... */
  };
  const formatTime = (date: Date) => {
    /* ... */
  };
  const selectedDay = days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* (모든 UI 코드는 이전과 동일) */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={
            selectedDay && selectedDay.places.length > 0
              ? {
                  latitude: selectedDay.places[0].latitude,
                  longitude: selectedDay.places[0].longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }
              : undefined
          }
        >
          {selectedDay?.places.map(place => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={place.address}
            />
          ))}
        </MapView>
      </View>

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
          renderItem={({ item }) => (
            <TimelineItem
              item={item}
              onDelete={() => deletePlaceFromDay(selectedDayIndex, item.id)}
              onEditTime={() => handleEditTime(item)}
            />
          )}
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
      <FloatingActionButton
        onPress={() =>
          navigation.navigate('AddPlace', { dayIndex: selectedDayIndex })
        }
      />

      {editingPlace && (
        <TimePickerModal
          visible={isTimePickerVisible}
          onClose={() => setTimePickerVisible(false)}
          initialDate={new Date()}
          onConfirm={date => {
            const newTime = formatTime(date);
            updatePlaceTime(selectedDayIndex, editingPlace.id, newTime);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // ⭐️ 4. 헤더 관련 스타일 추가
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerInput: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    borderBottomWidth: 1,
    borderColor: COLORS.placeholder,
    padding: 0,
    minWidth: 150,
  },
  mapContainer: {
    height: '40%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
