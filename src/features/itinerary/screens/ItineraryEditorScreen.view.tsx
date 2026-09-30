import React, {
  useCallback,
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
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Place } from '../components/TimelineItem';
import { AirplaneLoading } from '../../../components/common';
import ScheduleEditModal from '../components/ScheduleEditModal';
import BackTopBar from '../../../components/common/BackTopBar';
import PlaceRecommendationList, {
  type PlaceTab,
} from '../components/PlaceRecommendationList';
import PlaceDragGhost from '../components/PlaceDragGhost';
import { findDropSlot } from '../utils/dropSlot';
import { Day } from '../contexts/ItineraryContext';
import { PLAN_NAME_MAX_LENGTH, SimpleWeatherInfo } from '../../../api/trips';
import ChatbotWindow from '../components/chatbot/ChatbotWindow';
import { useScreenInsets } from '../../../hooks/useScreenInsets';
import {
  styles,
  COLORS,
  MINUTE_HEIGHT,
  GRID_TOP_OFFSET,
  SHEET_HANDLE_HEIGHT,
} from './ItineraryEditorScreen.styles';
import {
  timeToMinutes,
  minutesToTime,
  formatDateLocal,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from '../../../utils/timeUtils';
import MessageCircle from 'lucide-react-native/dist/esm/icons/message-circle';
import MapOutlineIcon from 'lucide-react-native/dist/esm/icons/map';
import ListChecks from 'lucide-react-native/dist/esm/icons/list-checks';
import CalendarDaysIcon from 'lucide-react-native/dist/esm/icons/calendar-days';
import CheckIcon from 'lucide-react-native/dist/esm/icons/check';
import InfoIcon from 'lucide-react-native/dist/esm/icons/info';
import Undo2 from 'lucide-react-native/dist/esm/icons/undo-2';
import Redo2 from 'lucide-react-native/dist/esm/icons/redo-2';
import UserPlusIcon from 'lucide-react-native/dist/esm/icons/user-plus';
import UsersIcon from 'lucide-react-native/dist/esm/icons/users';
import { useCoachmarkTarget } from '../coachmark/CoachmarkContext';
import TutorialLauncher from '../coachmark/TutorialLauncher';
import type { PlaceDetailTarget } from '../components/PlaceDetailSheet';
import {
  AUTO_SCROLL_EDGE,
  AUTO_SCROLL_MAX_STEP,
  AUTO_SCROLL_MIN_STEP,
  AUTO_SCROLL_TICK_MS,
} from '../components/editor/editorConstants';
import ToolbarIconButton from '../components/editor/ToolbarIconButton';
import { EditorStateContext } from '../components/editor/EditorStateContext';
import {
  SHEET_SNAPS,
  SHEET_INITIAL_RATIO,
  nearestSnap,
} from '../components/editor/sheetSnap';
import SheetCategoryRow from '../components/editor/SheetCategoryRow';
import TimelineTabScreen from '../components/editor/TimelineTabScreen';

/**
 * 덮어 둔 겹이 손가락을 먹게 한다. 그냥 얹어 두기만 하면 리액트 네이티브는
 * 만지겠다고 나서지 않은 View를 그대로 통과시킨다.
 */
const claimTouch = () => true;

const FLOATING_BUTTON_SIZE = normalize(44);
const FLOATING_BUTTON_GAP = normalize(10);
const FLOATING_BUTTON_BOTTOM_OFFSET = 14;

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
  const redoTarget = useCoachmarkTarget('redo');

  const [inputWidth, setInputWidth] = useState(120);
  const [dayScrollContentWidth, setDayScrollContentWidth] = useState(0);
  const [dayScrollLayoutWidth, setDayScrollLayoutWidth] = useState(0);
  const [dayScrollX, setDayScrollX] = useState(0);
  const dayTabsScrollRef = useRef<ScrollView>(null);
  const dayTabLayoutsRef = useRef<
    Record<number, { x: number; width: number }>
  >({});
  const isDayScrollable = dayScrollContentWidth > dayScrollLayoutWidth;
  const showLeftFade = isDayScrollable && dayScrollX > 5;
  const showRightFade =
    isDayScrollable &&
    dayScrollX < dayScrollContentWidth - dayScrollLayoutWidth - 5;

  const handleDaySelect = useCallback(
    (index: number) => {
      setSelectedDayIndex(index);

      const layout = dayTabLayoutsRef.current[index];
      if (!layout || dayScrollLayoutWidth <= 0) return;

      const edgePadding = normalize(8);
      const visibleStart = dayScrollX;
      const visibleEnd = visibleStart + dayScrollLayoutWidth;
      let nextX = dayScrollX;

      if (layout.x < visibleStart + edgePadding) {
        nextX = layout.x - edgePadding;
      } else if (layout.x + layout.width > visibleEnd - edgePadding) {
        nextX = layout.x + layout.width - dayScrollLayoutWidth + edgePadding;
      }

      const maxScrollX = Math.max(
        0,
        dayScrollContentWidth - dayScrollLayoutWidth,
      );
      nextX = Math.max(0, Math.min(nextX, maxScrollX));

      if (Math.abs(nextX - dayScrollX) > 1) {
        dayTabsScrollRef.current?.scrollTo({ x: nextX, animated: true });
      }
    },
    [
      dayScrollContentWidth,
      dayScrollLayoutWidth,
      dayScrollX,
      setSelectedDayIndex,
    ],
  );

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

  const floatingHistoryAnimStyle = useAnimatedStyle(() => {
    const hideAt = Math.max(
      0,
      sheetMax.value - FLOATING_BUTTON_BOTTOM_OFFSET - FLOATING_BUTTON_SIZE,
    );

    return {
      opacity: sheetBody.value >= hideAt ? 0 : 1,
      transform: [{ translateY: -sheetBody.value + sheetShift.value }],
    };
  });

  const floatingAssistAnimStyle = useAnimatedStyle(() => {
    const hideAt = Math.max(
      0,
      sheetMax.value -
        FLOATING_BUTTON_BOTTOM_OFFSET -
        (FLOATING_BUTTON_SIZE * 2 + FLOATING_BUTTON_GAP),
    );

    return {
      opacity: sheetBody.value >= hideAt ? 0 : 1,
      transform: [{ translateY: -sheetBody.value + sheetShift.value }],
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
  });
  dragCallbacks.current = {
    pickUp: handlePickUpPlace,
    drag: handleDragPlace,
    drop: handleDropPlace,
    cancel: handleCancelPickUp,
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

  if (!selectedDay) {
    return <AirplaneLoading />;
  }

  return (
    <View style={[styles.container, screenInsets]}>
      <BackTopBar title="일정 편집" onBack={() => onGoBack?.()} />

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
          ref={node => {
            dayTabsScrollRef.current = node;
            dayTabsTarget(node);
          }}
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
                onPress={() => handleDaySelect(index)}
                onLayout={event => {
                  const { x, width } = event.nativeEvent.layout;
                  dayTabLayoutsRef.current[index] = { x, width };
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`${day.dayNumber}일차 ${formatDate(
                  day.date,
                )}`}
                accessibilityState={{ selected: isSelected }}
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
              style={[
                styles.floatingHistoryContainer,
                floatingHistoryAnimStyle,
              ]}
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
              {!!onRedo && (
                <TouchableOpacity
                  ref={redoTarget}
                  testID="btn-redo"
                  style={styles.floatingHistoryButton}
                  onPress={onRedo}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="다시 실행"
                  hitSlop={6}
                >
                  <Redo2 color={COLORS.text} size={18} />
                </TouchableOpacity>
              )}
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
              style={[styles.floatingAssistContainer, floatingAssistAnimStyle]}
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
                onPickUpPlace={onPickUpStable}
                onDragPlace={onDragStable}
                onDropPlace={onDropStable}
                onCancelPickUp={onCancelStable}
              />
            </View>
          </Animated.View>
        </View>
      </EditorStateContext.Provider>

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

