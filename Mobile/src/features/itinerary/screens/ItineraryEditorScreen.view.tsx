import React, {
  useCallback,
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
  Pressable,
} from 'react-native';
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
} from '../components/TimelineItem';
import { AirplaneLoading, ScheduleEditModal, TimePickerModal } from '../../../components/common';
import PlaceRecommendationList, {
  PLACE_TABS,
  type PlaceTab,
} from '../components/PlaceRecommendationList';
import { findDropSlot } from '../utils/dropSlot';
import { Day } from '../../../contexts/ItineraryContext';
import { PLAN_NAME_MAX_LENGTH, SimpleWeatherInfo } from '../../../api/trips';
import WeatherHeader from '../components/weather/WeatherHeader';
import { useScreenInsets } from '../../../hooks/useScreenInsets';
import {
  styles,
  COLORS,
  HOUR_HEIGHT,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_SNAP_HEIGHT,
  GRID_TOP_OFFSET,
} from './ItineraryEditorScreen.styles';
import {
  timeToMinutes,
  timeToDate,
  minutesToTime,
  formatDateLocal,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from '../../../utils/timeUtils';
import MapOutlineIcon from 'lucide-react-native/dist/esm/icons/map';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import ListChecks from 'lucide-react-native/dist/esm/icons/list-checks';
import CalendarDaysIcon from 'lucide-react-native/dist/esm/icons/calendar-days';
import CheckIcon from 'lucide-react-native/dist/esm/icons/check';
import InfoIcon from 'lucide-react-native/dist/esm/icons/info';
import Redo2 from 'lucide-react-native/dist/esm/icons/redo-2';
import Undo2 from 'lucide-react-native/dist/esm/icons/undo-2';
import UserPlusIcon from 'lucide-react-native/dist/esm/icons/user-plus';
import UsersIcon from 'lucide-react-native/dist/esm/icons/users';
import XIcon from 'lucide-react-native/dist/esm/icons/x';

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
    accessibilityState={{ disabled: disabled }}
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
      <View style={styles.gridContainer} pointerEvents="none">
        {hours.map(hour => {
          const isLastHour = hour === endHour;
          return (
            <View
              key={hour}
              style={[
                styles.hourBlock,
                isLastHour ? styles.hourHeightZero : styles.hourHeightFull,
              ]}
            >
              <View
                style={[
                  styles.hourLabelContainer,
                  isLastHour ? styles.hourHeightZero : styles.hourHeightFull,
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
                  isLastHour ? styles.hourHeightZero : styles.hourHeightFull,
                ]}
              >
                <View
                  style={[
                    styles.quarterBlock,
                    styles.firstQuarterBlock,
                    isLastHour && styles.lastHourBorder,
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

const DraggableTimelineItem = React.memo(({
  place,
  offsetMinutes,
  maxEndMinutes,
  minStartMinutes,
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
  minStartMinutes: number;
  onDelete: (placeId: string) => void;
  onEditTime: (
    placeId: string,
    type: 'startTime' | 'endTime',
    time: string,
  ) => void;
  onDragEnd: (
    placeId: string,
    newStartMinutes: number,
    newEndMinutes: number,
  ) => void;
  onPress?: (place: Place) => void;
  onOverflow?: () => void;
  scrollRef?: React.RefObject<ScrollView | null>;
}) => {

  const MIN_TOP_PX =
    GRID_TOP_OFFSET + (minStartMinutes - offsetMinutes) * MINUTE_HEIGHT;
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
  const previewHeight = useSharedValue(initialHeight);

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
    previewHeight.value = newHeight;
  }, [place.startTime, place.endTime, offsetMinutes, top, height, previewHeight]);

  const startY = useSharedValue(0);
  const startHeight = useSharedValue(0);
  const isResizingTop = useSharedValue(0);
  const isResizingBottom = useSharedValue(0);
  const isDragging = useSharedValue(0);
  const previewTop = useSharedValue(initialTop);

  const exitOpacity = useSharedValue(1);
  const exitScale = useSharedValue(1);
  const exitTranslateX = useSharedValue(0);

  const dragOpacity = useSharedValue(1);
  const dragScale = useSharedValue(1);

  const placeId = place.id;

  const handleDeleteWithAnim = React.useCallback(() => {
    exitScale.value = withTiming(0.8, { duration: 250 });
    exitTranslateX.value = withTiming(400, { duration: 250 });
    exitOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onDelete)(placeId);
      }
    });
  }, [onDelete, placeId, exitOpacity, exitScale, exitTranslateX]);

  const handleEditTime = React.useCallback(
    (type: 'startTime' | 'endTime') => {
      onEditTime(
        placeId,
        type,
        type === 'startTime' ? place.startTime : place.endTime,
      );
    },
    [onEditTime, placeId, place.startTime, place.endTime],
  );

  const handlePress = React.useCallback(() => {
    onPress?.(place);
  }, [onPress, place]);

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

  React.useEffect(() => clearScrollInterval, []);

  const panGestureMove = Gesture.Pan()
    .minDistance(10)
    .onBegin(() => {
      startY.value = top.value;
      previewTop.value = top.value;
      previewHeight.value = height.value;
      isDragging.value = 1;
      dragOpacity.value = withSpring(0.9);
      dragScale.value = withSpring(1.015);
    })
    .onUpdate(event => {
      const newTop = startY.value + event.translationY;
      const maxTop = MAX_BOTTOM_PX - height.value;
      const clampedTop = Math.max(MIN_TOP_PX, Math.min(newTop, maxTop));
      top.value = clampedTop;

      previewTop.value =
        Math.round((clampedTop - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
          GRID_SNAP_HEIGHT +
        GRID_TOP_OFFSET;
      previewHeight.value = height.value;

      if (scrollRef) {
        const bottomEdge = clampedTop + height.value;
        const totalHeight =
          (maxEndMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET * 2;
        if (bottomEdge > totalHeight - 100) {

          runOnJS(startScrollInterval)(bottomEdge);
        } else if (bottomEdge <= totalHeight - 100) {
          runOnJS(clearScrollInterval)();
        }
      }
    })
    .onEnd(() => {
      isDragging.value = 0;
      dragOpacity.value = withSpring(1);
      dragScale.value = withSpring(1);
      runOnJS(clearScrollInterval)();
      const snappedTop =
        Math.round((top.value - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
          GRID_SNAP_HEIGHT +
        GRID_TOP_OFFSET;

      let newStartMinutes =
        (snappedTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      let newEndMinutes = newStartMinutes + durationMinutes;

      if (newEndMinutes > maxEndMinutes) {
        newEndMinutes = maxEndMinutes;
        newStartMinutes = maxEndMinutes - durationMinutes;
        if (onOverflow) runOnJS(onOverflow)();
      }

      const finalTop =
        (newStartMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
      top.value = withSpring(finalTop);
      previewTop.value = finalTop;
      previewHeight.value = height.value;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    })
    .onFinalize(() => {
      isDragging.value = 0;
      dragOpacity.value = withSpring(1);
      dragScale.value = withSpring(1);
    });

  const panGestureResizeTop = Gesture.Pan()
    .minDistance(4)
    .onBegin(() => {
      startY.value = top.value;
      startHeight.value = height.value;
      isDragging.value = 1;
      dragOpacity.value = withSpring(0.9);
      dragScale.value = withSpring(1.015);
      previewTop.value = top.value;
      previewHeight.value = height.value;
      isResizingTop.value = withSpring(1);
    })
    .onUpdate(event => {
      const newTop = startY.value + event.translationY;
      const newHeight = startHeight.value - (newTop - startY.value);

      if (newHeight >= MIN_ITEM_HEIGHT && newTop >= MIN_TOP_PX) {
        top.value = newTop;
        height.value = newHeight;

        const snappedTop =
          Math.round((newTop - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
            GRID_SNAP_HEIGHT +
          GRID_TOP_OFFSET;
        const bottom = startY.value + startHeight.value;
        let finalTop = Math.max(MIN_TOP_PX, snappedTop);
        let finalHeight = bottom - finalTop;

        if (finalHeight < MIN_ITEM_HEIGHT) {
          finalHeight = MIN_ITEM_HEIGHT;
          finalTop = bottom - MIN_ITEM_HEIGHT;
        }

        previewTop.value = finalTop;
        previewHeight.value = finalHeight;
      }
    })
    .onEnd(() => {
      isDragging.value = 0;
      dragOpacity.value = withSpring(1);
      dragScale.value = withSpring(1);
      const snappedTop =
        Math.round((top.value - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
          GRID_SNAP_HEIGHT +
        GRID_TOP_OFFSET;

      const bottom = startY.value + startHeight.value;
      let finalTop = Math.max(MIN_TOP_PX, snappedTop);
      let finalHeight =
        Math.round((bottom - finalTop) / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;

      if (finalHeight < MIN_ITEM_HEIGHT) {
        finalHeight = MIN_ITEM_HEIGHT;
        finalTop = Math.max(MIN_TOP_PX, bottom - MIN_ITEM_HEIGHT);
      }

      top.value = withSpring(finalTop);
      height.value = withSpring(finalHeight);
      previewTop.value = finalTop;
      previewHeight.value = finalHeight;

      const newStartMinutes =
        (finalTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    })
    .onFinalize(() => {
      isResizingTop.value = withSpring(0);
      isDragging.value = 0;
      dragOpacity.value = withSpring(1);
      dragScale.value = withSpring(1);
    });

  const panGestureResizeBottom = Gesture.Pan()
    .minDistance(4)
    .onBegin(() => {
      startHeight.value = height.value;
      isDragging.value = 1;
      dragOpacity.value = withSpring(0.9);
      dragScale.value = withSpring(1.015);
      previewTop.value = top.value;
      previewHeight.value = height.value;
      isResizingBottom.value = withSpring(1);
    })
    .onUpdate(event => {
      const newHeight = startHeight.value + event.translationY;
      const newBottom = top.value + newHeight;

      if (newHeight >= MIN_ITEM_HEIGHT && newBottom <= MAX_BOTTOM_PX) {
        height.value = newHeight;

        const snappedHeight =
          Math.round(newHeight / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
        let finalHeight = Math.max(snappedHeight, MIN_ITEM_HEIGHT);
        if (top.value + finalHeight > MAX_BOTTOM_PX) {
          finalHeight = MAX_BOTTOM_PX - top.value;
        }

        previewHeight.value = finalHeight;
      }
    })
    .onEnd(() => {
      isDragging.value = 0;
      dragOpacity.value = withSpring(1);
      dragScale.value = withSpring(1);
      const snappedHeight =
        Math.round(height.value / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
      let finalHeight = Math.max(snappedHeight, MIN_ITEM_HEIGHT);
      if (top.value + finalHeight > MAX_BOTTOM_PX) {

        finalHeight = Math.max(
          Math.floor((MAX_BOTTOM_PX - top.value) / GRID_SNAP_HEIGHT) *
            GRID_SNAP_HEIGHT,
          MIN_ITEM_HEIGHT,
        );
        if (onOverflow) runOnJS(onOverflow)();
      }

      height.value = withSpring(finalHeight);
      previewHeight.value = finalHeight;

      const newStartMinutes =
        (top.value - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
      const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

      runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
    })
    .onFinalize(() => {
      isResizingBottom.value = withSpring(0);
      isDragging.value = 0;
      dragOpacity.value = withSpring(1);
      dragScale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: top.value,
      height: height.value,
      left: 60,
      right: 15,
      opacity: exitOpacity.value * dragOpacity.value,
      transform: [
        { scale: exitScale.value * dragScale.value },
        { translateX: exitTranslateX.value },
      ],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isDragging.value === 1 ? 6 : 0 },
      shadowOpacity: isDragging.value === 1 ? 0.15 : 0,
      shadowRadius: isDragging.value === 1 ? 10 : 0,
      elevation: isDragging.value === 1 ? 5 : 0,
      zIndex: isDragging.value === 1 ? 100 : 1,
    };
  });

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: withSpring(previewTop.value, {
        damping: 15,
        stiffness: 120,
        mass: 0.8,
      }),
      height: height.value,
      left: 60,
      right: 15,
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderStyle: 'dashed',
      borderRadius: 12,
      backgroundColor: 'rgba(19, 68, 255, 0.08)',
      opacity: isDragging.value,
      zIndex: -1,
    };
  });

  const topHandleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scaleX: 1 + isResizingTop.value * 0.14 },
        { scaleY: 1 + isResizingTop.value * 0.14 },
      ],
    };
  });

  const bottomHandleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scaleX: 1 + isResizingBottom.value * 0.14 },
        { scaleY: 1 + isResizingBottom.value * 0.14 },
      ],
    };
  });

  return (
    <>
      <Animated.View style={indicatorStyle} pointerEvents="none" />
      <Animated.View style={animatedStyle}>
        <GestureDetector gesture={panGestureMove}>
          <Animated.View style={styles.flex1}>
            <TimelineItem
              item={place}
              onDelete={handleDeleteWithAnim}
              onEditTime={handleEditTime}
              onPress={handlePress}
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
    </>
  );
});
DraggableTimelineItem.displayName = 'DraggableTimelineItem';

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
      topPadding?: number;
      pendingPlace?: Omit<Place, 'startTime' | 'endTime'> | null;
      previewStartTime?: string | null;
      previewEndTime?: string | null;
      setPreviewStartTime?: (time: string | null) => void;
      setPreviewEndTime?: (time: string | null) => void;
      onConfirmPlacement?: () => void;
      onCancelPreview?: () => void;
      /** 끌어놓는 중이면 확인·취소 버튼 없이 점선만 그린다 */
      isDragging?: boolean;
      /** 비켜설 빈자리조차 없을 때 */
      dropBlocked?: boolean;
    }
  >(
    (
      {
        selectedDay,
        onDeletePlace,
        onEditPlaceTime,
        onUpdatePlaceTimes,
        onPressPlace,
        topPadding = 0,
        pendingPlace,
        previewStartTime,
        previewEndTime,
        setPreviewStartTime,
        setPreviewEndTime,
        onConfirmPlacement,
        onCancelPreview,
        isDragging = false,
        dropBlocked = false,
      },
      ref,
    ) => {

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

      const {
        gridHours,
        offsetMinutes,
        maxEndMinutes,
        minStartMinutes,
        endHour,
      } = React.useMemo(() => {
        const startTimeStr = selectedDay?.startTime || DEFAULT_DAY_START;
        const endTimeStr = selectedDay?.endTime || DEFAULT_DAY_END;
        const startMin = timeToMinutes(startTimeStr);
        const minHour = Math.floor(startMin / 60);
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

          minStartMinutes: startMin,
          endHour: maxHour,
        };
      }, [selectedDay?.startTime, selectedDay?.endTime]);

      return (
        <View style={styles.tabContentContainer}>
          <ScrollView
            ref={ref}
            contentContainerStyle={[
              styles.timelineContentContainer,
              { paddingTop: topPadding },
            ]}
          >
            <Pressable
              onPress={(evt) => {
                if (!pendingPlace || !setPreviewStartTime || !setPreviewEndTime) return;
                const clickY = evt.nativeEvent.locationY;
                const minutes =
                  (clickY - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
                const snappedMinutes = Math.floor(minutes / 15) * 15;
                const clampedMinutes = Math.max(
                  minStartMinutes,
                  Math.min(snappedMinutes, maxEndMinutes - 60),
                );

                const startTimeStr = minutesToTime(clampedMinutes);
                const endTimeStr = minutesToTime(clampedMinutes + 60);

                setPreviewStartTime(startTimeStr);
                setPreviewEndTime(endTimeStr);
              }}
            >
              <View style={styles.timelineWrapper} pointerEvents="box-none">
                <TimeGridBackground hours={gridHours} endHour={endHour} />
                {selectedDay?.places.map(place => (
                  <DraggableTimelineItem
                    key={place.id}
                    place={place}
                    offsetMinutes={offsetMinutes}
                    maxEndMinutes={maxEndMinutes}
                    minStartMinutes={minStartMinutes}
                    onDelete={onDeletePlace}
                    onEditTime={onEditPlaceTime}
                    onDragEnd={onUpdatePlaceTimes}
                    onPress={onPressPlace}
                    onOverflow={showOverflowBanner}
                    scrollRef={ref as React.RefObject<ScrollView | null>}
                  />
                ))}

                {pendingPlace && isDragging && dropBlocked && (
                  <View style={[styles.previewBanner, styles.previewBannerBlocked]}>
                    <Text style={styles.previewBannerBlockedText}>
                      놓을 자리가 없어요
                    </Text>
                  </View>
                )}

                {pendingPlace && previewStartTime && previewEndTime && (
                  <View
                    style={[
                      styles.previewBanner,
                      isDragging && styles.previewBannerDragging,
                      {
                        top:
                          (timeToMinutes(previewStartTime) - offsetMinutes) *
                            MINUTE_HEIGHT +
                          GRID_TOP_OFFSET,
                        height: Math.max(
                          (timeToMinutes(previewEndTime) -
                            timeToMinutes(previewStartTime)) *
                            MINUTE_HEIGHT,
                          MIN_ITEM_HEIGHT,
                        ),
                      },
                    ]}
                  >
                    <View style={styles.previewBannerInfo}>
                      <Text style={styles.previewBannerName} numberOfLines={1}>
                        {pendingPlace.name}
                      </Text>
                      <Text style={styles.previewBannerTime}>
                        {previewStartTime} - {previewEndTime} ({pendingPlace.type})
                      </Text>
                    </View>
                    {isDragging ? null : (
                    <View style={styles.previewBannerActions}>
                      <TouchableOpacity
                        onPress={onCancelPreview}
                        style={[styles.previewBannerActionButton, styles.previewBannerCancelButton]}
                        accessibilityRole="button"
                        accessibilityLabel="장소 배치 취소"
                        hitSlop={8}
                      >
                        <XIcon color={COLORS.white} size={14} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={onConfirmPlacement}
                        style={[styles.previewBannerActionButton, styles.previewBannerConfirmButton]}
                        accessibilityRole="button"
                        accessibilityLabel="장소 배치 확정"
                        hitSlop={8}
                      >
                        <CheckIcon color={COLORS.white} size={14} />
                      </TouchableOpacity>
                    </View>
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          </ScrollView>

          <Animated.View style={[styles.overflowBanner, bannerAnimStyle]}>
            <Text style={styles.overflowBannerText}>
              설정된 타임라인 시간을 초과할 수 없어요
            </Text>
          </Animated.View>
        </View>
      );
    },
  ),
);

export const EditorStateContext = createContext<{
  timelineScrollRef: any;
  selectedDay: any;
  handleDeletePlace: any;
  handleEditTime: any;
  handleUpdatePlaceTimes: any;
  onOpenDetail: any;
  weatherMap: any;
  handleAddPlace: any;
  planId: any;
  destination: any;
  travelId?: any;
  onUndo: any;
  onRedo?: () => void;
  pendingPlace: any;
  previewStartTime: any;
  previewEndTime: any;
  setPreviewStartTime: any;
  setPreviewEndTime: any;
  onConfirmPlacement: any;
  onCancelPreview: any;
  isDragging: boolean;
  dropBlocked: boolean;
} | null>(null);

/** 손잡이 줄 높이 — 잡는 막대와 갈래 줄. 접혀도 이만큼은 남는다. */
const SHEET_HANDLE_HEIGHT = 62;
/** 시트가 아무리 커도 시간표에 이만큼은 남긴다. */
const MIN_TIMELINE_HEIGHT = 96;
/** 붙는 자리 — 접힘 / 1·3 / 2·3 / 거의 전체 */
const SHEET_SNAPS = [0, 1 / 3, 2 / 3, 0.88];

const nearestSnap = (value: number, points: number[]) =>
  points.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));

/** 시트 손잡이의 갈래 줄. 접힌 채로도 눌러 그 목록을 열 수 있어야 한다. */
const SheetCategoryRow = React.memo(function SheetCategoryRow({
  selected,
  onSelect,
}: {
  selected: PlaceTab;
  onSelect: (tab: PlaceTab) => void;
}) {
  return (
    <View style={styles.sheetCats}>
      {PLACE_TABS.map(tab => {
        const isOn = tab === selected;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.sheetCat, isOn && styles.sheetCatOn]}
            onPress={() => onSelect(tab)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: isOn }}
          >
            <Text style={[styles.sheetCatText, isOn && styles.sheetCatTextOn]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const TimelineTabScreen = React.memo(() => {
  const state = useContext(EditorStateContext);
  if (!state) return null;
  const {
    timelineScrollRef,
    selectedDay,
    handleDeletePlace,
    handleEditTime,
    handleUpdatePlaceTimes,
    onOpenDetail,
    weatherMap,
    onUndo,
    onRedo,
    pendingPlace,
    previewStartTime,
    previewEndTime,
    setPreviewStartTime,
    setPreviewEndTime,
    onConfirmPlacement,
    onCancelPreview,
    isDragging,
    dropBlocked,
  } = state;

  const localDateStr = selectedDay ? formatDateLocal(selectedDay.date) : '';
  const currentWeather = selectedDay ? weatherMap[localDateStr] : undefined;

  return (
    <View style={styles.timelineStage}>
      <View pointerEvents="none" style={styles.timelineSceneBackdrop} />
      {selectedDay && currentWeather && (
        <View
          pointerEvents="none"
          style={styles.timelineWeatherOverlay}
        >
          <WeatherHeader
            dayNumber={selectedDay.dayNumber}
            weather={currentWeather}
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
        topPadding={selectedDay && currentWeather ? 62 : 0}
        pendingPlace={pendingPlace}
        previewStartTime={previewStartTime}
        previewEndTime={previewEndTime}
        setPreviewStartTime={setPreviewStartTime}
        setPreviewEndTime={setPreviewEndTime}
        onConfirmPlacement={onConfirmPlacement}
        onCancelPreview={onCancelPreview}
        isDragging={isDragging}
        dropBlocked={dropBlocked}
      />

      <View style={styles.floatingHistoryContainer}>
        <TouchableOpacity
          testID="btn-undo"
          style={styles.floatingHistoryButton}
          onPress={onUndo}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="실행 취소"
          hitSlop={3}
        >
          <Undo2 color={COLORS.text} size={16} />
        </TouchableOpacity>

        <TouchableOpacity
          testID="btn-redo"
          style={[
            styles.floatingHistoryButton,
            !onRedo && styles.floatingHistoryButtonDisabled,
          ]}
          onPress={onRedo}
          disabled={!onRedo}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="다시 실행"
          accessibilityState={{ disabled: !onRedo }}
          hitSlop={3}
        >
          <Redo2 color={onRedo ? COLORS.text : COLORS.placeholder} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

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
  isScheduleEditVisible: boolean;
  setScheduleEditVisible: (v: boolean) => void;
  onConfirmScheduleEdit: (updatedDays: any[]) => void;
  onConfirmTimePicker: (date: Date) => void;
  destination: string;
  onComplete: () => void;
  onOpenParticipants: () => void;
  onOpenMap: () => void;
  onOpenShare: () => void;
  onOpenChecklist: () => void;
  onUndo: () => void;
  onRedo?: () => void;
  participantsCount: number;

  planId: string | null;
  travelId?: number | null;
  onOpenDetail: (place: Place) => void;
  weatherMap: Record<string, SimpleWeatherInfo>;
  onOpenPlanInfo: () => void;
  onGoBack?: () => void;
  pendingPlace?: Omit<Place, 'startTime' | 'endTime'> | null;
  previewStartTime?: string | null;
  previewEndTime?: string | null;
  setPreviewStartTime?: (time: string | null) => void;
  setPreviewEndTime?: (time: string | null) => void;
  onConfirmPlacement?: () => void;
  onCancelPlacement?: () => void;
  onCancelPreview?: () => void;
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
  onGoBack,
  editingTime,
  timelineScrollRef,
  formatDate,
  handleEditTime,
  handleUpdatePlaceTimes,
  handleDeletePlace,
  handleAddPlace,
  selectedDay,
  isScheduleEditVisible,
  setScheduleEditVisible,
  onConfirmScheduleEdit,
  onConfirmTimePicker,
  destination,
  onComplete,
  onOpenParticipants,
  onOpenMap,
  onOpenShare,
  onOpenChecklist,
  onUndo,
  onRedo,
  participantsCount,
  planId,
  travelId,
  onOpenDetail,
  weatherMap,
  onOpenPlanInfo,
  pendingPlace,
  previewStartTime,
  previewEndTime,
  setPreviewStartTime,
  setPreviewEndTime,
  onConfirmPlacement,
  onCancelPlacement,
  onCancelPreview,
}: ItineraryEditorScreenViewProps) {
  const screenInsets = useScreenInsets(true);  const [inputWidth, setInputWidth] = useState(120);
  const [dayScrollContentWidth, setDayScrollContentWidth] = useState(0);
  const [dayScrollLayoutWidth, setDayScrollLayoutWidth] = useState(0);
  const [dayScrollX, setDayScrollX] = useState(0);
  const isDayScrollable = dayScrollContentWidth > dayScrollLayoutWidth;
  const showLeftFade = isDayScrollable && dayScrollX > 5;
  const showRightFade = isDayScrollable && dayScrollX < dayScrollContentWidth - dayScrollLayoutWidth - 5;

  React.useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (isEditingTripName) {
          onSaveTripName();
        }
      },
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [isEditingTripName, onSaveTripName]);

  // 컨텍스트가 타임라인에 내려줘야 해서 메모보다 먼저 세운다.
  const [draggingPlace, setDraggingPlace] = useState<Omit<
    Place,
    'startTime' | 'endTime'
  > | null>(null);
  const [dropBlocked, setDropBlocked] = useState(false);

  const editorStateContextValue = useMemo(() => {
    return {
      timelineScrollRef,
      selectedDay,
      handleDeletePlace,
      handleEditTime,
      handleUpdatePlaceTimes,
      onOpenDetail,
      weatherMap,
      handleAddPlace,
      planId,
      destination,
      travelId,
      onUndo,
      onRedo,
      pendingPlace,
      previewStartTime,
      previewEndTime,
      setPreviewStartTime,
      setPreviewEndTime,
      onConfirmPlacement,
      onCancelPreview,
      isDragging: !!draggingPlace,
      dropBlocked,
    };
  }, [
    timelineScrollRef,
    selectedDay,
    handleDeletePlace,
    handleEditTime,
    handleUpdatePlaceTimes,
    onOpenDetail,
    weatherMap,
    handleAddPlace,
    planId,
    destination,
    travelId,
    onUndo,
    onRedo,
    pendingPlace,
    previewStartTime,
    previewEndTime,
    setPreviewStartTime,
    setPreviewEndTime,
    onConfirmPlacement,
    onCancelPreview,
    draggingPlace,
    dropBlocked,
  ]);

  // ── 장소 시트 ──
  // 손잡이를 끌면 높이가 손끝을 따라오고, 놓으면 가까운 자리에 붙는다.
  //
  // 높이는 공유값과 ref 두 곳에 둔다. 공유값에 쓴 값을 JS에서 바로 되읽으면
  // 아직 반영되지 않은 옛 값이 나와, 계산에 쓰는 쪽은 ref만 본다.
  const [placeTab, setPlaceTab] = useState<PlaceTab>('관광지');

  const sheetBody = useSharedValue(0);
  const dragY = useSharedValue(0);

  const sheetHeightRef = useRef(0);
  const sheetMaxRef = useRef(0);
  const sheetStartRef = useRef(0);
  const sheetInited = useRef(false);
  const restoreTo = useRef(0);
  const bodyTop = useRef(0);
  const timelineTop = useRef(0);
  const timelineScrollY = useRef(0);
  const bodyViewRef = useRef<View>(null);
  const timelineViewRef = useRef<View>(null);

  const setSheetHeight = useCallback(
    (height: number, animate = true) => {
      const next = Math.max(0, Math.min(sheetMaxRef.current, height));
      sheetHeightRef.current = next;
      sheetBody.value = animate
        ? withTiming(next, { duration: 220 })
        : next;
    },
    [sheetBody],
  );

  const snapPoints = useCallback(
    () => SHEET_SNAPS.map(ratio => Math.round(sheetMaxRef.current * ratio)),
    [],
  );

  const onBodyLayout = useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      sheetMaxRef.current = Math.max(
        0,
        height - SHEET_HANDLE_HEIGHT - MIN_TIMELINE_HEIGHT,
      );
      if (!sheetInited.current && sheetMaxRef.current > 0) {
        sheetInited.current = true;
        setSheetHeight(Math.round(sheetMaxRef.current / 3));
      }
      bodyViewRef.current?.measureInWindow((_x, y) => {
        bodyTop.current = y;
      });
    },
    [setSheetHeight],
  );

  const sheetGesture = useMemo(
    () =>
      Gesture.Exclusive(
        Gesture.Pan()
          .runOnJS(true)
          .onBegin(() => {
            sheetStartRef.current = sheetHeightRef.current;
          })
          .onUpdate(e =>
            setSheetHeight(sheetStartRef.current - e.translationY, false),
          )
          .onEnd(() =>
            setSheetHeight(nearestSnap(sheetHeightRef.current, snapPoints())),
          ),
        Gesture.Tap()
          .runOnJS(true)
          .onEnd(() => {
            const points = snapPoints();
            setSheetHeight(sheetHeightRef.current <= 1 ? points[1] : 0);
          }),
      ),
    [setSheetHeight, snapPoints],
  );

  const sheetAnimStyle = useAnimatedStyle(() => ({
    height: SHEET_HANDLE_HEIGHT + sheetBody.value,
  }));

  const ghostScale = useSharedValue(0.86);
  const ghostAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: dragY.value - 22 },
      { scale: ghostScale.value },
    ],
  }));

  // ── 꾹 눌러 집고, 끌고, 놓기 ──
  const dayStartMinutes = timeToMinutes(
    selectedDay?.startTime || DEFAULT_DAY_START,
  );
  const dayEndMinutes = timeToMinutes(selectedDay?.endTime || DEFAULT_DAY_END);
  const gridOffsetMinutes = Math.floor(dayStartMinutes / 60) * 60;
  const localDateStr = selectedDay ? formatDateLocal(selectedDay.date) : '';
  const timelinePadding = selectedDay && weatherMap[localDateStr] ? 62 : 0;

  /** 손가락의 화면 좌표를 시간표의 15분 눈금으로 옮긴다. 밖이면 null. */
  const minutesAt = useCallback(
    (absoluteY: number) => {
      const top = timelineTop.current;
      if (!top || absoluteY < top) return null;
      const y =
        absoluteY -
        top +
        timelineScrollY.current -
        timelinePadding -
        GRID_TOP_OFFSET;
      const minutes = y / MINUTE_HEIGHT + gridOffsetMinutes;
      const snapped = Math.floor(minutes / 15) * 15;
      if (snapped + 60 < dayStartMinutes) return null;
      return Math.max(
        dayStartMinutes,
        Math.min(snapped, dayEndMinutes - 60),
      );
    },
    [dayStartMinutes, dayEndMinutes, gridOffsetMinutes, timelinePadding],
  );

  /**
   * 손끝이 가리키는 자리를 점선으로 보여준다.
   *
   * 겹치면 조용히 옮기지 않고, 끄는 동안 이미 빈자리로 비켜선 점선을 보여준다 —
   * 손을 떼기 전에 결과가 보여야 놀라지 않는다.
   */
  const previewAt = useCallback(
    (absoluteY: number) => {
      const wanted = minutesAt(absoluteY);
      if (wanted === null) {
        setPreviewStartTime?.(null);
        setPreviewEndTime?.(null);
        setDropBlocked(false);
        return null;
      }

      const busy = (selectedDay?.places ?? []).map((p: Place) => ({
        start: timeToMinutes(p.startTime),
        end: timeToMinutes(p.endTime),
      }));
      const slot = findDropSlot(wanted, 60, busy, {
        min: dayStartMinutes,
        max: dayEndMinutes,
      });

      if (!slot) {
        setPreviewStartTime?.(null);
        setPreviewEndTime?.(null);
        setDropBlocked(true);
        return null;
      }

      setDropBlocked(false);
      setPreviewStartTime?.(minutesToTime(slot.start));
      setPreviewEndTime?.(minutesToTime(slot.start + 60));
      return slot.start;
    },
    [
      minutesAt,
      selectedDay,
      dayStartMinutes,
      dayEndMinutes,
      setPreviewStartTime,
      setPreviewEndTime,
    ],
  );

  const draggingRef = useRef<Omit<Place, 'startTime' | 'endTime'> | null>(null);

  const handlePickUpPlace = useCallback(
    (place: Omit<Place, 'startTime' | 'endTime'>, absoluteY: number) => {
      restoreTo.current = sheetHeightRef.current;
      draggingRef.current = place;
      setDraggingPlace(place);
      handleAddPlace(place);
      timelineViewRef.current?.measureInWindow((_x, y) => {
        timelineTop.current = y;
      });
      dragY.value = absoluteY - bodyTop.current;
      ghostScale.value = 0.86;
      ghostScale.value = withSpring(1, { damping: 13, stiffness: 220 });
      setSheetHeight(0);
    },
    [dragY, ghostScale, handleAddPlace, setSheetHeight],
  );

  const handleDragPlace = useCallback(
    (absoluteY: number) => {
      dragY.value = absoluteY - bodyTop.current;
      previewAt(absoluteY);
    },
    [dragY, previewAt],
  );

  const restoreSheet = useCallback(() => {
    draggingRef.current = null;
    setDraggingPlace(null);
    setDropBlocked(false);
    setSheetHeight(restoreTo.current || Math.round(sheetMaxRef.current / 3));
  }, [setSheetHeight]);

  const handleDropPlace = useCallback(
    (absoluteY: number) => {
      const minutes = previewAt(absoluteY);
      const place = draggingRef.current;
      if (minutes === null || !place) {
        onCancelPlacement?.();
      } else {
        handleAddPlace({
          ...(place as Place),
          startTime: minutesToTime(minutes),
          endTime: minutesToTime(minutes + 60),
        } as any);
      }
      restoreSheet();
    },
    [previewAt, handleAddPlace, onCancelPlacement, restoreSheet],
  );

  const handleCancelPickUp = useCallback(() => {
    onCancelPlacement?.();
    restoreSheet();
  }, [onCancelPlacement, restoreSheet]);

  // 끄는 도중 목록이 새 함수를 받으면 행이 다시 그려진다. 최신 함수는 ref로 두고
  // 목록에는 바뀌지 않는 껍데기만 넘긴다.
  const dragCallbacks = useRef({
    pickUp: handlePickUpPlace,
    drag: handleDragPlace,
    drop: handleDropPlace,
    cancel: handleCancelPickUp,
    press: onOpenDetail,
  });
  dragCallbacks.current = {
    pickUp: handlePickUpPlace,
    drag: handleDragPlace,
    drop: handleDropPlace,
    cancel: handleCancelPickUp,
    press: onOpenDetail,
  };

  const onPickUpStable = useCallback(
    (place: Omit<Place, 'startTime' | 'endTime'>, y: number) =>
      dragCallbacks.current.pickUp(place, y),
    [],
  );
  const onDragStable = useCallback(
    (y: number) => dragCallbacks.current.drag(y),
    [],
  );
  const onDropStable = useCallback(
    (y: number) => dragCallbacks.current.drop(y),
    [],
  );
  const onCancelStable = useCallback(
    () => dragCallbacks.current.cancel(),
    [],
  );
  const onPressPlaceStable = useCallback(
    (place: Omit<Place, 'startTime' | 'endTime'>) =>
      dragCallbacks.current.press(place as Place),
    [],
  );


  if (!selectedDay) {
    return <AirplaneLoading />;
  }

  return (
    <View style={[styles.container, screenInsets]}>
      <View style={styles.topBarHeader}>
        <TouchableOpacity
          style={styles.topBarBackButton}
          onPress={onGoBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={8}
        >
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarHeaderTitle}>일정편집</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.topToolbar}>
        <View style={styles.toolbarLeftGroup}>
          {isEditingTripName ? (
            <>
              <Text
                style={[styles.toolbarTitleInput, styles.toolbarTitleMeasure]}
                onLayout={(e) => {
                  const { width } = e.nativeEvent.layout;
                  const finalWidth = Math.max(30, Math.min(170, width + 8));
                  setInputWidth(finalWidth);
                }}
              >
                {tripName || '일정 이름'}
              </Text>
              <TextInput
                value={tripName}
                onChangeText={setTripName}
                onBlur={onSaveTripName}
                onSubmitEditing={onSaveTripName}
                autoFocus
                numberOfLines={1}
                maxLength={PLAN_NAME_MAX_LENGTH}
                returnKeyType="done"
                style={[
                  styles.toolbarTitleInput,
                  styles.toolbarTitleInputSized,
                  { width: inputWidth },
                ]}
                placeholder="일정 이름"
                placeholderTextColor={COLORS.placeholder}
              />
            </>
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

          <ToolbarIconButton
            onPress={onOpenPlanInfo}
            variant="info"
          >
            <InfoIcon color={COLORS.text} size={18} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={onOpenChecklist} variant="outlineDark">
            <ListChecks color={COLORS.text} size={17} strokeWidth={2} />
          </ToolbarIconButton>
        </View>

        <View style={styles.toolbarRightGroup}>
          <ToolbarIconButton
            onPress={onOpenParticipants}
            badgeCount={participantsCount}
            variant="outlineBlue"
          >
            <UsersIcon color={COLORS.primary} size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={onOpenMap} variant="outlineDark">
            <MapOutlineIcon color={COLORS.text} size={17} strokeWidth={2} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={onOpenShare} variant="filledGray">
            <UserPlusIcon color={COLORS.text} size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={onComplete} variant="filledBlue" active>
            <CheckIcon color={COLORS.white} size={18} />
          </ToolbarIconButton>
        </View>
      </View>

      <View style={styles.dayTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContainer}
          style={styles.dayTabsScroll}
          onContentSizeChange={(w) => setDayScrollContentWidth(w)}
          onLayout={(e) => setDayScrollLayoutWidth(e.nativeEvent.layout.width)}
          onScroll={(e) => setDayScrollX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
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
                    styles.dayTabDayNumber,
                    isSelected && styles.dayTabDayNumberSelected,
                  ]}
                >
                  {day.dayNumber}일차
                </Text>
                <Text
                  style={[
                    styles.dayTabDateInline,
                    isSelected && styles.dayTabDateInlineSelected,
                  ]}
                >
                  {formatDate(day.date)}
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
          accessibilityRole="button"
          accessibilityLabel="일정 기간 편집"
        >
          <CalendarDaysIcon color={COLORS.textSecondary} size={22} />
        </TouchableOpacity>

        {showLeftFade && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dayTabsFadeOverlay, styles.dayTabsFadeOverlayLeft]}
            pointerEvents="none"
          />
        )}

        {showRightFade && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dayTabsFadeOverlay, styles.dayTabsFadeOverlayRight]}
            pointerEvents="none"
          />
        )}
      </View>

      {pendingPlace && (
        <View style={styles.pendingPlaceBanner}>
          <Text style={styles.pendingPlaceBannerText}>
            '{pendingPlace.name}'을 배치할 타임라인의 빈 영역을 클릭해 주세요.
          </Text>
          <TouchableOpacity
            onPress={onCancelPlacement}
            style={styles.pendingPlaceBannerCancelButton}
          >
            <Text style={styles.pendingPlaceBannerCancelText}>취소</Text>
          </TouchableOpacity>
        </View>
      )}

      <EditorStateContext.Provider value={editorStateContextValue}>
        <View style={styles.editorBody} ref={bodyViewRef} onLayout={onBodyLayout}>
          <View
            style={styles.editorTimeline}
            ref={timelineViewRef}
            testID="editor-timeline"
          >
            <TimelineTabScreen />
          </View>

          <Animated.View style={[styles.placeSheet, sheetAnimStyle]}>
            <GestureDetector gesture={sheetGesture}>
              <View
                style={styles.sheetHandle}
                accessibilityRole="adjustable"
                accessibilityLabel="추천 장소 크기 조절"
              >
                <View style={styles.sheetGrabber} />
                <SheetCategoryRow selected={placeTab} onSelect={setPlaceTab} />
              </View>
            </GestureDetector>

            <View style={styles.sheetBody}>
              <Text style={styles.sheetHint}>
                <Text style={styles.sheetHintStrong}>꾹 눌러</Text> 시간표에 놓기
              </Text>
              <PlaceRecommendationList
                onAddPlace={handleAddPlace}
                destination={destination}
                travelId={travelId ?? null}
                hideTabs
                selectedTab={placeTab}
                onSelectTab={setPlaceTab}
                onPressPlace={onPressPlaceStable}
                onPickUpPlace={onPickUpStable}
                onDragPlace={onDragStable}
                onDropPlace={onDropStable}
                onCancelPickUp={onCancelStable}
              />
            </View>
          </Animated.View>

          {draggingPlace && (
            <Animated.View
              pointerEvents="none"
              style={[styles.dragGhost, ghostAnimStyle]}
            >
              <Text style={styles.dragGhostText} numberOfLines={1}>
                {draggingPlace.name}
              </Text>
            </Animated.View>
          )}
        </View>
      </EditorStateContext.Provider>

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
          places: d.places,
        }))}
        onClose={() => setScheduleEditVisible(false)}
        onConfirm={onConfirmScheduleEdit}
      />
    </View>
  );
}
