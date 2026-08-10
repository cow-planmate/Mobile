import React, { useState, useEffect, useCallback, useRef } from 'react';
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  TouchableOpacity,

  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  AppState,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAlert } from '../../../contexts/AlertContext';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../components/TimelineItem';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useItinerary } from '../../../contexts/ItineraryContext';
import { usePlaces } from '../../../contexts/PlacesContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { useItineraryEditor } from '../../../hooks/useItineraryEditor';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateFullPlan } from '../../../hooks/usePlanQueries';
import { usePlanOwnership } from '../../../hooks/usePlanOwnership';
import {
  timeToMinutes,
  dateToTime,
  formatDateLocal,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from '../../../utils/timeUtils';
import { toLocalTime } from '../../../utils/planSyncPayload';
import {
  buildScheduleEditSync,
  mergeScheduleEditDays,
} from '../../../utils/scheduleEditSync';
import { SimpleWeatherInfo, fetchWeather } from '../../../api/trips';
import ItineraryEditorScreenView from './ItineraryEditorScreen.view';
import { ShareModal, PlanInfoModal, AirplaneLoading } from '../../../components/common';
import PlaceEditModal from '../components/PlaceEditModal';
import RouteMapSection from '../components/RouteMapSection';
import ChecklistSheet from '../components/checklist/ChecklistSheet';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMap, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons';

/**
 * Normalize raw categoryId to 0-4 range used by backend.
 */
const normalizeCategoryId = (
  rawId: number | undefined,
  type?: string,
): number => {
  const id = rawId ?? 4;
  if ([0, 1, 2, 3, 4].includes(id)) return id;
  if ([12, 14, 15, 28].includes(id)) return 0;
  if (id === 32) return 1;
  if (id === 39) return 2;
  switch (type) {
    case '관광지':
      return 0;
    case '숙소':
      return 1;
    case '식당':
      return 2;
    default:
      return 4;
  }
};

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

/**
 * 일정표 타임라인 편집, 장소 배치/수정, 실시간 소켓 동기화 화면 컨테이너 컴포넌트
 *
 * @param props route 라우트 파라미터 및 navigation 프로퍼티
 */
export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const { showAlert } = useAlert();
  const currentUser = useAuthStore(state => state.user);
  const { isOwner: isPlanOwner } = usePlanOwnership(route.params.planId);
  let queryClient: any = null;
  try {
    // useQueryClient는 Provider가 없으면 예외를 던진다. 내부적으로 useContext를
    // 먼저 호출하므로 훅 호출 순서는 어느 경로에서도 동일하다.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    queryClient = useQueryClient();
  } catch (e) {
    // Graceful fallback for test environments without QueryClientProvider
  }
  const createFullPlanMutation = useCreateFullPlan();
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
    planMetadata,
    fetchPlanDetails,
  } = useItineraryEditor(route, navigation);

  const [activeTab, setActiveTab] = useState<'타임라인' | '장소추가'>('타임라인');
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const [pendingPlace, setPendingPlace] = useState<any>(null);
  const [previewStartTime, setPreviewStartTime] = useState<string | null>(null);
  const [previewEndTime, setPreviewEndTime] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.pendingPlace) {
      setPendingPlace(route.params.pendingPlace);
      setPreviewStartTime(null);
      setPreviewEndTime(null);
      navigation.setParams({ pendingPlace: undefined } as any);
    }
  }, [route.params?.pendingPlace, navigation]);

  const handleAddPlaceOverride = useCallback((place: Omit<Place, 'startTime' | 'endTime'>) => {
    setPendingPlace(place);
    setPreviewStartTime(null);
    setPreviewEndTime(null);
    setActiveTab('타임라인');
  }, []);

  const handleConfirmPlacement = useCallback(() => {
    if (pendingPlace && previewStartTime && previewEndTime) {
      handleAddPlace({
        ...pendingPlace,
        startTime: previewStartTime,
        endTime: previewEndTime,
      } as any);
      setPendingPlace(null);
      setPreviewStartTime(null);
      setPreviewEndTime(null);
    }
  }, [pendingPlace, previewStartTime, previewEndTime, handleAddPlace]);

  const handleCancelPlacement = useCallback(() => {
    setPendingPlace(null);
    setPreviewStartTime(null);
    setPreviewEndTime(null);
  }, []);

  const handleCancelPreview = useCallback(() => {
    setPreviewStartTime(null);
    setPreviewEndTime(null);
  }, []);

  const [isPlanInfoVisible, setPlanInfoVisible] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBacking, setIsBacking] = useState(false);
  const isBackingRef = useRef(false);
  const isCompletingRef = useRef(false);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const { updatePlaceDetails, setDays, reorderPlacesInDay } = useItinerary();
  const {
    connect,
    disconnect,
    onlineUsers,
    sendMessage,
    isConnected,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useWebSocket();
  const {
    fetchAllRecommendations,
    fetchAllRecommendationsNoAuth,
    resetPlaces,
  } = usePlaces();
  const planId = route.params.planId;
  const destination = route.params.destination;
  const [isScheduleEditVisible, setScheduleEditVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isChecklistVisible, setChecklistVisible] = useState(false);
  const [isPlaceEditModalVisible, setPlaceEditModalVisible] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);
  const [isParticipantsVisible, setParticipantsVisible] = useState(false);
  const [isMapPreviewVisible, setMapPreviewVisible] = useState(false);


  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isCompletingRef.current) {
        return;
      }

      if (isBackingRef.current) {
        return;
      }

      if (isSaving) {
        e.preventDefault();
        return;
      }

      // 일정을 아직/끝내 불러오지 못한 상태. 지킬 변경사항이 없으므로 그대로
      // 내보낸다. 예전에는 여기서도 preventDefault를 걸어, 조회가 실패해 days가
      // 비면 전체화면 로딩 뒤에 갇혀 화면을 빠져나올 수 없었다.
      if (days.length === 0) {
        return;
      }

      e.preventDefault();

      showAlert({
        title: '변경사항 저장 안 됨',
        message: '작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?',
        type: 'warning',
        buttons: [
          {
            text: '계속 작성',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => {
              isBackingRef.current = true;
              setIsBacking(true);
              disconnect();

              setTimeout(() => {
                setIsBacking(false);
                navigation.dispatch(e.data.action);
                isBackingRef.current = false;
              }, 100);
            },
          },
        ],
      });
    });

    return () => {
      unsubscribe();
    };
  }, [days.length, disconnect, isSaving, navigation, showAlert]);




  // ── Undo ──
  // 되돌리기는 서버 히스토리(history:undo:{planId}:{sessionId})를 사용한다.
  // 로컬 스냅샷 방식은 원격 수신분까지 함께 되감아 다른 참여자의 편집을 되돌린다.

  // ── Weather state ──
  const [weatherMap, setWeatherMap] = useState<
    Record<string, SimpleWeatherInfo>
  >({});

  // 날씨 조회 범위. 날짜 문자열로 좁혀 두면 장소를 편집할 때마다 재조회하지 않고,
  // 일정 기간이 실제로 바뀔 때만(일수가 그대로여도) 다시 조회한다.
  const weatherRangeStart = days.length > 0 ? formatDateLocal(days[0].date) : '';
  const weatherRangeEnd =
    days.length > 0 ? formatDateLocal(days[days.length - 1].date) : '';

  /**
   * 실시간 편집(WS)으로 보낼 plan 변경 페이로드를 만든다.
   *
   * SharedSync가 캐시를 병합할 때 값이 null인 필드만 건너뛰는데, PlanDto의
   * adultCount·childCount는 원시 타입이라 페이로드에서 빠지면 null이 아니라 0으로
   * 역직렬화된다. 그래서 이름만 담아 보내면 인원수가 0으로 덮어써지고, 그 캐시가
   * 그대로 DB까지 내려간다. 바꾸지 않는 값이라도 반드시 실제 값을 함께 실어야 한다.
   *
   * isShared는 싣지 않는다. Plan 엔티티에 @IgnoreShared가 붙어 생성된 PlanDto에
   * 필드 자체가 없고, DTO는 ignoreUnknown이라 보내도 폐기된다. 예전에는 이 값을
   * 채우려고 전송 직전 공유 상태를 조회했는데, 왕복이 늘고 조회가 실패하면 이름
   * 실시간 반영까지 통째로 건너뛰는 부작용만 있었다.
   */
  const buildPlanSyncPayload = useCallback(
    (targetPlanId: string, planName: string) => ({
      planId: targetPlanId,
      planName,
      adultCount: planMetadata?.adultCount ?? route.params.adults ?? 1,
      childCount: planMetadata?.childCount ?? route.params.children ?? 0,
    }),
    [planMetadata, route.params.adults, route.params.children],
  );

  /**
   * 서버와 마지막으로 맞춘 일정 이름.
   *
   * 완료 시 이름이 그대로면 plan 전송을 통째로 건너뛰기 위해 둔다.
   */
  const syncedTripNameRef = useRef<string | null>(null);
  useEffect(() => {
    if (planMetadata?.planName) {
      syncedTripNameRef.current = planMetadata.planName;
    }
  }, [planMetadata?.planName]);

  /** 날씨 조회 기준 여행지. 서버는 도시명이 아니라 destinationId를 받는다. */
  const weatherDestinationId =
    (route.params as any)?.destinationId ||
    route.params.travelId ||
    (planMetadata as any)?.destinationId ||
    planMetadata?.travelId ||
    null;

  useEffect(() => {
    if (!weatherDestinationId || !weatherRangeStart || !weatherRangeEnd) {
      setWeatherMap({});
      return;
    }

    const startDate = weatherRangeStart;
    const endDate = weatherRangeEnd;

    // 기간이 연달아 바뀌면 먼저 보낸 응답이 나중에 도착해 최신 결과를 덮어쓸 수 있다.
    let cancelled = false;

    fetchWeather(Number(weatherDestinationId), startDate, endDate)
      .then(res => {
        if (cancelled) return;
        const map: Record<string, SimpleWeatherInfo> = {};
        if (res && Array.isArray(res.weather)) {
          res.weather.forEach(w => {
            map[w.date] = w;
          });
        }
        setWeatherMap(map);
      })
      .catch(error => {
        if (cancelled) return;
        // 예전에는 실패 시 고정값(18°/26°/맑음)을 채워 넣어, 조회가 계속 실패해도
        // 정상처럼 보였다. 이제는 비워 두어 날씨 영역 자체가 표시되지 않게 한다.
        console.warn('날씨 조회 실패:', error);
        setWeatherMap({});
      });

    return () => {
      cancelled = true;
    };
  }, [weatherDestinationId, weatherRangeStart, weatherRangeEnd]);

  const hasInitialFetchedRef = useRef(false);
  const isConnectedRef = useRef(isConnected);
  isConnectedRef.current = isConnected;
  // 백그라운드 전환으로 우리가 의도적으로 끊은 경우를 표시한다. 이 경우는
  // active 핸들러가 이미 재조회를 처리하므로 아래 자동 복구 effect가
  // 중복 실행되지 않도록 구분해야 한다.
  const intentionalDisconnectRef = useRef(false);
  // fetchPlanDetails는 route.params(startDate/endDate)가 바뀌면 identity가 바뀐다.
  // 아래 연결 관리 effect의 의존성에 두면 타임라인 시간대를 수정하는 것만으로
  // cleanup의 disconnect()가 실행되는데, 화면은 이미 포커스 상태라 focus 이벤트가
  // 다시 오지 않아 재연결되지 않는다. ref로 우회해 최신 함수만 참조한다.
  const fetchPlanDetailsRef = useRef(fetchPlanDetails);
  fetchPlanDetailsRef.current = fetchPlanDetails;

  useEffect(() => {
    if (!planId) return;

    /**
     * GET /api/plan/{id}/complete는 PlanSnapshotReader가 Redis 캐시를 우선 읽지만,
     * 세션이 완전히 종료돼 캐시가 비워진 뒤에는 DB로 폴백하며 DB 반영에는
     * 지연이 있다(주기 동기화/disconnect 동기화). 연결이 살아있는 상태에서
     * 재조회하면 방금 한 편집을 낡은 데이터로 덮어쓸 수 있으므로,
     * 세션이 끊겼다 다시 붙는 경우에만 재조회한다.
     */
    const resyncIfDisconnected = () => {
      if (isConnectedRef.current) return;
      void fetchPlanDetailsRef.current();
    };

    // effect가 다시 돌면 cleanup에서 연결이 끊긴다. 이미 포커스된 화면에는
    // focus 이벤트가 오지 않으므로 여기서 직접 붙인다. connect는 같은 방이면
    // no-op이라 focus 핸들러와 중복 호출돼도 안전하다.
    connect(planId);

    const unsubscribeFocus = navigation.addListener('focus', () => {
      connect(planId);
      if (hasInitialFetchedRef.current) {
        resyncIfDisconnected();
      } else {
        hasInitialFetchedRef.current = true;
      }
    });

    /*
     * blur는 듣지 않는다.
     *
     * 이 화면이 가려지는 경로는 완료 후 ItineraryView 이동과 뒤로가기뿐이고,
     * 둘 다 이동 전에 스스로 연결을 끊는다. 장소 추가와 지도는 화면 이동이
     * 아니라 각각 중첩 탭(ItineraryEditorScreen.view.tsx)과 Modal이라 blur
     * 자체가 발생하지 않는다.
     *
     * 화면 이동을 새로 추가한다면 그 자리에서 연결을 끊어야 한다. 빠뜨리면
     * 사용자가 자리를 떠도 다른 참여자의 접속자 목록에 남는다.
     */

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // 가려진 채로 복귀한 경우엔 되붙이지 않는다. 다시 앞으로 나올 때
        // focus 핸들러가 연결을 맡는다.
        if (!navigation.isFocused()) return;
        connect(planId);
        resyncIfDisconnected();
      } else if (nextAppState === 'background') {
        // 'inactive'는 알림 센터를 내리거나 앱 전환기를 띄우는 등 실제 이탈이
        // 아닌 전이에서도 발생한다. 그때마다 끊으면 복귀할 때 세션이 새로 생기고,
        // 직전 세션은 종료가 서버에 닿지 못해 유령으로 남기 쉽다.
        intentionalDisconnectRef.current = true;
        disconnect();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribeFocus();
      appStateSubscription.remove();
      disconnect();
    };
    // fetchPlanDetails는 의존성에서 제외한다(위 ref 주석 참고).
  }, [planId, connect, disconnect, navigation]);

  const wasConnectedRef = useRef(false);
  const awaitingAutoResyncRef = useRef(false);

  useEffect(() => {
    if (isConnected) {
      if (awaitingAutoResyncRef.current) {
        // 화면 전환 없이 소켓만 끊겼다 서버가 자동 재연결한 경우.
        // 끊긴 동안 보낸 메시지가 서버 예외로 유실됐을 수 있어 재조회로 맞춘다.
        awaitingAutoResyncRef.current = false;
        void fetchPlanDetailsRef.current();
      }
      wasConnectedRef.current = true;
    } else {
      if (wasConnectedRef.current && !intentionalDisconnectRef.current) {
        awaitingAutoResyncRef.current = true;
      }
      intentionalDisconnectRef.current = false;
      wasConnectedRef.current = false;
    }
    // isConnected 전이에만 반응해야 한다. fetchPlanDetails를 의존성에 두면
    // 같은 isConnected 값으로 effect가 다시 돌면서 intentionalDisconnectRef를
    // 지워 버려 의도적 종료가 자동 재연결 대기로 오인된다.
  }, [isConnected]);

  // 이름 입력 중에는 원격 값을 반영하지 않는다. 내가 타이핑하던 이름이
  // 남의 편집이나 내 전송의 에코로 되돌아가면 입력이 통째로 날아간다.
  const isEditingTripNameRef = useRef(isEditingTripName);
  isEditingTripNameRef.current = isEditingTripName;

  /**
   * 다른 참여자의 일정 이름 변경을 받아 반영합니다.
   *
   * 블록·타임테이블은 ItineraryContext가 처리하지만 일정 이름은 이 화면이 들고 있어
   * 여기서 따로 구독한다. 리스너는 Set으로 관리되므로 중복 구독이 아니다.
   */
  useEffect(() => {
    const handlePlanMessage = (msg: any) => {
      if (!msg) return;

      const entity = msg.entity || msg.target;
      const action = msg.action || msg.type;
      if (entity !== 'plan' || action === 'delete') return;

      // undo/redo 브로드캐스트는 payload 키가 '{entity}s'(=plans)다.
      const raw =
        msg.planDtos ||
        msg.plans ||
        (msg.data ? msg.data.planDtos || msg.data.plans : null);
      const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

      const remoteName = list.find((dto: any) => dto?.planName)?.planName;
      if (!remoteName || isEditingTripNameRef.current) return;

      setTripName((prev: string) =>
        prev === remoteName ? prev : remoteName,
      );
    };

    subscribeToMessages(handlePlanMessage);
    return () => {
      unsubscribeFromMessages(handlePlanMessage);
    };
  }, [subscribeToMessages, unsubscribeFromMessages, setTripName]);

  const fetchedDestIdRef = useRef<number | null>(null);

  const recommendationDestId =
    (route.params as any)?.destinationId ||
    route.params.travelId ||
    (planMetadata as any)?.destinationId ||
    planMetadata?.travelId ||
    null;

  // Fetch place recommendations via PlacesContext
  useEffect(() => {
    if (!recommendationDestId) return;
    if (fetchedDestIdRef.current === recommendationDestId) return;

    fetchedDestIdRef.current = recommendationDestId;
    if (planId) {
      fetchAllRecommendations(recommendationDestId);
    } else {
      fetchAllRecommendationsNoAuth(recommendationDestId);
    }
  }, [
    recommendationDestId,
    planId,
    fetchAllRecommendations,
    fetchAllRecommendationsNoAuth,
  ]);

  // 정리는 언마운트에서만 한다. 이전에는 의존성이 하나라도 바뀌면 cleanup이 돌아
  // planMetadata가 도착하는 순간 목록을 비우고 추천 3종을 처음부터 다시 조회했다.
  useEffect(() => {
    return () => {
      resetPlaces();
      fetchedDestIdRef.current = null;
    };
  }, [resetPlaces]);

  const handleOpenDetail = useCallback((place: Place) => {
    setEditingPlace(place);
    setPlaceEditModalVisible(true);
  }, []);

  const handlePlaceSave = useCallback(
    (updatedPlace: any) => {
      // Normalize time to "HH:mm" format for local state
      const normalizeTime = (t: string) =>
        t && t.length >= 5 ? t.substring(0, 5) : t;

      // Update local state + send WebSocket via context (matches Frontend flow)
      updatePlaceDetails(selectedDayIndex, updatedPlace.id, {
        startTime: normalizeTime(updatedPlace.startTime),
        endTime: normalizeTime(updatedPlace.endTime),
        memo: updatedPlace.memo,
        name: updatedPlace.name,
        address: updatedPlace.address,
      });

      setPlaceEditModalVisible(false);
      setEditingPlace(null);
    },
    [updatePlaceDetails, selectedDayIndex],
  );

  /**
   * 제목 편집을 확정한다. TextInput의 onBlur와 onSubmitEditing, 그리고 뷰의
   * keyboardDidHide 리스너까지 겹쳐서 호출될 수 있다(키보드를 내리면 blur와
   * keyboardDidHide가 함께 발생). 이름이 바뀌지 않았으면 WS 전송과 PATCH를
   * 건너뛰어 같은 편집에 중복 요청이 나가지 않게 한다.
   */
  const handleSaveTripName = useCallback(async () => {
    setIsEditingTripName(false);
    if (!tripName || !planId) return;
    if (tripName === syncedTripNameRef.current) return;

    sendMessage('update', 'plan', buildPlanSyncPayload(planId, tripName));
    syncedTripNameRef.current = tripName;
    // 이름 변경 REST는 서버가 OWNER만 허용한다. 편집자의 변경은 위 WebSocket
    // 전송으로 이미 반영되므로, 403이 확정된 요청을 굳이 보내지 않는다.
    if (isPlanOwner) {
      try {
        await axios.patch(
          resolveApiUrl(`/api/plan/${planId}/name`),
          { planName: tripName },
        );
      } catch (err) {
        console.error('Failed to update plan title on edit:', err);
      }
    }
  }, [
    buildPlanSyncPayload,
    isPlanOwner,
    planId,
    sendMessage,
    setIsEditingTripName,
    tripName,
  ]);

  const handleOpenParticipants = useCallback(() => {
    setParticipantsVisible(true);
  }, []);

  /** 지도에서 계산한 방문 순서를 현재 선택된 날짜에 반영한다. */
  const handleApplyOptimizedOrder = useCallback(
    (orderedPlaceIds: string[]) => {
      reorderPlacesInDay(selectedDayIndex, orderedPlaceIds);
      Toast.show({
        type: 'success',
        text1: '방문 순서를 최적화했습니다.',
        position: 'top',
        visibilityTime: 2000,
      });
    },
    [reorderPlacesInDay, selectedDayIndex],
  );

  const handleOpenMap = useCallback(() => {
    setMapPreviewVisible(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    setMapPreviewVisible(false);
  }, []);

  /**
   * 서버 히스토리에 되돌리기를 요청한다. 결과는 /topic/{planId} 브로드캐스트로
   * 돌아와 다른 참여자에게도 동일하게 반영된다. 로컬 상태는 직접 건드리지 않는다.
   */
  const handleUndo = useCallback(() => {
    if (!planId) return;
    sendMessage('undo', 'history', null);
  }, [planId, sendMessage]);

  /**
   * 다시 실행은 지원하지 않아 핸들러를 전달하지 않는다(버튼이 비활성으로 렌더된다).
   * 서버 HistoryService.publishChange가 redo 시 항상 afterData를 싣는데,
   * DELETE 기록의 afterData는 null이라 삭제 redo가 대상 ID 없는 페이로드를
   * 브로드캐스트한다. 클라이언트가 어느 블록인지 알 수 없어 서버와 어긋난다.
   * 서버가 DELETE redo에 beforeData의 ID를 실어주면 해제할 수 있다.
   */
  const handleRedo = undefined;

  /**
   * 일정 변경 모달의 확정 결과를 반영한다.
   *
   * 일차는 인덱스로 대조한다. 날짜로 대조하면 날짜를 옮긴 일차가 삭제+생성으로
   * 해석돼 그날의 장소가 통째로 사라지고, 서버가 옛 타임테이블을 DB에서 지우지
   * 못해 재진입 시 옛 날짜로 되돌아간다(utils/scheduleEditSync 주석 참고).
   */
  const onConfirmScheduleEdit = (updatedDays: any[]) => {
    if (updatedDays.length === 0) return;

    if (!planId) {
      console.warn('[Schedule] planId 없음 — timetable 동기화를 건너뜁니다.');
    } else {
      const { creates, updates, deletes } = buildScheduleEditSync(
        days,
        updatedDays,
        planId,
      );

      if (creates.length > 0) sendMessage('create', 'timetable', creates);
      if (updates.length > 0) sendMessage('update', 'timetable', updates);
      if (deletes.length > 0) sendMessage('delete', 'timetable', deletes);
    }

    setDays(prevDays => mergeScheduleEditDays(prevDays, updatedDays));
    // 일수가 줄어 selectedDayIndex가 범위를 벗어나는 경우는
    // useItineraryEditor의 클램프 이펙트가 처리한다(원격 삭제와 공통 경로).
    setScheduleEditVisible(false);
    // startDate/endDate는 planId가 없을 때 초기 날짜 골격을 만드는 용도라
    // 여기서 되돌려 쓸 필요가 없다. setParams로 갱신하면 fetchPlanDetails의
    // identity만 바뀌어 불필요한 재조회와 재연결을 유발한다.
  };

  const onConfirmTimePicker = (date: Date) => {
    if (!editingTime || !selectedDay) return;
    const newTime = dateToTime(date);
    const place = selectedDay.places.find(p => p.id === editingTime.placeId);
    if (place) {
      const newStartTimeMinutes = timeToMinutes(newTime);
      if (editingTime.type === 'startTime') {
        const endTimeMinutes = timeToMinutes(place.endTime);
        const durationMinutes = endTimeMinutes - timeToMinutes(place.startTime);
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
          handleUpdatePlaceTimes(place.id, startTimeMinutes, newEndTimeMinutes);
        }
      }
    }
    setTimePickerVisible(false);
    setEditingTime(null);
  };



  const onComplete = async () => {
    // 중복 방지 가드는 WS 전송보다 먼저 걸어야 연타 시 프레임이 중복되지 않는다.
    // state는 리렌더 전까지 갱신되지 않으므로 ref로 판단한다.
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    isCompletingRef.current = true;

    // 이름이 이미 서버와 맞아 있으면 보내지 않는다.
    if (
      route.params.planId &&
      tripName &&
      tripName !== syncedTripNameRef.current
    ) {
      sendMessage(
        'update',
        'plan',
        buildPlanSyncPayload(route.params.planId, tripName),
      );
      syncedTripNameRef.current = tripName;
    }

    // If plan already exists (editing from MySchedule or pre-created from Home), update title for owner and navigate to view
    if (route.params.planId) {
      // REST 호출보다 먼저 끊는다. 뒤로 미루면 그 왕복이 끝날 때까지 다른 참여자의
      // 접속자 목록에 그대로 남는다. 위 publish와 DISCONNECT는 같은 소켓에 순서대로
      // 실리므로, 곧바로 끊어도 방금 보낸 이름 변경이 유실되지 않는다.
      disconnect();

      try {
        // 이름 변경은 서버가 OWNER만 허용한다. 소유자가 아니면 보내지 않는다.
        if (isPlanOwner && tripName) {
          await axios.patch(
            resolveApiUrl(`/api/plan/${route.params.planId}/name`),
            { planName: tripName },
          );
        }
      } catch (err: any) {
        if (err.response?.status !== 403) {
          console.error('Failed to update plan title on complete:', err);
        }
      }

      if (queryClient) {
        void queryClient.invalidateQueries({ queryKey: ['myPlans'] });
        void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }

      navigation.navigate('ItineraryView', {
        days,
        tripName,
        planId: route.params.planId,
        departure: route.params.departure,
        destination: route.params.destination,
        travelId: route.params.travelId,
        transport: route.params.transport,
        adults: route.params.adults,
        children: route.params.children,
        startDate: route.params.startDate,
        endDate: route.params.endDate,
      });
      isSavingRef.current = false;
      setIsSaving(false);
      return;
    }

    // New plan: create on server, then navigate to view with planId
    try {
      const timetableVOs = days.map(day => ({
        date: formatDateLocal(day.date),
        timeTableStartTime: toLocalTime(day.startTime) || DEFAULT_DAY_START,
        timeTableEndTime: toLocalTime(day.endTime) || DEFAULT_DAY_END,
      }));

      const allBlocks = days.flatMap(day => {
        const dateStr = formatDateLocal(day.date);
        return day.places.map(place => {
          const categoryId = normalizeCategoryId(place.categoryId, place.type);
          const startTime =
            place.startTime.length === 5
              ? place.startTime + ':00'
              : place.startTime;
          const endTime =
            place.endTime.length === 5 ? place.endTime + ':00' : place.endTime;
          return {
            blockId: null,
            timeTableId: 0,
            date: dateStr,
            placeCategoryId: categoryId,
            placeName: place.name || '',
            placeAddress: place.address || '',
            placeLink: place.place_url || '',
            placeId: place.placeRefId || '',
            photoUrl: place.imageUrl || null,
            memo: place.memo || '',
            startTime,
            endTime,
            blockStartTime: startTime,
            blockEndTime: endTime,
            xLocation: place.longitude || 0,
            yLocation: place.latitude || 0,
            placeContentTypeId: place.contentTypeId || null,
            placeThumbnailUrl: place.imageUrl || null,
            placeCopyrightDivCd: place.copyrightDivCd || null,
          };
        });
      });

      const result = await createFullPlanMutation.mutateAsync({
        planFrame: {
          destinationId: route.params.travelId || 1,
          transportationType:
            route.params.transport === '자동차' ? 'PRIVATE' : 'PUBLIC',
          adultCount: route.params.adults || 1,
          childCount: route.params.children || 0,
        },
        timetables: timetableVOs,
        timetablePlaceBlocks: allBlocks,
      });

      const newPlanId = result?.planId;

      if (!newPlanId) {
        console.error('Plan creation response did not include planId:', result);
        showAlert({
          title: '일정을 확인할 수 없습니다',
          message: '일정 생성 응답에 식별자가 없습니다. 내 일정에서 생성 여부를 확인해주세요.',
        });
        return;
      }

      // 백엔드가 생성 시 planName을 무시하고 강제로 목적지명 등으로 생성할 수 있으므로,
      // 생성이 끝난 직후 신규 planId에 대해 즉각 이름 변경 PATCH API를 추가 호출하여 동기화합니다.
      if (newPlanId && tripName) {
        try {
          await axios.patch(
            resolveApiUrl(`/api/plan/${newPlanId}/name`),
            { planName: tripName },
          );
        } catch (patchErr) {
          console.error('Failed to patch plan name after creation:', patchErr);
        }
      }

      disconnect();

      navigation.navigate('ItineraryView', {
        days,
        tripName,
        planId: newPlanId,
        departure: route.params.departure,
        destination: route.params.destination,
        travelId: route.params.travelId,
        transport: route.params.transport,
        adults: route.params.adults,
        children: route.params.children,
        startDate: route.params.startDate,
        endDate: route.params.endDate,
      });
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      showAlert({ title: '오류', message: '일정 저장에 실패했습니다.' });
      isCompletingRef.current = false;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <>
      <ItineraryEditorScreenView
        days={days}
        selectedDayIndex={selectedDayIndex}
        setSelectedDayIndex={setSelectedDayIndex}
        tripName={tripName}
        isEditingTripName={isEditingTripName}
        setIsEditingTripName={setIsEditingTripName}
        setTripName={setTripName}
        onSaveTripName={handleSaveTripName}
        isTimePickerVisible={isTimePickerVisible}
        setTimePickerVisible={setTimePickerVisible}
        editingTime={editingTime}
        timelineScrollRef={timelineScrollRef}
        formatDate={formatDate}
        handleEditTime={handleEditTime}
        handleUpdatePlaceTimes={handleUpdatePlaceTimes}
        handleDeletePlace={handleDeletePlace}
        handleAddPlace={handleAddPlaceOverride}
        pendingPlace={pendingPlace}
        previewStartTime={previewStartTime}
        previewEndTime={previewEndTime}
        setPreviewStartTime={setPreviewStartTime}
        setPreviewEndTime={setPreviewEndTime}
        onConfirmPlacement={handleConfirmPlacement}
        onCancelPlacement={handleCancelPlacement}
        onCancelPreview={handleCancelPreview}
        selectedDay={selectedDay}
        isScheduleEditVisible={isScheduleEditVisible}
        setScheduleEditVisible={setScheduleEditVisible}
        onConfirmScheduleEdit={onConfirmScheduleEdit}
        onConfirmTimePicker={onConfirmTimePicker}
        destination={destination || ''}
        onComplete={onComplete}
        onOpenParticipants={handleOpenParticipants}
        onOpenMap={handleOpenMap}
        onOpenShare={() => setShareModalVisible(true)}
        onOpenChecklist={() => setChecklistVisible(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        participantsCount={onlineUsers.length}
        planId={planId ?? null}
        travelId={route.params.travelId || planMetadata?.travelId || null}
        onOpenDetail={handleOpenDetail}
        weatherMap={weatherMap}
        onOpenPlanInfo={() => setPlanInfoVisible(true)}
        onGoBack={handleGoBack}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <Modal
        visible={isParticipantsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setParticipantsVisible(false)}
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setParticipantsVisible(false)}
        >
          <Pressable
            style={modalStyles.panel}
            onPress={e => e.stopPropagation()}
          >
            <View style={modalStyles.panelHeader}>
              <View style={modalStyles.panelHeaderTitleRow}>
                <View style={modalStyles.panelHeaderIcon}>
                  <FontAwesomeIcon icon={faUsers} color="#1344FF" size={18} />
                </View>
                <View>
                  <Text style={modalStyles.panelTitle}>참여자</Text>
                  <Text style={modalStyles.panelSubtitle}>
                    현재 일정에 참여 중인 사람
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setParticipantsVisible(false)}>
                <FontAwesomeIcon icon={faXmark} color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={modalStyles.participantList}
              contentContainerStyle={modalStyles.participantListContent}
              showsVerticalScrollIndicator={false}
            >
              {onlineUsers.length === 0 ? (
                <View style={modalStyles.emptyState}>
                  <Text style={modalStyles.emptyStateText}>
                    현재 참여 중인 사람이 없습니다.
                  </Text>
                </View>
              ) : (
                onlineUsers.map((user, idx) => {
                  const name =
                    user.userNickname ||
                    user.userInfo?.nickname ||
                    '사용자';
                  const initial = name.charAt(0) || '?';
                  const userUidLower = String(user.uid || '').toLowerCase();

                  const isMe =
                    !!currentUser &&
                    String(currentUser.userId || '').toLowerCase() === userUidLower;
                  // 소유자는 내 계정에 대해서만 판정할 수 있다. 일정 조회 응답
                  // (PlanFrameDetailDto)에도, 편집자 목록(EDITOR만 반환)에도
                  // 소유자 정보가 없어 다른 참여자의 소유 여부는 알 방법이 없다.
                  const isOwner = isMe && isPlanOwner;

                  return (
                    <View key={user.uid || `user-${idx}`} style={modalStyles.participantRow}>
                      <View style={modalStyles.participantAvatar}>
                        {user.avatarUrl ? (
                          <FastImage
                            source={{ uri: user.avatarUrl, priority: FastImage.priority.normal }}
                            style={modalStyles.participantAvatarImage}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                        ) : (
                          <Text style={modalStyles.participantAvatarText}>
                            {initial}
                          </Text>
                        )}
                      </View>
                      <View style={modalStyles.participantInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={modalStyles.participantName}>
                            {name}
                          </Text>
                          {isMe && (
                            <Text style={{ fontSize: 11, color: '#1344FF', fontWeight: '600' }}>(나)</Text>
                          )}
                          {isOwner && (
                            <Text style={{ fontSize: 11, color: '#D97706', fontWeight: '600' }}>[소유자]</Text>
                          )}
                        </View>
                        <Text style={modalStyles.participantStatus}>
                          현재 일정에 접속 중
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isMapPreviewVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={handleCloseMap}
      >
        <View style={modalStyles.mapContainer}>
          <View style={modalStyles.mapHeader}>
            <View style={modalStyles.panelHeaderTitleRow}>
              <View style={modalStyles.panelHeaderIcon}>
                <FontAwesomeIcon icon={faMap} color="#1344FF" size={18} />
              </View>
              <View>
                <Text style={modalStyles.panelTitle}>일정 지도</Text>
                <Text style={modalStyles.panelSubtitle}>
                  현재 선택한 일차의 장소를 보여줍니다
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleCloseMap}>
              <FontAwesomeIcon icon={faXmark} color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.mapBody}>
            <RouteMapSection
              onApplyOptimizedOrder={handleApplyOptimizedOrder}
              places={
                selectedDay?.places.map(place => ({
                  id: place.id,
                  name: place.name,
                  address: place.address,
                  latitude: place.latitude,
                  longitude: place.longitude,
                  place_url: place.place_url,
                })) || []
              }
            />
          </View>
        </View>
      </Modal>
      <ShareModal
        visible={isShareModalVisible}
        onClose={() => setShareModalVisible(false)}
        planId={planId as string}
        isOwner={isPlanOwner}
      />
      {/* 닫혀 있을 때는 마운트하지 않는다. 조회 훅이 그동안 헛돌 이유가 없다. */}
      {isChecklistVisible && (
        <ChecklistSheet
          visible
          onClose={() => setChecklistVisible(false)}
          planId={planId ?? null}
        />
      )}
      {editingPlace && (
        <PlaceEditModal
          visible={isPlaceEditModalVisible}
          place={editingPlace}
          onClose={() => {
            setPlaceEditModalVisible(false);
            setEditingPlace(null);
          }}
          onSave={handlePlaceSave}
          onDelete={handleDeletePlace}
        />
      )}
      <PlanInfoModal
        visible={isPlanInfoVisible}
        onClose={() => setPlanInfoVisible(false)}
        planName={tripName}
        destination={planMetadata?.destinationName || route.params.destination || '미정'}
        startDate={days.length > 0 ? formatDateLocal(days[0].date) : route.params.startDate}
        endDate={days.length > 0 ? formatDateLocal(days[days.length - 1].date) : route.params.endDate}
        adultCount={planMetadata?.adultCount ?? route.params.adults ?? 1}
        childCount={planMetadata?.childCount ?? route.params.children ?? 0}
        transport={
          planMetadata?.transportationType
            ? planMetadata.transportationType === 'PRIVATE'
              ? '자동차'
              : '대중교통'
            : route.params.transport || '대중교통'
        }
      />
      <Modal
        visible={isInitialLoading || days.length === 0 || isSaving || isBacking}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <AirplaneLoading />
      </Modal>
    </>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    maxHeight: '78%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  panelHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panelHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: '#111827',
  },
  panelSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
  },
  participantList: {
    flexGrow: 0,
  },
  participantListContent: {
    gap: 10,
    paddingBottom: 6,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1344FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  participantAvatarImage: {
    width: '100%',
    height: '100%',
  },
  participantAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: '#111827',
  },
  participantStatus: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mapBody: {
    flex: 1,
    padding: 16,
  },
});
