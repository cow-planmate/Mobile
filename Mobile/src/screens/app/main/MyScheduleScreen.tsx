import React, { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '@env';
import { SimplePlanVO } from '../../../types/env';
import { AppStackParamList } from '../../../navigation/types';
import MyScheduleScreenView from './MyScheduleScreen.view';
import { useAlert } from '../../../contexts/AlertContext';
import { useAuth } from '../../../contexts/AuthContext';

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

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SimplePlanVO | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const onNotificationPress = () => {
    // 알림창 구현 필요시 추가
  };

  const onNavigateProfile = () => {
    // 프로필 이동 구현 필요시 추가
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
      onNotificationPress={onNotificationPress}
      onNavigateProfile={onNavigateProfile}
    />
  );
}
