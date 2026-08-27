
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { INITIAL_TAB } from '../../../navigation/types';
import { useAlert } from '../../../contexts/AlertContext';
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
import {
  PLAN_NAME_MAX_LENGTH,
  deletePlans,
  leaveAsEditor,
} from '../../../api/trips';
import { invalidatePlanCaches } from '../../../hooks/planCache';

import User from 'lucide-react-native/dist/esm/icons/user';
import Settings from 'lucide-react-native/dist/esm/icons/settings';
import Award from 'lucide-react-native/dist/esm/icons/award';
import Lock from 'lucide-react-native/dist/esm/icons/lock';
import X from 'lucide-react-native/dist/esm/icons/x';
import Camera from 'lucide-react-native/dist/esm/icons/camera';
import AlertTriangle from 'lucide-react-native/dist/esm/icons/triangle-alert';
import Calendar from 'lucide-react-native/dist/esm/icons/calendar';
import Trash2 from 'lucide-react-native/dist/esm/icons/trash-2';
import CheckCircle2 from 'lucide-react-native/dist/esm/icons/circle-check';
import Circle from 'lucide-react-native/dist/esm/icons/circle';
import Check from 'lucide-react-native/dist/esm/icons/check';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import ChevronDown from 'lucide-react-native/dist/esm/icons/chevron-down';
import MoreVertical from 'lucide-react-native/dist/esm/icons/ellipsis-vertical';
import ListChecks from 'lucide-react-native/dist/esm/icons/list-checks';
import PenLine from 'lucide-react-native/dist/esm/icons/pen-line';
import Share2 from 'lucide-react-native/dist/esm/icons/share-2';
import Trash2Icon from 'lucide-react-native/dist/esm/icons/trash-2';
import Type from 'lucide-react-native/dist/esm/icons/type';
import UserMinus from 'lucide-react-native/dist/esm/icons/user-minus';
import ChecklistSheet from '../../itinerary/components/checklist/ChecklistSheet';
import { useChecklist } from '../../itinerary/hooks/useChecklistQueries';
import gravatarUrl from '../../../utils/gravatarUrl';
import { resolveAvatarUrl } from '../../community/utils/avatar';
import FallbackImage from '../../../components/common/FallbackImage';
import { normalize } from '../../../utils/normalize';
import { allSettledWithConcurrency } from '../../../utils/concurrency';
import { toPlanDate } from '../utils/profileCalendar';
import { formatPeriod } from '../../../utils/timeUtils';
import {
  USER_PROFILE_QUERY_KEY,
  UserProfile,
  ProfilePlan,
} from '../../../hooks/useUserProfile';
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
import {
  ProfileCalendarSection,
  ProfileCommunitySection,
  ProfileFootprintSection,
  ProfileTravelLogSection,
} from '../components/ProfileActivitySections';
import { UnderlineTabs } from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import FeedbackModal from '../components/FeedbackModal';
import { verifyNicknameAvailable } from '../../../api/auth';
import { getDisplayErrorMessage } from '../../../utils/errorHandler';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import {
  NICKNAME_MAX_LENGTH,
  getNicknameLengthError,
} from '../../../utils/nickname';
import { styles, COLORS } from './ProfileScreen.styles';

const LEAVE_EDITOR_CONCURRENCY = 4;

type ProfileSection = 'travel' | 'community' | 'calendar';
type TripTab = 'upcoming' | 'past';

const PROFILE_SECTIONS = [
  { key: 'travel', label: '여행' },
  { key: 'community', label: '커뮤니티' },
  { key: 'calendar', label: '캘린더' },
];

const getFormattedPeriod = (start?: string, end?: string) => {
  if (!start) return '날짜 확인 필요';
  return formatPeriod(start, end);
};

interface PlanItem {
  planId: string;
  planName: string;
  startDate?: string;
  endDate?: string;
  isShared?: boolean;
}

export const PLAN_MENU_OPTIONS = [
  { label: '제목 바꾸기', action: 'rename', icon: Type },
  { label: '수정하기', action: 'edit', icon: PenLine },
  { label: '공유 및 초대', action: 'share', icon: Share2 },
  { label: '삭제하기', action: 'delete', icon: Trash2Icon, isDestructive: true },
];

export const SHARED_PLAN_MENU_OPTIONS = [
  { label: '수정하기', action: 'edit', icon: PenLine },
  { label: '공유 및 초대', action: 'share', icon: Share2 },
  {
    label: '편집 권한 포기하기',
    action: 'leave',
    icon: UserMinus,
    isDestructive: true,
  },
];

const ItineraryCardItem = React.memo(function ItineraryCardItem({
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
  onSelectToggle: (planId: string) => void;
  onOpenChecklist: (plan: PlanItem) => void;
}) {

  const getDDay = (startDateStr?: string) => {
    const start = toPlanDate(startDateStr);
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

  const themeColor = plan.isShared ? '#F97316' : tokens.colors.primary;

  const handleSelectToggle = () => onSelectToggle(plan.planId);

  const handleCardPress = () => {
    if (isEditMode) {
      handleSelectToggle();
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
          : (pressed ? { borderColor: themeColor, borderWidth: 2, backgroundColor: tokens.colors.borderLight } : null)
      ]}
    >

      <View style={styles.cardHeaderRow}>
        <View style={styles.badgeRow}>
          {isEditMode && (
            <TouchableOpacity 
              style={styles.cardCheckboxWrap}
              onPress={handleSelectToggle}
              activeOpacity={0.8}
              hitSlop={16}
            >
              <View style={[
                styles.cardCheckboxSquare,
                isSelected && { backgroundColor: themeColor, borderColor: themeColor }
              ]}>
                {isSelected && <Check size={10} color={tokens.colors.white} />}
              </View>
            </TouchableOpacity>
          )}
          <View style={[styles.ddayBadge, plan.isShared && styles.ddayBadgeShared]}>
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
            accessibilityRole="button"
            accessibilityLabel={`${plan.planName} 메뉴 열기`}
          >
            <MoreVertical size={18} color={tokens.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardInfoStatic}>
        <Text style={styles.cardTitleText} numberOfLines={1}>{plan.planName}</Text>
        <View style={styles.dateInfoRow}>
          <Calendar size={12} color={tokens.colors.textTertiary} style={styles.dateIconSpacing} />
          <Text style={styles.datePeriodText}>{formattedPeriod}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checklistContainer}
        onPress={() => onOpenChecklist(plan)}
        disabled={isEditMode}
        activeOpacity={0.7}
        accessibilityState={{ disabled: isEditMode }}
      >
        <View style={styles.checklistHeader}>
          <View style={styles.checklistHeaderLeft}>
            <ListChecks size={12} color={tokens.colors.textSecondary} style={styles.checklistIconSpacing} />
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
                  color={tokens.colors.primary}
                  style={styles.taskIconSpacing}
                />
              ) : (
                <Circle size={16} color={tokens.colors.textTertiary} style={styles.taskIconSpacing} />
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
            <Circle size={16} color={tokens.colors.textTertiary} style={styles.taskIconSpacing} />
            <Text
              style={[styles.taskText, { color: tokens.colors.textTertiary }]}
              numberOfLines={1}
            >
              {hasChecklistCache
                ? '준비물을 추가해 보세요'
                : '눌러서 준비물을 확인하세요'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {plan.isShared && (
        <View style={styles.sharedBadge}>
          <User size={10} color={tokens.colors.white} style={styles.sharedBadgeIconSpacing} />
          <Text style={styles.sharedBadgeText}>SHARED</Text>
        </View>
      )}
    </Pressable>
  );
});

interface ProfileScreenViewProps {
  loading: boolean;

  loadError?: boolean;
  onRetryLoad?: () => void;
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

  onRenamePlan: (planId: string, newName: string) => Promise<void>;

  onChangeProfileVisibility: (
    profilePublic: boolean,
  ) => Promise<void | undefined>;
  isProfileVisibilityUpdating?: boolean;

  onChangeProfileImage: () => Promise<void>;

  onDeleteProfileImage: () => Promise<void>;
  isProfileImageUpdating: boolean;
  scrollToItinerary?: boolean;
}

export default function ProfileScreenView({
  loading,
  loadError,
  onRetryLoad,
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
  isProfileVisibilityUpdating = false,
  onChangeProfileImage,
  onDeleteProfileImage,
  isProfileImageUpdating,
  scrollToItinerary,
}: ProfileScreenViewProps) {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [tempBirthdate, setTempBirthdate] = useState('');
  const [isBirthdatePickerOpen, setBirthdatePickerOpen] = useState(false);
  const [tempGender, setTempGender] = useState('');
  const [isNicknameChecking, setIsNicknameChecking] = useState(false);
  const isNicknameUnchanged = tempNickname.trim() === user.name;
  const [plans, setPlans] = useState<any[]>([]);

  // 로컬 plans 상태와 USER_PROFILE_QUERY_KEY 캐시를 한 번에 갱신해 두 값이
  // 어긋나지 않게 한다. invalidatePlanCaches의 백그라운드 리페치가 끝나기 전에도
  // 캐시가 이미 최신 상태라 화면 재진입 시 삭제/이름변경한 일정이 되살아나지 않는다.
  const patchPlansCache = useCallback(
    (mutate: (list: ProfilePlan[]) => ProfilePlan[]) => {
      queryClient.setQueryData<UserProfile>(USER_PROFILE_QUERY_KEY, prev =>
        prev ? { ...prev, myPlans: mutate(prev.myPlans) } : prev,
      );
    },
    [queryClient],
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  const [checklistPlan, setChecklistPlan] = useState<PlanItem | null>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const [itineraryY, setItineraryY] = useState(0);

  // 섹션이 6개라 세로로 쌓으면 스크롤이 과도해진다 — 프로필 헤더만 고정하고
  // 나머지는 탭으로 나눈다 (웹 마이페이지 섹션 구성을 모바일 깊이로 재배치)
  const [profileSection, setProfileSection] = useState<ProfileSection>('travel');
  // 여행 일정은 예정/지난을 탭으로 나눈다 (웹 TripSection과 동일)
  const [tripTab, setTripTab] = useState<TripTab>('upcoming');

  const [showBottomFade, setShowBottomFade] = useState(false);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!(editModalVisible && showBottomFade)) {
      bounceAnim.setValue(0);
      return;
    }

    const loop = Animated.loop(
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
    );
    loop.start();
    return () => loop.stop();
  }, [editModalVisible, showBottomFade, bounceAnim]);

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

  const [isProfilePublic, setIsProfilePublic] = useState(user.profilePublic);
  const profileVisibilityLock = useSubmitLock();
  const profileSaveLock = useSubmitLock();
  useEffect(() => {
    setIsProfilePublic(user.profilePublic);
  }, [user.profilePublic]);

  const [menuPlan, setMenuPlan] = useState<PlanItem | null>(null);
  const [isPlanMenuVisible, setPlanMenuVisible] = useState(false);
  const [isRenameVisible, setRenameVisible] = useState(false);
  const [isPlanShareVisible, setPlanShareVisible] = useState(false);

  const handleOpenPlanMenu = useCallback((plan: PlanItem) => {
    setMenuPlan(plan);
    setPlanMenuVisible(true);
  }, []);

  const handleOpenChecklist = useCallback((plan: PlanItem) => {
    setChecklistPlan(plan);
  }, []);

  const handleSelectToggle = useCallback((planId: string) => {
    setSelectedPlanIds(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId],
    );
  }, []);

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
      showAlert({
        title: '공유 일정 편집 권한 포기',
        message: '이 일정의 편집 권한을 포기하시겠습니까?',
        type: 'confirm',
        buttons: [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            style: 'destructive',
            onPress: async () => {
              try {
                await leaveAsEditor(planId);
                setPlans(prev => prev.filter(p => p.planId !== planId));
                patchPlansCache(list => list.filter(p => p.planId !== planId));

                void invalidatePlanCaches(queryClient);
                Toast.show({
                  type: 'success',
                  text1: '편집 권한을 포기했어요.',
                  position: 'top',
                });
              } catch (e) {

                console.error('편집 권한 포기 실패:', e);
                Toast.show({
                  type: 'error',
                  text1: '편집 권한을 포기하지 못했어요.',
                  position: 'top',
                });
              }
            }
          }
        ]
      });
    } else {
      showAlert({
        title: '일정 삭제',
        message: '이 일정을 정말 삭제할까요? 되돌릴 수 없어요.',
        type: 'confirm',
        buttons: [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            style: 'destructive',
            onPress: async () => {
              try {
                await axios.delete(resolveApiUrl(`/api/plan/${planId}`));
                setPlans(prev => prev.filter(p => p.planId !== planId));
                patchPlansCache(list => list.filter(p => p.planId !== planId));

                void invalidatePlanCaches(queryClient);
                Toast.show({
                  type: 'success',
                  text1: '일정을 삭제했어요.',
                  position: 'top',
                });
              } catch (e) {
                console.error('일정 삭제 실패:', e);
                Toast.show({
                  type: 'error',
                  text1: '일정을 삭제하지 못했어요.',
                  position: 'top',
                });
              }
            }
          }
        ]
      });
    }
  };

  const isPastPlan = (endDateStr?: string, startDateStr?: string) => {
    const targetDate = toPlanDate(endDateStr || startDateStr);
    if (!targetDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return targetDate.getTime() < today.getTime();
  };

  const { upcomingPlans, pastPlans } = useMemo(
    () => ({
      upcomingPlans: plans.filter(p => !isPastPlan(p.endDate, p.startDate)),
      pastPlans: plans.filter(p => isPastPlan(p.endDate, p.startDate)),
    }),
    [plans],
  );

  const allPlanIds = useMemo(() => plans.map(p => p.planId), [plans]);
  const isAllSelected = allPlanIds.length > 0 && allPlanIds.every(id => selectedPlanIds.includes(id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds(allPlanIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPlanIds.length === 0) return;
    showAlert({
      title: '선택 일정 삭제 및 권한 포기',
      message: `선택한 ${selectedPlanIds.length}개의 일정을 삭제하거나 권한을 포기할까요? 되돌릴 수 없어요.`,
      type: 'confirm',
      buttons: [
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

            if (sharedIds.length > 0) {
              const results = await allSettledWithConcurrency(
                sharedIds.map(id => () => leaveAsEditor(id)),
                LEAVE_EDITOR_CONCURRENCY,
              );
              results.forEach((r, i) => {
                if (r.status === 'fulfilled') {
                  processedIds.push(sharedIds[i]);
                } else {
                  failed += 1;
                }
              });
            }

            if (processedIds.length > 0) {
              setPlans(prev => prev.filter(p => !processedIds.includes(p.planId)));
              patchPlansCache(list =>
                list.filter(p => !processedIds.includes(p.planId)),
              );

              void invalidatePlanCaches(queryClient);
            }
            setSelectedPlanIds([]);
            setIsEditMode(false);

            if (failed > 0) {
              Toast.show({
                type: processedIds.length > 0 ? 'info' : 'error',
                text1:
                  processedIds.length > 0
                    ? `${processedIds.length}개 처리, ${failed}개는 실패했어요.`
                    : '선택한 일정을 처리하지 못했어요.',
                position: 'top',
              });
              return;
            }

            Toast.show({
              type: 'success',
              text1: '선택한 일정을 처리했어요.',
              position: 'top',
            });
          },
        },
      ],
    });
  };

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

  if (loadError) {
    return (
      <View style={styles.loadErrorContainer}>
        <Text style={styles.loadErrorText}>
          프로필을 불러오지 못했어요.{'\n'}잠시 후 다시 시도해 주세요.
        </Text>
        <TouchableOpacity
          style={styles.loadErrorButton}
          onPress={onRetryLoad}
          activeOpacity={0.8}
        >
          <Text style={styles.loadErrorButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profileAge = toKoreanAge(user.birthdate);

  // 커뮤니티 화면과 같은 규칙을 태운다. 백엔드가 사설망 URL을 내려주면
  // 여기만 그대로 렌더해 공백이 되던 불일치가 있었다.
  const avatarUri =
    resolveAvatarUrl(user.profileImageUrl, null, 200) ??
    (user.email ? gravatarUrl(user.email, 200) : null);

  const handleToggleProfilePublic = (next: boolean) =>
    profileVisibilityLock.runExclusive(async () => {
      setIsProfilePublic(next);
      try {
        await onChangeProfileVisibility(next);
      } catch (e) {
        setIsProfilePublic(!next);
        Toast.show({
          type: 'error',
          text1: '프로필 공개 설정을 변경하지 못했어요.',
          position: 'top',
        });
      }
    });

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

    setShowBottomFade(false);
  };

  const handleCheckNickname = async () => {
    const nickname = tempNickname.trim();
    const lengthError = getNicknameLengthError(nickname);
    if (lengthError) {
      Toast.show({ type: 'error', text1: lengthError, position: 'top' });
      return;
    }

    setIsNicknameChecking(true);
    try {
      const available = await verifyNicknameAvailable(nickname);
      Toast.show({
        type: available ? 'success' : 'error',
        text1: available
          ? '사용할 수 있는 닉네임이에요.'
          : '이미 사용 중인 닉네임이에요.',
        position: 'top',
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: getDisplayErrorMessage(e, '닉네임을 확인하지 못했어요.'),
        position: 'top',
      });
    } finally {
      setIsNicknameChecking(false);
    }
  };

  const handleSaveProfile = () =>
    profileSaveLock.runExclusive(async () => {
      try {
        const nickname = tempNickname.trim();
        const nicknameError = getNicknameLengthError(nickname);
        if (nicknameError) {
          Toast.show({ type: 'error', text1: nicknameError, position: 'top' });
          return;
        }

        if (tempBirthdate && tempBirthdate >= toBirthdateString(new Date())) {
          Toast.show({
            type: 'error',
            text1: '생년월일을 다시 확인해 주세요.',
            position: 'top',
          });
          return;
        }

        let hasChange = false;
        if (nickname !== user.name) {
          await handleUpdateNickname(nickname);
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
            text1: '프로필 정보를 저장했어요.',
            position: 'top',
          });
        }
        setEditModalVisible(false);
      } catch (err) {

        if (__DEV__) console.log('Failed to save profile modifications', err);
      }
    });

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: INITIAL_TAB });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={8}
        >
          <ChevronLeft size={24} color={tokens.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        ref={scrollRef}
        style={{ backgroundColor: tokens.colors.surface }}
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: normalize(40) }]}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>

            <View style={styles.avatarContainer}>
              <FallbackImage
                uri={avatarUri}
                style={styles.avatarImage}
                fallback={
                  <View style={styles.avatarPlaceholder}>
                    <User size={40} color={tokens.colors.textTertiary} />
                  </View>
                }
              />
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={handleOpenEditModal}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="프로필 편집"
                hitSlop={12}
              >
                <Settings size={12} color={tokens.colors.white} />
              </TouchableOpacity>
            </View>

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

          <View style={styles.tagSection}>
            {displayThemes.map((theme: string, idx: number) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestTagText}>
                  {theme.startsWith('#') ? theme : `#${theme}`}
                </Text>
              </View>
            ))}
          </View>

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

        <View style={styles.sectionTabsWrap}>
          <UnderlineTabs
            items={PROFILE_SECTIONS}
            selectedKey={profileSection}
            onSelect={key => setProfileSection(key as ProfileSection)}
            scrollable={false}
          />
        </View>

        {profileSection === 'community' && (
        <View style={[styles.achievementCard, styles.achievementCardDisabled]} pointerEvents="none">
          <View style={styles.achievementHeader}>
            <View style={styles.achievementTitleRow}>
              <Award size={18} color={tokens.colors.textTertiary} />
              <Text style={[styles.achievementTitle, { color: tokens.colors.textTertiary }]}>내 업적 (준비중)</Text>
            </View>
            <View style={[styles.achievementProgressBadge, { backgroundColor: tokens.colors.border }]}>
              <Text style={[styles.achievementProgressText, { color: tokens.colors.textTertiary }]}>0 / 5 달성</Text>
            </View>
          </View>

          <View style={styles.badgeList}>

            <View style={[styles.achievementBadge, { backgroundColor: tokens.colors.borderLight }]}>
              <Lock size={11} color={tokens.colors.textTertiary} />
              <Text style={[styles.badgeText, { color: tokens.colors.textTertiary }]}>첫 걸음</Text>
            </View>

            <View style={[styles.achievementBadge, { backgroundColor: tokens.colors.borderLight }]}>
              <Lock size={11} color={tokens.colors.textTertiary} />
              <Text style={[styles.badgeText, { color: tokens.colors.textTertiary }]}>계획의 달인</Text>
            </View>

            <View style={[styles.achievementBadge, { backgroundColor: tokens.colors.borderLight }]}>
              <Lock size={11} color={tokens.colors.textTertiary} />
              <Text style={[styles.badgeText, { color: tokens.colors.textTertiary }]}>열혈 리뷰어</Text>
            </View>

            <View style={[styles.achievementBadge, { backgroundColor: tokens.colors.borderLight }]}>
              <Lock size={11} color={tokens.colors.textTertiary} />
              <Text style={[styles.badgeText, { color: tokens.colors.textTertiary }]}>베스트 파트너</Text>
            </View>

            <View style={[styles.achievementBadge, { backgroundColor: tokens.colors.borderLight }]}>
              <Lock size={11} color={tokens.colors.textTertiary} />
              <Text style={[styles.badgeText, { color: tokens.colors.textTertiary }]}>전국 제패</Text>
            </View>
          </View>
        </View>

        )}

        {profileSection === 'community' && <ProfileCommunitySection />}

        {profileSection === 'calendar' && (
          <>
            <ProfileCalendarSection plans={plans} />
            <ProfileFootprintSection plans={plans} />
          </>
        )}

        {profileSection === 'travel' && (
        <View
          style={styles.itineraryDetailCard}
          onLayout={e => setItineraryY(e.nativeEvent.layout.y)}
        >

          <View style={styles.itineraryHeader}>
            <View style={styles.itineraryTitleRow}>
              <Calendar size={18} color={tokens.colors.primary} />
              <Text style={styles.itineraryTitle}>여행 상세 일정</Text>
            </View>
            {!isEditMode ? (
              <TouchableOpacity 
                style={styles.itineraryManageButton}
                onPress={() => setIsEditMode(true)}
                activeOpacity={0.8}
              >
                <Settings size={12} color={tokens.colors.textSecondary} style={styles.iconSpacingSmall} />
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

          {isEditMode && (
            <View style={styles.editSubToolbar}>

              <TouchableOpacity 
                style={styles.editActionSelectAll} 
                onPress={handleSelectAll}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.selectAllCheckSquare,
                  isAllSelected && styles.selectAllCheckSquareChecked
                ]}>
                  {isAllSelected && <Check size={8} color={tokens.colors.white} />}
                </View>
                <Text style={styles.editActionSelectAllText}>전체 선택</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.editActionDeleteSelected,
                  selectedPlanIds.length === 0 && styles.disabledOpacity
                ]}
                onPress={handleDeleteSelected}
                disabled={selectedPlanIds.length === 0}
                activeOpacity={0.8}
                accessibilityState={{ disabled: selectedPlanIds.length === 0 }}
              >
                <Trash2 size={12} color="#EF4444" style={styles.iconSpacingSmall} />
                <Text style={styles.editActionDeleteSelectedText}>선택 삭제 ({selectedPlanIds.length})</Text>
              </TouchableOpacity>
            </View>
          )}

          <UnderlineTabs
            items={[
              {
                key: 'upcoming',
                label: '예정된 일정',
                count: upcomingPlans.length,
              },
              { key: 'past', label: '지난 일정', count: pastPlans.length },
            ]}
            selectedKey={tripTab}
            onSelect={key => setTripTab(key as TripTab)}
            scrollable={false}
            style={styles.tripTabs}
          />

          {tripTab === 'upcoming' ? (
            upcomingPlans.length > 0 ? (
              <View>
                {upcomingPlans.map((plan: any) => (
                  <ItineraryCardItem
                    key={plan.planId}
                    plan={plan}
                    onOpenMenu={handleOpenPlanMenu}
                    navigation={navigation}
                    isEditMode={isEditMode}
                    isSelected={selectedPlanIds.includes(plan.planId)}
                    onSelectToggle={handleSelectToggle}
                    onOpenChecklist={handleOpenChecklist}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.dashedPlanBox}>
                <Calendar
                  size={36}
                  color={tokens.colors.textTertiary}
                  style={styles.dashedPlanIcon}
                />
                <Text style={styles.noPlanText}>
                  진행 중이거나 예정된 여행 일정이 없어요.
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('MainTabs', {
                      screen: INITIAL_TAB,
                      params: { screen: 'Home' },
                    })
                  }
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={styles.createPlanLink}>새로운 여행 계획하기</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={styles.pastRecordBox}>
              {pastPlans.length > 0 ? (
              <View style={styles.pastPlansContainer}>
                {pastPlans.map((plan: any) => {
                  const isSelected = selectedPlanIds.includes(plan.planId);
                  const isPastShared = !!plan.isShared;
                  const pastThemeColor = tokens.colors.textSecondary; 
                  const onSelectToggle = () => handleSelectToggle(plan.planId);

                  return (
                    <TouchableOpacity 
                      key={plan.planId} 
                      style={[
                        styles.pastPlanItem,
                        isSelected && styles.pastPlanItemSelectedBorder,
                        isSelected && { borderColor: pastThemeColor },
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
                      <View style={styles.pastPlanRow}>
                        {isEditMode && (
                          <TouchableOpacity 
                            style={styles.cardCheckboxWrap} 
                            onPress={onSelectToggle}
                            activeOpacity={0.8}
                            hitSlop={16}
                          >
                            <View style={[
                              styles.cardCheckboxSquare,
                              isSelected && { backgroundColor: pastThemeColor, borderColor: pastThemeColor }
                            ]}>
                              {isSelected && <Check size={10} color={tokens.colors.white} />}
                            </View>
                          </TouchableOpacity>
                        )}

                        <View style={styles.pastPlanLeft}>
                          <View style={styles.pastPlanTitleRow}>
                            <Text style={styles.pastPlanTitleText}>{plan.planName}</Text>
                            {isPastShared && (
                              <View style={[styles.pastPlanBadge, styles.pastPlanBadgeShared]}>
                                <Text style={[styles.pastPlanBadgeText, { color: tokens.colors.textSecondary }]}>SHARED</Text>
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
                          style={styles.pastPlanMenuButton}
                        >
                          <MoreVertical size={16} color={tokens.colors.textTertiary} />
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
                <Text style={styles.noPastRecordText}>
                  지난 여행 기록이 없어요.
                </Text>
              )}
            </View>
          )}
        </View>
        )}

        {profileSection === 'travel' && <ProfileTravelLogSection />}
      </ScrollView>

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

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editDialogCard}>

            <View style={styles.editDialogHeader}>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="닫기"
                hitSlop={10}
              >
                <X size={18} color={tokens.colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarEditContainer}
                onPress={handleProfileImagePress}
                disabled={isProfileImageUpdating}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="프로필 사진 변경"
                accessibilityState={{ disabled: isProfileImageUpdating }}
              >
                <FallbackImage
                  uri={avatarUri}
                  style={styles.avatarEditImage}
                  fallback={
                    <View style={styles.avatarEditPlaceholder}>
                      <User size={50} color={tokens.colors.textTertiary} />
                    </View>
                  }
                />
                <View style={styles.cameraBadge}>
                  <Camera size={12} color={tokens.colors.white} />
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일 계정</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputDisabled]}
                  value={user.email}
                  editable={false}
                  placeholderTextColor={tokens.colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>닉네임</Text>
                <View style={styles.rowInputWrap}>
                  <TextInput
                    style={[styles.textInput, styles.flex1]}
                    value={tempNickname}
                    onChangeText={setTempNickname}
                    placeholder="닉네임을 입력하세요"
                    placeholderTextColor={tokens.colors.textTertiary}
                    maxLength={NICKNAME_MAX_LENGTH}
                  />
                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      (isNicknameUnchanged || isNicknameChecking) && styles.disabledOpacity,
                    ]}
                    onPress={handleCheckNickname}
                    disabled={isNicknameUnchanged || isNicknameChecking}
                    activeOpacity={0.8}
                    accessibilityState={{ disabled: isNicknameUnchanged || isNicknameChecking }}
                  >
                    <Text
                      style={[
                        styles.checkButtonText,
                        (isNicknameUnchanged || isNicknameChecking) && {
                          color: tokens.colors.textTertiary,
                        },
                      ]}
                    >
                      {isNicknameChecking ? '확인 중…' : '중복 확인'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.twoColumnRow}>

                <View style={[styles.inputGroup, styles.flex1MarginRight12]}>
                  <Text style={styles.inputLabel}>생년월일</Text>
                  <TouchableOpacity

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

                <View style={[styles.inputGroup, styles.flex1]}>
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

              <View style={styles.twoColumnRow}>

                <View style={[styles.inputGroup, styles.flex1MarginRight12]}>
                  <Text style={styles.inputLabel}>여행 취향</Text>
                  <TouchableOpacity 
                    style={styles.actionNavButton}
                    onPress={() => setThemeModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionNavButtonText}>테마 변경</Text>
                    <Settings size={14} color={tokens.colors.textTertiary} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, styles.flex1]}>
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
                    accessibilityState={{ disabled: user.socialLogin }}
                  >
                    <Text style={styles.actionNavButtonText}>비밀번호 변경</Text>
                    <Settings size={14} color={tokens.colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>

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
                    disabled={
                      isProfileVisibilityUpdating ||
                      profileVisibilityLock.isSubmitting
                    }
                    accessibilityState={{
                      disabled:
                        isProfileVisibilityUpdating ||
                        profileVisibilityLock.isSubmitting,
                    }}
                    trackColor={{ false: tokens.colors.textTertiary, true: COLORS.primary }}
                    thumbColor={tokens.colors.white}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>피드백</Text>
                <TouchableOpacity
                  style={styles.actionNavButton}
                  onPress={() => setFeedbackModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionNavButtonText}>피드백 보내기</Text>
                  <Settings size={14} color={tokens.colors.textTertiary} />
                </TouchableOpacity>
              </View>

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
                <AlertTriangle size={14} color="#EF4444" style={styles.iconSpacingSmall} />
                <Text style={styles.resignLinkText}>계정 탈퇴하기</Text>
              </TouchableOpacity>
            </ScrollView>

            {showBottomFade && (
              <View style={styles.fadeOverlayContainer} pointerEvents="none">
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)', tokens.colors.white]}
                  style={styles.fadeOverlay}
                />
                <Animated.View 
                  style={[
                    styles.scrollHintContainer,
                    { transform: [{ translateY: bounceAnim }] }
                  ]}
                >
                  <ChevronDown size={14} color={tokens.colors.primary} />
                  <Text style={styles.scrollHintText}>더 보려면 스크롤</Text>
                </Animated.View>
              </View>
            )}

            <View style={styles.fixedBottomArea}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={profileSaveLock.isSubmitting}
                accessibilityState={{ disabled: profileSaveLock.isSubmitting }}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>변경사항 저장하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
      <FeedbackModal
        visible={isFeedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
      />

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
        maxLength={PLAN_NAME_MAX_LENGTH}
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
