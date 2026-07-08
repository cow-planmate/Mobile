import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { Header, NotificationModal } from '../../../components/common';
import TravelFeedList, { TravelFeedItem } from '../components/TravelFeedList';
import { AppStackParamList } from '../../../navigation/types';
import {
  getPendingInvitations,
  PendingInvitation,
  acceptInvitation,
  rejectInvitation,
} from '../../../api/trips';

export default function TravelFeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { showAlert } = useAlert();
  const user = useAuthStore((state) => state.user);

  const [pendingRequests, setPendingRequests] = useState<PendingInvitation[]>([]);
  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
      void fetchPendingRequests(true);
    }, [fetchPendingRequests])
  );

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

  const handleFeedItemPress = (item: TravelFeedItem) => {
    showAlert({
      title: '여행기 상세',
      message: `'${item.title}' 상세 페이지는 준비 중입니다.`,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        nickname={user?.nickname}
        email={user?.email}
        pendingRequestsCount={pendingRequests.length}
        onNotificationPress={onNotificationPress}
        onNavigateProfile={onNavigateProfile}
      />
      <View style={styles.content}>
        <TravelFeedList onItemPress={handleFeedItemPress} />
      </View>

      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        invitations={pendingRequests as any}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
});
