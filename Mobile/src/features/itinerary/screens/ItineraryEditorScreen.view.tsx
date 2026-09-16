import React, {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { normalize } from '../../../utils/normalize';
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

/**
 * 덮어 둔 겹이 손가락을 먹게 한다. 그냥 얹어 두기만 하면 리액트 네이티브는
 * 만지겠다고 나서지 않은 View를 그대로 통과시킨다.
 */
const claimTouch = () => true;

/** 놓일 자리를 블록보다 사방으로 얼마나 넓게 그릴지(px). */
const PREVIEW_OUTSET = 6;

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
import PlaceDragGhost from '../components/PlaceDragGhost';
import { findDropSlot } from '../utils/dropSlot';
import { Day } from '../../../contexts/ItineraryContext';
import { PLAN_NAME_MAX_LENGTH, SimpleWeatherInfo } from '../../../api/trips';
import WeatherHeader from '../components/weather/WeatherHeader';
import ChatbotWindow from '../components/chatbot/ChatbotWindow';
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
  TIMELINE_BLOCK_LEFT,
  TIMELINE_BLOCK_RIGHT,
  TIMELINE_BLOCK_RADIUS,
} from './ItineraryEditorScreen.styles';
import {
  timeToMinutes,
  timeToDate,
  minutesToTime,
  formatDateLocal,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from '../../../utils/timeUtils';
import MessageCircle from 'lucide-react-native/dist/esm/icons/message-circle';
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
import {
  useCoachmarkTarget,
  useCoachmarkTour,
} from '../coachmark/CoachmarkContext';
import TutorialLauncher from '../coachmark/TutorialLauncher';
import type { PlaceDetailTarget } from '../components/PlaceDetailSheet';

type ToolbarButtonVariant =
  | 'plain'
  | 'info'
  | 'outlineBlue'
  | 'outlineDark'
  | 'filledGray'
  | 'filledBlue';

const ToolbarIconButton = ({
  label,
  children,
  onPress,
  active = false,
  disabled = false,
  badgeCount,
  variant = 'info',
  targetRef,
}: {
  children: React.ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  badgeCount?: number;
  variant?: ToolbarButtonVariant;
  /** 첫 진입 안내가 이 버튼을 짚을 수 있게 다는 ref. */
  targetRef?: (node: unknown) => void;
}) => (
  <TouchableOpacity
    ref={targetRef}
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
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
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

/** 손끝이 시간표 위아래 이 안쪽에 들어오면 그쪽으로 굴린다(px). */
const AUTO_SCROLL_EDGE = 90;
/** 한 번에 굴리는 최대 거리(px). 가장자리에 붙을수록 이 값에 가까워진다. */
const AUTO_SCROLL_MAX_STEP = 12;
/**
 * 구간에 들어오면 적어도 이만큼은 움직인다.
 *
 * 거리에만 비례시키면 경계 바로 안쪽에서 한 번에 1px씩 움직여, 굴러가는
 * 중인지 멈춘 것인지 알 수 없다.
 */
const AUTO_SCROLL_MIN_STEP = 4;
const AUTO_SCROLL_TICK_MS = 16;

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
    onShowDetail,
    onOverflow,
    scrollRef,
    requestAutoScroll,
    getScrollY,
    onItemDragStart,
    onItemDragEnd,
    disabled = false,
    isTourAnchor = false,
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
    /** 블록의 ⓘ. 열쇠를 모르는 장소에는 주지 않아 단추가 서지 않는다. */
    onShowDetail?: (place: Place) => void;
    onOverflow?: () => void;
    scrollRef?: React.RefObject<ScrollView | null>;
    /** 손끝 자리를 주면 가장자리에서 시간표를 굴려 주고, 시킨 거리를 돌려준다. */
    requestAutoScroll?: (pointY: number) => number;
    /** 지금 얼마나 굴러가 있는지. 실제로 움직인 만큼만 블록에 반영한다. */
    getScrollY?: () => number;
    onItemDragStart?: (placeId: string) => void;
    onItemDragEnd?: () => void;
    disabled?: boolean;
    /** 첫 진입 안내는 그날 첫 블록 하나만 짚는다. */
    isTourAnchor?: boolean;
  }) => {
    const blockTarget = useCoachmarkTarget('timelineBlock', isTourAnchor);
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

    // ── 끌고 있는 블록이 가장자리에 닿으면 시간표를 굴린다 ──
    /** 끌고 있는 손끝의 화면 좌표. 워클릿에서 건너온다. */
    const dragPointY = useRef(0);
    const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    /** 지난 번에 본 스크롤 자리. 실제로 움직인 만큼만 블록에 얹는다. */
    const seenScrollY = useRef(0);

    const stopBlockAutoScroll = useCallback(() => {
      if (autoScrollTimer.current === null) return;
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }, []);

    /**
     * 굴러간 만큼 블록도 같이 내려 준다.
     *
     * 블록의 자리는 눈금판 안에서의 거리이고, 굴리면 눈금판이 화면에서 밀린다.
     * 그대로 두면 손가락은 가만히 있는데 블록만 위로 빠져나간다. 끌기 시작한
     * 자리(startY)도 같이 밀어야 다음에 손이 움직일 때 되돌아가지 않는다.
     */
    const shiftByScroll = useCallback(
      (moved: number) => {
        if (!moved) return;
        const maxTop = MAX_BOTTOM_PX - height.value;
        const next = Math.max(MIN_TOP_PX, Math.min(top.value + moved, maxTop));
        const applied = next - top.value;
        if (!applied) return;
        top.value = next;
        startY.value += applied;
        previewTop.value =
          Math.round((next - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
            GRID_SNAP_HEIGHT +
          GRID_TOP_OFFSET;
      },
      [MAX_BOTTOM_PX, MIN_TOP_PX, height, top, startY, previewTop],
    );

    const onDragPointMove = useCallback(
      (pointY: number) => {
        dragPointY.current = pointY;
        if (!requestAutoScroll || !getScrollY) return;
        if (autoScrollTimer.current !== null) return;

        seenScrollY.current = getScrollY();
        autoScrollTimer.current = setInterval(() => {
          const now = getScrollY();
          shiftByScroll(now - seenScrollY.current);
          seenScrollY.current = now;
          if (requestAutoScroll(dragPointY.current) === 0)
            stopBlockAutoScroll();
        }, AUTO_SCROLL_TICK_MS);
      },
      [requestAutoScroll, getScrollY, shiftByScroll, stopBlockAutoScroll],
    );

    useEffect(() => stopBlockAutoScroll, [stopBlockAutoScroll]);
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
        // 집어도 크기는 그대로 둔다. 블록의 높이가 곧 머무는 시간이라,
        // 줄이거나 키우면 손에 든 것과 놓일 자리의 크기가 어긋난다.
        // 들린 것은 그림자로 알리고, 뒤에 깔린 놓일 자리가 비쳐 보이게
        // 살짝만 투명하게 둔다.
        dragOpacity.value = withSpring(0.88, PREVIEW_SPRING_CONFIG);
        indicatorOpacity.value = withTiming(1, { duration: 150 });
        indicatorScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
        if (onItemDragStart) runOnJS(onItemDragStart)(placeId);
      })
      .onUpdate(event => {
        runOnJS(onDragPointMove)(event.absoluteY);
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
        runOnJS(stopBlockAutoScroll)();
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
        runOnJS(stopBlockAutoScroll)();
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
        left: TIMELINE_BLOCK_LEFT,
        right: TIMELINE_BLOCK_RIGHT,
        opacity: exitOpacity.value * dragOpacity.value,
        transform: [
          { scale: exitScale.value * dragScale.value },
          { translateY: exitTranslateY.value },
        ],
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: isDragging.value === 1 ? 12 : 0 },
        shadowOpacity: isDragging.value === 1 ? 0.3 : 0,
        shadowRadius: isDragging.value === 1 ? 22 : 0,
        elevation: isDragging.value === 1 ? 14 : 0,
        zIndex: isDragging.value === 1 ? 100 : 1,
      };
    });

    /**
     * 놓일 자리는 블록보다 조금 크게 그린다.
     *
     * 블록이 제 크기 그대로 들리므로 딱 맞게 그리면 블록 밑에 완전히 가린다.
     * 사방으로 조금 넓혀 두면 점선 테두리가 블록 둘레로 드러나, 손에 든 것과
     * 놓일 자리가 같이 보인다.
     */
    const indicatorStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: withSpring(
          previewTop.value - PREVIEW_OUTSET,
          PREVIEW_SPRING_CONFIG,
        ),
        height: withSpring(
          previewHeight.value + PREVIEW_OUTSET * 2,
          PREVIEW_SPRING_CONFIG,
        ),
        left: TIMELINE_BLOCK_LEFT - PREVIEW_OUTSET,
        right: TIMELINE_BLOCK_RIGHT - PREVIEW_OUTSET,
        borderWidth: 2.5,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: TIMELINE_BLOCK_RADIUS + PREVIEW_OUTSET,
        backgroundColor: 'rgba(19, 68, 255, 0.14)',
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
          ref={blockTarget}
          style={animatedStyle}
          pointerEvents={isDeleting ? 'none' : 'auto'}
        >
          <GestureDetector gesture={panGestureMove}>
            <Animated.View style={styles.flex1}>
              <TimelineItem
                item={place}
                onDelete={handleDeleteWithAnim}
                onEditTime={handleEditTime}
                onShowDetail={
                  onShowDetail ? () => onShowDetail(place) : undefined
                }
                onPress={handlePress}
                style={styles.flex1}
                isTourAnchor={isTourAnchor}
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

/**
 * 시간표가 빈 채로 안내를 열었을 때 대신 짚어 주는 예시 블록.
 *
 * 진짜 블록과 같은 카드를 쓴다 - 흉내가 달라 보이면 "이렇게 놓인다"는 말이
 * 남지 않는다. 손가락은 먹지 않는다. 눈에만 있는 것이라 끌어도 아무 일도
 * 일어나지 않아야 하고, 끌리는 것처럼 보이면 그게 더 나쁘다.
 */
const DemoTimelineBlock = React.memo(function DemoTimelineBlock({
  place,
  offsetMinutes,
  visible,
}: {
  place: Place;
  offsetMinutes: number;
  visible: boolean;
}) {
  const blockTarget = useCoachmarkTarget('timelineBlock');
  const top =
    GRID_TOP_OFFSET +
    (timeToMinutes(place.startTime) - offsetMinutes) * MINUTE_HEIGHT;
  const height =
    (timeToMinutes(place.endTime) - timeToMinutes(place.startTime)) *
    MINUTE_HEIGHT;

  return (
    <View
      ref={blockTarget}
      pointerEvents="none"
      style={[
        styles.timelineDemoBlock,
        { top, height },
        visible ? null : styles.timelineDemoHidden,
      ]}
    >
      <TimelineItem item={place} isTourAnchor style={styles.flex1} />
    </View>
  );
});

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
      /** 블록의 ⓘ를 눌렀을 때. 시간표를 그리는 쪽은 열쇠만 넘긴다. */
      onShowBlockDetail?: (place: Place) => void;
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
      /**
       * 지금 얼마나 굴러가 있는지. 장소를 끌 때 가장자리에서 저절로 굴리려면
       * 바깥에서 지금 자리를 알아야 다음 자리를 시킬 수 있다.
       */
      onScrollY?: (offsetY: number) => void;
      /** 블록을 끌 때도 가장자리에서 저절로 굴린다. 시간표와 같은 자를 쓴다. */
      requestAutoScroll?: (pointY: number) => number;
      getScrollY?: () => number;
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
        onShowBlockDetail,
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
        onScrollY,
        requestAutoScroll,
        getScrollY,
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

      const timelineTarget = useCoachmarkTarget('timeline');

      const tour = useCoachmarkTour();
      const isTourRunning = !!tour?.isRunning;
      const activeTarget = tour?.activeTarget ?? null;

      /**
       * 시간표가 빈 채로 안내를 열면 짚을 블록이 없다. 눈에만 있는 예시 블록을
       * 하나 놓아 시간 조절과 수정·삭제를 그 위에서 보여 준다.
       *
       * 안내가 열려 있는 동안 내내 달려 있다 - 순서를 정할 때 잴 수 있어야
       * 그 두 단계가 목록에 남는다. 다만 제 차례가 오기 전에는 보이지 않는다.
       * 담지도 않은 장소가 이미 놓인 것처럼 보이면 안내가 거짓말이 된다.
       */
      const hasPlaces = !!selectedDay?.places?.length;
      const showDemoBlock = isTourRunning && !hasPlaces;
      const isDemoBlockVisible =
        activeTarget === 'timelineBlock' || activeTarget === 'blockActions';

      /**
       * 예시 블록을 놓을 시각. 안내를 열 때 지금 보고 있는 자리에서 정한다.
       *
       * 하루 시작에 못 박아 두면 시간표를 내려 둔 채로 안내를 열었을 때 화면
       * 밖에 놓인다. 그러면 잴 수 없어 시간 조절·수정 단계가 목록에서 통째로
       * 빠졌다 - 실제로 '5 / 10'이 되어 그 둘을 건너뛰었다.
       *
       * 안내 중에는 시간표를 굴릴 수 없으니 열 때 한 번만 정하면 된다.
       */
      const demoStartRef = useRef<number | null>(null);
      if (!showDemoBlock) {
        demoStartRef.current = null;
      } else if (demoStartRef.current === null) {
        const scrolled =
          offsetMinutes + ((getScrollY?.() ?? 0) - GRID_TOP_OFFSET) / MINUTE_HEIGHT;
        // 눈금에 맞춰 올림한다 - 내림하면 날씨 카드 뒤로 반쯤 숨는다.
        const snapped = Math.ceil(scrolled / 15) * 15;
        demoStartRef.current = Math.max(
          minStartMinutes,
          Math.min(snapped, maxEndMinutes - 60),
        );
      }
      const demoStartMinutes = demoStartRef.current;

      const demoPlace = React.useMemo<Place>(
        () => ({
          id: 'coachmark-demo',
          name: '예시 장소',
          type: '관광지',
          categoryId: 0,
          startTime: minutesToTime(demoStartMinutes ?? minStartMinutes),
          endTime: minutesToTime((demoStartMinutes ?? minStartMinutes) + 60),
          address: '',
          imageUrl: '',
          latitude: 0,
          longitude: 0,
        }),
        [demoStartMinutes, minStartMinutes],
      );

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
          {/* 안내가 '여기에 놓으라'고 밝힐 자리. 날씨 카드가 떠 있는 만큼은
              빼고 잡는다 - 장소를 놓을 수 있는 곳이 아니라 밝혀 봐야 헷갈린다. */}
          <View
            ref={timelineTarget}
            pointerEvents="none"
            style={[styles.timelineDropArea, { top: topPadding }]}
          />
          <ScrollView
            ref={ref}
            scrollEnabled={!isItemDragging && !isDragging}
            onScroll={e => onScrollY?.(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
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
                {showDemoBlock && (
                  <DemoTimelineBlock
                    place={demoPlace}
                    offsetMinutes={offsetMinutes}
                    visible={isDemoBlockVisible}
                  />
                )}
                {selectedDay?.places.map((place, placeIndex) => (
                  <DraggableTimelineItem
                    key={place.id}
                    place={place}
                    isTourAnchor={placeIndex === 0}
                    offsetMinutes={offsetMinutes}
                    maxEndMinutes={maxEndMinutes}
                    minStartMinutes={minStartMinutes}
                    onDelete={onDeletePlace}
                    onEditTime={onEditPlaceTime}
                    onDragEnd={onUpdatePlaceTimes}
                    onPress={onPressPlace}
                    onShowDetail={onShowBlockDetail}
                    onOverflow={showOverflowBanner}
                    scrollRef={ref as React.RefObject<ScrollView | null>}
                    requestAutoScroll={requestAutoScroll}
                    getScrollY={getScrollY}
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
  /** 블록의 ⓘ. 시간표는 화면 깊숙이 있어 맥락으로 내려보낸다. */
  onShowPlaceDetail?: (target: PlaceDetailTarget) => void;
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
  onTimelineScrollY: (offsetY: number) => void;
  requestAutoScroll: (pointY: number) => number;
  getTimelineScrollY: () => number;
  sheetInset: number;
  onItemDragStart?: () => void;
  onItemDragEnd?: () => void;
} | null>(null);

/** 붙는 자리 — 접힘 / 1·3 / 2·3 / 최대 확장 */
const SHEET_SNAPS = [0, 1 / 3, 2 / 3, 1];
/** 화면에 처음 들어왔을 때 열어 둘 높이. 스냅 자리와 같아야 첫 드래그가 안 튄다. */
const SHEET_INITIAL_RATIO = SHEET_SNAPS[1];

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
    onShowPlaceDetail,
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
    onTimelineScrollY,
    requestAutoScroll,
    getTimelineScrollY,
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
        onShowBlockDetail={
          onShowPlaceDetail
            ? place =>
                place.placeRefId
                  ? onShowPlaceDetail({
                      contentId: String(place.placeRefId),
                      name: place.name,
                      address: place.address,
                    })
                  : undefined
            : undefined
        }
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
        onScrollY={onTimelineScrollY}
        requestAutoScroll={requestAutoScroll}
        getScrollY={getTimelineScrollY}
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
  /** 장소가 어떤 곳인지 보여 주는 시트를 연다. 화면이 들고 있다. */
  onShowPlaceDetail?: (target: PlaceDetailTarget) => void;
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
  onOpenChatbot: () => void;
  isChatbotOpen?: boolean;
  onCloseChatbot?: () => void;
  onChatbotApplied?: () => void;
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
  onShowPlaceDetail,
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
  onOpenChatbot,
  isChatbotOpen = false,
  onCloseChatbot,
  onChatbotApplied,
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

  // 첫 진입 안내가 짚을 자리들. 대상 쪽에서 이름표를 달아 두면 안내가 찾아간다.
  const planInfoTarget = useCoachmarkTarget('planInfo');
  const checklistTarget = useCoachmarkTarget('checklist');
  const participantsTarget = useCoachmarkTarget('participants');
  const mapTarget = useCoachmarkTarget('map');
  const inviteTarget = useCoachmarkTarget('invite');
  const completeTarget = useCoachmarkTarget('complete');
  const dayTabsTarget = useCoachmarkTarget('dayTabs');
  const dayPeriodTarget = useCoachmarkTarget('dayPeriod');
  const placeSheetTarget = useCoachmarkTarget('placeSheet');
  const undoTarget = useCoachmarkTarget('undo');

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
  // 손끝에 들린 카드가 따라갈 자리. 손이 움직일 때마다 다시 그리면 목록이
  // 통째로 다시 그려지므로 상태 대신 공유값으로 둔다.
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragLift = useSharedValue(0);
  const [isTimelineItemDragging, setIsTimelineItemDragging] = useState(false);
  const handleTimelineItemDragStart = useCallback(() => {
    setIsTimelineItemDragging(true);
    // 가장자리 판정은 시간표가 화면 어디까지인지를 알아야 한다. 블록을 집을
    // 때도 재 둔다 - 장소를 집을 때만 재면 블록만 끌었을 때는 빈 값이다.
    measureGridRef.current?.();
  }, []);
  const handleTimelineItemDragEnd = useCallback(
    () => setIsTimelineItemDragging(false),
    [],
  );
  const gridViewRef = useRef<View>(null);
  /** 시간표 아래 여백에 쓰는, 손을 뗀 뒤의 시트 높이. */
  const [sheetRest, setSheetRest] = useState(0);

  // ── 가장자리에서 저절로 굴리기 ──
  /** 지금 얼마나 굴러가 있는지. 시간표가 알려 주는 값을 그대로 받아 둔다. */
  const timelineScrollY = useRef(0);
  /** 굴리는 동안 손끝이 머무는 자리. */
  const dragPointY = useRef(0);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * 가장자리 판정은 재어 둔 화면 크기를 읽어야 해서 아래쪽에서 만들어진다.
   * 위에서 먼저 쓰는 쪽은 ref를 건너 읽는다.
   */
  const autoScrollStepRef = useRef<((pointY: number) => number) | null>(null);
  /** 화면 크기를 다시 재는 손. 위에서 먼저 쓰는 쪽은 ref를 건너 읽는다. */
  const measureGridRef = useRef<(() => void) | null>(null);

  const handleTimelineScrollY = useCallback((offsetY: number) => {
    const moved = offsetY - timelineScrollY.current;
    timelineScrollY.current = offsetY;
    // 굴린 만큼 눈금판이 화면에서 밀린다. 끌고 있을 때만 따라 고치면 되고,
    // 그 밖에는 집는 순간 다시 재므로 건드리지 않는다.
    if (draggingRef.current && moved) gridTopRef.current -= moved;
  }, []);

  /**
   * 손끝 자리를 받아 시간표를 그만큼 굴리라고 시키고, 시킨 거리를 돌려준다.
   * 0이면 더 굴릴 곳이 없거나 가장자리 밖이라는 뜻이다.
   *
   * 시간표 안에서 블록을 끄는 쪽도 같은 자로 굴려야 하므로 여기 하나만 둔다.
   */
  const requestAutoScroll = useCallback(
    (pointY: number) => {
      const step = autoScrollStepRef.current?.(pointY) ?? 0;
      if (!step) return 0;
      const next = Math.max(0, timelineScrollY.current + step);
      if (next === timelineScrollY.current) return 0;
      timelineScrollRef.current?.scrollTo({ y: next, animated: false });
      return step;
    },
    [timelineScrollRef],
  );

  const getTimelineScrollY = useCallback(() => timelineScrollY.current, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current === null) return;
    clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = null;
  }, []);

  const editorStateContextValue = useMemo(() => {
    return {
      timelineScrollRef,
      selectedDay,
      handleDeletePlace,
      handleEditTime,
      handleUpdatePlaceTimes,
      onOpenDetail,
      onShowPlaceDetail,
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
      onTimelineScrollY: handleTimelineScrollY,
      requestAutoScroll,
      getTimelineScrollY,
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
    onShowPlaceDetail,
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
    handleTimelineScrollY,
    requestAutoScroll,
    getTimelineScrollY,
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
  /**
   * 열 수 있는 최대 높이. 워클릿(floatingAnimStyle)이 읽어야 해서 공유값으로도
   * 두지만, JS에서 값을 매기고 곧바로 되읽는 계산은 전부 ref만 본다 — 공유값을
   * 되읽으면 아직 반영되지 않은 옛 값(0)이 나와 처음 높이가 0으로 잘렸다.
   */
  const sheetMaxRef = useRef(0);
  const sheetMax = useSharedValue(0);
  const sheetStartRef = useRef(0);
  /** 손잡이를 한 번이라도 잡았는가. 잡은 뒤에는 처음 높이로 되돌리지 않는다. */
  const sheetTouched = useRef(false);
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

  /**
   * 창을 열면 장소 시트를 맨 밑으로 접는다.
   *
   * 창이 시트 자리까지 내려오므로 펼쳐 둔 목록은 어차피 가린다. 접어 두면
   * 창이 그만큼 더 내려갈 수 있고, 닫을 때는 보고 있던 높이로 되돌린다.
   */
  const sheetBeforeChat = useRef<number | null>(null);
  useEffect(() => {
    if (isChatbotOpen) {
      if (sheetBeforeChat.current === null) {
        sheetBeforeChat.current = sheetHeightRef.current;
      }
      setSheetHeight(0);
      return;
    }
    if (sheetBeforeChat.current === null) return;
    setSheetHeight(sheetBeforeChat.current);
    sheetBeforeChat.current = null;
  }, [isChatbotOpen, setSheetHeight]);

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
  const sheetTopGap = hasWeather ? normalize(72) : normalize(8);

  const onBodyLayout = useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      bodyHeight.current = height;
      const nextMax = Math.max(0, height - SHEET_HANDLE_HEIGHT - sheetTopGap);
      sheetMaxRef.current = nextMax;
      sheetMax.value = nextMax;
      // 화면이 뜨는 동안 몸통은 여러 번 재어진다. 그중 처음 잰 값이 실제보다
      // 작으면 그 1/3에 굳어 시트가 접힌 채로 열린 것처럼 보였다.
      // 손잡이를 잡기 전까지는 마지막으로 잰 크기에 맞춰 다시 연다.
      if (!sheetTouched.current && nextMax > 0) {
        setSheetHeight(Math.round(nextMax * SHEET_INITIAL_RATIO));
      }
      measureGrid();
    },
    [setSheetHeight, measureGrid, sheetTopGap, sheetMax],
  );

  useEffect(() => {
    if (bodyHeight.current > 0) {
      const newMax = Math.max(
        0,
        bodyHeight.current - SHEET_HANDLE_HEIGHT - sheetTopGap,
      );
      sheetMaxRef.current = newMax;
      sheetMax.value = newMax;
      if (sheetHeightRef.current > newMax) {
        setSheetHeight(newMax, true);
      }
    }
  }, [sheetTopGap, setSheetHeight, sheetMax]);

  const createSheetGesture = useCallback(
    () =>
      Gesture.Exclusive(
        Gesture.Pan()
          .runOnJS(true)
          // 창이 떠 있는 동안에는 시트도 잠근다. 시트는 창보다 위에 있어,
          // 올리면 잠가 둔 겹을 넘어 창을 덮는다.
          .enabled(!isTimelineItemDragging && !draggingPlace && !isChatbotOpen)
          .hitSlop({ top: 16, bottom: 16, left: 30, right: 30 })
          .onBegin(() => {
            sheetTouched.current = true;
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
            sheetTouched.current = true;
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
    [
      setSheetHeight,
      snapPoints,
      isTimelineItemDragging,
      draggingPlace,
      isChatbotOpen,
    ],
  );

  const sheetGesture = useMemo(createSheetGesture, [createSheetGesture]);
  const sheetHintGesture = useMemo(createSheetGesture, [createSheetGesture]);

  const sheetAnimStyle = useAnimatedStyle(() => ({
    height: SHEET_HANDLE_HEIGHT + sheetBody.value,
    transform: [{ translateY: sheetShift.value }],
  }));

  /**
   * 떠 있는 단추가 손가락을 받지 않아야 하는 두 경우.
   *
   * 하나는 시트를 70% 넘게 올렸을 때 - 단추가 시트에 묻히므로 눌리면 시트
   * 위의 것을 누른 셈이 된다.
   *
   * 다른 하나는 장소를 집어 끌고 있을 때다. 이 단추들은 시간표 오른쪽 아래에
   * 떠 있어 블록의 연필·X와 자리가 겹친다. 끌던 카드를 그 위에 놓으면 놓을
   * 자리를 고른 것이 아니라 사용법이나 도우미가 열려 버린다.
   */
  const floatingPointerEvents =
    draggingPlace ||
    sheetRest >
      (bodyHeight.current - SHEET_HANDLE_HEIGHT - sheetTopGap || 400) * 0.7
      ? ('none' as const)
      : ('box-none' as const);

  const floatingAnimStyle = useAnimatedStyle(() => {
    const max = sheetMax.value || 400;
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
    (
      place: Omit<Place, 'startTime' | 'endTime'>,
      absoluteY: number,
      absoluteX: number,
    ) => {
      draggingRef.current = place;
      setDraggingPlace(place);
      // 카드는 집힌 자리에서 그대로 떠오른다 - 튀어 들어오면 어디서 온 것인지
      // 알 수 없다.
      dragX.value = absoluteX;
      dragY.value = absoluteY;
      dragLift.value = withTiming(1, { duration: 140 });
      handleAddPlace(place);
      measureGrid();
      // 높이를 줄이면 목록이 짜부라지며 집고 있던 손가락이 끊긴다.
      // 자리는 그대로 두고 아래로 밀어 내려 손잡이 줄만 남긴다.
      sheetShift.value = withTiming(sheetHeightRef.current, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    },
    [handleAddPlace, sheetShift, measureGrid, dragX, dragY, dragLift],
  );

  /**
   * 손끝이 시간표 위아래 가장자리에 들어오면 그쪽으로 조금씩 굴린다.
   *
   * 화면에 보이는 만큼만 놓을 자리로 쓸 수 있으면 붙잡은 카드를 멀리 있는
   * 시간대로 옮길 길이 없다. 가장자리에 가까울수록 빠르게 굴려, 손을 댄 채로
   * 시간표를 따라 내려가거나 올라갈 수 있게 한다.
   *
   * 끌고 있는 동안 시간표의 손가락 스크롤은 꺼 두지만, 여기서 시키는 것은
   * 코드가 직접 옮기는 것이라 그대로 움직인다.
   */
  const autoScrollStep = useCallback((pointY: number) => {
    const top = timelineTop.current;
    const bottom = bodyTop.current + bodyHeight.current - SHEET_HANDLE_HEIGHT;
    if (!top || !bodyHeight.current) return 0;

    // 가장자리 안으로 들어온 깊이만큼 빨라진다. 경계에 걸치면 거의 멈춘 듯이,
    // 끝까지 밀면 가장 빠르게.
    const paced = (depth: number) =>
      Math.max(
        AUTO_SCROLL_MIN_STEP,
        Math.ceil(Math.min(1, depth) * AUTO_SCROLL_MAX_STEP),
      );

    if (pointY < top + AUTO_SCROLL_EDGE) {
      return -paced((top + AUTO_SCROLL_EDGE - pointY) / AUTO_SCROLL_EDGE);
    }
    if (pointY > bottom - AUTO_SCROLL_EDGE) {
      return paced((pointY - (bottom - AUTO_SCROLL_EDGE)) / AUTO_SCROLL_EDGE);
    }
    return 0;
  }, []);

  autoScrollStepRef.current = autoScrollStep;
  measureGridRef.current = measureGrid;

  const handleDragPlace = useCallback(
    (absoluteY: number, absoluteX: number) => {
      dragX.value = absoluteX;
      dragY.value = absoluteY;
      dragPointY.current = absoluteY;
      previewAt(absoluteY);

      const needsScroll = autoScrollStep(absoluteY) !== 0;
      if (!needsScroll) {
        stopAutoScroll();
        return;
      }
      if (autoScrollTimer.current !== null) return;

      autoScrollTimer.current = setInterval(() => {
        if (autoScrollStep(dragPointY.current) === 0) {
          stopAutoScroll();
          return;
        }
        requestAutoScroll(dragPointY.current);
        previewAt(dragPointY.current);
      }, AUTO_SCROLL_TICK_MS);
    },
    [
      previewAt,
      dragX,
      dragY,
      autoScrollStep,
      stopAutoScroll,
      requestAutoScroll,
    ],
  );

  const restoreSheet = useCallback(() => {
    stopAutoScroll();
    draggingRef.current = null;
    // 카드는 오므라들며 사라진 뒤에 치운다. 곧바로 지우면 놓은 자리에서
    // 툭 없어져 무엇이 어디로 갔는지 남지 않는다.
    dragLift.value = withTiming(0, { duration: 180 }, done => {
      if (done) runOnJS(setDraggingPlace)(null);
    });
    setDropBlocked(false);
    sheetShift.value = withTiming(0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [sheetShift, dragLift, stopAutoScroll]);

  const handleDropPlace = useCallback(
    (absoluteY: number, absoluteX: number) => {
      dragX.value = absoluteX;
      dragY.value = absoluteY;
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
    [previewAt, onPlaceAt, onCancelPlacement, restoreSheet, dragX, dragY],
  );

  useEffect(() => stopAutoScroll, [stopAutoScroll]);

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
    (place: Omit<Place, 'startTime' | 'endTime'>, y: number, x: number) =>
      dragCallbacks.current.pickUp(place, y, x),
    [],
  );
  const onDragStable = useCallback(
    (y: number, x: number) => dragCallbacks.current.drag(y, x),
    [],
  );
  const onDropStable = useCallback(
    (y: number, x: number) => dragCallbacks.current.drop(y, x),
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

          <ToolbarIconButton
            onPress={onOpenPlanInfo}
            label="일정 정보"
            variant="info"
            targetRef={planInfoTarget}
          >
            <InfoIcon color={COLORS.text} size={18} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={onOpenChecklist}
            label="체크리스트"
            variant="outlineDark"
            targetRef={checklistTarget}
          >
            <ListChecks color={COLORS.text} size={17} strokeWidth={2} />
          </ToolbarIconButton>
        </View>

        <View style={styles.toolbarRightGroup}>
          <ToolbarIconButton
            onPress={onOpenParticipants}
            label="현재 접속자"
            badgeCount={participantsCount}
            variant="outlineBlue"
            targetRef={participantsTarget}
          >
            <UsersIcon color={COLORS.primary} size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={onOpenMap}
            label="여행 동선"
            variant="outlineDark"
            targetRef={mapTarget}
          >
            <MapOutlineIcon color={COLORS.text} size={17} strokeWidth={2} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={onOpenShare}
            label="공유 및 초대"
            variant="filledGray"
            targetRef={inviteTarget}
          >
            <UserPlusIcon color={COLORS.text} size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={onComplete}
            label="완료"
            variant="filledBlue"
            active
            targetRef={completeTarget}
          >
            <CheckIcon color={COLORS.white} size={18} />
          </ToolbarIconButton>
        </View>
      </View>

      <View style={styles.dayTabsWrapper}>
        <ScrollView
          ref={dayTabsTarget}
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
          ref={dayPeriodTarget}
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

          {/* 창이 떠 있는 동안에는 치운다. 뒤가 잠겨 있어 눌러도 되는 것이
            없고, 창이 그 자리까지 내려와 서로 겹친다. */}
          {!isChatbotOpen && (
            <Animated.View
              pointerEvents={floatingPointerEvents}
              style={[styles.floatingHistoryContainer, floatingAnimStyle]}
            >
              <TouchableOpacity
                ref={undoTarget}
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
          )}

          {/* 도움을 청하는 두 단추는 오른쪽에 위아래로 세운다 - 되돌리기는
            방금 한 일을 무르는 손이고, 이 둘은 새로 여는 자리라 갈라 둔다.
            둘 다 시트 높이를 따라 움직여서 시트를 올려도 가려지지 않는다.

            창이 떠 있는 동안에는 이 묶음도 치운다. 창이 이 자리까지 내려와
            겹치고, 닫기는 창 머릿줄의 X가 맡는다. */}
          {!isChatbotOpen && (
            <Animated.View
              pointerEvents={floatingPointerEvents}
              style={[styles.floatingAssistContainer, floatingAnimStyle]}
            >
              <TutorialLauncher />
              {/* 웹과 같은 토글이다 - 열려 있으면 같은 자리에서 X로 바뀐다. */}
              <TouchableOpacity
                testID="btn-chatbot"
                style={styles.floatingChatButton}
                onPress={onOpenChatbot}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="AI 여행 도우미"
                hitSlop={6}
              >
                <MessageCircle color={COLORS.white} size={18} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* 창은 제자리에 선다. 단추 묶음처럼 추천 장소 시트를 따라 올리면
            날짜 탭 밑으로 파고들고, 시트를 끝까지 올렸을 때 같이 투명해져서
            보이지도 않는 채로 탭을 가로챈다. 시트가 올라오면 그 위로 뜨게
            두는 편이 창답고 예측도 된다.

            뒤는 잠근다. 창에 무엇을 시켜 놓고 뒤에서 같은 것을 고치면 어느
            쪽이 맞는지 알 수 없다. 닫기는 창 머릿줄의 X가 맡는다.

            닫아도 창은 그대로 붙여 두고 그리지만 않는다. 떼어 내면 주고받던
            이야기가 같이 사라져, 다시 열 때마다 처음부터 다시 물어야 한다.
            닫혀 있는 동안 이 겹은 비어 있어 손가락이 그대로 지나간다. */}
          <View pointerEvents="box-none" style={styles.chatbotAnchor}>
            {isChatbotOpen && (
              <View
                style={styles.chatbotScrim}
                onStartShouldSetResponder={claimTouch}
              />
            )}
            <ChatbotWindow
          onShowPlace={
            onShowPlaceDetail
              ? place =>
                  place.contentId
                    ? onShowPlaceDetail({
                        contentId: String(place.contentId),
                        name: place.title,
                        address: place.addr1,
                      })
                    : undefined
              : undefined
          }
              visible={isChatbotOpen}
              planId={planId ?? null}
              onClose={onCloseChatbot ?? onOpenChatbot}
              onApplied={onChatbotApplied}
            />
          </View>

          <Animated.View
            ref={placeSheetTarget}
            style={[styles.placeSheet, sheetAnimStyle]}
          >
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
              <GestureDetector gesture={sheetHintGesture}>
                <View>
                  <Text style={styles.sheetHint}>
                    <Text style={styles.sheetHintStrong}>꾹 눌러</Text> 시간표에
                    놓기
                  </Text>
                </View>
              </GestureDetector>
              <PlaceRecommendationList
                onAddPlace={handleAddPlace}
                onShowDetail={onShowPlaceDetail}
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

      {/* 집은 장소가 손끝에 들려 시간표까지 따라간다. 화면 맨 위에 얹어야
          시트와 시간표 어느 쪽 위로도 지나갈 수 있다. */}
      <PlaceDragGhost
        place={draggingPlace}
        x={dragX}
        y={dragY}
        lift={dragLift}
      />

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
