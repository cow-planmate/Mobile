
import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  LoadingSpinner,
  MenuModal,
  ShareModal,
  UpdatePasswordModal,
  UpdateThemeModal,
  UpdateValueModal,
} from '../../../components/common';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { deletePlans, leaveAsEditor } from '../../../api/trips';
import { invalidatePlanCaches } from '../../../hooks/planCache';
import {
  faT,
  faPen,
  faShare,
  faTrash,
  faUserMinus,
} from '@fortawesome/free-solid-svg-icons';

import {
  User,
  Settings,
  Award,
  Lock,
  X,
  Camera,
  AlertTriangle,
  Calendar,
  Trash2,
  CheckCircle2,
  Circle,
  Check,
  ChevronLeft,
  ChevronDown,
  MoreVertical,
  ListChecks,
} from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import ChecklistSheet from '../../itinerary/components/checklist/ChecklistSheet';
import { useChecklist } from '../../itinerary/hooks/useChecklistQueries';
import gravatarUrl from '../../../utils/gravatarUrl';
import { normalize } from '../../../utils/normalize';
import { parseLocalDate } from '../../../utils/timeUtils';
import DatePicker from 'react-native-date-picker';
import {
  toKoreanAge,
  formatBirthdate,
  toBirthdateString,
  parseBirthdate,
} from '../../../utils/birthdate';
import { MyStats } from '../../community/types';
import {
  getLevelProgress,
  levelBadgeColor,
  levelName,
} from '../../community/constants/levels';
import ProfileActivitySections from '../components/ProfileActivitySections';
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



/**
 * 일정 카드의 날짜 문자열('YYYY.MM.DD' 또는 'YYYY-MM-DD')을 로컬 자정 Date로 바꾼다.
 *
 * new Date('2026-08-10')은 UTC 자정으로 해석되어 UTC보다 이른 타임존에서
 * 하루가 밀린다. D-Day와 지난 일정 판정이 하루씩 어긋나므로 로컬로 파싱한다.
 */
const parsePlanDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = parseLocalDate(value.replace(/\./g, '-').substring(0, 10));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** 내가 만든 일정의 설정 메뉴 */
export const PLAN_MENU_OPTIONS = [
  { label: '제목 바꾸기', action: 'rename', icon: faT },
  { label: '수정하기', action: 'edit', icon: faPen },
  { label: '공유 및 초대', action: 'share', icon: faShare },
  { label: '삭제하기', action: 'delete', icon: faTrash, isDestructive: true },
];

/** 편집 권한만 받은 일정의 설정 메뉴 (삭제 대신 권한 포기) */
// 제목 바꾸기는 넣지 않는다. 서버가 PATCH /api/plan/{planId}/name을 OWNER에게만
// 허용해 편집자가 누르면 403이 온다. 일정 편집 화면에서는 실시간 편집으로 바꿀 수 있다.
export const SHARED_PLAN_MENU_OPTIONS = [
  { label: '수정하기', action: 'edit', icon: faPen },
  { label: '공유 및 초대', action: 'share', icon: faShare },
  {
    label: '편집 권한 포기하기',
    action: 'leave',
    icon: faUserMinus,
    isDestructive: true,
  },
];

const ItineraryCardItem = ({
  plan,
  onOpenMenu,
  navigation,
  isEditMode,
  isSelected,
  onSelectToggle,
  onOpenChecklist,
}: {
  plan: PlanItem;
  onOpenMenu: (plan: PlanItem) => void;
  navigation: any;
  isEditMode: boolean;
  isSelected: boolean;
  onSelectToggle: () => void;
  onOpenChecklist: (plan: PlanItem) => void;
}) => {

  // D-Day 계산
  const getDDay = (startDateStr?: string) => {
    const start = parsePlanDate(startDateStr);
    if (!start) return 'D-Day';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const dDay = getDDay(plan.startDate);
  const formattedPeriod = getFormattedPeriod(plan.startDate, plan.endDate);

  /**
   * 준비물 요약.
   *
   * 목록 스크롤만으로 카드 수만큼 요청이 나가지 않도록 조회는 끄고 캐시만 읽는다.
   * 시트를 한 번이라도 연 일정은 캐시가 채워져 있고, 시트에서 항목을 바꾸면
   * 같은 캐시를 구독하는 이 카드도 함께 갱신된다.
   */
  const { data: sharedChecklist } = useChecklist(plan.planId, 'shared', false);
  const { data: personalChecklist } = useChecklist(
    plan.planId,
    'personal',
    false,
  );
  const checklistItems = [
    ...(sharedChecklist ?? []),
    ...(personalChecklist ?? []),
  ];
  const hasChecklistCache = !!sharedChecklist || !!personalChecklist;
  const completedCount = checklistItems.filter(item => item.isChecked).length;


  // 테마 색상 분기 (공유받은 일정이면 오렌지색, 생성한 일정이면 파란색)
  const themeColor = plan.isShared ? '#F97316' : '#1344FF';

  const handleCardPress = () => {
    if (isEditMode) {
      onSelectToggle();
    } else {
      navigation.navigate('ItineraryView', {
        planId: plan.planId,
        tripName: plan.planName,
      });
    }
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.itineraryCardWrapper,
        { overflow: 'hidden' },
        isSelected 
          ? { borderColor: themeColor, borderWidth: 2 } 
          : (pressed ? { borderColor: themeColor, borderWidth: 2, backgroundColor: '#F3F4F6' } : null)
      ]}
    >
      {/* 카드 상단 배지 및 설정 버튼 */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.badgeRow}>
          {isEditMode && (
            <TouchableOpacity 
              style={styles.cardCheckboxWrap} 
              onPress={onSelectToggle}
              activeOpacity={0.8}
            >
              <View style={[
                styles.cardCheckboxSquare,
                isSelected && { backgroundColor: themeColor, borderColor: themeColor }
              ]}>
                {isSelected && <Check size={10} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          )}
          <View style={[styles.ddayBadge, plan.isShared && { backgroundColor: '#F97316' }]}>
            <Text style={styles.ddayText}>{dDay}</Text>
          </View>
          <Text style={styles.statusText}>예정됨</Text>
        </View>
        {!isEditMode && (
          <TouchableOpacity
            onPress={() => onOpenMenu(plan)}
            activeOpacity={0.7}
            hitSlop={8}
            style={plan.isShared ? { marginTop: normalize(16) } : null}
          >
            <MoreVertical size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* 카드 본문 타이틀 및 날짜 - 터치는 부모 Pressable이 처리함 */}
      <View style={{ pointerEvents: 'none' }}>
        <Text style={styles.cardTitleText} numberOfLines={1}>{plan.planName}</Text>
        <View style={styles.dateInfoRow}>
          <Calendar size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
          <Text style={styles.datePeriodText}>{formattedPeriod}</Text>
        </View>
      </View>

      {/* 체크리스트 영역 */}
      <TouchableOpacity
        style={styles.checklistContainer}
        onPress={() => onOpenChecklist(plan)}
        disabled={isEditMode}
        activeOpacity={0.7}
      >
        <View style={styles.checklistHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ListChecks size={12} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.checklistTitle}>준비물</Text>
          </View>
          <Text style={styles.checklistProgressText}>
            {hasChecklistCache
              ? `${completedCount}/${checklistItems.length}`
              : '확인하기'}
          </Text>
        </View>

        {hasChecklistCache && checklistItems.length > 0 ? (
          checklistItems.slice(0, 3).map(item => (
            <View key={item.itemId} style={styles.taskItemRow}>
              {item.isChecked ? (
                <CheckCircle2
                  size={16}
                  color="#1344FF"
                  style={{ marginRight: 8 }}
                />
              ) : (
                <Circle size={16} color="#D1D5DB" style={{ marginRight: 8 }} />
              )}
              <Text
                style={[
                  styles.taskText,
                  item.isChecked && styles.taskTextCompleted,
                ]}
                numberOfLines={1}
              >
                {item.content}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.taskItemRow}>
            <Circle size={16} color="#D1D5DB" style={{ marginRight: 8 }} />
            <Text
              style={[styles.taskText, { color: '#9CA3AF' }]}
              numberOfLines={1}
            >
              {hasChecklistCache
                ? '준비물을 추가해 보세요'
                : '눌러서 준비물을 확인하세요'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 공유 일정 전용 SHARED 코너 배지 */}
      {plan.isShared && (
        <View style={styles.sharedBadge}>
          <User size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.sharedBadgeText}>SHARED</Text>
        </View>
      )}
    </Pressable>
  );
};

interface ProfileScreenViewProps {
  loading: boolean;
  user: any;
  communityStats?: MyStats;
  isCommunityStatsLoading: boolean;
  isThemeModalVisible: boolean;
  setThemeModalVisible: (visible: boolean) => void;
  isPasswordModalVisible: boolean;
  setPasswordModalVisible: (visible: boolean) => void;
  handleUpdateNickname: (val: string) => Promise<void>;
  handleUpdateBirthdate: (val: string) => Promise<void>;
  handleUpdateGender: (val: string) => Promise<void>;
  handleUpdateTheme: () => void;
  handleUpdatePassword: (cur: string, n: string) => void;
  handleResign: () => void;
  /** 일정 제목 변경 (서버 반영 + 프로필 캐시 갱신은 컨테이너가 담당) */
  onRenamePlan: (planId: string, newName: string) => Promise<void>;
  /** 프로필 공개 여부 변경 */
  onChangeProfileVisibility: (profilePublic: boolean) => Promise<void>;
  /** 갤러리에서 선택한 프로필 사진 업로드 */
  onChangeProfileImage: () => Promise<void>;
  /** 등록된 프로필 사진 삭제 */
  onDeleteProfileImage: () => Promise<void>;
  isProfileImageUpdating: boolean;
  scrollToItinerary?: boolean;
}

export default function ProfileScreenView({
  loading,
  user,
  communityStats,
  isCommunityStatsLoading,
  isThemeModalVisible,
  setThemeModalVisible,
  isPasswordModalVisible,
  setPasswordModalVisible,
  handleUpdateNickname,
  handleUpdateBirthdate,
  handleUpdateGender,
  handleUpdateTheme,
  handleUpdatePassword,
  handleResign,
  onRenamePlan,
  onChangeProfileVisibility,
  onChangeProfileImage,
  onDeleteProfileImage,
  isProfileImageUpdating,
  scrollToItinerary,
}: ProfileScreenViewProps) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [tempBirthdate, setTempBirthdate] = useState('');
  const [isBirthdatePickerOpen, setBirthdatePickerOpen] = useState(false);
  const [tempGender, setTempGender] = useState('');
  const isNicknameUnchanged = tempNickname === user.name;
  const [plans, setPlans] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  /** 준비물 시트를 연 일정. null이면 시트가 닫힌 상태다. */
  const [checklistPlan, setChecklistPlan] = useState<PlanItem | null>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const [itineraryY, setItineraryY] = useState(0);

  // 스크롤 및 페이드 상태 관련 State
  const [showBottomFade, setShowBottomFade] = useState(false);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  
  // 힌트 화살표 애니메이션 객체
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (editModalVisible && showBottomFade) {
      // 스크롤 유도 바운싱 애니메이션 루프 시작
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [editModalVisible, showBottomFade, bounceAnim]);

  // 바닥 감지 및 스크롤 가능 여부 체크 헬퍼
  const checkScrollState = (contentHeight: number, layoutHeight: number, offsetY: number) => {
    const isScrollable = contentHeight > layoutHeight + 5;
    const isCloseToBottom = layoutHeight + offsetY >= contentHeight - 25;
    setShowBottomFade(isScrollable && !isCloseToBottom);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    checkScrollState(contentSize.height, layoutMeasurement.height, contentOffset.y);
  };

  React.useEffect(() => {
    if (scrollToItinerary && itineraryY > 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ y: itineraryY, animated: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [scrollToItinerary, itineraryY]);

  React.useEffect(() => {
    if (user && user.myPlans) {
      setPlans(user.myPlans);
    }
  }, [user]);

  // 스위치는 즉시 반응해야 하므로 낙관적으로 바꾸고, 실패하면 되돌린다.
  const [isProfilePublic, setIsProfilePublic] = useState(user.profilePublic);
  useEffect(() => {
    setIsProfilePublic(user.profilePublic);
  }, [user.profilePublic]);

  // ── 일정 카드 설정 메뉴 ──
  const [menuPlan, setMenuPlan] = useState<PlanItem | null>(null);
  const [isPlanMenuVisible, setPlanMenuVisible] = useState(false);
  const [isRenameVisible, setRenameVisible] = useState(false);
  const [isPlanShareVisible, setPlanShareVisible] = useState(false);

  const handleOpenPlanMenu = (plan: PlanItem) => {
    setMenuPlan(plan);
    setPlanMenuVisible(true);
  };

  const handleOpenChecklist = (plan: PlanItem) => {
    setChecklistPlan(plan);
  };

  const handlePlanMenuSelect = (action: string) => {
    setPlanMenuVisible(false);
    if (!menuPlan) return;

    switch (action) {
      case 'rename':
        setRenameVisible(true);
        break;
      case 'edit':
        navigation.navigate('ItineraryEditor', { planId: menuPlan.planId });
        break;
      case 'share':
        setPlanShareVisible(true);
        break;
      case 'delete':
      case 'leave':
        handleDeletePlan(menuPlan.planId, !!menuPlan.isShared);
        break;
    }
  };

  const handleConfirmRename = async (newName: string) => {
    if (!menuPlan) return;
    try {
      await onRenamePlan(menuPlan.planId, newName);
    } catch (e) {
      // 실패 문구는 컨테이너가 띄운다. 목록은 그대로 두고 모달만 닫는다.
      setRenameVisible(false);
      return;
    }
    setPlans(prev =>
      prev.map(p =>
        p.planId === menuPlan.planId ? { ...p, planName: newName.trim() } : p,
      ),
    );
    setRenameVisible(false);
  };

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
                // 로컬 목록만 지우면 캐시(staleTime 5분)에는 그대로 남아
                // 화면을 다시 열 때 되살아난다.
                void invalidatePlanCaches(queryClient);
                Toast.show({
                  type: 'success',
                  text1: '편집 권한 포기가 완료되었습니다.',
                  position: 'top',
                });
              } catch (e) {
                // 실패인데 성공으로 알리고 목록에서 지우면, 서버에는 남아 있는데
                // 화면에서만 사라져 사용자가 상태를 오해한다.
                console.error('편집 권한 포기 실패:', e);
                Toast.show({
                  type: 'error',
                  text1: '편집 권한 포기에 실패했습니다.',
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
                // 로컬 목록만 지우면 캐시(staleTime 5분)에는 그대로 남아
                // 화면을 다시 열 때 되살아난다.
                void invalidatePlanCaches(queryClient);
                Toast.show({
                  type: 'success',
                  text1: '일정이 정상적으로 삭제되었습니다.',
                  position: 'top',
                });
              } catch (e) {
                console.error('일정 삭제 실패:', e);
                Toast.show({
                  type: 'error',
                  text1: '일정 삭제에 실패했습니다.',
                  position: 'top',
                });
              }
            }
          }
        ]
      );
    }
  };

  /** 종료일(없으면 시작일)이 오늘보다 이전이면 지난 일정으로 본다. */
  const isPastPlan = (endDateStr?: string, startDateStr?: string) => {
    const targetDate = parsePlanDate(endDateStr || startDateStr);
    if (!targetDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return targetDate.getTime() < today.getTime();
  };

  const upcomingPlans = plans.filter(p => !isPastPlan(p.endDate, p.startDate));
  const pastPlans = plans.filter(p => isPastPlan(p.endDate, p.startDate));

  const allPlanIds = plans.map(p => p.planId);
  const isAllSelected = allPlanIds.length > 0 && allPlanIds.every(id => selectedPlanIds.includes(id));

  // 전체 선택 핸들러
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds(allPlanIds);
    }
  };

  // 선택 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedPlanIds.length === 0) return;
    Alert.alert(
      '선택 일정 삭제 및 권한 포기',
      `선택한 ${selectedPlanIds.length}개의 일정을 삭제 또는 권한 포기하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            const selected = plans.filter(p =>
              selectedPlanIds.includes(p.planId),
            );
            const ownedIds = selected.filter(p => !p.isShared).map(p => p.planId);
            const sharedIds = selected.filter(p => p.isShared).map(p => p.planId);

            const processedIds: string[] = [];
            let failed = 0;

            // 내가 소유한 일정은 일괄 삭제 API로 한 번에 처리한다.
            // 서버가 소유분만 걸러 실제 삭제된 ID를 돌려주므로 그 결과를 신뢰한다.
            if (ownedIds.length > 0) {
              try {
                const deleted = await deletePlans(ownedIds);
                processedIds.push(...deleted);
                failed += ownedIds.length - deleted.length;
              } catch (e) {
                console.error('일괄 삭제 실패:', e);
                failed += ownedIds.length;
              }
            }

            // 편집 권한만 있는 일정은 일괄 API 대상이 아니라 개별 처리한다.
            if (sharedIds.length > 0) {
              const results = await Promise.allSettled(
                sharedIds.map(id => leaveAsEditor(id)),
              );
              results.forEach((r, i) => {
                if (r.status === 'fulfilled') {
                  processedIds.push(sharedIds[i]);
                } else {
                  failed += 1;
                }
              });
            }

            // 실제로 처리된 것만 화면에서 지운다.
            // 예전에는 실패해도 전부 지우고 성공 토스트를 띄워, 서버에는 남아 있는데
            // 목록에서는 사라진 것처럼 보였다.
            if (processedIds.length > 0) {
              setPlans(prev => prev.filter(p => !processedIds.includes(p.planId)));
              // 로컬 목록만 지우면 캐시(staleTime 5분)에는 그대로 남아
              // 화면을 다시 열 때 되살아난다.
              void invalidatePlanCaches(queryClient);
            }
            setSelectedPlanIds([]);
            setIsEditMode(false);

            if (failed > 0) {
              Toast.show({
                type: processedIds.length > 0 ? 'info' : 'error',
                text1:
                  processedIds.length > 0
                    ? `${processedIds.length}개 처리, ${failed}개 실패했습니다.`
                    : '선택한 일정을 처리하지 못했습니다.',
                position: 'top',
              });
              return;
            }

            Toast.show({
              type: 'success',
              text1: '선택한 일정 처리가 완료되었습니다.',
              position: 'top',
            });
          },
        },
      ],
    );
  };

  // 취소 핸들러
  const handleCancelEditMode = () => {
    setSelectedPlanIds([]);
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner color={COLORS.primary} />
      </View>
    );
  }

  // 선호테마 추출 및 파싱
  // 나이는 저장하지 않고 생년월일에서 파생해 표시한다.
  const profileAge = toKoreanAge(user.birthdate);

  /**
   * 아바타 URL. 서버에 올린 프로필 이미지가 있으면 그것을 쓰고,
   * 없을 때만 이메일 기반 Gravatar로 대체한다.
   */
  const avatarUri =
    user.profileImageUrl || (user.email ? gravatarUrl(user.email, 200) : '');

  const handleToggleProfilePublic = async (next: boolean) => {
    setIsProfilePublic(next);
    try {
      await onChangeProfileVisibility(next);
    } catch (e) {
      setIsProfilePublic(!next);
      Toast.show({
        type: 'error',
        text1: '프로필 공개 설정 변경에 실패했습니다.',
        position: 'top',
      });
    }
  };

  const handleProfileImagePress = () => {
    if (isProfileImageUpdating) return;

    const actions: any[] = [
      {
        text: '갤러리에서 선택',
        onPress: onChangeProfileImage,
      },
    ];

    if (user.profileImageUrl) {
      actions.push({
        text: '현재 사진 삭제',
        style: 'destructive',
        onPress: onDeleteProfileImage,
      });
    }

    actions.push({ text: '취소', style: 'cancel' });
    Alert.alert('프로필 사진', '등록할 사진을 선택해주세요.', actions);
  };

  const preferredThemes = user.preferredThemes || [];
  const themeNames = preferredThemes.map((t: any) => t.preferredThemeName || t);
  const defaultThemes = ['해수욕장', '호텔', '한식', '고기집', '이자카야'];
  const displayThemes = themeNames.length > 0 ? themeNames : defaultThemes;
  const activityProgress = getLevelProgress(
    communityStats?.postCount ?? 0,
    communityStats?.commentCount ?? 0,
  );
  const currentLevel = communityStats?.level ?? activityProgress.currentTier.level;
  const badgeColor = levelBadgeColor(currentLevel);
  const activityValue = communityStats
    ? activityProgress.nextTier
      ? `${activityProgress.score} / ${activityProgress.nextTier.min} 활동`
      : `${activityProgress.score} 활동 · 최고 레벨`
    : '활동 통계를 불러오는 중';

  const handleOpenEditModal = () => {
    setTempNickname(user.name);
    setTempBirthdate(user.birthdate || '');
    setTempGender(user.gender);
    setEditModalVisible(true);
    // 모달이 열릴 때 스크롤 상태 초기화
    setShowBottomFade(false);
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
      if (tempBirthdate && tempBirthdate !== user.birthdate) {
        await handleUpdateBirthdate(tempBirthdate);
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

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'FeedTab' });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView
        ref={scrollRef}
        style={{ backgroundColor: '#F8F9FA' }}
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + normalize(40) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. 프로필 카드 ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            {/* 프로필 이미지 & 설정 버튼 */}
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <FastImage
                  source={{ uri: avatarUri, priority: FastImage.priority.normal }}
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
                <View style={[styles.levelBadge, { backgroundColor: badgeColor.bg }]}>
                  <Award size={10} color={badgeColor.text} />
                  <Text style={[styles.levelBadgeText, { color: badgeColor.text }]}>
                    Lv.{currentLevel} · {levelName(currentLevel)}
                  </Text>
                </View>
              </View>

              <View style={styles.emailRow}>
                <Text style={styles.emailText} numberOfLines={1}>{user.email || '이메일 없음'}</Text>
                <Text style={styles.emailDivider}>|</Text>
                <View style={styles.genderAgeBadge}>
                  <Text style={styles.genderAgeBadgeText}>
                    {user.gender || '미설정'} • {profileAge === null ? '미설정' : `만 ${profileAge}세`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 경험치 프로그레스 바 */}
          <View style={styles.experienceSection}>
            <View style={styles.experienceLabelRow}>
              <Text style={styles.experienceTitle}>현재 활동 점수</Text>
              <Text style={styles.experienceValue}>{activityValue}</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${communityStats ? activityProgress.progressPercent : 0}%`,
                    backgroundColor: badgeColor.text,
                  },
                ]}
              />
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
              <Text style={styles.statNumber}>
                {plans.filter((p: any) => !p.isShared).length}
              </Text>
              <Text style={styles.statLabel}>나의 일정</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>
                {plans.filter((p: any) => p.isShared).length}
              </Text>
              <Text style={styles.statLabel}>초대된 일정</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>
                {isCommunityStatsLoading ? '-' : activityProgress.score}
              </Text>
              <Text style={styles.statLabel}>커뮤니티 활동</Text>
            </View>
          </View>
        </View>

        {/* ── 2. 내 업적 카드 ── */}
        <View style={[styles.achievementCard, { opacity: 0.6 }]} pointerEvents="none">
          <View style={styles.achievementHeader}>
            <View style={styles.achievementTitleRow}>
              <Award size={18} color="#9CA3AF" />
              <Text style={[styles.achievementTitle, { color: '#9CA3AF' }]}>내 업적 (준비중)</Text>
            </View>
            <View style={[styles.achievementProgressBadge, { backgroundColor: '#E5E7EB' }]}>
              <Text style={[styles.achievementProgressText, { color: '#9CA3AF' }]}>0 / 5 달성</Text>
            </View>
          </View>

          <View style={styles.badgeList}>
            {/* 업적 1 */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>첫 걸음</Text>
            </View>

            {/* 업적 2 */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>계획의 달인</Text>
            </View>

            {/* 업적 3 */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>열혈 리뷰어</Text>
            </View>

            {/* 업적 4 */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>베스트 파트너</Text>
            </View>

            {/* 업적 5 */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>전국 제패</Text>
            </View>
          </View>
        </View>

        {/* ── 2.1. 여행 상세 일정 카드 ── */}
        <View 
          style={styles.itineraryDetailCard}
          onLayout={e => setItineraryY(e.nativeEvent.layout.y)}
        >


          <View style={styles.itineraryHeader}>
            <View style={styles.itineraryTitleRow}>
              <Calendar size={18} color="#1344FF" />
              <Text style={styles.itineraryTitle}>여행 상세 일정</Text>
            </View>
            {!isEditMode ? (
              <TouchableOpacity 
                style={styles.itineraryManageButton}
                onPress={() => setIsEditMode(true)}
                activeOpacity={0.8}
              >
                <Settings size={12} color="#4B5563" style={{ marginRight: 4 }} />
                <Text style={styles.itineraryManageText}>일정 관리</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.editActionCancel} 
                onPress={handleCancelEditMode}
                activeOpacity={0.8}
              >
                <Text style={styles.editActionCancelText}>취소</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 일정 관리 다중 선택 서브 툴바 */}
          {isEditMode && (
            <View style={styles.editSubToolbar}>
              {/* 전체 선택 */}
              <TouchableOpacity 
                style={styles.editActionSelectAll} 
                onPress={handleSelectAll}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.selectAllCheckSquare,
                  isAllSelected && styles.selectAllCheckSquareChecked
                ]}>
                  {isAllSelected && <Check size={8} color="#FFFFFF" />}
                </View>
                <Text style={styles.editActionSelectAllText}>전체 선택</Text>
              </TouchableOpacity>

              {/* 선택 삭제 */}
              <TouchableOpacity 
                style={[
                  styles.editActionDeleteSelected,
                  selectedPlanIds.length === 0 && { opacity: 0.5 }
                ]} 
                onPress={handleDeleteSelected}
                disabled={selectedPlanIds.length === 0}
                activeOpacity={0.8}
              >
                <Trash2 size={12} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.editActionDeleteSelectedText}>선택 삭제 ({selectedPlanIds.length})</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 진행 중/예정된 일정 블록 */}
          {upcomingPlans.length > 0 ? (
            <View style={{ marginBottom: normalize(16) }}>
              <View style={styles.sectionSubtitleRow}>
                <Text style={styles.sectionSubtitleText}>예정된 여행</Text>
              </View>
              <View>
                {upcomingPlans.map((plan: any) => {
                  const isSelected = selectedPlanIds.includes(plan.planId);
                  const onSelectToggle = () => {
                    if (isSelected) {
                      setSelectedPlanIds(prev => prev.filter(id => id !== plan.planId));
                    } else {
                      setSelectedPlanIds(prev => [...prev, plan.planId]);
                    }
                  };
                  return (
                    <ItineraryCardItem 
                      key={plan.planId} 
                      plan={plan} 
                      onOpenMenu={handleOpenPlanMenu}
                      navigation={navigation}
                      isEditMode={isEditMode}
                      isSelected={isSelected}
                      onSelectToggle={onSelectToggle}
                      onOpenChecklist={handleOpenChecklist}
                    />
                  );
                })}
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
                {pastPlans.map((plan: any) => {
                  const isSelected = selectedPlanIds.includes(plan.planId);
                  const isPastShared = !!plan.isShared;
                  const pastThemeColor = '#6B7280'; // 지난 여행의 테두리 및 체크박스는 회색으로 통일
                  
                  const onSelectToggle = () => {
                    if (isSelected) {
                      setSelectedPlanIds(prev => prev.filter(id => id !== plan.planId));
                    } else {
                      setSelectedPlanIds(prev => [...prev, plan.planId]);
                    }
                  };

                  return (
                    <TouchableOpacity 
                      key={plan.planId} 
                      style={[
                        styles.pastPlanItem,
                        isSelected && { borderColor: pastThemeColor, borderWidth: 2 }
                      ]}
                      onPress={() => {
                        if (isEditMode) {
                          onSelectToggle();
                        } else {
                          navigation.navigate('ItineraryView', {
                            planId: plan.planId,
                            tripName: plan.planName,
                          });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {isEditMode && (
                          <TouchableOpacity 
                            style={styles.cardCheckboxWrap} 
                            onPress={onSelectToggle}
                            activeOpacity={0.8}
                          >
                            <View style={[
                              styles.cardCheckboxSquare,
                              isSelected && { backgroundColor: pastThemeColor, borderColor: pastThemeColor }
                            ]}>
                              {isSelected && <Check size={10} color="#FFFFFF" />}
                            </View>
                          </TouchableOpacity>
                        )}
                        
                        <View style={styles.pastPlanLeft}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.pastPlanTitleText}>{plan.planName}</Text>
                            {isPastShared && (
                              <View style={[styles.pastPlanBadge, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', borderWidth: 1 }]}>
                                <Text style={[styles.pastPlanBadgeText, { color: '#6B7280' }]}>SHARED</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.pastPlanDateText}>
                            {getFormattedPeriod(plan.startDate, plan.endDate)}
                          </Text>
                        </View>
                      </View>

                      {!isEditMode ? (
                        <TouchableOpacity
                          onPress={() =>
                            handleOpenPlanMenu({ ...plan, isShared: isPastShared })
                          }
                          activeOpacity={0.7}
                          hitSlop={8}
                          style={{ padding: 4 }}
                        >
                          <MoreVertical size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.pastPlanBadge}>
                          <Text style={styles.pastPlanBadgeText}>여행 완료</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noPastRecordText}>지난 여행 기록이 없습니다.</Text>
            )}
          </View>
        </View>
        <ProfileActivitySections plans={plans} />
      </ScrollView>

      {/* 생년월일 선택기. 수정 모달 위에 떠야 하므로 형제로 둔다. */}
      <DatePicker
        modal
        mode="date"
        title="생년월일 선택"
        confirmText="확인"
        cancelText="취소"
        locale="ko"
        maximumDate={new Date()}
        open={isBirthdatePickerOpen}
        date={parseBirthdate(tempBirthdate)}
        onConfirm={date => {
          setBirthdatePickerOpen(false);
          setTempBirthdate(toBirthdateString(date));
        }}
        onCancel={() => setBirthdatePickerOpen(false)}
      />

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
              <TouchableOpacity
                style={styles.avatarEditContainer}
                onPress={handleProfileImagePress}
                disabled={isProfileImageUpdating}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="프로필 사진 변경"
              >
                {avatarUri ? (
                  <FastImage
                    source={{ uri: avatarUri, priority: FastImage.priority.normal }}
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
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollArea}
              contentContainerStyle={styles.editDialogBody} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEventThrottle={16}
              onScroll={handleScroll}
              onContentSizeChange={(width, height) => {
                contentHeightRef.current = height;
                checkScrollState(contentHeightRef.current, layoutHeightRef.current, 0);
              }}
              onLayout={(event) => {
                layoutHeightRef.current = event.nativeEvent.layout.height;
                checkScrollState(contentHeightRef.current, layoutHeightRef.current, 0);
              }}
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
                    style={[styles.checkButton, isNicknameUnchanged && { opacity: 0.5 }]}
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
                    disabled={isNicknameUnchanged}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.checkButtonText, isNicknameUnchanged && { color: '#9CA3AF' }]}>중복 확인</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 나이 & 성별 가로 배치 */}
              <View style={styles.twoColumnRow}>
                {/* 생년월일 */}
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>생년월일</Text>
                  <TouchableOpacity
                    // textInput은 TextInput용이라 높이만 있고 정렬이 없다.
                    // View로 쓰려면 세로 가운데 정렬을 직접 준다.
                    style={[styles.textInput, styles.pickerField]}
                    onPress={() => setBirthdatePickerOpen(true)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.pickerFieldText,
                        !tempBirthdate && styles.pickerFieldPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {tempBirthdate ? formatBirthdate(tempBirthdate) : '선택'}
                    </Text>
                  </TouchableOpacity>
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
                      <Text style={[styles.genderOptionText, tempGender === '남자' && styles.genderOptionActiveText]}>남자</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.genderOptionButton, tempGender === '여자' && styles.genderOptionActive]}
                      onPress={() => setTempGender('여자')}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.genderOptionText, tempGender === '여자' && styles.genderOptionActiveText]}>여자</Text>
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

              {/* 프로필 공개 설정 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>프로필 공개</Text>
                <View style={styles.visibilityRow}>
                  <Text style={styles.visibilityDescription}>
                    {isProfilePublic
                      ? '다른 사용자가 내 프로필을 볼 수 있어요.'
                      : '나만 내 프로필을 볼 수 있어요.'}
                  </Text>
                  <Switch
                    value={isProfilePublic}
                    onValueChange={handleToggleProfilePublic}
                    trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                    thumbColor="#FFFFFF"
                  />
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

            {/* 동적으로 나타나고 유도 화살표가 적용된 하단 그라데이션 레이어 */}
            {showBottomFade && (
              <View style={styles.fadeOverlayContainer} pointerEvents="none">
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)', '#FFFFFF']}
                  style={styles.fadeOverlay}
                />
                <Animated.View 
                  style={[
                    styles.scrollHintContainer,
                    { transform: [{ translateY: bounceAnim }] }
                  ]}
                >
                  <ChevronDown size={14} color="#1344FF" />
                  <Text style={styles.scrollHintText}>더 보려면 스크롤</Text>
                </Animated.View>
              </View>
            )}

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

      {/* ── 일정 카드 설정 메뉴 ── */}
      <MenuModal
        visible={isPlanMenuVisible}
        title={menuPlan?.planName ?? '일정 설정'}
        options={
          menuPlan?.isShared ? SHARED_PLAN_MENU_OPTIONS : PLAN_MENU_OPTIONS
        }
        onClose={() => setPlanMenuVisible(false)}
        onSelect={handlePlanMenuSelect}
      />

      <UpdateValueModal
        visible={isRenameVisible}
        title="제목 바꾸기"
        label="일정 제목"
        initialValue={menuPlan?.planName ?? ''}
        onClose={() => setRenameVisible(false)}
        onConfirm={handleConfirmRename}
      />

      {menuPlan && (
        <ShareModal
          visible={isPlanShareVisible}
          onClose={() => setPlanShareVisible(false)}
          planId={menuPlan.planId}
          isOwner={!menuPlan.isShared}
        />
      )}

      {checklistPlan && (
        <ChecklistSheet
          visible
          onClose={() => setChecklistPlan(null)}
          planId={checklistPlan.planId}
        />
      )}
    </View>
  );
}
