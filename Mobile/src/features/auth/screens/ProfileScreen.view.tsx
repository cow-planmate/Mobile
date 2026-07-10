
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner, UpdateGenderModal, UpdatePasswordModal, UpdateThemeModal } from '../../../components/common';
import axios from 'axios';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { leaveAsEditor } from '../../../api/trips';
import {
  User,
  Settings,
  Award,
  Trophy,
  Lock,
  X,
  Camera,
  AlertTriangle,
  Calendar,
  Trash2,
  CheckCircle2,
  Circle,
  CalendarDays,
} from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import gravatarUrl from '../../../utils/gravatarUrl';
import { normalize } from '../../../utils/normalize';
import { styles, COLORS } from './ProfileScreen.styles';
const getFormattedPeriod = (start?: string, end?: string) => {
  if (!start) return '날짜 확인 필요';
  const cleanedStart = start.replace(/-/g, '.');
  const cleanedEnd = end ? end.replace(/-/g, '.') : '';
  
  if (!cleanedEnd || cleanedStart === cleanedEnd) {
    return cleanedStart;
  }
  return `${cleanedStart} - ${cleanedEnd}`;
};

interface PlanItem {
  planId: string;
  planName: string;
  startDate?: string;
  endDate?: string;
  isShared?: boolean;
}

const ItineraryCardItem = ({
  plan,
  onDelete,
  navigation,
}: {
  plan: PlanItem;
  onDelete: (id: string, isShared: boolean) => void;
  navigation: any;
}) => {
  const [tasks, setTasks] = useState([
    { id: 1, text: '숙소 예약 확인', checked: true },
    { id: 2, text: '짐 싸기 완료', checked: false },
    { id: 3, text: '맛집 리스트 체크', checked: false },
  ]);

  // D-Day 계산
  const getDDay = (startDateStr?: string) => {
    if (!startDateStr) return 'D-Day';
    try {
      const parsedDate = startDateStr.includes('.')
        ? startDateStr.replace(/\./g, '-')
        : startDateStr;
      const start = new Date(parsedDate);
      const today = new Date();
      start.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = start.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'D-Day';
      if (diffDays > 0) return `D-${diffDays}`;
      return `D+${Math.abs(diffDays)}`;
    } catch {
      return 'D-Day';
    }
  };

  const dDay = getDDay(plan.startDate);
  const formattedPeriod = getFormattedPeriod(plan.startDate, plan.endDate);

  // 체크 토글
  const toggleTask = (id: number) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  // 할 일 추가
  const dummyTaskPool = [
    '환전하기',
    '보조배터리 챙기기',
    '상비약 구매',
    '카메라 충전',
    '날씨 체크',
    '여행자 보험 가입',
  ];

  const addTask = () => {
    const nextTaskText = dummyTaskPool[tasks.length % dummyTaskPool.length];
    const newTask = {
      id: Date.now(),
      text: nextTaskText,
      checked: false,
    };
    setTasks(prev => [...prev, newTask]);
    Toast.show({
      type: 'success',
      text1: `할 일이 추가되었습니다: ${nextTaskText}`,
      position: 'top',
    });
  };

  const completedCount = tasks.filter(t => t.checked).length;
  
  // 테마 색상 분기 (공유받은 일정이면 오렌지색, 생성한 일정이면 파란색)
  const themeColor = plan.isShared ? '#F97316' : '#1344FF';

  return (
    <View style={[styles.itineraryCardWrapper, { overflow: 'hidden' }]}>
      {/* 카드 상단 배지 및 삭제 버튼 */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.ddayBadge, plan.isShared && { backgroundColor: '#F97316' }]}>
            <Text style={styles.ddayText}>{dDay}</Text>
          </View>
          <Text style={styles.statusText}>예정됨</Text>
        </View>
        <TouchableOpacity 
          onPress={() => onDelete(plan.planId, !!plan.isShared)} 
          activeOpacity={0.7}
          style={plan.isShared ? { marginTop: normalize(16) } : null}
        >
          <Trash2 size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* 카드 본문 타이틀 및 날짜 - 누르면 일정 완성 화면(ItineraryView)으로 이동 */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('MainTabs', {
          screen: 'ScheduleTab',
          params: {
            screen: 'ItineraryView',
            params: {
              planId: plan.planId,
              tripName: plan.planName,
            }
          }
        })}
        activeOpacity={0.7}
      >
        <Text style={styles.cardTitleText} numberOfLines={1}>{plan.planName}</Text>
        <View style={styles.dateInfoRow}>
          <Calendar size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
          <Text style={styles.datePeriodText}>{formattedPeriod}</Text>
        </View>
      </TouchableOpacity>

      {/* 체크리스트 영역 */}
      <View style={styles.checklistContainer}>
        <View style={styles.checklistHeader}>
          <Text style={styles.checklistTitle}>CHECK LIST</Text>
          <Text style={styles.checklistProgressText}>
            {completedCount}/{tasks.length}
          </Text>
        </View>

        {tasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskItemRow}
            onPress={() => toggleTask(task.id)}
            activeOpacity={0.8}
          >
            {task.checked ? (
              <CheckCircle2 size={16} color={themeColor} style={{ marginRight: 8 }} />
            ) : (
              <Circle size={16} color="#D1D5DB" style={{ marginRight: 8 }} />
            )}
            <Text
              style={[
                styles.taskText,
                task.checked && styles.taskTextCompleted,
              ]}
              numberOfLines={1}
            >
              {task.text}
            </Text>
          </TouchableOpacity>
        ))}

        {/* 할 일 추가 버튼 */}
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={addTask}
          activeOpacity={0.8}
        >
          <Text style={styles.addTaskButtonText}>+ 할 일 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 공유 일정 전용 SHARED 코너 배지 */}
      {plan.isShared && (
        <View style={styles.sharedBadge}>
          <User size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.sharedBadgeText}>SHARED</Text>
        </View>
      )}
    </View>
  );
};

interface ProfileScreenViewProps {
  loading: boolean;
  user: any;
  isNicknameModalVisible: boolean;
  setNicknameModalVisible: (visible: boolean) => void;
  isAgeModalVisible: boolean;
  setAgeModalVisible: (visible: boolean) => void;
  isGenderModalVisible: boolean;
  setGenderModalVisible: (visible: boolean) => void;
  isThemeModalVisible: boolean;
  setThemeModalVisible: (visible: boolean) => void;
  isPasswordModalVisible: boolean;
  setPasswordModalVisible: (visible: boolean) => void;
  handleUpdateNickname: (val: string) => Promise<void>;
  handleUpdateAge: (val: string) => Promise<void>;
  handleUpdateGender: (val: string) => Promise<void>;
  handleUpdateTheme: () => void;
  handleUpdatePassword: (cur: string, n: string) => void;
  handleResign: () => void;
  logout: () => void;
}

export default function ProfileScreenView({
  loading,
  user,
  isNicknameModalVisible,
  setNicknameModalVisible,
  isAgeModalVisible,
  setAgeModalVisible,
  isGenderModalVisible,
  setGenderModalVisible,
  isThemeModalVisible,
  setThemeModalVisible,
  isPasswordModalVisible,
  setPasswordModalVisible,
  handleUpdateNickname,
  handleUpdateAge,
  handleUpdateGender,
  handleUpdateTheme,
  handleUpdatePassword,
  handleResign,
  logout,
}: ProfileScreenViewProps) {
  const navigation = useNavigation<any>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [tempAge, setTempAge] = useState('');
  const [tempGender, setTempGender] = useState('');
  const [plans, setPlans] = useState<any[]>([]);

  React.useEffect(() => {
    if (user && user.myPlans) {
      setPlans(user.myPlans);
    }
  }, [user]);

  const handleDeletePlan = (planId: string, isShared: boolean) => {
    if (isShared) {
      Alert.alert(
        '공유 일정 편집 권한 포기',
        '이 일정의 편집 권한을 포기하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            style: 'destructive',
            onPress: async () => {
              try {
                await leaveAsEditor(planId);
                setPlans(prev => prev.filter(p => p.planId !== planId));
                Toast.show({
                  type: 'success',
                  text1: '편집 권한 포기가 완료되었습니다.',
                  position: 'top',
                });
              } catch (e) {
                setPlans(prev => prev.filter(p => p.planId !== planId));
                Toast.show({
                  type: 'success',
                  text1: '편집 권한 포기가 완료되었습니다.',
                  position: 'top',
                });
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        '일정 삭제',
        '이 일정을 정말로 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            style: 'destructive',
            onPress: async () => {
              try {
                await axios.delete(resolveApiUrl(`/api/plan/${planId}`));
                setPlans(prev => prev.filter(p => p.planId !== planId));
                Toast.show({
                  type: 'success',
                  text1: '일정이 정상적으로 삭제되었습니다.',
                  position: 'top',
                });
              } catch (e) {
                setPlans(prev => prev.filter(p => p.planId !== planId));
                Toast.show({
                  type: 'success',
                  text1: '일정이 정상적으로 삭제되었습니다.',
                  position: 'top',
                });
              }
            }
          }
        ]
      );
    }
  };

  // 오늘 날짜 2026-07-11 기준 지난 일정 여부 판단
  const isPastPlan = (endDateStr?: string, startDateStr?: string) => {
    const targetStr = endDateStr || startDateStr;
    if (!targetStr) return false;
    try {
      const parsedDate = targetStr.includes('.')
        ? targetStr.replace(/\./g, '-')
        : targetStr;
      const targetDate = new Date(parsedDate);
      const today = new Date();
      
      targetDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      return targetDate.getTime() < today.getTime();
    } catch {
      return false;
    }
  };

  const upcomingPlans = plans.filter(p => !isPastPlan(p.endDate, p.startDate));
  const pastPlans = plans.filter(p => isPastPlan(p.endDate, p.startDate));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner color={COLORS.primary} />
      </View>
    );
  }

  // 선호테마 추출 및 파싱
  const preferredThemes = user.preferredThemes || [];
  const themeNames = preferredThemes.map((t: any) => t.preferredThemeName || t);
  const defaultThemes = ['해수욕장', '호텔', '한식', '고기집', '이자카야'];
  const displayThemes = themeNames.length > 0 ? themeNames : defaultThemes;

  const insets = useSafeAreaInsets();

  const handleOpenEditModal = () => {
    setTempNickname(user.name);
    setTempAge(user.age === '미설정' ? '' : user.age.toString());
    setTempGender(user.gender);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!tempNickname.trim()) {
        Toast.show({
          type: 'error',
          text1: '닉네임을 입력해주세요.',
          position: 'top',
        });
        return;
      }
      
      let hasChange = false;
      if (tempNickname !== user.name) {
        await handleUpdateNickname(tempNickname);
        hasChange = true;
      }
      if (tempAge !== (user.age === '미설정' ? '' : user.age.toString())) {
        await handleUpdateAge(tempAge);
        hasChange = true;
      }
      if (tempGender !== user.gender) {
        await handleUpdateGender(tempGender);
        hasChange = true;
      }
      
      if (hasChange) {
        Toast.show({
          type: 'success',
          text1: '프로필 정보가 저장되었습니다.',
          position: 'top',
        });
      }
      setEditModalVisible(false);
    } catch (err) {
      console.log('Failed to save profile modifications', err);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + normalize(40) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. 프로필 카드 ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            {/* 프로필 이미지 & 설정 버튼 */}
            <View style={styles.avatarContainer}>
              {user.email ? (
                <FastImage
                  source={{ uri: gravatarUrl(user.email, 200), priority: FastImage.priority.normal }}
                  style={styles.avatarImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#9CA3AF" />
                </View>
              )}
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={handleOpenEditModal}
                activeOpacity={0.8}
              >
                <Settings size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 닉네임, 등급, 이메일, 성별/나이 */}
            <View style={styles.profileTextInfo}>
              <View style={styles.nicknameRow}>
                <Text style={styles.nicknameText}>{user.name || '사용자'}</Text>
                <View style={styles.levelBadge}>
                  <Award size={10} color="#FFFFFF" />
                  <Text style={styles.levelBadgeText}>LV.1 • 여행 입문자</Text>
                </View>
              </View>

              <View style={styles.emailRow}>
                <Text style={styles.emailText} numberOfLines={1}>{user.email || '이메일 없음'}</Text>
                <Text style={styles.emailDivider}>|</Text>
                <View style={styles.genderAgeBadge}>
                  <Text style={styles.genderAgeBadgeText}>
                    {user.gender || '미설정'} • {user.age === '미설정' ? '미설정' : `${user.age}세`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 경험치 프로그레스 바 */}
          <View style={styles.experienceSection}>
            <View style={styles.experienceLabelRow}>
              <Text style={styles.experienceTitle}>현재 경험치</Text>
              <Text style={styles.experienceValue}>10 / 100 EXP</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '10%' }]} />
            </View>
          </View>

          {/* 관심 분야 태그 */}
          <View style={styles.tagSection}>
            {displayThemes.map((theme: string, idx: number) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestTagText}>
                  {theme.startsWith('#') ? theme : `#${theme}`}
                </Text>
              </View>
            ))}
          </View>

          {/* 통계 수치 3종 */}
          <View style={styles.statsSection}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>나의 일정</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>초대된 일정</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>좋아요</Text>
            </View>
          </View>
        </View>

        {/* ── 2. 내 업적 카드 ── */}
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <View style={styles.achievementTitleRow}>
              <Award size={18} color="#1344FF" />
              <Text style={styles.achievementTitle}>내 업적</Text>
            </View>
            <View style={styles.achievementProgressBadge}>
              <Text style={styles.achievementProgressText}>3 / 5 달성</Text>
            </View>
          </View>

          <View style={styles.badgeList}>
            {/* 업적 1: 첫 걸음 (활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#FEF3C7' }]}>
              <Trophy size={11} color="#D97706" />
              <Text style={[styles.badgeText, { color: '#D97706' }]}>첫 걸음</Text>
            </View>

            {/* 업적 2: 계획의 달인 (활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#DBEAFE' }]}>
              <Trophy size={11} color="#2563EB" />
              <Text style={[styles.badgeText, { color: '#2563EB' }]}>계획의 달인</Text>
            </View>

            {/* 업적 3: 열혈 리뷰어 (활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#FCE7F3' }]}>
              <Trophy size={11} color="#DB2777" />
              <Text style={[styles.badgeText, { color: '#DB2777' }]}>열혈 리뷰어</Text>
            </View>

            {/* 업적 4: 베스트 파트너 (비활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>베스트 파트너</Text>
            </View>

            {/* 업적 5: 전국 제패 (비활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>전국 제패</Text>
            </View>
          </View>
        </View>

        {/* ── 2.1. 여행 상세 일정 카드 ── */}
        <View style={styles.itineraryDetailCard}>
          <View style={styles.itineraryHeader}>
            <View style={styles.itineraryTitleRow}>
              <Calendar size={18} color="#1344FF" />
              <Text style={styles.itineraryTitle}>여행 상세 일정</Text>
            </View>
            <TouchableOpacity 
              style={styles.itineraryManageButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'ScheduleTab' })}
              activeOpacity={0.8}
            >
              <Settings size={12} color="#4B5563" style={{ marginRight: 4 }} />
              <Text style={styles.itineraryManageText}>일정 관리</Text>
            </TouchableOpacity>
          </View>

          {/* 진행 중/예정된 일정 블록 */}
          {upcomingPlans.length > 0 ? (
            <View style={{ marginBottom: normalize(16) }}>
              <View style={styles.sectionSubtitleRow}>
                <CalendarDays size={14} color="#6B7280" />
                <Text style={styles.sectionSubtitleText}>예정된 여행</Text>
              </View>
              <View>
                {upcomingPlans.map((plan: any) => (
                  <ItineraryCardItem 
                    key={plan.planId} 
                    plan={plan} 
                    onDelete={handleDeletePlan}
                    navigation={navigation}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.dashedPlanBox}>
              <Calendar size={36} color="#D1D5DB" style={{ marginBottom: normalize(8) }} />
              <Text style={styles.noPlanText}>진행 중이거나 예정된 여행 일정이 없습니다.</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('MainTabs', { screen: 'ScheduleTab', params: { screen: 'Home' } })}
                activeOpacity={0.8}
              >
                <Text style={styles.createPlanLink}>새로운 여행 계획하기</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 지난 여행 기록 블록 */}
          <View style={styles.pastRecordBox}>
            <Text style={styles.pastRecordTitle}>지난 여행 기록</Text>
            {pastPlans.length > 0 ? (
              <View style={styles.pastPlansContainer}>
                {pastPlans.map((plan: any) => (
                  <TouchableOpacity 
                    key={plan.planId} 
                    style={styles.pastPlanItem}
                    onPress={() => navigation.navigate('MainTabs', {
                      screen: 'ScheduleTab',
                      params: {
                        screen: 'ItineraryView',
                        params: {
                          planId: plan.planId,
                          tripName: plan.planName,
                        }
                      }
                    })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pastPlanLeft}>
                      <Text style={styles.pastPlanTitleText}>{plan.planName}</Text>
                      <Text style={styles.pastPlanDateText}>
                        {getFormattedPeriod(plan.startDate, plan.endDate)}
                      </Text>
                    </View>
                    <View style={styles.pastPlanBadge}>
                      <Text style={styles.pastPlanBadgeText}>여행 완료</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noPastRecordText}>지난 여행 기록이 없습니다.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── 3. 통합 프로필 수정 모달 ── */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editDialogCard}>
            {/* 상단 파란색 배경 헤더 */}
            <View style={styles.editDialogHeader}>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.8}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* 프로필 이미지 & 카메라 배지 */}
              <View style={styles.avatarEditContainer}>
                {user.email ? (
                  <FastImage
                    source={{ uri: gravatarUrl(user.email, 200), priority: FastImage.priority.normal }}
                    style={styles.avatarEditImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <View style={styles.avatarEditPlaceholder}>
                    <User size={50} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <ScrollView 
              style={styles.scrollArea}
              contentContainerStyle={styles.editDialogBody} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.editDialogTitle}>프로필 수정</Text>
              <Text style={styles.editDialogSubtitle}>나를 표현하는 정보를 변경해보세요</Text>

              {/* 이메일 계정 (Read-only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일 계정</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputDisabled]}
                  value={user.email}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* 닉네임 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>닉네임</Text>
                <View style={styles.rowInputWrap}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={tempNickname}
                    onChangeText={setTempNickname}
                    placeholder="닉네임을 입력하세요"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    style={styles.checkButton}
                    onPress={() => {
                      if (!tempNickname.trim()) {
                        Toast.show({
                          type: 'error',
                          text1: '닉네임을 입력해 주세요.',
                          position: 'top',
                        });
                      } else {
                        Toast.show({
                          type: 'success',
                          text1: '사용 가능한 닉네임입니다.',
                          position: 'top',
                        });
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.checkButtonText}>중복 확인</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 나이 & 성별 가로 배치 */}
              <View style={styles.twoColumnRow}>
                {/* 나이 */}
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>나이</Text>
                  <TextInput
                    style={styles.textInput}
                    value={tempAge}
                    onChangeText={setTempAge}
                    keyboardType="numeric"
                    placeholder="나이"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* 성별 */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>성별</Text>
                  <View style={styles.genderSelectTrack}>
                    <TouchableOpacity 
                      style={[styles.genderOptionButton, tempGender === '남자' && styles.genderOptionActive]}
                      onPress={() => setTempGender('남자')}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.genderOptionText, tempGender === '남자' && styles.genderOptionActiveText]}>남성</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.genderOptionButton, tempGender === '여자' && styles.genderOptionActive]}
                      onPress={() => setTempGender('여자')}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.genderOptionText, tempGender === '여자' && styles.genderOptionActiveText]}>여성</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 여행 취향 & 보안 설정 가로 배치 */}
              <View style={styles.twoColumnRow}>
                {/* 여행 취향 */}
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>여행 취향</Text>
                  <TouchableOpacity 
                    style={styles.actionNavButton}
                    onPress={() => setThemeModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionNavButtonText}>테마 변경</Text>
                    <Settings size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* 보안 설정 */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>보안 설정</Text>
                  <TouchableOpacity 
                    style={[styles.actionNavButton, user.socialLogin && styles.actionNavButtonDisabled]}
                    onPress={() => {
                      if (!user.socialLogin) {
                        setPasswordModalVisible(true);
                      }
                    }}
                    disabled={user.socialLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionNavButtonText}>비밀번호 변경</Text>
                    <Settings size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 오작동 우려로 스크롤 영역 하단 맨 끝에 계정 탈퇴하기 배치 */}
              <TouchableOpacity 
                style={styles.resignLinkButton}
                onPress={() => {
                  setEditModalVisible(false);
                  setTimeout(() => {
                    handleResign();
                  }, 200);
                }}
                activeOpacity={0.8}
              >
                <AlertTriangle size={14} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.resignLinkText}>계정 탈퇴하기</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* 스크롤 유도를 위한 하단 반투명 그라데이션 페이드 레이어 */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)', '#FFFFFF']}
              style={styles.fadeOverlay}
              pointerEvents="none"
            />

            {/* 스크롤 영역 밖 하단에 항시 고정된 변경사항 저장하기 버튼 */}
            <View style={styles.fixedBottomArea}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>변경사항 저장하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── 기존 Modal 포탈들 ── */}
      <UpdateThemeModal
        visible={isThemeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        onConfirm={handleUpdateTheme}
      />
      <UpdatePasswordModal
        visible={isPasswordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        onConfirm={handleUpdatePassword}
      />
    </View>
  );
}
