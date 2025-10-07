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
import { useItinerary, Day } from '../../../contexts/ItineraryContext';
import TimePickerModal from '../../../components/common/TimePickerModal';
import MapView, { Marker } from 'react-native-maps'; // ⭐️ 1. MapView와 Marker를 불러옵니다.

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

// UI 확인을 위한 임시 데이터 (좌표 추가)
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

  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  useEffect(() => {
    if (days.length > 0) return;
    const start = new Date(route.params.startDate);
    const end = new Date(route.params.endDate);
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

  useEffect(() => {
    navigation.setOptions({ title: tripName });
  }, [navigation, tripName]);

  const handleEditTime = (place: Place) => {
    setEditingPlace(place);
    setTimePickerVisible(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const selectedDay = days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단에 지도 뷰 추가 */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          // 지도의 초기 위치를 선택된 날짜의 첫 번째 장소로 설정 (장소가 있을 경우)
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
          {/* 선택된 날의 장소들을 마커로 표시 */}
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

      {/* 날짜 탭 */}
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

      {/* 타임라인 */}
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

      {/* 시간 선택 모달 */}
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
  mapContainer: {
    height: '40%', // 화면의 40%를 지도가 차지하도록 설정
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
