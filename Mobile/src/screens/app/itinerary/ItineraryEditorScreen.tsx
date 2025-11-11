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

// 1. (지시 3) Gesture Handler 및 Reanimated import
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';

const Tab = createMaterialTopTabNavigator();

const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF', // 1. (지시 2) 배경색을 흰색으로 변경
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
  lightGray: '#F5F5F7',
};

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

// (Dummy 데이터는 이전과 동일...)
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

const HOUR_HEIGHT = 180; // (시간당 높이 180px)
const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // (분당 3px)
const MIN_ITEM_HEIGHT = 45; // (15분 높이)
const GRID_SNAP_HEIGHT = HOUR_HEIGHT / 4; // (15분 = 45px)

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

// --- 시간 그리드 배경 컴포넌트 (수정) ---
const TimeGridBackground = ({ hours }: { hours: number[] }) => {
  const hourStr = (h: number) => h.toString().padStart(2, '0');

  return (
    <View style={styles.gridContainer}>
      {hours.map(hour => (
        <View key={hour} style={[styles.hourBlock, { height: HOUR_HEIGHT }]}>
          {/* 2. (지시 1) 시간 라벨 열 수정 */}
          <View style={styles.hourLabelContainer}>
            <Text style={[styles.timeLabelText, { top: 0 }]}>
              {`${hourStr(hour)}:00`}
            </Text>
            <Text
              style={[
                styles.timeLabelText,
                styles.minuteLabel,
                { top: HOUR_HEIGHT / 4 },
              ]}
            >
              {`${hourStr(hour)}:15`}
            </Text>
            <Text
              style={[
                styles.timeLabelText,
                styles.minuteLabel,
                { top: HOUR_HEIGHT / 2 },
              ]}
            >
              {`${hourStr(hour)}:30`}
            </Text>
            <Text
              style={[
                styles.timeLabelText,
                styles.minuteLabel,
                { top: (HOUR_HEIGHT * 3) / 4 },
              ]}
            >
              {`${hourStr(hour)}:45`}
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

// ⭐️ --- DraggableTimelineItem 컴포넌트 수정 --- ⭐️
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
    newStartMinutes: number,
    newEndMinutes: number,
  ) => void;
}) => {
  const GRID_TOP_OFFSET = 40;
  const startMinutes = timeToMinutes(place.startTime);
  const endMinutes = timeToMinutes(place.endTime);
  const durationMinutes = endMinutes - startMinutes;

  const initialTop =
    (startMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
  const calculatedHeight = durationMinutes * MINUTE_HEIGHT;
  const initialHeight = Math.max(calculatedHeight, MIN_ITEM_HEIGHT);

  const top = useSharedValue(initialTop);
  const height = useSharedValue(initialHeight);

  const startY = useSharedValue(0);
  const startHeight = useSharedValue(0);

  const isResizingTop = useSharedValue(0);
  const isResizingBottom = useSharedValue(0);

  // 1. 제스처 핸들러 1: 카드 이동 (중앙)
  const panGestureMove = Gesture.Pan()
    .onBegin(() => {
      startY.value = top.value;
    })
    .onUpdate(event => {
      top.value = startY.value + event.translationY;
    })
    .onEnd(event => {
      const newTop = startY.value + event.translationY;
      const relativeTop = newTop - GRID_TOP_OFFSET;
      const snappedRelativeTop =
        Math.round(relativeTop / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
      const snappedTop = snappedRelativeTop + GRID_TOP_OFFSET;

      top.value = withSpring(snappedTop);

      const newStartMinutes =
        snappedRelativeTop / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes = newStartMinutes + durationMinutes;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    });

  // 2. 제스처 핸들러 2: 상단 리사이즈 (Top Handle)
  const panGestureResizeTop = Gesture.Pan()
    .onBegin(() => {
      startY.value = top.value;
      startHeight.value = height.value;
      isResizingTop.value = withSpring(1); // ⭐️ 수정: 피드백 활성화
    })
    .onUpdate(event => {
      const newHeight = startHeight.value - event.translationY;
      if (newHeight >= MIN_ITEM_HEIGHT) {
        top.value = startY.value + event.translationY;
        height.value = newHeight;
      }
    })
    .onEnd(event => {
      // ⭐️ 수정: onEnd에서 최종 값 계산 로직 수정
      const relativeTop = top.value - GRID_TOP_OFFSET;
      const snappedRelativeTop =
        Math.round(relativeTop / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
      let finalSnappedTop = snappedRelativeTop + GRID_TOP_OFFSET;

      const originalBottomPosition = startY.value + startHeight.value;
      let finalSnappedHeight = originalBottomPosition - finalSnappedTop;

      if (finalSnappedHeight < MIN_ITEM_HEIGHT) {
        finalSnappedHeight = MIN_ITEM_HEIGHT;
        finalSnappedTop = originalBottomPosition - MIN_ITEM_HEIGHT;
      }

      top.value = withSpring(finalSnappedTop);
      height.value = withSpring(finalSnappedHeight);

      // ⭐️ 수정: runOnJS에 'finalSnappedTop'과 'finalSnappedHeight' 사용
      const newStartMinutes =
        (finalSnappedTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes =
        newStartMinutes + finalSnappedHeight / MINUTE_HEIGHT;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    })
    .onFinalize(() => {
      isResizingTop.value = withSpring(0); // ⭐️ 수정: 피드백 비활성화
    });

  // 3. 제스처 핸들러 3: 하단 리사이즈 (Bottom Handle)
  const panGestureResizeBottom = Gesture.Pan()
    .onBegin(() => {
      startHeight.value = height.value;
      isResizingBottom.value = withSpring(1); // ⭐️ 수정: 피드백 활성화
    })
    .onUpdate(event => {
      const newHeight = startHeight.value + event.translationY;
      height.value = Math.max(newHeight, MIN_ITEM_HEIGHT);
    })
    .onEnd(event => {
      const snappedHeight =
        Math.round(height.value / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
      const finalHeight = Math.max(snappedHeight, MIN_ITEM_HEIGHT);
      height.value = withSpring(finalHeight);

      const newStartMinutes =
        (top.value - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    })
    .onFinalize(() => {
      isResizingBottom.value = withSpring(0); // ⭐️ 수정: 피드백 비활성화
    });

  // 4. 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: top.value,
      height: height.value,
      left: 90,
      right: 15,
    };
  });

  // 5. 시각적 피드백(핸들)을 위한 애니메이션 스타일
  const topHandleStyle = useAnimatedStyle(() => {
    return {
      opacity: isResizingTop.value,
    };
  });

  const bottomHandleStyle = useAnimatedStyle(() => {
    return {
      opacity: isResizingBottom.value,
    };
  });

  return (
    // ⭐️ 6. 제스처 디텍터 중첩 구조로 변경
    <Animated.View style={animatedStyle}>
      {/* 6-1. 이동 제스처 (가운데 영역) */}
      <GestureDetector gesture={panGestureMove}>
        <Animated.View style={{ flex: 1 }}>
          <TimelineItem
            item={place}
            onDelete={onDelete}
            onEditTime={onEditTime}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </GestureDetector>

      {/* 6-2. 상단 리사이즈 핸들 */}
      <GestureDetector gesture={panGestureResizeTop}>
        <Animated.View style={styles.resizeHandleTop}>
          <Animated.View
            style={[styles.resizeHandleIndicator, topHandleStyle]}
          />
        </Animated.View>
      </GestureDetector>

      {/* 6-3. 하단 리사이즈 핸들 */}
      <GestureDetector gesture={panGestureResizeBottom}>
        <Animated.View style={styles.resizeHandleBottom}>
          <Animated.View
            style={[styles.resizeHandleIndicator, bottomHandleStyle]}
          />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};
// ⭐️ --- DraggableTimelineItem 컴포넌트 수정 끝 --- ⭐️

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

  const handleUpdatePlaceTimes = (
    placeId: string,
    newStartMinutes: number,
    newEndMinutes: number,
  ) => {
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
                onDragEnd={handleUpdatePlaceTimes}
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

                handleUpdatePlaceTimes(
                  place.id,
                  newStartTimeMinutes,
                  newEndTimeMinutes,
                );
              } else {
                const newEndTimeMinutes = timeToMinutes(newTime);
                const startTimeMinutes = timeToMinutes(place.startTime);

                if (newEndTimeMinutes <= startTimeMinutes) {
                  handleUpdatePlaceTimes(
                    place.id,
                    startTimeMinutes,
                    startTimeMinutes + 15,
                  );
                } else {
                  handleUpdatePlaceTimes(
                    place.id,
                    startTimeMinutes,
                    newEndTimeMinutes,
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
  // --- (지시 1, 3) 스타일 수정 ---
  hourLabelContainer: {
    width: 60,
    height: HOUR_HEIGHT,
    position: 'relative',
    alignItems: 'center',
  },
  hourLabelGroup: {
    // 3. 이 스타일은 이제 사용되지 않음
  },
  hourText: {
    // 4. 이 스타일은 이제 사용되지 않음
  },
  hourTextMain: {
    // 5. 이 스타일은 이제 사용되지 않음
  },
  hourTextSub: {
    // 6. 이 스타일은 이제 사용되지 않음
  },
  minuteLabel: {
    // 7. 이 스타일은 이제 사용되지 않음
  },
  // 8. (지시 1, 3) 새로운 시간 라벨 스타일
  timeLabelText: {
    position: 'absolute',
    marginTop: -8,
    color: COLORS.placeholder,
    fontSize: 12,
    fontWeight: '500',
    width: '100%',
    textAlign: 'center',
  },
  // ---
  hourContent: {
    flex: 1,
    marginLeft: 30,
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
  // ⭐️ 13. 리사이즈 핸들 스타일 수정
  resizeHandleTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 24, // 터치 영역 20 -> 24
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-start', // ⭐️ 수정: 상단에 배치
    paddingTop: 4, // ⭐️ 수정: 여백
  },
  resizeHandleBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24, // 터치 영역 20 -> 24
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-end', // ⭐️ 수정: 하단에 배치
    paddingBottom: 4, // ⭐️ 수정: 여백
  },
  resizeHandleIndicator: {
    width: 30,
    height: 3, // ⭐️ 수정: 4 -> 3
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.8, // ⭐️ 수정: 기본 투명도 0, 드래그 시 1로 변경
  },
});
