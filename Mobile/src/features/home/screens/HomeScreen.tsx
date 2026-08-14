import React, { useState, useEffect, useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppState, AppStateStatus, Modal, BackHandler } from 'react-native';
import { AppStackParamList } from '../../../navigation/types';
import { useAuthStore } from '../../../store/useAuthStore';
import { HomeScreenView } from './HomeScreen.view';
import {
  acceptInvitation,
  rejectInvitation,
} from '../../../api/trips';
import { useAlert } from '../../../contexts/AlertContext';
import { useInvitationSse } from '../../../hooks/useInvitationSse';
import {
  IS_FCM_RUNTIME_ENABLED,
  useFcmNotifications,
} from '../../../hooks/useFcmNotifications';
import { AirplaneLoading } from '../../../components/common';
import { useCreateFullPlan } from '../../../hooks/usePlanQueries';
import { invalidatePlanCaches } from '../../../hooks/planCache';
import {
  usePendingInvitationActions,
  usePendingInvitations,
} from '../../../hooks/usePendingInvitations';
import { useQueryClient } from '@tanstack/react-query';
import { formatDateLocal } from '../../../utils/timeUtils';
import {
  CollaborationRequestResult,
  describeAcceptResult,
  describeRejectResult,
  describeRequestResultMessage,
  describeRequestResultTitle,
} from '../../../utils/collaborationRequest';
type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

/**
 * 메인 대시보드 홈 화면 컨테이너 컴포넌트
 *
 * @param props navigation 프로퍼티
 */
export default function HomeScreen({ navigation }: HomeScreenProps) {
  const user = useAuthStore((state) => state.user);
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const createFullPlanMutation = useCreateFullPlan();

  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isCreating) return;
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isCreating]);

  useEffect(() => {
    if (!isCreating) return;
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation, isCreating]);

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [adults, setAdults] = useState<number | null>(1);
  const [children, setChildren] = useState<number | null>(0);
  const [isPaxModalVisible, setPaxModalVisible] = useState(false);

  const [destination, setDestination] = useState('');
  const [travelId, setTravelId] = useState<number>(0);

  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const { data: pendingRequests = [] } = usePendingInvitations(!!user);
  const pendingInvitations = usePendingInvitationActions();
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  // 목록은 캐시가 신선하면 그대로 쓴다. 새 요청은 SSE·FCM이 알려 준다.
  const fetchPendingRequests = pendingInvitations.invalidate;

  /**
   * 내가 보낸 초대·편집 권한 요청이 처리된 결과.
   *
   * 서버가 결과를 보관하지 않아 나중에 조회할 방법이 없다. 이벤트를 받은
   * 그 자리에서 알리고, 놓치면 그대로 사라진다(FCM 푸시로 한 번 더 온다).
   */
  const handleRequestResult = useCallback(
    (result: CollaborationRequestResult) => {
      showAlert({
        title: describeRequestResultTitle(result),
        message: describeRequestResultMessage(result),
        type: result.status === 'ACCEPTED' ? 'success' : 'info',
      });
    },
    [showAlert],
  );

  useInvitationSse({
    enabled: !!user,
    onInvitationEvent: () => fetchPendingRequests(),
    onRequestResult: handleRequestResult,
  });

  useFcmNotifications({
    enabled: !!user && IS_FCM_RUNTIME_ENABLED,
    onInvitationPush: () => fetchPendingRequests(),
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const wasBackground =
        appState === 'background' ||
        appState === 'inactive' ||
        appState === 'unknown';
      const isNowActive = nextState === 'active';

      setAppState(nextState);

      if (wasBackground && isNowActive && user) {
        void fetchPendingRequests();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appState, fetchPendingRequests, user]);



  /** 알림 문구는 초대/편집 권한 요청에 따라 달라지므로 목록에서 종류를 찾는다. */
  const findRequestType = (requestId: number) =>
    pendingRequests.find(r => r.requestId === requestId)?.type;

  const handleAccept = async (requestId: number) => {
    const type = findRequestType(requestId);
    try {
      await acceptInvitation(requestId);
      // 수락하면 편집 권한이 생겨 프로필의 editablePlans가 바뀐다.
      // 무효화하지 않으면 내 일정 목록에 최대 staleTime(5분)만큼 나타나지 않는다.
      void invalidatePlanCaches(queryClient);
      showAlert({ title: '수락 완료', message: describeAcceptResult(type) });
      pendingInvitations.remove(requestId);
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({
        title: '수락하지 못했습니다',
        message: '네트워크 상태를 확인하고 다시 시도해주세요.',
        buttons: [
          { text: '닫기', style: 'cancel' },
          { text: '다시 시도', onPress: () => void handleAccept(requestId) },
        ],
      });
    }
  };

  const rejectRequest = async (requestId: number) => {
    const type = findRequestType(requestId);
    try {
      await rejectInvitation(requestId);
      showAlert({ title: '거절 완료', message: describeRejectResult(type) });
      pendingInvitations.remove(requestId);
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({
        title: '거절하지 못했습니다',
        message: '네트워크 상태를 확인하고 다시 시도해주세요.',
        buttons: [
          { text: '닫기', style: 'cancel' },
          { text: '다시 시도', onPress: () => void rejectRequest(requestId) },
        ],
      });
    }
  };

  /**
   * 거절은 되돌릴 수 없다. 서버가 처리 결과를 보관하지 않아 목록에서 사라지면
   * 다시 찾을 방법이 없으므로, 누르기 전에 한 번 확인한다.
   */
  const handleReject = (requestId: number) => {
    const request = pendingRequests.find(r => r.requestId === requestId);
    showAlert({
      title: '거절할까요?',
      message: request
        ? `${request.senderNickname}님의 요청은 거절하면 다시 받을 수 없어요.`
        : '거절하면 다시 받을 수 없어요.',
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: () => void rejectRequest(requestId),
        },
      ],
    });
  };

  const handleNotificationPress = () => {
    if (pendingRequests.length === 0) {
      showAlert({ title: '알림', message: '새로운 알림이 없습니다.' });
      return;
    }
    setNotificationModalVisible(true);
  };

  const isFormValid =
    destination !== '' &&
    startDate !== null &&
    endDate !== null &&
    adults !== null;

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  const getPaxText = () => {
    if (adults === null) return '';
    let text = `성인 ${adults}명`;
    if (children && children > 0) {
      text += `, 어린이 ${children}명`;
    }
    return text;
  };

  const getDateText = () => {
    if (!startDate || !endDate) return '';
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const handleCreateItinerary = async () => {
    if (!isFormValid) {
      return;
    }

    if (travelId === undefined || travelId <= 0) {
      showAlert({
        title: '알림',
        message:
          '여행지가 올바르게 선택되지 않았습니다.\n목록에서 다시 선택해주세요.',
      });
      return;
    }

    if (!startDate || !endDate) {
      return;
    }

    setIsCreating(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const timetableVOs: { date: string; timeTableStartTime: string; timeTableEndTime: string }[] = [];
      const currentDate = new Date(start);

      while (currentDate.getTime() <= end.getTime()) {
        timetableVOs.push({
          date: formatDateLocal(currentDate),
          timeTableStartTime: '09:00:00',
          timeTableEndTime: '20:00:00',
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const result = await createFullPlanMutation.mutateAsync({
        planFrame: {
          destinationId: travelId,
          adultCount: adults ?? 1,
          childCount: children ?? 0,
        },
        timetables: timetableVOs,
        timetablePlaceBlocks: [],
      });

      const newPlanId = result?.planId;

      if (!newPlanId) {
        console.error('Plan creation response did not include planId:', result);
        setIsCreating(false);
        showAlert({
          title: '일정을 확인할 수 없습니다',
          message: '일정 생성 응답에 식별자가 없습니다. 내 일정에서 생성 여부를 확인해주세요.',
        });
        return;
      }

      setIsCreating(false);

      navigation.navigate('ItineraryEditor', {
        planId: newPlanId,
        departure: 'SEOUL',
        destination,
        travelId: travelId || 0,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        adults: adults ?? 1,
        children: children ?? 0,
      });
    } catch (error) {
      console.error('일정 생성 준비 실패:', error);
      setIsCreating(false);
      /** 입력값은 그대로 남아 있으므로 이 자리에서 바로 다시 시도할 수 있다. */
      showAlert({
        title: '일정을 만들지 못했습니다',
        message:
          '입력한 내용은 그대로 남아 있어요.\n네트워크 상태를 확인하고 다시 시도해주세요.',
        buttons: [
          { text: '닫기', style: 'cancel' },
          { text: '다시 시도', onPress: () => void handleCreateItinerary() },
        ],
      });
    }
  };

  const openSearchModal = () => {
    setSearchModalVisible(true);
  };

  const onSelectLocation = (location: string, id?: number) => {
    setDestination(location);
    if (id !== undefined) setTravelId(id);
  };

  return (
    <>
      <HomeScreenView
        nickname={user?.nickname}
        email={user?.email}
        pendingRequestsCount={pendingRequests.length}
        destination={destination}
        dateText={getDateText()}
        paxText={getPaxText()}
        isFormValid={isFormValid}
        isSearchModalVisible={isSearchModalVisible}
        isCalendarVisible={isCalendarVisible}
        isPaxModalVisible={isPaxModalVisible}
        startDate={startDate}
        endDate={endDate}
        adults={adults}
        children={children}
        onNotificationPress={handleNotificationPress}
        isNotificationModalVisible={isNotificationModalVisible}
        pendingRequestList={pendingRequests}
        onCloseNotificationModal={() => setNotificationModalVisible(false)}
        onAcceptNotification={handleAccept}
        onRejectNotification={handleReject}
        onNavigateProfile={() => navigation.navigate('Profile')}
        onOpenSearchModal={openSearchModal}
        onCloseSearchModal={() => setSearchModalVisible(false)}
        onSelectLocation={onSelectLocation}
        onOpenCalendar={() => setCalendarVisible(true)}
        onCloseCalendar={() => setCalendarVisible(false)}
        onConfirmCalendar={({ startDate: newStartDate, endDate: newEndDate }) => {
          setStartDate(newStartDate);
          setEndDate(newEndDate);
          setCalendarVisible(false);
        }}
        onOpenPaxModal={() => setPaxModalVisible(true)}
        onClosePaxModal={() => setPaxModalVisible(false)}
        onConfirmPax={({ adults: newAdults, children: newChildren }) => {
          setAdults(newAdults);
          setChildren(newChildren);
          setPaxModalVisible(false);
        }}
        onCreateItinerary={handleCreateItinerary}
      />
      <Modal
        visible={isCreating}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <AirplaneLoading />
      </Modal>
    </>
  );
}
