import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import TimelineItem, { Place } from '../../../components/itinerary/TimelineItem';
import TimePickerModal from '../../../components/common/TimePickerModal';
import ScheduleEditModal from '../../../components/common/ScheduleEditModal';
import { Day } from '../../../contexts/ItineraryContext';
import {
  styles,
  COLORS,
  HOUR_HEIGHT,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_SNAP_HEIGHT,
} from './ItineraryEditorScreen.styles';
import { timeToMinutes, timeToDate, dateToTime } from '../../../utils/timeUtils';

const Tab = createMaterialTopTabNavigator();

const PlaceSearchResultItem = React.memo(
  ({
    item,
    onSelect,
  }: {
    item: Omit<Place, 'startTime' | 'endTime'>;
    onSelect: () => void;
  }) => (
    <TouchableOpacity style={styles.resultItem} onPress={onSelect}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
      ) : (
        <View style={[styles.resultImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>{item.type[0]}</Text>
        </View>
      )}
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultMeta}>
          {item.type} · ⭐ {item.rating > 0 ? item.rating : '-'}
        </Text>
        <Text style={styles.resultAddress} numberOfLines={1}>
          {item.resultAddress || item.address}
        </Text>
      </View>
    </TouchableOpacity>
  ),
);

const TimeGridBackground = React.memo(({ hours }: { hours: number[] }) => {
  const hourStr = (h: number) => h.toString().padStart(2, '0');

  return (
    <View style={styles.gridContainer}>
      {hours.map(hour => (
        <View key={hour} style={[styles.hourBlock, { height: HOUR_HEIGHT }]}>
          <View style={styles.hourLabelContainer}>
            <Text style={[styles.timeLabelText, styles.timeLabelTop]}>
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
});

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
  const MIN_TOP_PX = GRID_TOP_OFFSET;
  const TOTAL_TIMELINE_MINS = 24 * 60;
  const TOTAL_TIMELINE_PX = TOTAL_TIMELINE_MINS * MINUTE_HEIGHT;
  const MAX_BOTTOM_PX = GRID_TOP_OFFSET + TOTAL_TIMELINE_PX;

  const startMinutes = timeToMinutes(place.startTime);
  const endMinutes = timeToMinutes(place.endTime);
  const durationMinutes = endMinutes - startMinutes;

  const initialTop =
    (startMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
  const calculatedHeight = durationMinutes * MINUTE_HEIGHT;
  const initialHeight = Math.max(calculatedHeight, MIN_ITEM_HEIGHT);

  const top = useSharedValue(initialTop);
  const height = useSharedValue(initialHeight);

  React.useEffect(() => {
    const newStartMinutes = timeToMinutes(place.startTime);
    const newEndMinutes = timeToMinutes(place.endTime);
    const newDurationMinutes = newEndMinutes - newStartMinutes;

    const newTop =
      (newStartMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
    const newCalculatedHeight = newDurationMinutes * MINUTE_HEIGHT;
    const newHeight = Math.max(newCalculatedHeight, MIN_ITEM_HEIGHT);

    if (top.value !== newTop) {
      top.value = withSpring(newTop);
    }
    if (height.value !== newHeight) {
      height.value = withSpring(newHeight);
    }
  }, [place.startTime, place.endTime, offsetMinutes, top, height]);

  const startY = useSharedValue(0);
  const startHeight = useSharedValue(0);
  const isResizingTop = useSharedValue(0);
  const isResizingBottom = useSharedValue(0);

  const panGestureMove = Gesture.Pan()
    .onBegin(() => {
      startY.value = top.value;
    })
    .onUpdate(event => {
      const newTop = startY.value + event.translationY;
      const maxTop = MAX_BOTTOM_PX - height.value;
      const clampedTop = Math.max(MIN_TOP_PX, Math.min(newTop, maxTop));
      top.value = clampedTop;
    })
    .onEnd(event => {
      const snappedTop =
        Math.round((top.value - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
          GRID_SNAP_HEIGHT +
        GRID_TOP_OFFSET;
      top.value = withSpring(snappedTop);

      const newStartMinutes =
        (snappedTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes = newStartMinutes + durationMinutes;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    });

  const panGestureResizeTop = Gesture.Pan()
    .onBegin(() => {
      startY.value = top.value;
      startHeight.value = height.value;
      isResizingTop.value = withSpring(1);
    })
    .onUpdate(event => {
      const newTop = startY.value + event.translationY;
      const newHeight = startHeight.value - (newTop - startY.value);

      if (newHeight >= MIN_ITEM_HEIGHT && newTop >= MIN_TOP_PX) {
        top.value = newTop;
        height.value = newHeight;
      }
    })
    .onEnd(() => {
      const snappedTop =
        Math.round((top.value - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
          GRID_SNAP_HEIGHT +
        GRID_TOP_OFFSET;
      const bottom = startY.value + startHeight.value;
      let finalTop = Math.max(MIN_TOP_PX, snappedTop);
      let finalHeight = bottom - finalTop;

      if (finalHeight < MIN_ITEM_HEIGHT) {
        finalHeight = MIN_ITEM_HEIGHT;
        finalTop = bottom - MIN_ITEM_HEIGHT;
      }

      top.value = withSpring(finalTop);
      height.value = withSpring(finalHeight);

      const newStartMinutes =
        (finalTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    })
    .onFinalize(() => {
      isResizingTop.value = withSpring(0);
    });

  const panGestureResizeBottom = Gesture.Pan()
    .onBegin(() => {
      startHeight.value = height.value;
      isResizingBottom.value = withSpring(1);
    })
    .onUpdate(event => {
      const newHeight = startHeight.value + event.translationY;
      const newBottom = top.value + newHeight;

      if (newHeight >= MIN_ITEM_HEIGHT && newBottom <= MAX_BOTTOM_PX) {
        height.value = newHeight;
      }
    })
    .onEnd(() => {
      const snappedHeight =
        Math.round(height.value / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
      let finalHeight = Math.max(snappedHeight, MIN_ITEM_HEIGHT);
      if (top.value + finalHeight > MAX_BOTTOM_PX) {
        finalHeight = MAX_BOTTOM_PX - top.value;
      }

      height.value = withSpring(finalHeight);

      const newStartMinutes =
        (top.value - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    })
    .onFinalize(() => {
      isResizingBottom.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: top.value,
      height: height.value,
      left: 60,
      right: 15,
    };
  });

  const topHandleStyle = useAnimatedStyle(() => {
    return { opacity: isResizingTop.value };
  });

  const bottomHandleStyle = useAnimatedStyle(() => {
    return { opacity: isResizingBottom.value };
  });

  return (
    <Animated.View style={animatedStyle}>
      <GestureDetector gesture={panGestureMove}>
        <Animated.View style={styles.flex1}>
          <TimelineItem
            item={place}
            onDelete={onDelete}
            onEditTime={onEditTime}
            style={styles.flex1}
          />
        </Animated.View>
      </GestureDetector>

      <GestureDetector gesture={panGestureResizeTop}>
        <Animated.View style={styles.resizeHandleTop}>
          <Animated.View
            style={[styles.resizeHandleIndicator, topHandleStyle]}
          />
        </Animated.View>
      </GestureDetector>

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

const TimelineComponent = React.memo(
  React.forwardRef<
    ScrollView,
    {
      selectedDay: Day;
      onDeletePlace: (placeId: string) => void;
      onEditPlaceTime: (
        placeId: string,
        type: 'startTime' | 'endTime',
        time: string,
      ) => void;
      onUpdatePlaceTimes: (
        placeId: string,
        newStartMinutes: number,
        newEndMinutes: number,
      ) => void;
    }
  >(
    (
      { selectedDay, onDeletePlace, onEditPlaceTime, onUpdatePlaceTimes },
      ref,
    ) => {
      const { gridHours, offsetMinutes } = React.useMemo(() => {
        const minHour = 0;
        const maxHour = 23;
        const hours = Array.from(
          { length: maxHour - minHour + 1 },
          (_, i) => i + minHour,
        );
        const offset = minHour * 60;
        return { gridHours: hours, offsetMinutes: offset };
      }, []);

      return (
        <View style={styles.tabContentContainer}>
          <ScrollView
            ref={ref}
            contentContainerStyle={styles.timelineContentContainer}
          >
            <View style={styles.timelineWrapper}>
              <TimeGridBackground hours={gridHours} />
              {selectedDay?.places.map(place => (
                <DraggableTimelineItem
                  key={place.id}
                  place={place}
                  offsetMinutes={offsetMinutes}
                  onDelete={() => onDeletePlace(place.id)}
                  onEditTime={type =>
                    onEditPlaceTime(
                      place.id,
                      type,
                      type === 'startTime' ? place.startTime : place.endTime,
                    )
                  }
                  onDragEnd={onUpdatePlaceTimes}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      );
    },
  ),
);

const AddPlaceComponent = React.memo(
  ({
    onAddPlace,
    destination,
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    searchResults,
    isLoading,
    handleSearch,
    filteredPlaces,
  }: {
    onAddPlace: (place: Omit<Place, 'startTime' | 'endTime'>) => void;
    destination: string;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    selectedTab: '관광지' | '숙소' | '식당';
    setSelectedTab: (tab: '관광지' | '숙소' | '식당') => void;
    searchResults: Place[];
    isLoading: boolean;
    handleSearch: () => void;
    filteredPlaces: Place[];
  }) => {
    return (
      <View style={styles.tabContentContainer}>
        <View style={styles.searchHeader}>
          <TextInput
            style={styles.searchInput}
            placeholder={
              destination ? `${destination} 근처 장소 검색` : '장소 검색'
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.placeTypeTabContainer}>
          {['관광지', '숙소', '식당'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab as any)}
              style={[
                styles.placeTypeTab,
                selectedTab === tab && styles.placeTypeTabSelected,
              ]}
            >
              <Text
                style={[
                  styles.placeTypeTabText,
                  selectedTab === tab && styles.placeTypeTabTextSelected,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.addPlaceListContainer}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={styles.marginTop20}
            />
          ) : (
            <FlatList
              data={filteredPlaces}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <PlaceSearchResultItem
                  item={item}
                  onSelect={() => onAddPlace(item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchResults.length === 0
                      ? '검색 결과가 없습니다.'
                      : `${selectedTab}에 해당하는 장소가 없습니다.`}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    );
  },
);

export interface ItineraryEditorScreenViewProps {
  days: Day[];
  selectedDayIndex: number;
  setSelectedDayIndex: (idx: number) => void;
  tripName: string;
  isTimePickerVisible: boolean;
  setTimePickerVisible: (visible: boolean) => void;
  editingTime: {
    placeId: string;
    type: 'startTime' | 'endTime';
    time: string;
  } | null;
  timelineScrollRef: React.RefObject<ScrollView>;
  formatDate: (date: Date) => string;
  handleEditTime: (
    placeId: string,
    type: 'startTime' | 'endTime',
    time: string,
  ) => void;
  handleUpdatePlaceTimes: (
    placeId: string,
    newStartMinutes: number,
    newEndMinutes: number,
  ) => void;
  handleDeletePlace: (placeId: string) => void;
  handleAddPlace: (place: Omit<Place, 'startTime' | 'endTime'>) => void;
  selectedDay: Day | null;
  onlineUsers: any[];
  isScheduleEditVisible: boolean;
  setScheduleEditVisible: (v: boolean) => void;
  onConfirmScheduleEdit: (updatedDays: any[]) => void;
  onConfirmTimePicker: (date: Date) => void;
  destination: string;
  onComplete: () => void;
  // State for AddPlaceComponent
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedTab: '관광지' | '숙소' | '식당';
  setSelectedTab: (t: '관광지' | '숙소' | '식당') => void;
  searchResults: Place[];
  isSearching: boolean;
  handleSearch: () => void;
  filteredPlaces: Place[];
}

export default function ItineraryEditorScreenView({
  days,
  selectedDayIndex,
  setSelectedDayIndex,
  tripName,
  isTimePickerVisible,
  setTimePickerVisible,
  editingTime,
  timelineScrollRef,
  formatDate,
  handleEditTime,
  handleUpdatePlaceTimes,
  handleDeletePlace,
  handleAddPlace,
  selectedDay,
  onlineUsers,
  isScheduleEditVisible,
  setScheduleEditVisible,
  onConfirmScheduleEdit,
  onConfirmTimePicker,
  destination,
  onComplete,
  searchQuery,
  setSearchQuery,
  selectedTab,
  setSelectedTab,
  searchResults,
  isSearching,
  handleSearch,
  filteredPlaces,
}: ItineraryEditorScreenViewProps) {
  if (!selectedDay) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>일정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dayTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContainer}
          style={styles.dayTabsScroll}
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
                {day.dayNumber}일차
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
          <TouchableOpacity
            style={styles.dayTab}
            onPress={() => setScheduleEditVisible(true)}
          >
            <Text style={styles.dayTabText}>+</Text>
            <Text style={styles.dayTabDateText}>수정</Text>
          </TouchableOpacity>
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
        <Tab.Screen name="타임라인">
          {() => (
            <TimelineComponent
              ref={timelineScrollRef}
              selectedDay={selectedDay}
              onDeletePlace={handleDeletePlace}
              onEditPlaceTime={handleEditTime}
              onUpdatePlaceTimes={handleUpdatePlaceTimes}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="장소추가">
          {() => (
            <AddPlaceComponent
              onAddPlace={handleAddPlace}
              destination={destination}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              searchResults={searchResults}
              isLoading={isSearching}
              handleSearch={handleSearch}
              filteredPlaces={filteredPlaces}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
        <Text style={styles.completeButtonText}>일정 생성 완료</Text>
      </TouchableOpacity>

      {editingTime && (
        <TimePickerModal
          visible={isTimePickerVisible}
          onClose={() => setTimePickerVisible(false)}
          initialDate={timeToDate(editingTime.time)}
          onConfirm={onConfirmTimePicker}
        />
      )}

      <ScheduleEditModal
        visible={isScheduleEditVisible}
        initialDays={days.map(d => ({
          date: d.date,
          startTime: d.startTime,
          endTime: d.endTime,
        }))}
        onClose={() => setScheduleEditVisible(false)}
        onConfirm={onConfirmScheduleEdit}
      />
    </SafeAreaView>
  );
}
