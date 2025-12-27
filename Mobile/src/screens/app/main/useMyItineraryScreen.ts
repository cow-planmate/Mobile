import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

interface PlanVO {
  planId: number;
  planName: string;
  startDate?: string;
  endDate?: string;
  state?: string;
  city?: string;
}

export const useMyItineraryScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [myPlanVOs, setMyPlanVOs] = useState<PlanVO[]>([]);
  const [editablePlanVOs, setEditablePlanVOs] = useState<PlanVO[]>([]);

  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/user/profile`);
      const data = response.data;

      setMyPlanVOs(data.myPlanVOs || []);
      setEditablePlanVOs(data.editablePlanVOs || []);
    } catch (error) {
      console.error('Failed to fetch itineraries:', error);
      Alert.alert('오류', '일정 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItineraries();
    }, []),
  );

  const handlePlanPress = (planId: number) => {
    // TODO: Navigate to plan details
    Alert.alert('알림', `일정 ID ${planId} 상세보기가 준비 중입니다.`);
  };

  const handleOptionPress = (planId: number) => {
    setSelectedPlanId(planId);
    setIsOptionModalVisible(true);
  };

  const closeOptionModal = () => {
    setIsOptionModalVisible(false);
    setSelectedPlanId(null);
  };

  const handleRename = () => {
    Alert.alert('알림', '제목 바꾸기 기능이 준비 중입니다.');
    closeOptionModal();
  };

  const handleEdit = () => {
    Alert.alert('알림', '수정하기 기능이 준비 중입니다.');
    closeOptionModal();
  };

  const handleDelete = () => {
    Alert.alert('삭제 확인', '정말로 이 일정을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          if (!selectedPlanId) return;
          try {
            await axios.delete(`${API_URL}/api/plan/${selectedPlanId}`);
            Alert.alert('알림', '삭제되었습니다.');
            fetchItineraries();
          } catch (error) {
            console.error('Delete plan error:', error);
            Alert.alert('오류', '일정 삭제에 실패했습니다.');
          } finally {
            closeOptionModal();
          }
        },
      },
    ]);
  };

  const handleShare = () => {
    Alert.alert('알림', '공유 및 초대 기능이 준비 중입니다.');
    closeOptionModal();
  };

  return {
    loading,
    myPlanVOs,
    editablePlanVOs,
    handlePlanPress,
    isOptionModalVisible,
    selectedPlanId,
    handleOptionPress,
    closeOptionModal,
    handleRename,
    handleEdit,
    handleDelete,
    handleShare,
  };
};
