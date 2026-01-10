import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
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
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '@env';
import { AppStackParamList } from '../../../navigation/types';
import TimelineItem, {
  Place,
} from '../../../components/itinerary/TimelineItem';
import { Day } from '../../../contexts/ItineraryContext';
import TimePickerModal from '../../../components/common/TimePickerModal';
import ScheduleEditModal from '../../../components/common/ScheduleEditModal';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  styles,
  COLORS,
  HOUR_HEIGHT,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_SNAP_HEIGHT,
} from './ItineraryEditorScreen.styles';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useItineraryEditor } from '../../../hooks/useItineraryEditor';
import {
  timeToMinutes,
  timeToDate,
  dateToTime,
} from '../../../utils/timeUtils';

const Tab = createMaterialTopTabNavigator();

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

interface PlaceVO {
  placeId: string;
  categoryId: number;
  url: string;
  name: string;
  formatted_address: string;
  rating: number;
  xlocation: number;
  ylocation: number;
  iconUrl: string;
}

const getCategoryType = (id: number): '관광지' | '숙소' | '식당' | '기타' => {
  if ([12, 14, 15, 28].includes(id)) return '관광지';
  if (id === 32) return '숙소';
  if (id === 39) return '식당';
  return '기타';
};

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
          {item.address}
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

  // Re-sync shared values when props change
  useEffect(() => {
    const newStartMinutes = timeToMinutes(place.startTime);
    const newEndMinutes = timeToMinutes(place.endTime);
    const newDurationMinutes = newEndMinutes - newStartMinutes;

    const newTop =
      (newStartMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
    const newCalculatedHeight = newDurationMinutes * MINUTE_HEIGHT;
    const newHeight = Math.max(newCalculatedHeight, MIN_ITEM_HEIGHT);

    // Only update if significantly different to avoid loops/jitters
    if (top.value !== newTop) {
      top.value = withSpring(newTop);
    }
    if (height.value !== newHeight) {
      height.value = withSpring(newHeight);
    }
  }, [place.startTime, place.endTime, offsetMinutes, top, height]);

  // ... rest of the component

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
      const newTop = startY.value + event.translationY;
      const maxTop = MAX_BOTTOM_PX - height.value;
      const clampedTop = Math.max(MIN_TOP_PX, Math.min(newTop, maxTop));

      const relativeTop = clampedTop - GRID_TOP_OFFSET;
      const snappedRelativeTop =
        Math.round(relativeTop / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;

      const newStartMinutes =
        snappedRelativeTop / MINUTE_HEIGHT + offsetMinutes;
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
      const relativeTop = top.value - GRID_TOP_OFFSET;
      const snappedRelativeTop =
        Math.round(relativeTop / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
      let finalSnappedTop = snappedRelativeTop + GRID_TOP_OFFSET;

      finalSnappedTop = Math.max(MIN_TOP_PX, finalSnappedTop);

      const originalBottomPosition = startY.value + startHeight.value;
      let finalSnappedHeight = originalBottomPosition - finalSnappedTop;

      if (finalSnappedHeight < MIN_ITEM_HEIGHT) {
        finalSnappedHeight = MIN_ITEM_HEIGHT;
        finalSnappedTop = originalBottomPosition - MIN_ITEM_HEIGHT;
      }

      const newStartMinutes =
        (finalSnappedTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes =
        newStartMinutes + finalSnappedHeight / MINUTE_HEIGHT;

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

      const newBottom = top.value + snappedHeight;
      let finalHeight = snappedHeight;

      if (newBottom > MAX_BOTTOM_PX) {
        finalHeight = MAX_BOTTOM_PX - top.value;
      }

      finalHeight = Math.max(finalHeight, MIN_ITEM_HEIGHT);

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
      const { gridHours, offsetMinutes } = useMemo(() => {
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
  }: {
    onAddPlace: (place: Omit<Place, 'startTime' | 'endTime'>) => void;
    destination: string;
  }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'관광지' | '숙소' | '식당'>(
      '관광지',
    );
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPlaces = useCallback(
      async (
        queryTerm: string,
        categoryOverride?: '관광지' | '숙소' | '식당',
      ) => {
        setIsLoading(true);
        try {
          let query = queryTerm;

          if (!queryTerm && destination && categoryOverride) {
            const keyword =
              categoryOverride === '식당' ? '맛집' : categoryOverride;
            query = `${destination} ${keyword}`.trim();
          } else if (destination) {
            query = `${destination} ${queryTerm}`.trim();
          }

          if (!query) {
            setIsLoading(false);
            return;
          }

          const url = `${API_URL}/api/plan/place/${encodeURIComponent(query)}`;
          console.log('Fetching places from:', url);

          const response = await axios.get(url);

          if (response.data && response.data.places) {
            const mappedPlaces: Place[] = response.data.places.map(
              (p: PlaceVO) => ({
                id: p.placeId,
                categoryId: p.categoryId,
                name: p.name,
                type: categoryOverride || getCategoryType(p.categoryId),
                address: p.formatted_address,
                rating: p.rating,
                imageUrl: p.iconUrl,
                latitude: p.ylocation,
                longitude: p.xlocation,
                time: '10:00',
                startTime: '10:00',
                endTime: '11:00',
              }),
            );
            setSearchResults(mappedPlaces);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search failed:', error);
          Alert.alert('오류', '장소 검색에 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      },
      [destination],
    );

    useEffect(() => {
      if (destination && !searchQuery) {
        fetchPlaces('', selectedTab);
      }
    }, [destination, selectedTab, searchQuery, fetchPlaces]);

    const handleSearch = () => {
      fetchPlaces(searchQuery);
    };

    const filteredPlaces = searchResults.filter(place => {
      if (selectedTab === '관광지') {
        return place.type === '관광지' || place.type === '기타';
      }
      // '숙소' | '식당' have no overlap with '기타'
      return place.type === selectedTab;
    });

    const handleSelectPlace = (place: Omit<Place, 'startTime' | 'endTime'>) => {
      onAddPlace(place);
    };

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
                  onSelect={() => handleSelectPlace(item)}
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

export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const {
    days,
    selectedDayIndex,
    setSelectedDayIndex,
    tripName,
    setTripName,
    isEditingTripName,
    setIsEditingTripName,
    isTimePickerVisible,
    setTimePickerVisible,
    editingTime,
    setEditingTime,
    timelineScrollRef,
    formatDate,
    handleEditTime,
    handleUpdatePlaceTimes,
    handleDeletePlace,
    handleAddPlace,
    selectedDay,
  } = useItineraryEditor(route, navigation);

  // WebSocket Integration
  const { connect, onlineUsers, sendMessage } = useWebSocket();
  const planId = route.params.planId;

  const [isScheduleEditVisible, setScheduleEditVisible] = useState(false);

  // Connection
  useEffect(() => {
    if (planId) {
      connect(planId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  useLayoutEffect(() => {
    const handleTitleSave = () => {
      setIsEditingTripName(false);
      if (tripName) {
        sendMessage('update', 'plan', { planId, title: tripName });
      }
    };

    navigation.setOptions({
      headerTitle: () =>
        isEditingTripName ? (
          <TextInput
            value={tripName}
            onChangeText={setTripName}
            autoFocus={true}
            onBlur={handleTitleSave}
            onSubmitEditing={handleTitleSave}
            style={styles.headerInput}
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingTripName(true)}>
            <Text style={styles.headerTitle}>{tripName}</Text>
          </TouchableOpacity>
        ),
      headerRight: () => (
        <View style={styles.onlineUsersContainer}>
          {onlineUsers.length > 0 && (
            <View style={styles.onlineUsersWrapper}>
              {onlineUsers.slice(0, 3).map((u, i) => (
                <View
                  key={u.uid}
                  style={[
                    styles.onlineUserAvatar,
                    {
                      marginLeft: i > 0 ? -10 : 0,
                    },
                  ]}
                >
                  <Text style={styles.onlineUserInitials}>
                    {u.userNickname?.charAt(0) || '?'}
                  </Text>
                </View>
              ))}
              {onlineUsers.length > 3 && (
                <View
                  style={[
                    styles.onlineUserAvatar,
                    styles.moreUsersAvatar,
                    { marginLeft: -10 },
                  ]}
                >
                  <Text style={styles.moreUsersText}>
                    +{onlineUsers.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      ),
    });
  }, [
    navigation,
    tripName,
    days,
    isEditingTripName,
    setIsEditingTripName,
    setTripName,
    onlineUsers,
    planId,
    sendMessage,
  ]);

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
              destination={route.params.destination}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={() =>
          navigation.navigate('ItineraryView', {
            days,
            tripName,
            planId: route.params.planId,
            departure: route.params.departure,
            travelId: route.params.travelId,
            transport: route.params.transport,
            adults: route.params.adults,
            children: route.params.children,
            startDate: route.params.startDate,
            endDate: route.params.endDate,
          })
        }
      >
        <Text style={styles.completeButtonText}>일정 생성 완료</Text>
      </TouchableOpacity>

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

                if (durationMinutes < 15) {
                  handleUpdatePlaceTimes(
                    place.id,
                    newStartTimeMinutes,
                    newStartTimeMinutes + 15,
                  );
                } else {
                  handleUpdatePlaceTimes(
                    place.id,
                    newStartTimeMinutes,
                    newStartTimeMinutes + durationMinutes,
                  );
                }
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

      <ScheduleEditModal
        visible={isScheduleEditVisible}
        initialDays={days.map(d => ({
          date: d.date,
          startTime: d.startTime,
          endTime: d.endTime,
        }))}
        onClose={() => setScheduleEditVisible(false)}
        onConfirm={updatedDays => {
          if (updatedDays.length > 0) {
            // Calculate added/removed days and notify backend via WebSocket
            const oldDates = new Set(
              days.map(d => d.date.toISOString().split('T')[0]),
            );
            const newDates = new Set(
              updatedDays.map(d => d.date.toISOString().split('T')[0]),
            );

            const addedDates = [...newDates].filter(d => !oldDates.has(d));
            const removedDates = [...oldDates].filter(d => !newDates.has(d));

            if (addedDates.length > 0) {
              const newTimetables = addedDates.map(dateStr => ({
                timetableId: 0, // Backend will assign ID
                date: dateStr,
                startTime: '09:00:00',
                endTime: '20:00:00',
              }));
              sendMessage('create', 'timetable', newTimetables);
            }

            if (removedDates.length > 0) {
              const removedTimetables = days
                .filter(d =>
                  removedDates.includes(d.date.toISOString().split('T')[0]),
                )
                .map(d => ({
                  timetableId: d.timetableId, // Valid ID required for delete
                  date: d.date.toISOString().split('T')[0],
                  startTime: '09:00:00',
                  endTime: '20:00:00',
                }));
              
              if (removedTimetables.length > 0) {
                 sendMessage('delete', 'timetable', removedTimetables);
              }
            }

            const firstDay = updatedDays[0].date;
            const lastDay = updatedDays[updatedDays.length - 1].date;

            setScheduleEditVisible(false);
            
            // Delay buffer to allow WS processing before re-fetching
            setTimeout(() => {
                navigation.setParams({
                  startDate: firstDay.toISOString(),
                  endDate: lastDay.toISOString(),
                });
            }, 300);
          }
        }}
      />
    </SafeAreaView>
  );
}
