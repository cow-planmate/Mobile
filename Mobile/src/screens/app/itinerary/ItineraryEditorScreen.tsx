// src/screens/app/itinerary/ItineraryEditorScreen.tsx
import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Button,
  TextInput,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import TimelineItem, {
  Place,
} from '../../../components/itinerary/TimelineItem';
import { useItinerary, Day } from '../../../contexts/ItineraryContext';
import TimePickerModal from '../../../components/common/TimePickerModal';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const Tab = createMaterialTopTabNavigator();

const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
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
    startTime: '09:00',
    endTime: '10:00',
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
    startTime: '10:15',
    endTime: '11:45',
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
    startTime: '13:00',
    endTime: '14:30',
    address: '서울특별시 강서구',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/id/14/100/100',
    latitude: 37.55,
    longitude: 126.8,
  },
];
const DUMMY_SEARCH_RESULTS: Omit<Place, 'startTime' | 'endTime'>[] = [
  {
    id: '10',
    name: '더현대 서울',
    type: '관광지',
    address: '서울 영등포구',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/id/20/100/100',
    latitude: 37.525,
    longitude: 126.928,
  },
  {
    id: '11',
    name: '콘래드 서울',
    type: '숙소',
    address: '서울 영등포구',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/id/21/100/100',
    latitude: 37.526,
    longitude: 126.927,
  },
  {
    id: '12',
    name: '세상의모든아침',
    type: '식당',
    address: '서울 영등포구',
    rating: 4.5,
    imageUrl: 'https://picsum.photos/id/22/100/100',
    latitude: 37.527,
    longitude: 126.929,
  },
  {
    id: '13',
    name: '63빌딩',
    type: '관광지',
    address: '서울 영등포구',
    rating: 4.6,
    imageUrl: 'https://picsum.photos/id/23/100/100',
    latitude: 37.519,
    longitude: 126.94,
  },
];

const PlaceSearchResultItem = ({
  item,
  onSelect,
}: {
  item: Omit<Place, 'startTime' | 'endTime'>;
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

const HOUR_HEIGHT = 120;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const MIN_ITEM_HEIGHT = 80; // 1. 최소 높이 상수 다시 추가
const GRID_SNAP_HEIGHT = HOUR_HEIGHT / 4;

const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const timeToDate = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const dateToTime = (date: Date) => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const minutesToTime = (totalMinutes: number) => {
  const snappedMinutes = Math.round(totalMinutes / 15) * 15;
  const hours = Math.floor(snappedMinutes / 60) % 24;
  const minutes = snappedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

const TimeGridBackground = ({ hours }: { hours: number[] }) => {
  const hourStr = (h: number) => h.toString().padStart(2, '0');

  return (
    <View style={styles.gridContainer}>
      {hours.map(hour => (
        <View key={hour} style={[styles.hourBlock, { height: HOUR_HEIGHT }]}>
          <View style={styles.hourLabelContainer}>
            <View style={[styles.hourLabelGroup, { top: 0 }]}>
              <Text style={[styles.hourText, styles.hourTextMain]}>
                {`${hourStr(hour)}`}
              </Text>
              <Text style={[styles.hourText, styles.hourTextSub]}>00</Text>
            </View>
            <Text
              style={[
                styles.hourText,
                styles.hourTextSub,
                styles.minuteLabel,
                { top: HOUR_HEIGHT / 4 },
              ]}
            >
              15
            </Text>
            <Text
              style={[
                styles.hourText,
                styles.hourTextSub,
                styles.minuteLabel,
                { top: HOUR_HEIGHT / 2 },
              ]}
            >
              30
            </Text>
            <Text
              style={[
                styles.hourText,
                styles.hourTextSub,
                styles.minuteLabel,
                { top: (HOUR_HEIGHT * 3) / 4 },
              ]}
            >
              45
            </Text>
          </View>

          <View style={styles.hourContent}>
            <View style={[styles.quarterBlock, styles.firstQuarterBlock]} />
            <View style={styles.quarterBlock} />
            <View style={styles.quarterBlock} />
            <View style={styles.quarterBlock} />
          </View>
        </View>
      ))}
    </View>
  );
};

// 2. onDragEnd prop 타입 수정 (string -> number)
const DraggableTimelineItem = ({
  place,
  offsetMinutes,
  onDelete,
  onEditTime,
  onDragEnd,
}: {
  place: Place;
  offsetMinutes: number;
  onDelete: () => void;
  onEditTime: (type: 'startTime' | 'endTime') => void;
  onDragEnd: (
    placeId: string,
    newStartMinutes: number, // string -> number
    newEndMinutes: number, // string -> number
  ) => void;
}) => {
  const startMinutes = timeToMinutes(place.startTime);
  const endMinutes = timeToMinutes(place.endTime);
  const durationMinutes = endMinutes - startMinutes;

  const initialTop = (startMinutes - offsetMinutes) * MINUTE_HEIGHT + 20;
  const calculatedHeight = (endMinutes - startMinutes) * MINUTE_HEIGHT;

  // 3. 최소 높이(MIN_ITEM_HEIGHT) 적용 복원
  const height = Math.max(calculatedHeight, MIN_ITEM_HEIGHT);

  const top = useSharedValue(initialTop);
  const startY = useSharedValue(initialTop);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startY.value = top.value;
    })
    .onUpdate(event => {
      top.value = startY.value + event.translationY;
    })
    .onEnd(event => {
      const newTop = startY.value + event.translationY;

      const snappedTop =
        Math.round(newTop / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;

      const newStartMinutes = (snappedTop - 20) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes = newStartMinutes + durationMinutes;

      // 4. (오류 수정) runOnJS에는 number 타입의 분(minutes)을 전달
      runOnJS(onDragEnd)(
        place.id,
        newStartMinutes, // minutesToTime() 호출 제거
        newEndMinutes, // minutesToTime() 호출 제거
      );

      top.value = withSpring(snappedTop + 20);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: top.value,
      height: height, // 최소 높이가 적용된 'height' 사용
      left: 0,
      right: 15,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <TimelineItem
          item={place}
          onDelete={onDelete}
          onEditTime={onEditTime}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const { days, setDays, deletePlaceFromDay, addPlaceToDay, updatePlaceTimes } =
    useItinerary();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tripName, setTripName] = useState('강서구 1');
  const [isEditingTripName, setIsEditingTripName] = useState(false);

  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [editingTime, setEditingTime] = useState<{
    placeId: string;
    type: 'startTime' | 'endTime';
    time: string;
  } | null>(null);

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}.${day}`;
  };

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () =>
        isEditingTripName ? (
          <TextInput
            value={tripName}
            onChangeText={setTripName}
            autoFocus={true}
            onBlur={() => setIsEditingTripName(false)}
            style={styles.headerInput}
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingTripName(true)}>
            <Text style={styles.headerTitle}>{tripName}</Text>
          </TouchableOpacity>
        ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ItineraryView', { days, tripName })
          }
          style={styles.headerDoneButton}
        >
          <Text style={styles.headerDoneButtonText}>완료</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, tripName, days, isEditingTripName]);

  const handleEditTime = (
    placeId: string,
    type: 'startTime' | 'endTime',
    time: string,
  ) => {
    setEditingTime({ placeId, type, time });
    setTimePickerVisible(true);
  };

  // 5. (오류 수정) handleDragEnd가 number 타입을 받도록 수정
  const handleDragEnd = (
    placeId: string,
    newStartMinutes: number,
    newEndMinutes: number,
  ) => {
    // 6. (오류 수정) '분'을 '시간 문자열'로 변환하는 작업을 JS 스레드(여기)에서 수행
    const newStartTime = minutesToTime(newStartMinutes);
    const newEndTime = minutesToTime(newEndMinutes);
    updatePlaceTimes(selectedDayIndex, placeId, newStartTime, newEndTime);
  };

  const selectedDay = days[selectedDayIndex];

  const TimelineView = () => {
    const { gridHours, offsetMinutes } = useMemo(() => {
      let minHour = 9;
      let maxHour = 17;

      if (selectedDay && selectedDay.places.length > 0) {
        const startTimes = selectedDay.places.map(p =>
          timeToMinutes(p.startTime),
        );
        const endTimes = selectedDay.places.map(p => timeToMinutes(p.endTime));

        const minTime = Math.min(...startTimes);
        const maxTime = Math.max(...endTimes);

        minHour = Math.max(0, Math.floor(minTime / 60) - 1);
        maxHour = Math.min(23, Math.ceil(maxTime / 60) + 1);
      }

      const gridHours = Array.from(
        { length: maxHour - minHour + 1 },
        (_, i) => i + minHour,
      );
      const offsetMinutes = minHour * 60;

      return { gridHours, offsetMinutes };
    }, [selectedDay]);

    return (
      <View style={styles.tabContentContainer}>
        <ScrollView contentContainerStyle={styles.timelineContentContainer}>
          <View style={styles.timelineWrapper}>
            <TimeGridBackground hours={gridHours} />

            {selectedDay?.places.map(place => (
              <DraggableTimelineItem
                key={place.id}
                place={place}
                offsetMinutes={offsetMinutes}
                onDelete={() => deletePlaceFromDay(selectedDayIndex, place.id)}
                onEditTime={type =>
                  handleEditTime(
                    place.id,
                    type,
                    type === 'startTime' ? place.startTime : place.endTime,
                  )
                }
                onDragEnd={handleDragEnd}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const AddPlaceView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'관광지' | '숙소' | '식당'>(
      '관광지',
    );

    const filteredPlaces = DUMMY_SEARCH_RESULTS.filter(place => {
      const matchesTab = place.type === selectedTab;
      const matchesSearch = place.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

    const handleSelectPlace = (place: Omit<Place, 'startTime' | 'endTime'>) => {
      addPlaceToDay(selectedDayIndex, place);
    };

    return (
      <View style={styles.tabContentContainer}>
        <View style={styles.searchHeader}>
          <TextInput
            style={styles.searchInput}
            placeholder="장소를 검색하세요"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.placeTypeTabContainer}>
          <TouchableOpacity
            onPress={() => setSelectedTab('관광지')}
            style={[
              styles.placeTypeTab,
              selectedTab === '관광지' && styles.placeTypeTabSelected,
            ]}
          >
            <Text
              style={[
                styles.placeTypeTabText,
                selectedTab === '관광지' && styles.placeTypeTabTextSelected,
              ]}
            >
              관광지
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('숙소')}
            style={[
              styles.placeTypeTab,
              selectedTab === '숙소' && styles.placeTypeTabSelected,
            ]}
          >
            <Text
              style={[
                styles.placeTypeTabText,
                selectedTab === '숙소' && styles.placeTypeTabTextSelected,
              ]}
            >
              숙소
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('식당')}
            style={[
              styles.placeTypeTab,
              selectedTab === '식당' && styles.placeTypeTabSelected,
            ]}
          >
            <Text
              style={[
                styles.placeTypeTabText,
                selectedTab === '식당' && styles.placeTypeTabTextSelected,
              ]}
            >
              식당
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addPlaceListContainer}>
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
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dayTabsWrapper}>
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
              <Text
                style={[
                  styles.dayTabDateText,
                  selectedDayIndex === index && styles.dayTabDateTextSelected,
                ]}
              >
                {formatDate(day.date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.placeholder,
          tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
          tabBarLabelStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen name="타임라인">{() => <TimelineView />}</Tab.Screen>
        <Tab.Screen name="장소추가">{() => <AddPlaceView />}</Tab.Screen>
      </Tab.Navigator>

      {editingTime && (
        <TimePickerModal
          visible={isTimePickerVisible}
          onClose={() => setTimePickerVisible(false)}
          initialDate={timeToDate(editingTime.time)}
          onConfirm={date => {
            const newTime = dateToTime(date);
            const place = selectedDay.places.find(
              p => p.id === editingTime.placeId,
            );
            if (place) {
              if (editingTime.type === 'startTime') {
                const newStartTimeMinutes = timeToMinutes(newTime);
                const endTimeMinutes = timeToMinutes(place.endTime);

                const durationMinutes =
                  endTimeMinutes - timeToMinutes(place.startTime);

                const newEndTimeMinutes = newStartTimeMinutes + durationMinutes;
                const newEndTime = minutesToTime(newEndTimeMinutes);

                updatePlaceTimes(
                  selectedDayIndex,
                  place.id,
                  newTime,
                  newEndTime,
                );
              } else {
                const newEndTimeMinutes = timeToMinutes(newTime);
                const startTimeMinutes = timeToMinutes(place.startTime);

                if (newEndTimeMinutes <= startTimeMinutes) {
                  const newEndTime = minutesToTime(startTimeMinutes + 15);
                  updatePlaceTimes(
                    selectedDayIndex,
                    place.id,
                    place.startTime,
                    newEndTime,
                  );
                } else {
                  updatePlaceTimes(
                    selectedDayIndex,
                    place.id,
                    place.startTime,
                    newTime,
                  );
                }
              }
            }
            setTimePickerVisible(false);
            setEditingTime(null);
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
  headerDoneButton: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  headerDoneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dayTabsWrapper: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    minWidth: 60,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
  },
  dayTabText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  dayTabTextSelected: {
    color: COLORS.white,
  },
  dayTabDateText: {
    color: COLORS.placeholder,
    fontSize: 12,
    marginTop: 2,
  },
  dayTabDateTextSelected: {
    color: COLORS.white,
    opacity: 0.8,
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  timelineContainer: {
    paddingVertical: 20,
  },
  timelineContentContainer: {
    paddingBottom: 200,
  },
  timelineWrapper: {
    position: 'relative',
    paddingVertical: 20,
  },
  gridContainer: {
    paddingVertical: 20,
  },
  hourBlock: {
    flexDirection: 'row',
  },
  hourLabelContainer: {
    width: 60,
    height: HOUR_HEIGHT,
    position: 'relative',
    alignItems: 'center',
  },
  hourLabelGroup: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    top: 0,
    marginTop: -8,
    alignItems: 'baseline',
  },
  hourText: {
    color: COLORS.placeholder,
    fontSize: 10,
  },
  hourTextMain: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  hourTextSub: {
    marginLeft: 2,
  },
  minuteLabel: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    marginTop: -8,
  },
  hourContent: {
    flex: 1,
    height: HOUR_HEIGHT,
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingLeft: 90,
  },
  quarterBlock: {
    height: HOUR_HEIGHT / 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  firstQuarterBlock: {
    borderTopColor: COLORS.border,
  },
  addPlaceListContainer: {
    flex: 1,
  },
  searchHeader: {
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
  },
  placeTypeTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: COLORS.card,
  },
  placeTypeTab: {
    marginRight: 15,
    paddingVertical: 10,
  },
  placeTypeTabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  placeTypeTabText: {
    fontSize: 16,
    color: COLORS.placeholder,
    fontWeight: '600',
  },
  placeTypeTabTextSelected: {
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
