import React, {
  useCallback,
  createContext,
  useContext,
  useEffect,
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
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const PREVIEW_SPRING_CONFIG = {
  damping: 22,
  stiffness: 220,
  mass: 0.6,
};
import TimelineItem, { Place } from '../components/TimelineItem';
import {
  AirplaneLoading,
  ScheduleEditModal,
  TimePickerModal,
} from '../../../components/common';
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
  SHEET_HANDLE_HEIGHT,
  TAB_FILL,
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

const DraggableTimelineItem = React.memo(
  ({
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
    onItemDragStart,
    onItemDragEnd,
    disabled = false,
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
    onItemDragStart?: (placeId: string) => void;
    onItemDragEnd?: () => void;
    disabled?: boolean;
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
    }, [
      place.startTime,
      place.endTime,
      offsetMinutes,
      top,
      height,
      previewHeight,
    ]);

    const startY = useSharedValue(0);
    const startHeight = useSharedValue(0);
    const isResizingTop = useSharedValue(0);
    const isResizingBottom = useSharedValue(0);
    const isDragging = useSharedValue(0);
    const previewTop = useSharedValue(initialTop);
    const indicatorOpacity = useSharedValue(0);
    const indicatorScale = useSharedValue(0.97);

    const exitOpacity = useSharedValue(1);
    const exitScale = useSharedValue(1);
    const exitTranslateY = useSharedValue(0);

    const dragOpacity = useSharedValue(1);
    const dragScale = useSharedValue(1);

    const placeId = place.id;
    const isDeletingRef = useRef(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteWithAnim = React.useCallback(() => {
      if (isDeletingRef.current) return;
      isDeletingRef.current = true;
      setIsDeleting(true);

      exitScale.value = withTiming(0.88, {
        duration: 220,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
      exitTranslateY.value = withTiming(8, {
        duration: 220,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
      exitOpacity.value = withTiming(
        0,
        { duration: 200, easing: Easing.out(Easing.cubic) },
        () => {
          runOnJS(onDelete)(placeId);
        },
      );
    }, [onDelete, placeId, exitOpacity, exitScale, exitTranslateY]);

    const handleEditTime = React.useCallback(
      (type: 'startTime' | 'endTime') => {
        if (isDeletingRef.current) return;
        onEditTime(
          placeId,
          type,
          type === 'startTime' ? place.startTime : place.endTime,
        );
      },
      [onEditTime, placeId, place.startTime, place.endTime],
    );

    const handlePress = React.useCallback(() => {
      if (isDeletingRef.current) return;
      onPress?.(place);
    }, [onPress, place]);

    const panGestureMove = Gesture.Pan()
      .enabled(!disabled)
      .activateAfterLongPress(200)
      .onBegin(() => {
        if (isDeletingRef.current) return;
        startY.value = top.value;
        previewTop.value = top.value;
        previewHeight.value = height.value;
      })
      .onStart(() => {
        isDragging.value = 1;
        dragOpacity.value = withSpring(0.76, PREVIEW_SPRING_CONFIG);
        dragScale.value = withSpring(0.91, PREVIEW_SPRING_CONFIG);
        indicatorOpacity.value = withTiming(1, { duration: 150 });
        indicatorScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
        if (onItemDragStart) runOnJS(onItemDragStart)(placeId);
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
      })
      .onEnd(() => {
        isDragging.value = 0;
        dragOpacity.value = withSpring(1);
        dragScale.value = withSpring(1);
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

        indicatorOpacity.value = withDelay(
          80,
          withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
        );
        indicatorScale.value = withDelay(
          80,
          withTiming(0.98, { duration: 220 }),
        );

        runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
        if (onItemDragEnd) runOnJS(onItemDragEnd)();
      })
      .onFinalize((_event, success) => {
        if (!success) {
          isDragging.value = 0;
          dragOpacity.value = withSpring(1);
          dragScale.value = withSpring(1);
          indicatorOpacity.value = withTiming(0, { duration: 150 });
          indicatorScale.value = withTiming(0.97, { duration: 150 });
          if (onItemDragEnd) runOnJS(onItemDragEnd)();
        }
      });

    const panGestureResizeTop = Gesture.Pan()
      .enabled(!disabled)
      .minDistance(4)
      .onBegin(() => {
        if (isDeletingRef.current) return;
        startY.value = top.value;
        startHeight.value = height.value;
        previewTop.value = top.value;
        previewHeight.value = height.value;
      })
      .onStart(() => {
        isDragging.value = 1;
        dragOpacity.value = withSpring(0.82, PREVIEW_SPRING_CONFIG);
        dragScale.value = withSpring(0.96, PREVIEW_SPRING_CONFIG);
        isResizingTop.value = withSpring(1);
        indicatorOpacity.value = withTiming(1, { duration: 150 });
        indicatorScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
        if (onItemDragStart) runOnJS(onItemDragStart)(placeId);
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

        indicatorOpacity.value = withDelay(
          80,
          withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
        );
        indicatorScale.value = withDelay(
          80,
          withTiming(0.98, { duration: 220 }),
        );

        const newStartMinutes =
          (finalTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
        const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

        runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
        if (onItemDragEnd) runOnJS(onItemDragEnd)();
      })
      .onFinalize((_event, success) => {
        isResizingTop.value = withSpring(0);
        if (!success) {
          isDragging.value = 0;
          dragOpacity.value = withSpring(1);
          dragScale.value = withSpring(1);
          indicatorOpacity.value = withTiming(0, { duration: 150 });
          if (onItemDragEnd) runOnJS(onItemDragEnd)();
        }
      });

    const panGestureResizeBottom = Gesture.Pan()
      .enabled(!disabled)
      .minDistance(4)
      .onBegin(() => {
        if (isDeletingRef.current) return;
        startHeight.value = height.value;
        previewTop.value = top.value;
        previewHeight.value = height.value;
      })
      .onStart(() => {
        isDragging.value = 1;
        dragOpacity.value = withSpring(0.82, PREVIEW_SPRING_CONFIG);
        dragScale.value = withSpring(0.96, PREVIEW_SPRING_CONFIG);
        isResizingBottom.value = withSpring(1);
        indicatorOpacity.value = withTiming(1, { duration: 150 });
        indicatorScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
        if (onItemDragStart) runOnJS(onItemDragStart)(placeId);
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

        indicatorOpacity.value = withDelay(
          80,
          withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
        );
        indicatorScale.value = withDelay(
          80,
          withTiming(0.98, { duration: 220 }),
        );

        const newStartMinutes =
          (top.value - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
        const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

        runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
        if (onItemDragEnd) runOnJS(onItemDragEnd)();
      })
      .onFinalize((_event, success) => {
        isResizingBottom.value = withSpring(0);
        if (!success) {
          isDragging.value = 0;
          dragOpacity.value = withSpring(1);
          dragScale.value = withSpring(1);
          indicatorOpacity.value = withTiming(0, { duration: 150 });
          if (onItemDragEnd) runOnJS(onItemDragEnd)();
        }
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
          { translateY: exitTranslateY.value },
        ],
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: isDragging.value === 1 ? 8 : 0 },
        shadowOpacity: isDragging.value === 1 ? 0.22 : 0,
        shadowRadius: isDragging.value === 1 ? 16 : 0,
        elevation: isDragging.value === 1 ? 8 : 0,
        zIndex: isDragging.value === 1 ? 100 : 1,
      };
    });

    const indicatorStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: withSpring(previewTop.value, PREVIEW_SPRING_CONFIG),
        height: withSpring(previewHeight.value, PREVIEW_SPRING_CONFIG),
        left: 60,
        right: 15,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: 'rgba(19, 68, 255, 0.11)',
        opacity: indicatorOpacity.value,
        transform: [{ scale: indicatorScale.value }],
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
        <Animated.View
          style={animatedStyle}
          pointerEvents={isDeleting ? 'none' : 'auto'}
        >
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
  },
);
DraggableTimelineItem.displayName = 'DraggableTimelineItem';

interface AnimatedPlacementPreviewProps {
  pendingPlace?: Omit<Place, 'startTime' | 'endTime'> | null;
  previewStartTime?: string | null;
  previewEndTime?: string | null;
  offsetMinutes: number;
  isDragging?: boolean;
  dropBlocked?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const AnimatedPlacementPreview: React.FC<AnimatedPlacementPreviewProps> =
  React.memo(
    ({
      pendingPlace,
      previewStartTime,
      previewEndTime,
      offsetMinutes,
      isDragging = false,
      dropBlocked = false,
      onCancel,
      onConfirm,
    }) => {
      const startMin = previewStartTime
        ? timeToMinutes(previewStartTime)
        : null;
      const endMin = previewEndTime ? timeToMinutes(previewEndTime) : null;

      const targetTop = useMemo(() => {
        if (startMin === null) return null;
        return (startMin - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
      }, [startMin, offsetMinutes]);

      const targetHeight = useMemo(() => {
        if (startMin === null || endMin === null) return MIN_ITEM_HEIGHT;
        return Math.max((endMin - startMin) * MINUTE_HEIGHT, MIN_ITEM_HEIGHT);
      }, [startMin, endMin]);

      const lastTopRef = useRef<number>(targetTop ?? GRID_TOP_OFFSET);
      if (targetTop !== null) {
        lastTopRef.current = targetTop;
      }
      const lastHeightRef = useRef<number>(targetHeight);
      if (startMin !== null && endMin !== null) {
        lastHeightRef.current = targetHeight;
      }

      const animTop = useSharedValue(targetTop ?? GRID_TOP_OFFSET);
      const animHeight = useSharedValue(targetHeight);
      const animOpacity = useSharedValue(0);
      const animScale = useSharedValue(0.96);
      const prevPlaceRef = useRef(pendingPlace);

      useEffect(() => {
        if (!pendingPlace) {
          animOpacity.value = withTiming(0, { duration: 120 });
          animScale.value = withTiming(0.96, { duration: 120 });
          return;
        }

        const isNewPlace = prevPlaceRef.current !== pendingPlace;
        prevPlaceRef.current = pendingPlace;

        if (targetTop !== null) {
          if (isNewPlace || animOpacity.value === 0) {
            animTop.value = targetTop;
            animHeight.value = targetHeight;
            animOpacity.value = withTiming(1, {
              duration: 160,
              easing: Easing.out(Easing.cubic),
            });
            animScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
          } else {
            animTop.value = withSpring(targetTop, PREVIEW_SPRING_CONFIG);
            animHeight.value = withSpring(targetHeight, PREVIEW_SPRING_CONFIG);
            animOpacity.value = withTiming(1, { duration: 120 });
            animScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
          }
        } else if (dropBlocked) {
          animTop.value = withSpring(lastTopRef.current, PREVIEW_SPRING_CONFIG);
          animHeight.value = withSpring(
            lastHeightRef.current,
            PREVIEW_SPRING_CONFIG,
          );
          animOpacity.value = withTiming(1, { duration: 150 });
          animScale.value = withSequence(
            withTiming(0.97, { duration: 80 }),
            withSpring(1, PREVIEW_SPRING_CONFIG),
          );
        } else {
          animOpacity.value = withTiming(0, { duration: 120 });
          animScale.value = withTiming(0.96, { duration: 120 });
        }
      }, [
        pendingPlace,
        targetTop,
        targetHeight,
        dropBlocked,
        animTop,
        animHeight,
        animOpacity,
        animScale,
      ]);

      const animatedStyle = useAnimatedStyle(() => ({
        top: animTop.value,
        height: animHeight.value,
        opacity: animOpacity.value,
        transform: [{ scale: animScale.value }],
      }));

      if (!pendingPlace) return null;
      if (targetTop === null && !dropBlocked) return null;

      if (dropBlocked) {
        return (
          <Animated.View
            style={[
              styles.previewBanner,
              styles.previewBannerBlocked,
              animatedStyle,
            ]}
            pointerEvents="none"
          >
            <Text style={styles.previewBannerBlockedText}>공간 부족</Text>
          </Animated.View>
        );
      }

      return (
        <Animated.View
          style={[
            styles.previewBanner,
            isDragging && styles.previewBannerDragging,
            animatedStyle,
          ]}
          pointerEvents={isDragging ? 'none' : 'box-none'}
        >
          <View style={styles.previewBannerInfo}>
            <Text style={styles.previewBannerName} numberOfLines={1}>
              {pendingPlace.name}
            </Text>
            <Text style={styles.previewBannerTime}>
              {previewStartTime} - {previewEndTime} ({pendingPlace.type})
            </Text>
          </View>
          {!isDragging && (
            <View style={styles.previewBannerActions}>
              <TouchableOpacity
                onPress={onCancel}
                style={[
                  styles.previewBannerActionButton,
                  styles.previewBannerCancelButton,
                ]}
                accessibilityRole="button"
                accessibilityLabel="장소 배치 취소"
                hitSlop={8}
              >
                <XIcon color={COLORS.white} size={14} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                style={[
                  styles.previewBannerActionButton,
                  styles.previewBannerConfirmButton,
                ]}
                accessibilityRole="button"
                accessibilityLabel="장소 배치 확정"
                hitSlop={8}
              >
                <CheckIcon color={COLORS.white} size={14} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      );
    },
  );
AnimatedPlacementPreview.displayName = 'AnimatedPlacementPreview';

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
      /** 시트에 가려지는 만큼. 마지막 시간대도 시트 위로 올려 볼 수 있게. */
      bottomPadding?: number;
      pendingPlace?: Omit<Place, 'startTime' | 'endTime'> | null;
      previewStartTime?: string | null;
      previewEndTime?: string | null;
      setPreviewStartTime?: (time: string | null) => void;
      setPreviewEndTime?: (time: string | null) => void;
      onConfirmPlacement?: () => void;
      onCancelPreview?: () => void;
      /** 눈금판 자체의 화면 좌표를 재기 위한 ref. 여백·스크롤을 추측하지 않는다 */
      gridRef?: React.RefObject<View | null>;
      /** 끌어놓는 중이면 확인·취소 버튼 없이 점선만 그린다 */
      isDragging?: boolean;
      /** 비켜설 빈자리조차 없을 때 */
      dropBlocked?: boolean;
      onItemDragStart?: () => void;
      onItemDragEnd?: () => void;
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
        bottomPadding = 0,
        pendingPlace,
        previewStartTime,
        previewEndTime,
        setPreviewStartTime,
        setPreviewEndTime,
        onConfirmPlacement,
        onCancelPreview,
        gridRef,
        isDragging = false,
        dropBlocked = false,
        onItemDragStart,
        onItemDragEnd,
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

      const [draggingPlaceId, setDraggingPlaceId] = useState<string | null>(
        null,
      );
      const isItemDragging = draggingPlaceId !== null;
      const handleItemDragStart = useCallback(
        (placeId?: string) => {
          setDraggingPlaceId(placeId || 'active');
          onItemDragStart?.();
        },
        [onItemDragStart],
      );
      const handleItemDragEnd = useCallback(() => {
        setDraggingPlaceId(null);
        onItemDragEnd?.();
      }, [onItemDragEnd]);

      return (
        <View style={styles.tabContentContainer}>
          <ScrollView
            ref={ref}
            scrollEnabled={!isItemDragging && !isDragging}
            contentContainerStyle={[
              styles.timelineContentContainer,
              { paddingTop: topPadding, paddingBottom: bottomPadding },
            ]}
          >
            <Pressable
              onPress={evt => {
                if (!pendingPlace || !setPreviewStartTime || !setPreviewEndTime)
                  return;
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
              <View
                ref={gridRef}
                style={styles.timelineWrapper}
                pointerEvents="box-none"
              >
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
                    onItemDragStart={handleItemDragStart}
                    onItemDragEnd={handleItemDragEnd}
                    disabled={
                      isDragging ||
                      (isItemDragging && draggingPlaceId !== place.id)
                    }
                  />
                ))}

                <AnimatedPlacementPreview
                  pendingPlace={pendingPlace}
                  previewStartTime={previewStartTime}
                  previewEndTime={previewEndTime}
                  offsetMinutes={offsetMinutes}
                  isDragging={isDragging}
                  dropBlocked={dropBlocked}
                  onCancel={onCancelPreview}
                  onConfirm={onConfirmPlacement}
                />
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
  gridRef: React.RefObject<View | null>;
  sheetInset: number;
  onItemDragStart?: () => void;
  onItemDragEnd?: () => void;
} | null>(null);

/** 붙는 자리 — 접힘 / 1·3 / 2·3 / 최대 확장 */
const SHEET_SNAPS = [0, 1 / 3, 2 / 3, 1];

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
            style={[
              styles.sheetCat,
              isOn && {
                backgroundColor: TAB_FILL[tab] ?? COLORS.primary,
                borderColor: TAB_FILL[tab] ?? COLORS.primary,
              },
            ]}
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
    gridRef,
    sheetInset,
    onItemDragStart,
    onItemDragEnd,
  } = state;

  const localDateStr = selectedDay ? formatDateLocal(selectedDay.date) : '';
  const currentWeather = selectedDay ? weatherMap[localDateStr] : undefined;

  return (
    <View style={styles.timelineStage}>
      <View pointerEvents="none" style={styles.timelineSceneBackdrop} />
      {selectedDay && currentWeather && (
        <View pointerEvents="none" style={styles.timelineWeatherOverlay}>
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
        bottomPadding={sheetInset}
        pendingPlace={pendingPlace}
        previewStartTime={previewStartTime}
        previewEndTime={previewEndTime}
        setPreviewStartTime={setPreviewStartTime}
        setPreviewEndTime={setPreviewEndTime}
        onConfirmPlacement={onConfirmPlacement}
        onCancelPreview={onCancelPreview}
        isDragging={isDragging}
        dropBlocked={dropBlocked}
        gridRef={gridRef}
        onItemDragStart={onItemDragStart}
        onItemDragEnd={onItemDragEnd}
      />
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
  /** 끌어놓기로 시간까지 정해진 장소를 바로 담는다 */
  onPlaceAt?: (
    place: Omit<Place, 'startTime' | 'endTime'>,
    startTime: string,
    endTime: string,
  ) => void;
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
  onPlaceAt,
  onCancelPreview,
}: ItineraryEditorScreenViewProps) {
  const screenInsets = useScreenInsets(true);
  const [inputWidth, setInputWidth] = useState(120);
  const [dayScrollContentWidth, setDayScrollContentWidth] = useState(0);
  const [dayScrollLayoutWidth, setDayScrollLayoutWidth] = useState(0);
  const [dayScrollX, setDayScrollX] = useState(0);
  const isDayScrollable = dayScrollContentWidth > dayScrollLayoutWidth;
  const showLeftFade = isDayScrollable && dayScrollX > 5;
  const showRightFade =
    isDayScrollable &&
    dayScrollX < dayScrollContentWidth - dayScrollLayoutWidth - 5;

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
  const [isTimelineItemDragging, setIsTimelineItemDragging] = useState(false);
  const handleTimelineItemDragStart = useCallback(
    () => setIsTimelineItemDragging(true),
    [],
  );
  const handleTimelineItemDragEnd = useCallback(
    () => setIsTimelineItemDragging(false),
    [],
  );
  const gridViewRef = useRef<View>(null);
  /** 시간표 아래 여백에 쓰는, 손을 뗀 뒤의 시트 높이. */
  const [sheetRest, setSheetRest] = useState(0);

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
      gridRef: gridViewRef,
      sheetInset: SHEET_HANDLE_HEIGHT + sheetRest,
      onItemDragStart: handleTimelineItemDragStart,
      onItemDragEnd: handleTimelineItemDragEnd,
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
    sheetRest,
    handleTimelineItemDragStart,
    handleTimelineItemDragEnd,
  ]);

  // ── 장소 시트 ──
  // 손잡이를 끌면 높이가 손끝을 따라오고, 놓으면 가까운 자리에 붙는다.
  //
  // 높이는 공유값과 ref 두 곳에 둔다. 공유값에 쓴 값을 JS에서 바로 되읽으면
  // 아직 반영되지 않은 옛 값이 나와, 계산에 쓰는 쪽은 ref만 본다.
  const [placeTab, setPlaceTab] = useState<PlaceTab>('관광지');

  const sheetBody = useSharedValue(0);
  /** 접을 때 내려가는 거리. 높이가 아니라 위치만 옮겨야 손가락이 안 끊긴다. */
  const sheetShift = useSharedValue(0);

  const sheetHeightRef = useRef(0);
  const sheetMaxRef = useRef(0);
  const sheetStartRef = useRef(0);
  const sheetInited = useRef(false);
  const bodyTop = useRef(0);
  const bodyHeight = useRef(0);
  const timelineTop = useRef(0);
  const gridTopRef = useRef(0);
  const bodyViewRef = useRef<View>(null);
  const timelineViewRef = useRef<View>(null);

  const setSheetHeight = useCallback(
    (height: number, animate = true) => {
      const next = Math.max(0, Math.min(sheetMaxRef.current, height));
      sheetHeightRef.current = next;
      sheetBody.value = animate ? withTiming(next, { duration: 220 }) : next;
      // 끄는 동안에는 시간표를 다시 짜지 않는다. 손을 뗀 자리에서만 맞춘다.
      if (animate) setSheetRest(next);
    },
    [sheetBody],
  );

  const snapPoints = useCallback(
    () => SHEET_SNAPS.map(ratio => Math.round(sheetMaxRef.current * ratio)),
    [],
  );

  const measureGrid = useCallback(() => {
    bodyViewRef.current?.measureInWindow((_x, y) => {
      bodyTop.current = y;
    });
    timelineViewRef.current?.measureInWindow((_x, y) => {
      timelineTop.current = y;
    });
    gridViewRef.current?.measureInWindow((_x, y) => {
      gridTopRef.current = y;
    });
  }, []);

  const selectedDayDateStr = selectedDay
    ? formatDateLocal(selectedDay.date)
    : '';
  const hasWeather = Boolean(
    selectedDay && weatherMap && weatherMap[selectedDayDateStr],
  );
  /** 날씨 카드가 있으면 그 바로 밑(72px), 없으면 일차 탭 바로 밑(8px)까지만 남긴다. */
  const sheetTopGap = hasWeather ? 72 : 8;

  const onBodyLayout = useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      bodyHeight.current = height;
      sheetMaxRef.current = Math.max(
        0,
        height - SHEET_HANDLE_HEIGHT - sheetTopGap,
      );
      if (!sheetInited.current && sheetMaxRef.current > 0) {
        sheetInited.current = true;
        setSheetHeight(Math.round(sheetMaxRef.current / 3));
      }
      measureGrid();
    },
    [setSheetHeight, measureGrid, sheetTopGap],
  );

  useEffect(() => {
    if (bodyHeight.current > 0) {
      const newMax = Math.max(
        0,
        bodyHeight.current - SHEET_HANDLE_HEIGHT - sheetTopGap,
      );
      sheetMaxRef.current = newMax;
      if (sheetHeightRef.current > newMax) {
        setSheetHeight(newMax, true);
      }
    }
  }, [sheetTopGap, setSheetHeight]);

  const sheetGesture = useMemo(
    () =>
      Gesture.Exclusive(
        Gesture.Pan()
          .runOnJS(true)
          .enabled(!isTimelineItemDragging && !draggingPlace)
          .hitSlop({ top: 16, bottom: 16, left: 30, right: 30 })
          .onBegin(() => {
            sheetStartRef.current = sheetHeightRef.current;
          })
          .onUpdate(e =>
            setSheetHeight(sheetStartRef.current - e.translationY, false),
          )
          .onEnd(e => {
            const current = sheetHeightRef.current;
            const points = snapPoints();
            const velocityY = e.velocityY;
            const translationY = e.translationY;

            // 빠른 스와이프(플릭) 또는 30px 이상의 명확한 드래그 방향 반영
            if (velocityY < -250 || translationY < -30) {
              const higherPoints = points.filter(p => p > current + 10);
              const target =
                higherPoints.length > 0
                  ? higherPoints[0]
                  : points[points.length - 1];
              setSheetHeight(target);
            } else if (velocityY > 250 || translationY > 30) {
              const lowerPoints = points.filter(p => p < current - 10);
              const target =
                lowerPoints.length > 0
                  ? lowerPoints[lowerPoints.length - 1]
                  : points[0];
              setSheetHeight(target);
            } else {
              setSheetHeight(nearestSnap(current, points));
            }
          }),
        Gesture.Tap()
          .runOnJS(true)
          .enabled(!isTimelineItemDragging && !draggingPlace)
          .hitSlop({ top: 16, bottom: 16, left: 30, right: 30 })
          .onEnd(() => {
            const points = snapPoints();
            const maxPoint = points[points.length - 1];
            const peekPoint = points[1] || Math.round(maxPoint / 3);
            // 접힌 상태면 피크(1/3)로, 이미 열려 있으면 최대로 확장, 최대면 다시 피크로 전환
            if (sheetHeightRef.current <= 1) {
              setSheetHeight(peekPoint);
            } else if (sheetHeightRef.current >= maxPoint - 20) {
              setSheetHeight(peekPoint);
            } else {
              setSheetHeight(maxPoint);
            }
          }),
      ),
    [setSheetHeight, snapPoints, isTimelineItemDragging, draggingPlace],
  );

  const sheetAnimStyle = useAnimatedStyle(() => ({
    height: SHEET_HANDLE_HEIGHT + sheetBody.value,
    transform: [{ translateY: sheetShift.value }],
  }));

  const floatingAnimStyle = useAnimatedStyle(() => {
    const max = sheetMaxRef.current || 400;
    const progress = Math.max(0, Math.min(1, sheetBody.value / max));
    const opacity =
      progress < 0.5 ? 1 : Math.max(0, 1 - (progress - 0.5) / 0.25);
    return {
      opacity,
      transform: [
        {
          translateY: -sheetBody.value + sheetShift.value,
        },
      ],
    };
  });

  // ── 꾹 눌러 집고, 끌고, 놓기 ──
  const dayStartMinutes = timeToMinutes(
    selectedDay?.startTime || DEFAULT_DAY_START,
  );
  const dayEndMinutes = timeToMinutes(selectedDay?.endTime || DEFAULT_DAY_END);
  const gridOffsetMinutes = Math.floor(dayStartMinutes / 60) * 60;

  const FINGER_TARGET_OFFSET = 20;

  /**
   * 손가락의 화면 좌표를 시간표의 15분 눈금으로 옮긴다. 시간표 밖이면 null.
   *
   * 눈금판의 화면 좌표를 직접 재서 쓴다. 날씨 카드 여백이나 스크롤 값을
   * 더하고 빼며 맞추면 한 칸씩 어긋나기 쉽다.
   */
  const minutesAt = useCallback(
    (absoluteY: number) => {
      const gridTop =
        gridTopRef.current ||
        bodyTop.current +
          (selectedDay && weatherMap[formatDateLocal(selectedDay.date)]
            ? 62
            : 0);
      const areaTop = timelineTop.current;
      // 시트가 접힌 뒤의 시간표 바닥. 손잡이 줄 위까지가 놓을 수 있는 자리다.
      const areaBottom =
        bodyTop.current + bodyHeight.current - SHEET_HANDLE_HEIGHT;
      if (!gridTop) return null;
      if (areaTop && absoluteY < areaTop) return null;
      if (bodyHeight.current && absoluteY > areaBottom) return null;

      const targetY = absoluteY - FINGER_TARGET_OFFSET;
      const minutes =
        (targetY - gridTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT +
        gridOffsetMinutes;
      const snapped = Math.floor(minutes / 15) * 15;
      if (snapped + 60 < dayStartMinutes) return null;
      return Math.max(dayStartMinutes, Math.min(snapped, dayEndMinutes - 60));
    },
    [
      dayStartMinutes,
      dayEndMinutes,
      gridOffsetMinutes,
      selectedDay,
      weatherMap,
    ],
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
    (place: Omit<Place, 'startTime' | 'endTime'>, _absoluteY: number) => {
      draggingRef.current = place;
      setDraggingPlace(place);
      handleAddPlace(place);
      measureGrid();
      // 높이를 줄이면 목록이 짜부라지며 집고 있던 손가락이 끊긴다.
      // 자리는 그대로 두고 아래로 밀어 내려 손잡이 줄만 남긴다.
      sheetShift.value = withTiming(sheetHeightRef.current, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    },
    [handleAddPlace, sheetShift, measureGrid],
  );

  const handleDragPlace = useCallback(
    (absoluteY: number) => {
      previewAt(absoluteY);
    },
    [previewAt],
  );

  const restoreSheet = useCallback(() => {
    draggingRef.current = null;
    setDraggingPlace(null);
    setDropBlocked(false);
    sheetShift.value = withTiming(0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [sheetShift]);

  const handleDropPlace = useCallback(
    (absoluteY: number) => {
      const minutes = previewAt(absoluteY);
      const place = draggingRef.current;
      if (minutes === null || !place) {
        onCancelPlacement?.();
      } else {
        // handleAddPlace는 pendingPlace만 세우는 자리라 여기서는 쓰지 않는다.
        onPlaceAt?.(place, minutesToTime(minutes), minutesToTime(minutes + 60));
      }
      restoreSheet();
    },
    [previewAt, onPlaceAt, onCancelPlacement, restoreSheet],
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
  const onCancelStable = useCallback(() => dragCallbacks.current.cancel(), []);
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
        <Text style={styles.topBarHeaderTitle}>일정 편집</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.topToolbar}>
        <View style={styles.toolbarLeftGroup}>
          {isEditingTripName ? (
            <>
              <Text
                style={[styles.toolbarTitleInput, styles.toolbarTitleMeasure]}
                onLayout={e => {
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

          <ToolbarIconButton onPress={onOpenPlanInfo} variant="info">
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
          onContentSizeChange={w => setDayScrollContentWidth(w)}
          onLayout={e => setDayScrollLayoutWidth(e.nativeEvent.layout.width)}
          onScroll={e => setDayScrollX(e.nativeEvent.contentOffset.x)}
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

      {/* 끄는 동안에는 띄우지 않는다. 이미 끌고 있는 손에 '눌러 주세요'는 맞지 않고,
          띠가 끼어들며 시간표가 밀려 놓이는 자리가 어긋난다. */}
      {pendingPlace && !draggingPlace && (
        <View style={styles.pendingPlaceBanner}>
          <Text style={styles.pendingPlaceBannerText}>
            '{pendingPlace.name}' 놓을 자리를 눌러 주세요
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
        <View
          style={styles.editorBody}
          ref={bodyViewRef}
          onLayout={onBodyLayout}
        >
          <View
            style={styles.editorTimeline}
            ref={timelineViewRef}
            testID="editor-timeline"
          >
            <TimelineTabScreen />
          </View>

          <Animated.View
            pointerEvents={
              sheetRest > (sheetMaxRef.current || 400) * 0.7
                ? 'none'
                : 'box-none'
            }
            style={[styles.floatingHistoryContainer, floatingAnimStyle]}
          >
            <TouchableOpacity
              testID="btn-undo"
              style={styles.floatingHistoryButton}
              onPress={onUndo}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="실행 취소"
              hitSlop={6}
            >
              <Undo2 color={COLORS.text} size={18} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.placeSheet, sheetAnimStyle]}>
            <GestureDetector gesture={sheetGesture}>
              <View
                style={styles.sheetGrabArea}
                accessibilityRole="adjustable"
                accessibilityLabel="추천 장소 크기 조절"
              >
                <View style={styles.sheetGrabber} />
              </View>
            </GestureDetector>

            <SheetCategoryRow selected={placeTab} onSelect={setPlaceTab} />

            <View style={styles.sheetBody}>
              <Text style={styles.sheetHint}>
                <Text style={styles.sheetHintStrong}>꾹 눌러</Text> 시간표에
                놓기
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
