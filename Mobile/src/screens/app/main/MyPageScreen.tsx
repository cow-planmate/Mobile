import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '@env';
import UpdateValueModal from '../../../components/common/UpdateValueModal';
import ShareModal from '../../../components/common/ShareModal';
import MenuModal from '../../../components/common/MenuModal'; // Updated
import { SimplePlanVO } from '../../../types/env';
import { AppStackParamList } from '../../../navigation/types';

import { styles, COLORS } from './MyPageScreen.styles';

const MENU_OPTIONS = [
  { label: '제목 바꾸기', action: 'rename' },
  { label: '수정하기', action: 'edit' },
  { label: '공유 및 초대', action: 'share' },
  { label: '삭제하기', action: 'delete', isDestructive: true },
];

const SectionHeader = ({
  title,
  subtitle,
  count,
  actionText,
  onActionPress,
}: {
  title: string;
  subtitle: string;
  count: number;
  actionText?: string;
  onActionPress?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.sectionActionContainer}>
      <Text style={styles.sectionCount}>
        <Text style={styles.sectionCountIcon}>🗓️</Text> {count}개의 계획
      </Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
          <Text style={styles.sectionActionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const ItineraryCard = ({
  title,
  subtitle,
  onPress,
  onPressMore,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  onPressMore: () => void;
}) => (
  <TouchableOpacity style={styles.itineraryCard} onPress={onPress}>
    <View style={styles.itineraryIconContainer}>
      <Text style={styles.itineraryIcon}>🗓️</Text>
    </View>
    <View style={styles.itineraryContent}>
      <Text style={styles.itineraryTitle}>{title}</Text>
      <Text style={styles.itinerarySubtitle}>{subtitle}</Text>
    </View>
    <TouchableOpacity onPress={onPressMore} style={styles.moreButton}>
      <Text style={styles.moreButtonText}>⋮</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function MyPageScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [myItineraries, setMyItineraries] = useState<SimplePlanVO[]>([]);
  const [sharedItineraries, setSharedItineraries] = useState<SimplePlanVO[]>(
    [],
  );

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SimplePlanVO | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

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
      Alert.alert('오류', '일정을 불러오는데 실패했습니다.');
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
      Alert.alert('성공', '일정 제목이 변경되었습니다.');
      setRenameModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert('실패', '제목 변경에 실패했습니다.');
    }
  };

  const handleDeletePlan = async (planId: number) => {
    Alert.alert('일정 삭제', '정말로 이 일정을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/plan/${planId}`);
            setMyItineraries(prev => prev.filter(p => p.planId !== planId));
            Alert.alert('성공', '일정이 삭제되었습니다.');
          } catch (e) {
            console.error('Delete plan failed:', e);
            Alert.alert('실패', '일정 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <SectionHeader
          title="나의 일정"
          subtitle="직접 생성한 일정을 관리하세요"
          count={myItineraries.length}
          actionText="다중삭제"
          onActionPress={() => alert('다중삭제 미구현')}
        />

        {myItineraries.map(item => (
          <ItineraryCard
            key={item.planId}
            title={item.planName}
            subtitle={
              item.startDate && item.endDate
                ? `${item.startDate}~${item.endDate}`
                : '클릭하여 상세보기'
            }
            onPress={() =>
              navigation.navigate('ItineraryView', {
                days: [],
                tripName: item.planName,
                planId: item.planId,
              })
            }
            onPressMore={() => handleMenuPress(item)}
          />
        ))}

        <View style={styles.sectionSeparator} />

        <SectionHeader
          title="우리들의 일정"
          subtitle="초대받은 일정에서 다른 멤버와 함께 편집하세요"
          count={sharedItineraries.length}
        />

        {sharedItineraries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              편집 권한을 받은 일정이 없습니다
            </Text>
          </View>
        ) : (
          sharedItineraries.map(item => (
            <ItineraryCard
              key={item.planId}
              title={item.planName}
              subtitle={
                item.startDate && item.endDate
                  ? `${item.startDate}~${item.endDate}`
                  : '초대된 일정'
              }
              onPress={() =>
                navigation.navigate('ItineraryEditor', {
                  planId: item.planId,
                })
              }
              onPressMore={() => handleMenuPress(item)}
            />
          ))
        )}
      </ScrollView>

      <MenuModal
        visible={menuVisible}
        title="일정 관리"
        options={MENU_OPTIONS}
        onClose={() => setMenuVisible(false)}
        onSelect={handleMenuSelect}
      />

      <UpdateValueModal
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        onConfirm={handleRenameTitle}
        title="제목 바꾸기"
        label="새로운 제목"
        initialValue={selectedPlan?.planName || ''}
      />

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        planId={selectedPlan?.planId}
      />
    </SafeAreaView>
  );
}
