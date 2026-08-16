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
import { invalidatePlanCaches } from '../../../hooks/planCache';
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
import { faMap } from '@fortawesome/free-solid-svg-icons/faMap';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';

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

export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const { showAlert } = useAlert();
  const currentUser = useAuthStore(state => state.user);
  const { isOwner: isPlanOwner } = usePlanOwnership(route.params.planId);
  let queryClient: any = null;
  try {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    queryClient = useQueryClient();
  } catch (e) {

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
    isInitialPlanLoading,
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
  const [isBacking, setIsBacking] = useState(false);
  const isBackingRef = useRef(false);
  const isCompletingRef = useRef(false);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

  const intentionalDisconnectRef = useRef(false);

  const fetchPlanDetailsRef = useRef(fetchPlanDetails);
  fetchPlanDetailsRef.current = fetchPlanDetails;

  useEffect(() => {
    if (!planId) return;

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

  }, [planId, connect, disconnect, navigation]);

  const wasConnectedRef = useRef(false);
  const awaitingAutoResyncRef = useRef(false);

  useEffect(() => {
    if (isConnected) {
      if (awaitingAutoResyncRef.current) {

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

      const normalizeTime = (t: string) =>
        t && t.length >= 5 ? t.substring(0, 5) : t;

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

  const handleSaveTripName = useCallback(async () => {
    setIsEditingTripName(false);
    if (!tripName || !planId) return;
    if (tripName === syncedTripNameRef.current) return;

    sendMessage('update', 'plan', buildPlanSyncPayload(planId, tripName));
    syncedTripNameRef.current = tripName;

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

  const handleUndo = useCallback(() => {
    if (!planId) return;
    sendMessage('undo', 'history', null);
  }, [planId, sendMessage]);

  const handleRedo = undefined;

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

    if (route.params.planId) {

      disconnect();

      try {

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
        showAlert({
          title: '일정을 확인할 수 없습니다',
          message: '일정 생성 응답에 식별자가 없습니다. 내 일정에서 생성 여부를 확인해주세요.',
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
        travelId={recommendationDestId}
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
                  placeRefId: place.placeRefId,
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
      />
      <Modal
        visible={isInitialPlanLoading || days.length === 0 || isSaving || isBacking}
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
