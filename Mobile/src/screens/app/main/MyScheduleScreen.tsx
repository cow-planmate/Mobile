import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppState, AppStateStatus } from 'react-native';
import axios from 'axios';
import { API_URL, FCM_RUNTIME_ENABLED as FCM_RUNTIME_ENABLED_ENV } from '@env';
import { SimplePlanVO } from '../../../types/env';
import { AppStackParamList } from '../../../navigation/types';
import MyScheduleScreenView from './MyScheduleScreen.view';
import { useAlert } from '../../../contexts/AlertContext';
import { useAuth } from '../../../contexts/AuthContext';
import {
  acceptInvitation,
  getPendingInvitations,
  PendingInvitation,
  rejectInvitation,
} from '../../../api/trips';
import { useInvitationSse } from '../../../hooks/useInvitationSse';
import { useFcmNotifications } from '../../../hooks/useFcmNotifications';

const INVITATION_REFRESH_INTERVAL_MS = 15000;
const FCM_RUNTIME_ENABLED =
  (FCM_RUNTIME_ENABLED_ENV || '').trim().toLowerCase() === 'true';

export default function MyScheduleScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [myItineraries, setMyItineraries] = useState<SimplePlanVO[]>([]);
  const [sharedItineraries, setSharedItineraries] = useState<SimplePlanVO[]>(
    [],
  );

  const [pendingRequests, setPendingRequests] = useState<PendingInvitation[]>(
    [],
  );
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SimplePlanVO | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const fetchPendingRequests = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const requests = await getPendingInvitations();
      if (requests) {
        setPendingRequests(requests);
      }
    } catch (error) {
      console.log('초대 요청 목록 조회 실패:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchPendingRequests();
  }, [fetchPendingRequests]);

  useFocusEffect(
    useCallback(() => {
      void fetchPendingRequests();
    }, [fetchPendingRequests]),
  );

  useInvitationSse({
    enabled: !!user,
    onInvitationEvent: () => fetchPendingRequests(true),
  });

  useFcmNotifications({
    enabled: !!user && FCM_RUNTIME_ENABLED,
    onInvitationPush: () => fetchPendingRequests(true),
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
        void fetchPendingRequests(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appState, fetchPendingRequests, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId = setInterval(() => {
      if (appState === 'active') {
        void fetchPendingRequests(true);
      }
    }, INVITATION_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [appState, fetchPendingRequests, user]);

  const handleAccept = async (requestId: number) => {
    try {
      await acceptInvitation(requestId);
      showAlert({ title: '수락 완료', message: '일정에 참여했습니다.' });
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({ title: '오류', message: '수락 처리에 실패했습니다.' });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectInvitation(requestId);
      showAlert({ title: '거절 완료', message: '초대를 거절했습니다.' });
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({ title: '오류', message: '거절 처리에 실패했습니다.' });
    }
  };

  const onNotificationPress = () => {
    if (pendingRequests.length === 0) {
      showAlert({ title: '알림', message: '새로운 알림이 없습니다.' });
      return;
    }
    setNotificationModalVisible(true);
  };

  const onNavigateProfile = () => {
    navigation.navigate('Profile');
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, []),
  );

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/user/profile`);
      const data = response.data;
      setMyItineraries(data.myPlanVOs || []);
      setSharedItineraries(data.editablePlanVOs || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      showAlert({ title: '오류', message: '일정을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuPress = (plan: SimplePlanVO) => {
    setSelectedPlan(plan);
    setMenuVisible(true);
  };

  const handleMenuSelect = (action: string) => {
    setMenuVisible(false);
    if (!selectedPlan) return;

    switch (action) {
      case 'rename':
        setRenameModalVisible(true);
        break;
      case 'edit':
        navigation.navigate('ItineraryEditor', { planId: selectedPlan.planId });
        break;
      case 'delete':
        handleDeletePlan(selectedPlan.planId);
        break;
      case 'share':
        setShareModalVisible(true);
        break;
    }
  };

  const handleRenameTitle = async (newTitle: string) => {
    if (!selectedPlan) return;
    try {
      await axios.patch(`${API_URL}/api/plan/${selectedPlan.planId}`, {
        title: newTitle,
      });
      setMyItineraries(prev =>
        prev.map(p =>
          p.planId === selectedPlan.planId ? { ...p, planName: newTitle } : p,
        ),
      );
      setSharedItineraries(prev =>
        prev.map(p =>
          p.planId === selectedPlan.planId ? { ...p, planName: newTitle } : p,
        ),
      );
      showAlert({ title: '성공', message: '일정 제목이 변경되었습니다.' });
      setRenameModalVisible(false);
    } catch (e) {
      console.error(e);
      showAlert({ title: '실패', message: '제목 변경에 실패했습니다.' });
    }
  };

  const handleDeletePlan = async (planId: number) => {
    showAlert({
      title: '일정 삭제',
      message: '정말로 이 일정을 삭제하시겠습니까?',
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/plan/${planId}`);
              setMyItineraries(prev => prev.filter(p => p.planId !== planId));
              showAlert({ title: '성공', message: '일정이 삭제되었습니다.' });
            } catch (e) {
              console.error('Delete plan failed:', e);
              showAlert({
                title: '실패',
                message: '일정 삭제에 실패했습니다.',
              });
            }
          },
        },
      ],
    });
  };

  const navigateToView = (plan: SimplePlanVO) => {
    navigation.navigate('ItineraryView', {
      days: [],
      tripName: plan.planName,
      planId: plan.planId,
    });
  };

  const navigateToEditor = (plan: SimplePlanVO) => {
    navigation.navigate('ItineraryEditor', {
      planId: plan.planId,
    });
  };

  return (
    <MyScheduleScreenView
      loading={loading}
      myItineraries={myItineraries}
      sharedItineraries={sharedItineraries}
      menuVisible={menuVisible}
      setMenuVisible={setMenuVisible}
      selectedPlan={selectedPlan}
      renameModalVisible={renameModalVisible}
      setRenameModalVisible={setRenameModalVisible}
      shareModalVisible={shareModalVisible}
      setShareModalVisible={setShareModalVisible}
      handleMenuPress={handleMenuPress}
      handleMenuSelect={handleMenuSelect}
      handleRenameTitle={handleRenameTitle}
      navigateToView={navigateToView}
      navigateToEditor={navigateToEditor}
      email={user?.email}
      nickname={user?.nickname}
      pendingRequestsCount={pendingRequests.length}
      isNotificationModalVisible={isNotificationModalVisible}
      pendingRequestList={pendingRequests}
      onCloseNotificationModal={() => setNotificationModalVisible(false)}
      onAcceptNotification={handleAccept}
      onRejectNotification={handleReject}
      onNotificationPress={onNotificationPress}
      onNavigateProfile={onNavigateProfile}
    />
  );
}
