import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Modal, AppState } from 'react-native';
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
import { invalidatePlanCaches } from '../../../hooks/planCache';
import {
  timeToMinutes,
  dateToTime,
  formatDateLocal,
  normalizeTime,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from '../../../utils/timeUtils';
import { toLocalTime } from '../../../utils/planSyncPayload';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';
import {
  buildScheduleEditSync,
  mergeScheduleEditDays,
} from '../../../utils/scheduleEditSync';
import { SimpleWeatherInfo, fetchWeather } from '../../../api/trips';
import ItineraryEditorScreenView from './ItineraryEditorScreen.view';
import { ShareModal, PlanInfoModal, AirplaneLoading } from '../../../components/common';
import PlaceEditModal from '../components/PlaceEditModal';
import ParticipantsModal from '../components/ParticipantsModal';
import PlanMapModal from '../components/PlanMapModal';
import ChecklistSheet from '../components/checklist/ChecklistSheet';
import EditAccessGate from '../components/EditAccessGate';
import { normalizeCategoryId } from '../../../utils/placeCategory';
import { CoachmarkProvider, EditorCoachmark } from '../coachmark';
import type { CoachmarkTargetId } from '../coachmark';

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const { showAlert } = useAlert();
  const currentUser = useAuthStore(state => state.user);
  const {
    isOwner: isPlanOwner,
    canEdit,
    isResolved: isMembershipResolved,
  } = usePlanOwnership(route.params.planId);
  const queryClient = useQueryClient();
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
    isInitialPlanLoading,
  } = useItineraryEditor(route, navigation);

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
  }, []);

  /**
   * 끌어놓기로 자리를 정해 바로 담는다.
   *
   * handleAddPlace 자리에는 pendingPlace만 세우는 override가 들어가 있어서,
   * 끌어놓기가 그 함수를 부르면 아무것도 담기지 않는다. 시간이 이미 정해진
   * 경우를 위한 길을 따로 낸다.
   */
  const handlePlacePlaceAt = useCallback(
    (
      place: Omit<Place, 'startTime' | 'endTime'>,
      startTime: string,
      endTime: string,
    ) => {
      handleAddPlace({ ...place, startTime, endTime } as any);
      setPendingPlace(null);
      setPreviewStartTime(null);
      setPreviewEndTime(null);
    },
    [handleAddPlace],
  );

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
  const [isBacking, setIsBacking] = useState(false);
  const isBackingRef = useRef(false);
  const isCompletingRef = useRef(false);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 새로 만드는 일정(planId 없음)은 판정 대상이 아니다. 소유/편집 목록 갱신이 끝난
  // 뒤에만 권한 없음으로 단정한다 — 갱신 중에는 직전 목록이 남아 오판이 난다.
  const isAccessDenied =
    !!route.params.planId && isMembershipResolved && !canEdit;

  const handleRefreshMembership = useCallback(() => {
    if (queryClient) {
      void invalidatePlanCaches(queryClient);
    }
  }, [queryClient]);

  const {
    updatePlaceDetails,
    setDays,
    reorderPlacesInDay,
    setLastAddedPlaceId,
  } = useItinerary();
  const {
    connect,
    disconnect,
    onlineUsers,
    sendMessage,
    isConnected,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useWebSocket();
  const { fetchAllRecommendations, resetPlaces } = usePlaces();
  const planId = route.params.planId;
  const destination = route.params.destination;
  const [isScheduleEditVisible, setScheduleEditVisible] = useState(false);
  const scheduleEditBaseRef = useRef(days);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isChecklistVisible, setChecklistVisible] = useState(false);
  const [isChatbotVisible, setChatbotVisible] = useState(false);
  const [isPlaceEditModalVisible, setPlaceEditModalVisible] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);
  const [isParticipantsVisible, setParticipantsVisible] = useState(false);
  const [isMapPreviewVisible, setMapPreviewVisible] = useState(false);

  // 완료로 화면을 벗어났다가 되돌아오면 저장 확인을 다시 살린다.
  // 복구하지 않으면 남은 변경분이 다음 이탈 때 조용히 사라진다.
  useEffect(
    () => navigation.addListener('focus', () => {
      isCompletingRef.current = false;
    }),
    [navigation],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isCompletingRef.current) {
        return;
      }

      if (isBackingRef.current) {
        return;
      }

      // 편집이 막힌 화면에는 저장할 변경사항이 없다.
      if (isAccessDenied) {
        return;
      }

      if (isSaving) {
        e.preventDefault();
        return;
      }

      if (days.length === 0) {
        return;
      }

      e.preventDefault();

      // 장소를 넣고 옮기고 지우는 것도, 일정 이름도 실시간 동기화로 그때그때
      // 저장된다. 이미 저장된 일정을 두고 "저장 안 됨"이라 겁줄 이유가 없다.
      // 아직 서버에 없는 일정(planId 없음)만 완료를 눌러야 저장된다.
      const isSavedPlan = !!route.params.planId;

      showAlert({
        title: isSavedPlan ? '편집 마치기' : '저장되지 않은 일정',
        message: isSavedPlan
          ? '바꾼 내용은 그때그때 저장되고 있어요. 편집을 마칠까요?'
          : '아직 저장하지 않은 일정이에요. 나가면 지금까지 짠 일정이 사라져요.',
        type: isSavedPlan ? 'confirm' : 'warning',
        buttons: [
          {
            text: '계속 편집',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: '나가기',
            style: isSavedPlan ? 'default' : 'destructive',
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
  }, [
    days.length,
    disconnect,
    isAccessDenied,
    isSaving,
    navigation,
    route.params.planId,
    showAlert,
  ]);

  const [weatherMap, setWeatherMap] = useState<
    Record<string, SimpleWeatherInfo>
  >({});

  const weatherRangeStart = days.length > 0 ? formatDateLocal(days[0].date) : '';
  const weatherRangeEnd =
    days.length > 0 ? formatDateLocal(days[days.length - 1].date) : '';

  const buildPlanSyncPayload = useCallback(
    (targetPlanId: string, planName: string) => ({
      planId: targetPlanId,
      planName,
      adultCount: planMetadata?.adultCount ?? route.params.adults ?? 1,
      childCount: planMetadata?.childCount ?? route.params.children ?? 0,
    }),
    [planMetadata, route.params.adults, route.params.children],
  );

  const syncedTripNameRef = useRef<string | null>(null);
  useEffect(() => {
    if (planMetadata?.planName) {
      syncedTripNameRef.current = planMetadata.planName;
    }
  }, [planMetadata?.planName]);

  const weatherDestinationId =
    (route.params as any)?.destinationId ||
    route.params.travelId ||
    planMetadata?.destinationId ||
    null;

  useEffect(() => {
    if (!weatherDestinationId || !weatherRangeStart || !weatherRangeEnd) {
      setWeatherMap({});
      return;
    }

    const startDate = weatherRangeStart;
    const endDate = weatherRangeEnd;

    const controller = new AbortController();

    fetchWeather(
      Number(weatherDestinationId),
      startDate,
      endDate,
      controller.signal,
    )
      .then(res => {
        if (controller.signal.aborted) return;
        const map: Record<string, SimpleWeatherInfo> = {};
        if (res && Array.isArray(res.weather)) {
          res.weather.forEach(w => {
            map[w.date] = w;
          });
        }
        setWeatherMap(map);
      })
      .catch(error => {
        if (controller.signal.aborted) return;

        console.warn('날씨 조회 실패:', error);
        setWeatherMap({});
      });

    return () => {
      controller.abort();
    };
  }, [weatherDestinationId, weatherRangeStart, weatherRangeEnd]);

  const hasInitialFetchedRef = useRef(false);
  const isConnectedRef = useRef(isConnected);
  isConnectedRef.current = isConnected;

  const fetchPlanDetailsRef = useRef(fetchPlanDetails);
  fetchPlanDetailsRef.current = fetchPlanDetails;

  useEffect(() => {
    if (!planId) return;
    // 비멤버는 서버가 룸 입장을 거부한다 — 재연결만 반복하므로 아예 붙지 않는다.
    if (isAccessDenied) return;

    const resyncIfDisconnected = () => {
      if (isConnectedRef.current) return;
      void fetchPlanDetailsRef.current();
    };

    connect(planId);

    const unsubscribeFocus = navigation.addListener('focus', () => {
      connect(planId);
      if (hasInitialFetchedRef.current) {
        resyncIfDisconnected();
      } else {
        hasInitialFetchedRef.current = true;
      }
    });

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {

        if (!navigation.isFocused()) return;
        connect(planId);
        resyncIfDisconnected();
      } else if (nextAppState === 'background') {

        disconnect();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribeFocus();
      appStateSubscription.remove();
      disconnect();
    };

  }, [planId, connect, disconnect, isAccessDenied, navigation]);

  useEffect(() => {
    if (isConnected) {
      void fetchPlanDetailsRef.current();
    }
  }, [isConnected]);

  const isEditingTripNameRef = useRef(isEditingTripName);
  isEditingTripNameRef.current = isEditingTripName;

  useEffect(() => {
    const handlePlanMessage = (msg: any) => {
      if (!msg) return;

      const entity = msg.entity || msg.target;
      const action = msg.action || msg.type;
      if (entity !== 'plan' || action === 'delete') return;

      const raw =
        msg.planDtos ||
        msg.plans ||
        (msg.data ? msg.data.planDtos || msg.data.plans : null);
      const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

      const remoteName = list.find((dto: any) => dto?.planName)?.planName;
      if (!remoteName || isEditingTripNameRef.current) return;

      syncedTripNameRef.current = remoteName;
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
    planMetadata?.destinationId ||
    null;

  useEffect(() => {
    if (!recommendationDestId) return;
    if (fetchedDestIdRef.current === recommendationDestId) return;

    fetchedDestIdRef.current = recommendationDestId;
    fetchAllRecommendations(recommendationDestId);
  }, [recommendationDestId, fetchAllRecommendations]);

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

      const values = {
        startTime: normalizeTime(updatedPlace.startTime),
        endTime: normalizeTime(updatedPlace.endTime),
        memo: updatedPlace.memo,
        name: updatedPlace.name,
        address: updatedPlace.address,
      };
      const changes = Object.fromEntries(Object.entries(values).filter(([key, value]) => {
        const original = key === 'startTime' || key === 'endTime'
          ? normalizeTime(editingPlace?.[key]) : editingPlace?.[key];
        return value !== original;
      }));
      if (Object.keys(changes).length > 0) {
        updatePlaceDetails(selectedDayIndex, updatedPlace.id, changes);
      }

      setPlaceEditModalVisible(false);
      setEditingPlace(null);
    },
    [updatePlaceDetails, selectedDayIndex, editingPlace],
  );

  const handleSaveTripName = useCallback(async () => {
    setIsEditingTripName(false);
    if (!tripName || !planId) return;
    if (tripName === syncedTripNameRef.current) return;

    const lastSyncedName = syncedTripNameRef.current;
    sendMessage('update', 'plan', buildPlanSyncPayload(planId, tripName));
    syncedTripNameRef.current = tripName;

    if (isPlanOwner && !isConnected) {
      try {
        await axios.patch(
          resolveApiUrl(`/api/plan/${planId}/name`),
          { planName: tripName },
        );
      } catch (err) {
        // 저장에 실패했는데 동기화 표시를 남겨두면 완료 시에도 건너뛰어
        // 이름이 영영 저장되지 않는다. 되돌려 다시 시도되게 한다.
        syncedTripNameRef.current = lastSyncedName;
        console.error('Failed to update plan title on edit:', err);
        showAlert({
          title: '일정 이름 저장 실패',
          message: getDisplayErrorMessage(
            err,
            '일정 이름을 저장하지 못했어요. 완료할 때 다시 시도할게요.',
          ),
          type: 'error',
        });
      }
    }
  }, [
    buildPlanSyncPayload,
    isConnected,
    isPlanOwner,
    planId,
    sendMessage,
    setIsEditingTripName,
    showAlert,
    tripName,
  ]);

  const handleOpenParticipants = useCallback(() => {
    setParticipantsVisible(true);
  }, []);

  const handleApplyOptimizedOrder = useCallback(
    (orderedPlaceIds: string[]) => {
      reorderPlacesInDay(selectedDayIndex, orderedPlaceIds);
      Toast.show({
        type: 'success',
        text1: '방문 순서를 최적화했어요.',
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

  const handleUndo = useCallback(() => {
    if (!planId) return;
    sendMessage('undo', 'history', null);
  }, [planId, sendMessage]);

  const handleRedo = undefined;

  const onConfirmScheduleEdit = (updatedDays: any[]) => {
    if (updatedDays.length === 0) return;
    const originalDays = scheduleEditBaseRef.current;

    if (!planId) {
      console.warn('[Schedule] planId 없음 — timetable 동기화를 건너뜁니다.');
    } else {
      const { creates, updates, deletes } = buildScheduleEditSync(
        originalDays,
        updatedDays,
        planId,
      );

      if (creates.length > 0) sendMessage('create', 'timetable', creates);
      if (updates.length > 0) sendMessage('update', 'timetable', updates);
      if (deletes.length > 0) sendMessage('delete', 'timetable', deletes);
    }

    setDays(prevDays => mergeScheduleEditDays(prevDays, updatedDays, originalDays));

    setScheduleEditVisible(false);

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

    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    isCompletingRef.current = true;
    const nameChanged = tripName && tripName !== syncedTripNameRef.current;

    if (
      route.params.planId &&
      nameChanged
    ) {
      sendMessage(
        'update',
        'plan',
        buildPlanSyncPayload(route.params.planId, tripName),
      );
      syncedTripNameRef.current = tripName;
    }

    if (route.params.planId) {

      disconnect();

      try {

        if (isPlanOwner && nameChanged && !isConnected) {
          await axios.patch(
            resolveApiUrl(`/api/plan/${route.params.planId}/name`),
            { planName: tripName },
          );
        }
      } catch (err: any) {
        if (err.response?.status !== 403) {
          console.error('Failed to update plan title on complete:', err);
          // 일정 자체는 실시간 동기화로 저장되므로 완료는 막지 않되,
          // 이름만 반영되지 않은 것을 알린다.
          showAlert({
            title: '일정 이름 저장 실패',
            message: getDisplayErrorMessage(
              err,
              '일정은 저장했지만 이름은 반영하지 못했어요.',
            ),
            type: 'error',
          });
        }
      }

      if (queryClient) {
        void invalidatePlanCaches(queryClient);
      }

      navigation.navigate('ItineraryView', {
        days,
        tripName,
        planId: route.params.planId,
        departure: route.params.departure,
        destination: route.params.destination,
        travelId: route.params.travelId,
        adults: route.params.adults,
        children: route.params.children,
        startDate: route.params.startDate,
        endDate: route.params.endDate,
      });
      isSavingRef.current = false;
      setIsSaving(false);
      return;
    }

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
          adultCount: route.params.adults || 1,
          childCount: route.params.children || 0,
        },
        timetables: timetableVOs,
        timetablePlaceBlocks: allBlocks,
      });

      const newPlanId = result?.planId;

      if (!newPlanId) {
        console.error('Plan creation response did not include planId:', result);
        isCompletingRef.current = false;
        showAlert({
          title: '일정을 확인할 수 없어요',
          message: '일정 생성 응답에 식별자가 없어요. 내 일정에서 생성됐는지 확인해 주세요.',
        });
        return;
      }

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
        adults: route.params.adults,
        children: route.params.children,
        startDate: route.params.startDate,
        endDate: route.params.endDate,
      });
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      showAlert({ title: '오류', message: '일정을 저장하지 못했어요.' });
      isCompletingRef.current = false;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  /**
   * 첫 진입 안내를 시작해도 되는 상태인지. 무엇이 덮여 있으면 그 아래를 짚어
   * 봐야 보이지 않고, 이름을 고치는 중이면 손을 가로막는다. 볼 권한이 없는
   * 사람에게는 편집 버튼을 설명할 이유가 없다.
   */
  /**
   * 안내에 넘겨 주는 시간표 한 줄씩. 장소 담기와 시간 조절 단계는 이것이
   * 달라졌는지를 보고 '직접 해봤다'를 판정한다.
   *
   * 보고 있는 날만 추리지 않고 전부 넘긴다 - 안내 중에도 일차를 옮길 수 있어서
   * 다른 날에 담은 것이 안 담은 것으로 보이면 안내가 그 자리에 갇힌다.
   */
  const coachmarkPlaces = useMemo(
    () =>
      days.flatMap(day =>
        day.places.map(place => ({
          id: place.id,
          startTime: place.startTime,
          endTime: place.endTime,
        })),
      ),
    [days],
  );

  /**
   * 안내가 짚으려는 것이 화면 밖으로 밀려났을 때 다시 끌어온다.
   *
   * 장소를 담으면 시간표가 담은 자리로 굴러가서, 안내가 짚는 그날 첫 블록이
   * 위로 밀려난다. 그 자리를 다시 보이게 해야 시간 조절·수정 단계가 살아 있다.
   * 장소를 담았을 때 그 자리로 굴러가는 길이 이미 있으니 그것을 그대로 쓴다.
   */
  const revealCoachmarkTarget = useCallback(
    (target: CoachmarkTargetId) => {
      if (target !== 'timelineBlock' && target !== 'blockActions') return false;
      const anchor = days[selectedDayIndex]?.places?.[0];
      if (!anchor) return false;
      setLastAddedPlaceId(anchor.id);
      return true;
    },
    [days, selectedDayIndex, setLastAddedPlaceId],
  );

  const isCoachmarkReady =
    canEdit &&
    !isAccessDenied &&
    !isInitialPlanLoading &&
    !isSaving &&
    !isBacking &&
    days.length > 0 &&
    !isEditingTripName &&
    !isPlanInfoVisible &&
    !isParticipantsVisible &&
    !isMapPreviewVisible &&
    !isShareModalVisible &&
    !isChecklistVisible &&
    !isPlaceEditModalVisible &&
    !isScheduleEditVisible &&
    !isTimePickerVisible;

  return (
    <CoachmarkProvider>
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
        onPlaceAt={handlePlacePlaceAt}
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
        setScheduleEditVisible={(visible: boolean) => {
          if (visible) scheduleEditBaseRef.current = days;
          setScheduleEditVisible(visible);
        }}
        onConfirmScheduleEdit={onConfirmScheduleEdit}
        onConfirmTimePicker={onConfirmTimePicker}
        destination={destination || ''}
        onComplete={onComplete}
        onOpenParticipants={handleOpenParticipants}
        onOpenMap={handleOpenMap}
        onOpenShare={() => setShareModalVisible(true)}
        onOpenChecklist={() => setChecklistVisible(true)}
        onOpenChatbot={() => setChatbotVisible(current => !current)}
        isChatbotOpen={isChatbotVisible}
        onCloseChatbot={() => setChatbotVisible(false)}
        // 반영은 서버에서 일정을 통째로 바꾼다. 지금 화면 것과 어긋나므로
        // 편집 중인 방의 최신 일정을 다시 받아 온다.
        onChatbotApplied={() => void fetchPlanDetailsRef.current()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        participantsCount={onlineUsers.length}
        planId={planId ?? null}
        travelId={recommendationDestId}
        onOpenDetail={handleOpenDetail}
        weatherMap={weatherMap}
        onOpenPlanInfo={() => setPlanInfoVisible(true)}
        onGoBack={handleGoBack}
      />
      <ParticipantsModal
        visible={isParticipantsVisible}
        onClose={() => setParticipantsVisible(false)}
        users={onlineUsers}
        currentUserId={currentUser?.userId}
        isPlanOwner={isPlanOwner}
      />

      <PlanMapModal
        dayLabel={selectedDay ? `${selectedDay.dayNumber}일차` : undefined}
        visible={isMapPreviewVisible}
        onClose={handleCloseMap}
        onApplyOptimizedOrder={handleApplyOptimizedOrder}
        places={
          selectedDay?.places.map(place => ({
            id: place.id,
            name: place.name,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            placeRefId: place.placeRefId,
            place_url: place.place_url,
          })) || []
        }
      />

      <ShareModal
        visible={isShareModalVisible}
        onClose={() => setShareModalVisible(false)}
        planId={planId as string}
        isOwner={isPlanOwner}
      />

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
          dayStartTime={selectedDay?.startTime || DEFAULT_DAY_START}
          dayEndTime={selectedDay?.endTime || DEFAULT_DAY_END}
          onClose={() => {
            setPlaceEditModalVisible(false);
            setEditingPlace(null);
          }}
          onSave={handlePlaceSave}
          onDelete={handleDeletePlace}
        />
      )}
      <PlanInfoModal
        onEditName={canEdit ? () => {
          setPlanInfoVisible(false);
          setIsEditingTripName(true);
        } : undefined}
        onEditPeriod={canEdit ? () => {
          setPlanInfoVisible(false);
          scheduleEditBaseRef.current = days;
          setScheduleEditVisible(true);
        } : undefined}
        visible={isPlanInfoVisible}
        onClose={() => setPlanInfoVisible(false)}
        planName={tripName}
        destination={planMetadata?.destinationName || route.params.destination || '미정'}
        startDate={days.length > 0 ? formatDateLocal(days[0].date) : route.params.startDate}
        endDate={days.length > 0 ? formatDateLocal(days[days.length - 1].date) : route.params.endDate}
        adultCount={planMetadata?.adultCount ?? route.params.adults ?? 1}
        childCount={planMetadata?.childCount ?? route.params.children ?? 0}
      />
      {/* 로딩이 끝나지 않으면 화면 전체를 덮는다 — 뒤로가기로 빠져나갈 수 있어야 한다 */}
      <Modal
        visible={
          !isAccessDenied &&
          (isInitialPlanLoading || days.length === 0 || isSaving || isBacking)
        }
        transparent={false}
        animationType="fade"
        onRequestClose={handleGoBack}
      >
        <AirplaneLoading />
      </Modal>
      <EditAccessGate
        visible={isAccessDenied}
        planId={planId ?? null}
        onGoBack={handleGoBack}
        onStaleMembership={handleRefreshMembership}
      />
      <EditorCoachmark
        enabled={isCoachmarkReady}
        places={coachmarkPlaces}
        onRevealTarget={revealCoachmarkTarget}
      />
    </CoachmarkProvider>
  );
}
