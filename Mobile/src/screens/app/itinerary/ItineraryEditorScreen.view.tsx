import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabActions } from '@react-navigation/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import TimelineItem, {
  Place,
} from '../../../components/itinerary/TimelineItem';
import TimePickerModal from '../../../components/common/TimePickerModal';
import ScheduleEditModal from '../../../components/common/ScheduleEditModal';
import DetailPopup from '../../../components/itinerary/DetailPopup';
import PlaceRecommendationList from '../../../components/itinerary/PlaceRecommendationList';
import { Day } from '../../../contexts/ItineraryContext';
import { SimpleWeatherInfo } from '../../../api/trips';
import WeatherHeader from '../../../components/weather/WeatherHeader';
import {
  styles,
  COLORS,
  HOUR_HEIGHT,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_SNAP_HEIGHT,
} from './ItineraryEditorScreen.styles';
import {
  timeToMinutes,
  timeToDate,
  dateToTime,
} from '../../../utils/timeUtils';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendar,
  faMapPin,
  faCheck,
  faCircleInfo,
  faLocationDot,
  faMap,
  faRedo,
  faUserPlus,
  faUndo,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

const Tab = createMaterialTopTabNavigator();

const TimelineTabIcon = ({ color }: { color: string }) => (
  <FontAwesomeIcon icon={faCalendar} color={color} size={24} />
);

const PlaceTabIcon = ({ color }: { color: string }) => (
  <FontAwesomeIcon icon={faMapPin} color={color} size={24} />
);

const BottomMenuBar = ({
  state,
  navigation,
  descriptors,
}: {
  state: any;
  navigation: any;
  descriptors: any;
}) => {
  return (
    <View style={styles.bottomTabBar}>
      <View style={styles.bottomTabContent}>
        {state.routes.map((route: any, index: number) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const focused = state.index === index;
          const color = focused ? COLORS.primary : COLORS.placeholder;
          const label = options.title ?? route.name;
          const icon = options.tabBarIcon?.({ focused, color }) ?? null;

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.dispatch(TabActions.jumpTo(route.name));
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={handlePress}
              activeOpacity={0.8}
              style={styles.bottomTabItem}
            >
              <View style={styles.bottomTabIcon}>{icon}</View>
              <Text
                style={[
                  styles.bottomTabLabel,
                  focused && styles.bottomTabLabelActive,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

type ToolbarButtonVariant =
  | 'plain'
  | 'info'
  | 'outlineBlue'
  | 'outlineDark'
  | 'filledGray'
  | 'filledBlue';

const ToolbarIconButton = ({
  children,
  onPress,
  active = false,
  disabled = false,
  badgeCount,
  variant = 'info',
}: {
  children: React.ReactNode;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  badgeCount?: number;
  variant?: ToolbarButtonVariant;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    hitSlop={8}
    style={[
      styles.toolbarIconButton,
      variant === 'plain' && styles.toolbarIconButtonPlain,
      variant === 'info' && styles.toolbarIconButtonInfo,
      variant === 'outlineBlue' && styles.toolbarIconButtonOutlineBlue,
      variant === 'outlineDark' && styles.toolbarIconButtonOutlineDark,
      variant === 'filledGray' && styles.toolbarIconButtonFilledGray,
      variant === 'filledBlue' && styles.toolbarIconButtonFilledBlue,
      active && styles.toolbarIconButtonActive,
      disabled && styles.toolbarIconButtonDisabled,
    ]}
  >
    {children}
    {typeof badgeCount === 'number' && badgeCount > 0 && (
      <View style={styles.toolbarBadge}>
        <Text style={styles.toolbarBadgeText}>
          {badgeCount > 9 ? '9+' : badgeCount}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

const TimeGridBackground = React.memo(
  ({ hours, endHour }: { hours: number[]; endHour: number }) => {
    const hourStr = (h: number) => h.toString().padStart(2, '0');

    return (
      <View style={styles.gridContainer}>
        {hours.map(hour => {
          const isLastHour = hour === endHour;
          return (
            <View
              key={hour}
              style={[
                styles.hourBlock,
                { height: isLastHour ? 0 : HOUR_HEIGHT },
              ]}
            >
              <View
                style={[
                  styles.hourLabelContainer,
                  { height: isLastHour ? 0 : HOUR_HEIGHT },
                ]}
              >
                <Text style={[styles.timeLabelText, styles.timeLabelTop]}>
                  {`${hourStr(hour)}:00`}
                </Text>
                {!isLastHour && (
                  <>
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
                  </>
                )}
              </View>

              <View
                style={[
                  styles.hourContent,
                  { height: isLastHour ? 0 : HOUR_HEIGHT },
                ]}
              >
                <View
                  style={[
                    styles.quarterBlock,
                    styles.firstQuarterBlock,
                    isLastHour && { borderTopWidth: 1 },
                  ]}
                />
                {!isLastHour && (
                  <>
                    <View style={styles.quarterBlock} />
                    <View style={styles.quarterBlock} />
                    <View style={styles.quarterBlock} />
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  },
);

const DraggableTimelineItem = ({
  place,
  offsetMinutes,
  maxEndMinutes,
  onDelete,
  onEditTime,
  onDragEnd,
  onPress,
  onOverflow,
  scrollRef,
}: {
  place: Place;
  offsetMinutes: number;
  maxEndMinutes: number;
  onDelete: () => void;
  onEditTime: (type: 'startTime' | 'endTime') => void;
  onDragEnd: (
    placeId: string,
    newStartMinutes: number,
    newEndMinutes: number,
  ) => void;
  onPress?: () => void;
  onOverflow?: () => void;
  scrollRef?: React.RefObject<ScrollView | null>;
}) => {
  const GRID_TOP_OFFSET = 40;
  const MIN_TOP_PX = GRID_TOP_OFFSET;
  const MAX_BOTTOM_PX =
    GRID_TOP_OFFSET + (maxEndMinutes - offsetMinutes) * MINUTE_HEIGHT;

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

  // Auto-scroll helper
  const scrollIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const clearScrollInterval = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const startScrollInterval = (bottomEdge: number) => {
    if (!scrollIntervalRef.current && scrollRef?.current) {
      scrollIntervalRef.current = setInterval(() => {
        scrollRef.current?.scrollTo({
          y: bottomEdge - 200,
          animated: true,
        });
      }, 100);
    }
  };

  const panGestureMove = Gesture.Pan()
    .onBegin(() => {
      startY.value = top.value;
    })
    .onUpdate(event => {
      const newTop = startY.value + event.translationY;
      const maxTop = MAX_BOTTOM_PX - height.value;
      const clampedTop = Math.max(MIN_TOP_PX, Math.min(newTop, maxTop));
      top.value = clampedTop;

      // Auto-scroll when near bottom edge
      if (scrollRef) {
        const bottomEdge = clampedTop + height.value;
        const totalHeight =
          (maxEndMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET * 2;
        if (bottomEdge > totalHeight - 100) {
          // Trigger scroll down
          runOnJS(startScrollInterval)(bottomEdge);
        } else if (bottomEdge <= totalHeight - 100) {
          runOnJS(clearScrollInterval)();
        }
      }
    })
    .onEnd(event => {
      runOnJS(clearScrollInterval)();
      const snappedTop =
        Math.round((top.value - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
          GRID_SNAP_HEIGHT +
        GRID_TOP_OFFSET;

      let newStartMinutes =
        (snappedTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      let newEndMinutes = newStartMinutes + durationMinutes;

      // Clamp to max time
      if (newEndMinutes > maxEndMinutes) {
        newEndMinutes = maxEndMinutes;
        newStartMinutes = maxEndMinutes - durationMinutes;
        if (onOverflow) runOnJS(onOverflow)();
      }

      const finalTop =
        (newStartMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
      top.value = withSpring(finalTop);

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
        if (onOverflow) runOnJS(onOverflow)();
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
            onPress={onPress}
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
      onPressPlace?: (place: Place) => void;
    }
  >(
    (
      {
        selectedDay,
        onDeletePlace,
        onEditPlaceTime,
        onUpdatePlaceTimes,
        onPressPlace,
      },
      ref,
    ) => {
      // Overflow warning banner animation
      const bannerOpacity = useSharedValue(0);
      const bannerTranslateY = useSharedValue(20);
      const bannerAnimStyle = useAnimatedStyle(() => ({
        opacity: bannerOpacity.value,
        transform: [{ translateY: bannerTranslateY.value }],
      }));

      const showOverflowBanner = useCallback(() => {
        bannerOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 1800 }),
          withTiming(0, { duration: 400 }),
        );
        bannerTranslateY.value = withSequence(
          withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 1800 }),
          withTiming(20, { duration: 400 }),
        );
      }, [bannerOpacity, bannerTranslateY]);

      const { gridHours, offsetMinutes, maxEndMinutes, endHour } =
        React.useMemo(() => {
          const startTimeStr = selectedDay?.startTime || '09:00:00';
          const endTimeStr = selectedDay?.endTime || '20:00:00';
          const minHour = Math.floor(timeToMinutes(startTimeStr) / 60);
          const endMin = timeToMinutes(endTimeStr);
          const maxHour = Math.ceil(endMin / 60);

          const hours = Array.from(
            { length: maxHour - minHour + 1 },
            (_, i) => i + minHour,
          );
          const offset = minHour * 60;
          return {
            gridHours: hours,
            offsetMinutes: offset,
            maxEndMinutes: endMin,
            endHour: maxHour,
          };
        }, [selectedDay?.startTime, selectedDay?.endTime]);

      return (
        <View style={styles.tabContentContainer}>
          <ScrollView
            ref={ref}
            contentContainerStyle={styles.timelineContentContainer}
          >
            <View style={styles.timelineWrapper}>
              <TimeGridBackground hours={gridHours} endHour={endHour} />
              {selectedDay?.places.map(place => (
                <DraggableTimelineItem
                  key={place.id}
                  place={place}
                  offsetMinutes={offsetMinutes}
                  maxEndMinutes={maxEndMinutes}
                  onDelete={() => onDeletePlace(place.id)}
                  onEditTime={type =>
                    onEditPlaceTime(
                      place.id,
                      type,
                      type === 'startTime' ? place.startTime : place.endTime,
                    )
                  }
                  onDragEnd={onUpdatePlaceTimes}
                  onPress={() => onPressPlace?.(place)}
                  onOverflow={showOverflowBanner}
                  scrollRef={ref as React.RefObject<ScrollView | null>}
                />
              ))}
            </View>
          </ScrollView>

          {/* Overflow warning banner */}
          <Animated.View style={[styles.overflowBanner, bannerAnimStyle]}>
            <Text style={styles.overflowBannerText}>
              설정된 타임라인 시간을 초과할 수 없습니다
            </Text>
          </Animated.View>
        </View>
      );
    },
  ),
);

export interface ItineraryEditorScreenViewProps {
  days: Day[];
  selectedDayIndex: number;
  setSelectedDayIndex: (idx: number) => void;
  tripName: string;
  isEditingTripName: boolean;
  setIsEditingTripName: (visible: boolean) => void;
  setTripName: (value: string) => void;
  onSaveTripName: () => void;
  isTimePickerVisible: boolean;
  setTimePickerVisible: (visible: boolean) => void;
  editingTime: {
    placeId: string;
    type: 'startTime' | 'endTime';
    time: string;
  } | null;
  timelineScrollRef: React.RefObject<ScrollView | null>;
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
  onOpenParticipants: () => void;
  onOpenMap: () => void;
  onOpenShare: () => void;
  onUndo: () => void;
  onRedo: () => void;
  participantsCount: number;
  // New props for detail popup & recommendations
  planId: number | null;
  detailPlace: Place | null;
  isDetailVisible: boolean;
  onOpenDetail: (place: Place) => void;
  onCloseDetail: () => void;
  weatherMap: Record<string, SimpleWeatherInfo>;
}

export default function ItineraryEditorScreenView({
  days,
  selectedDayIndex,
  setSelectedDayIndex,
  tripName,
  isEditingTripName,
  setIsEditingTripName,
  setTripName,
  onSaveTripName,
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
  onOpenParticipants,
  onOpenMap,
  onOpenShare,
  onUndo,
  onRedo,
  participantsCount,
  planId,
  detailPlace,
  isDetailVisible,
  onOpenDetail,
  onCloseDetail,
  weatherMap,
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
      <View style={styles.topToolbar}>
        <View style={styles.toolbarLeftGroup}>
          {isEditingTripName ? (
            <TextInput
              value={tripName}
              onChangeText={setTripName}
              onBlur={onSaveTripName}
              onSubmitEditing={onSaveTripName}
              autoFocus
              numberOfLines={1}
              style={styles.toolbarTitleInput}
              placeholder="일정 이름"
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingTripName(true)}
              activeOpacity={0.8}
              style={styles.toolbarTitleButton}
            >
              <Text style={styles.toolbarTitleText} numberOfLines={1}>
                {tripName}
              </Text>
            </TouchableOpacity>
          )}

          <ToolbarIconButton onPress={onUndo} variant="plain">
            <FontAwesomeIcon icon={faUndo} color="#111827" size={18} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={onRedo} variant="plain">
            <FontAwesomeIcon icon={faRedo} color="#111827" size={18} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={() => setScheduleEditVisible(true)}
            variant="info"
          >
            <FontAwesomeIcon icon={faCircleInfo} color="#111827" size={18} />
          </ToolbarIconButton>
        </View>

        <View style={styles.toolbarRightGroup}>
          <ToolbarIconButton
            onPress={onOpenParticipants}
            badgeCount={participantsCount}
            variant="outlineBlue"
          >
            <FontAwesomeIcon icon={faUsers} color="#1344FF" size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={onOpenMap} variant="outlineDark">
            <FontAwesomeIcon icon={faMap} color="#111827" size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={onOpenShare} variant="filledGray">
            <FontAwesomeIcon icon={faUserPlus} color="#111827" size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={onComplete} variant="filledBlue" active>
            <FontAwesomeIcon icon={faCheck} color="#FFFFFF" size={18} />
          </ToolbarIconButton>
        </View>
      </View>

      <View style={styles.dayTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContainer}
          style={styles.dayTabsScroll}
        >
          {days.map((day, index) => {
            const isSelected = selectedDayIndex === index;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayTab,
                  isSelected && styles.dayTabSelected,
                  !isSelected && styles.dayTabUnselected,
                ]}
                onPress={() => setSelectedDayIndex(index)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.dayTabLabel,
                    isSelected && styles.dayTabLabelSelected,
                  ]}
                  numberOfLines={1}
                >
                  <Text
                    style={[
                      styles.dayTabDayNumber,
                      isSelected && styles.dayTabDayNumberSelected,
                    ]}
                  >
                    {day.dayNumber}일차{' '}
                  </Text>
                  <Text
                    style={[
                      styles.dayTabDateInline,
                      isSelected && styles.dayTabDateInlineSelected,
                    ]}
                  >
                    {formatDate(day.date)}
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          style={styles.dayEditButton}
          onPress={() => setScheduleEditVisible(true)}
          activeOpacity={0.85}
          hitSlop={8}
        >
          <FontAwesomeIcon icon={faCalendar} color="#6B7280" size={22} />
        </TouchableOpacity>
      </View>

      <Tab.Navigator
        tabBar={props => <BottomMenuBar {...props} />}
        sceneStyle={styles.tabScene}
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.placeholder,
        }}
      >
        <Tab.Screen
          name="타임라인"
          options={{
            title: '시간표',
            tabBarIcon: TimelineTabIcon,
          }}
        >
          {() => (
            <View style={styles.timelineStage}>
              <View pointerEvents="none" style={styles.timelineSceneBackdrop} />
              {selectedDay &&
                weatherMap[selectedDay.date.toISOString().split('T')[0]] && (
                  <View
                    pointerEvents="none"
                    style={styles.timelineWeatherOverlay}
                  >
                    <WeatherHeader
                      dayNumber={selectedDay.dayNumber}
                      weather={
                        weatherMap[selectedDay.date.toISOString().split('T')[0]]
                      }
                      appearance="overlay"
                    />
                  </View>
                )}
              <TimelineComponent
                ref={timelineScrollRef}
                selectedDay={selectedDay}
                onDeletePlace={handleDeletePlace}
                onEditPlaceTime={handleEditTime}
                onUpdatePlaceTimes={handleUpdatePlaceTimes}
                onPressPlace={onOpenDetail}
              />
            </View>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="장소추가"
          options={{
            title: '추천 장소',
            tabBarIcon: PlaceTabIcon,
          }}
        >
          {() => (
            <PlaceRecommendationList
              onAddPlace={handleAddPlace}
              planId={planId}
              destination={destination}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

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

      {/* {detailPlace && (
        <DetailPopup
          visible={isDetailVisible}
          place={detailPlace}
          onClose={onCloseDetail}
          onUpdateMemo={onUpdateMemo}
          onDelete={onDeleteFromDetail}
        />
      )} */}
    </SafeAreaView>
  );
}
