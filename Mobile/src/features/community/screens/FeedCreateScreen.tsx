import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import Check from 'lucide-react-native/dist/esm/icons/check';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import CalendarIcon from 'lucide-react-native/dist/esm/icons/calendar';
import Search from 'lucide-react-native/dist/esm/icons/search';
import X from 'lucide-react-native/dist/esm/icons/x';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// 묶음(index)으로 들어오면 쓰지도 않는 화면들이 딸려 온다.
import SearchLocationModal from '../../../components/common/SearchLocationModal';
import { useAlert } from '../../../contexts/AlertContext';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { FeedStackParamList } from '../../../navigation/types';
import { useCreatePost, usePost, useUpdatePost } from '../hooks/queries';
import { textToBlocks } from '../utils/blocks';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import { useUnsavedChangesPrompt } from '../../../hooks/useUnsavedChangesPrompt';
import { POST_TITLE_MAX_LENGTH } from '../constants/board';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { useScreenInsets } from '../../../hooks/useScreenInsets';
import { buildFeedUpdatePayload } from '../utils/feedPostPayload';
import {
  buildFeedPlanSnapshot,
  CompletePlanResponse,
  FeedPlanSnapshot,
} from '../utils/planToItinerary';
import {
  deleteCommunityImage,
  uploadCommunityImage,
} from '../services/communityApi';
import {
  buildFeedImageUploadFile,
  FeedImageUploadFile,
} from '../utils/feedImage';

type FeedCreateRoute = RouteProp<FeedStackParamList, 'FeedCreate'>;

export default function FeedCreateScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const route = useRoute<FeedCreateRoute>();
  const { showAlert } = useAlert();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useUserProfile();
  const screenInsets = useScreenInsets(false);
  const createPost = useCreatePost();
  const postId = route.params?.postId;
  const isEditMode = !!postId;
  const existingPost = usePost(postId, true);
  const updatePost = useUpdatePost(Number(postId ?? 0), true);

  const [snapshot, setSnapshot] = useState<FeedPlanSnapshot | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  /**
   * 일정을 붙이지 않았을 때 직접 적는 지역.
   *
   * 서버는 여행기에 지역을 요구한다. 일정을 붙이면 거기서 따오지만, 안 붙이면
   * 따올 데가 없어 사람에게 물어야 한다.
   */
  const [region, setRegion] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const initialForm = useRef({ title: '', content: '', thumbnailUrl: '' });
  // 지금 앱은 메모를 늘 함께 보낸다. 기본값을 true로 두어 그 동작을 지키고,
  // 끄고 싶을 때만 끌 수 있게 한다 (웹 기본값은 false다).
  const [includeMemo, setIncludeMemo] = useState(true);
  const [thumbnailFile, setThumbnailFile] =
    useState<FeedImageUploadFile | null>(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  /**
   * 일정을 붙이지 않았을 때의 여행 일수.
   *
   * 서버는 여행기에 1일 이상을 요구한다. 일정을 붙이면 날짜 수에서 나오지만,
   * 안 붙이면 셀 것이 없어 사람에게 묻는다. 대부분 하루짜리라 1로 시작한다.
   */
  const [dayCount, setDayCount] = useState(1);
  const [planSearch, setPlanSearch] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const contentSelection = useRef({ start: 0, end: 0 });

  const contentRef = useRef<TextInput>(null);
  const hydratedPostId = useRef<string | undefined>(undefined);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const post = existingPost.data;
    if (!post || post.category !== 'feed') return;
    if (hydratedPostId.current === postId) return;

    hydratedPostId.current = postId;
    initialForm.current = {
      title: post.title,
      content: post.contentText,
      thumbnailUrl: post.image ?? '',
    };
    setTitle(post.title);
    setContent(post.contentText);
    setThumbnailUrl(post.image ?? '');
  }, [existingPost.data, postId]);

  const isHydrating = isEditMode && hydratedPostId.current !== postId;

  const ownedPlans = useMemo(
    () => (profile?.myPlans ?? []).filter(plan => !plan.isShared),
    [profile?.myPlans],
  );

  const filteredPlans = useMemo(() => {
    if (!planSearch.trim()) return ownedPlans;
    const q = planSearch.toLowerCase();
    return ownedPlans.filter(
      plan =>
        (plan.planName ?? '').toLowerCase().includes(q) ||
        ((plan as any).destination ?? '').toLowerCase().includes(q),
    );
  }, [ownedPlans, planSearch]);

  const handleInsertFormat = (prefix: string, suffix = '') => {
    const text = content;
    const { start, end } = contentSelection.current;
    const selected = text.slice(start, end);
    const newText =
      text.slice(0, start) +
      prefix +
      (selected || '') +
      suffix +
      text.slice(end);
    setContent(newText);
    setShowSlashMenu(false);
  };
  const previewDays =
    snapshot?.itinerary.days ?? existingPost.data?.itinerary?.days ?? [];
  // 고른 일정의 일수에서 그대로 나오는 값이라 사용자가 고칠 수 없다.
  // 미리보기 카드 헤더에 알약으로 붙여 "가져온 값"임을 자리로 드러낸다.
  const durationLabel =
    previewDays.length > 1
      ? `${previewDays.length - 1}박 ${previewDays.length}일`
      : '당일치기';

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      const { data } = await axios.get<CompletePlanResponse>(
        resolveApiUrl(`/api/plan/${planId}/complete`),
      );
      const nextSnapshot = buildFeedPlanSnapshot(data);
      setSnapshot(nextSnapshot);
      setTitle(current => current || nextSnapshot.planName);
      setThumbnailUrl(current => current || nextSnapshot.thumbnailUrl || '');
    } catch (error) {
      showAlert({
        title: '일정 불러오기 실패',
        message: getBackendErrorMessage(error),
        type: 'error',
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  const { isSubmitting, runExclusive } = useSubmitLock();

  const handleSelectThumbnail = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      if (!isMountedRef.current || result.didCancel) return;
      if (result.errorCode) {
        throw new Error(result.errorMessage || '이미지를 선택하지 못했어요.');
      }

      const selected = buildFeedImageUploadFile(result.assets?.[0]);
      if ('error' in selected) {
        showAlert({
          title: '이미지 확인',
          message: selected.error,
          type: 'error',
        });
        return;
      }
      setThumbnailFile(selected.file);
    } catch (error) {
      if (!isMountedRef.current) return;
      showAlert({
        title: '이미지 선택 실패',
        message: getBackendErrorMessage(error),
        type: 'error',
      });
    }
  };

  const { allowLeave } = useUnsavedChangesPrompt({
    hasUnsavedChanges:
      title !== initialForm.current.title ||
      content !== initialForm.current.content ||
      thumbnailUrl !== initialForm.current.thumbnailUrl ||
      thumbnailFile !== null ||
      snapshot !== null ||
      !includeMemo,
    title: '작성 취소',
    message: '작성 중인 여행기가 사라져요. 나갈까요?',
  });

  // 서버는 여행기에 지역을 요구한다. 일정을 붙였으면 거기서 따오고, 아니면
  // 직접 적은 것을 쓴다.
  const regionToSend = snapshot?.destinationName ?? region.trim();

  const handleSubmit = () =>
    runExclusive(async () => {
      // 일정은 붙여도 되고 안 붙여도 된다. 다녀온 이야기만 적고 싶은 사람에게
      // 일정부터 고르라고 하면 쓸 자리가 없다.
      const canEdit = isEditMode && existingPost.data?.category === 'feed';

      // 지역은 새로 쓸 때만 묻는다. 고칠 때는 서버에 이미 있는 것을 그대로 둔다.
      if (
        (isEditMode && !canEdit) ||
        !title.trim() ||
        (!isEditMode && !regionToSend)
      ) {
        showAlert({
          title: '입력 확인',
          message: snapshot
            ? '여행기 제목을 입력해 주세요.'
            : '여행기 제목과 지역을 입력해 주세요.',
          type: 'error',
        });
        return;
      }

      const contentText = content.trim() || title.trim();
      // 메모를 안 내보내기로 했으면 스냅샷에서 털어낸다. 서버가 받은 대로 저장하므로
      // 여기서 빼지 않으면 가져가는 사람에게 그대로 복사된다.
      const itineraryToSend = snapshot
        ? includeMemo
          ? snapshot.itinerary
          : {
              ...snapshot.itinerary,
              days: snapshot.itinerary.days.map(day => ({
                ...day,
                items: day.items.map(({ memo: _memo, ...item }) => item),
              })),
            }
        : null;
      let uploadedThumbnailUrl: string | null = null;
      try {
        const resolvedThumbnailUrl = thumbnailFile
          ? await uploadCommunityImage(thumbnailFile)
          : thumbnailUrl.trim() || null;
        if (thumbnailFile) {
          uploadedThumbnailUrl = resolvedThumbnailUrl;
          if (!isMountedRef.current) {
            if (uploadedThumbnailUrl) {
              void deleteCommunityImage(uploadedThumbnailUrl).catch(
                () => undefined,
              );
            }
            return;
          }
        }

        const created = isEditMode
          ? await updatePost.mutateAsync(
              buildFeedUpdatePayload({
                title,
                content,
                thumbnailUrl: resolvedThumbnailUrl ?? '',
              }),
            )
          : await createPost.mutateAsync({
              category: 'feed',
              title: title.trim(),
              content: textToBlocks(contentText),
              contentText,
              thumbnailUrl: resolvedThumbnailUrl,
              region: regionToSend,
              location: regionToSend,
              durationDays: snapshot?.itinerary.days.length ?? dayCount,
              // 일정을 붙이지 않았으면 일정에서만 나오는 것들은 비운다.
              ...(snapshot
                ? { itinerary: itineraryToSend, sourcePlanId: snapshot.planId }
                : {}),
            });
        allowLeave();
        setThumbnailFile(null);
        // 수정은 상세 화면에서 진입하므로 되돌아가면 된다. replace 하면
        // 같은 여행기 상세가 스택에 두 번 쌓여 뒤로가기가 한 번 헛돈다.
        if (isEditMode || created?.id == null) {
          navigation.goBack();
        } else {
          navigation.replace('FeedDetail', { postId: String(created.id) });
        }
      } catch (error) {
        if (uploadedThumbnailUrl) {
          void deleteCommunityImage(uploadedThumbnailUrl).catch(
            () => undefined,
          );
        }
        if (!isMountedRef.current) return;
        showAlert({
          title: isEditMode ? '여행기 수정 실패' : '여행기 등록 실패',
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    });

  // 발행 단추가 잠기는 조건. 세 자리(모양·비활성·스크린리더)가 같은 값을 봐야 한다.
  // 일정은 붙이지 않아도 되므로 제목과 지역만 있으면 열어 둔다.
  const isSubmitBlocked =
    !title.trim() ||
    (!isEditMode && !regionToSend) ||
    (isEditMode && existingPost.data?.category !== 'feed') ||
    createPost.isPending ||
    updatePost.isPending ||
    isSubmitting;

  return (
    <KeyboardAvoidingView
      style={[styles.container, screenInsets]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <ChevronLeft size={24} color={tokens.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {isEditMode ? '여행기 수정' : '여행기 쓰기'}
          </Text>
        </View>
        {/* 뒤로 가기와 같은 너비의 빈 칸. 이게 없으면 제목이 왼쪽으로 쏠린다. */}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.section}>여행 정보</Text>
        {/* 수정 중에는 일정을 바꿀 수 없다. 어떤 일정인지는 아래 미리보기 카드가
          이미 다 말하므로, 같은 말을 안내 띠로 한 번 더 하지 않는다. */}
        <Text style={styles.label}>공개할 일정 (선택)</Text>
        {isEditMode && existingPost.isLoading ? (
          <ActivityIndicator color={tokens.colors.primary} />
        ) : isEditMode &&
          (existingPost.isError ||
            (existingPost.data && existingPost.data.category !== 'feed')) ? (
          <Text style={styles.emptyText}>여행기를 불러올 수 없어요.</Text>
        ) : isEditMode ? null : isProfileLoading ? (
          <ActivityIndicator color={tokens.colors.primary} />
        ) : isProfileError ? (
          <Pressable onPress={() => refetchProfile()}>
            <Text style={styles.emptyText}>
              일정을 불러오지 못했어요. 다시 시도하려면 눌러 주세요.
            </Text>
          </Pressable>
        ) : ownedPlans.length === 0 ? (
          <Text style={styles.emptyText}>
            발행할 내 일정이 없어요. 일정 없이 글만 올려도 돼요.
          </Text>
        ) : !snapshot ? (
          <TouchableOpacity
            style={styles.planPickerTrigger}
            onPress={() => setIsPlanModalOpen(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="내 일정 불러오기"
          >
            <View style={styles.planPickerLeft}>
              <View style={styles.planPickerIconWrap}>
                <CalendarIcon
                  size={normalize(18)}
                  color={tokens.colors.primary}
                />
              </View>
              <View>
                <Text style={styles.planPickerTitle}>내 일정 불러오기</Text>
                <Text style={styles.planPickerSubtitle}>
                  붙이면 읽는 사람이 그대로 가져갈 수 있어요
                </Text>
              </View>
            </View>
            <ChevronRight
              size={normalize(18)}
              color={tokens.colors.textTertiary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.selectedPlanCard}>
            <View style={styles.selectedPlanLeft}>
              <View style={styles.selectedPlanIconWrap}>
                <MapPin size={normalize(18)} color={tokens.colors.primary} />
              </View>
              <View style={styles.selectedPlanInfo}>
                <Text style={styles.selectedPlanName} numberOfLines={1}>
                  {snapshot.planName}
                </Text>
                <Text style={styles.selectedPlanMeta}>
                  {snapshot.destinationName} · {snapshot.itinerary.days.length}
                  일 일정
                </Text>
              </View>
            </View>
            <View style={styles.planCardActions}>
              <TouchableOpacity
                style={styles.changePlanButton}
                onPress={() => setIsPlanModalOpen(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="일정 변경"
              >
                <Text style={styles.changePlanButtonText}>변경</Text>
              </TouchableOpacity>
              {/* 붙이지 않아도 되는 것이므로 뺄 자리도 있어야 한다. */}
              <TouchableOpacity
                style={styles.changePlanButton}
                onPress={() => setSnapshot(null)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="일정 빼기"
              >
                <Text style={styles.changePlanButtonText}>빼기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {previewDays.length > 0 && (
          <View style={styles.itineraryPreview}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>일정 미리보기</Text>
              <View style={styles.durationPill}>
                <Text style={styles.durationPillText}>{durationLabel}</Text>
              </View>
            </View>
            {previewDays.map(day => (
              <View key={day.day} style={styles.previewDay}>
                <View style={styles.previewDayLabel}>
                  <Text style={styles.previewDayText}>DAY {day.day}</Text>
                </View>
                <View style={styles.previewPlaces}>
                  {day.items.slice(0, 3).map((item, idx, arr) => (
                    <View
                      key={`${day.day}-${item.time}-${item.place}-${idx}`}
                      style={styles.timelineItemRow}
                    >
                      <View style={styles.timelineTrack}>
                        <View style={styles.timelineBadge}>
                          <Text style={styles.timelineBadgeText}>
                            {idx + 1}
                          </Text>
                        </View>
                        {idx < arr.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>
                      <View
                        style={[
                          styles.timelineContent,
                          idx < arr.length - 1 && styles.timelineContentLinked,
                        ]}
                      >
                        <View style={styles.timelinePlaceHeader}>
                          <Text
                            style={styles.timelinePlaceName}
                            numberOfLines={1}
                          >
                            {item.place}
                          </Text>
                          {item.time ? (
                            <View style={styles.timelineTimeChip}>
                              <Text style={styles.timelineTimeText}>
                                {item.time}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        {item.description ? (
                          <Text
                            style={styles.timelinePlaceDesc}
                            numberOfLines={1}
                          >
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                  {day.items.length > 3 && (
                    <Text style={styles.previewMore}>
                      외 {day.items.length - 3}곳
                    </Text>
                  )}
                  {day.items.length === 0 && (
                    <Text style={styles.previewMore}>
                      등록한 장소가 없어요.
                    </Text>
                  )}
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.memoRow}
              onPress={() => setIncludeMemo(current => !current)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: includeMemo }}
              accessibilityLabel="블록 메모도 함께 공개"
            >
              <View style={[styles.memoBox, includeMemo && styles.memoBoxOn]}>
                {includeMemo && (
                  <Check size={normalize(12)} color={tokens.colors.white} />
                )}
              </View>
              <View style={styles.memoTextWrap}>
                <Text style={styles.memoLabel}>블록 메모도 함께 공개</Text>
                <Text style={styles.memoHint}>
                  가져갈 때 메모까지 복사됩니다
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 일정을 붙이면 지역과 기간은 거기서 따온다. 안 붙였을 때만 묻는다. */}
        {!isEditMode && !snapshot && (
          <>
            <Text style={[styles.label, styles.labelGap]}>지역</Text>
            <TouchableOpacity
              style={styles.planPickerTrigger}
              onPress={() => setIsRegionModalOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="지역 고르기"
            >
              <View style={styles.planPickerLeft}>
                <View style={styles.planPickerIconWrap}>
                  <MapPin size={normalize(18)} color={tokens.colors.primary} />
                </View>
                <View>
                  <Text style={styles.planPickerTitle}>
                    {region || '지역 고르기'}
                  </Text>
                  <Text style={styles.planPickerSubtitle}>
                    어디를 다녀왔는지 골라 주세요
                  </Text>
                </View>
              </View>
              <ChevronRight
                size={normalize(18)}
                color={tokens.colors.textTertiary}
              />
            </TouchableOpacity>

            <Text style={[styles.label, styles.labelGap]}>여행 기간</Text>
            <View style={styles.dayCountRow}>
              <TouchableOpacity
                style={styles.dayCountButton}
                onPress={() => setDayCount(current => Math.max(1, current - 1))}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="기간 줄이기"
              >
                <Text style={styles.dayCountButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.dayCountValue}>
                {dayCount > 1 ? `${dayCount - 1}박 ${dayCount}일` : '당일치기'}
              </Text>
              <TouchableOpacity
                style={styles.dayCountButton}
                onPress={() =>
                  setDayCount(current => Math.min(30, current + 1))
                }
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="기간 늘리기"
              >
                <Text style={styles.dayCountButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={[styles.section, styles.sectionGap]}>기본 정보</Text>
        <Text style={styles.label}>제목</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder={
            isHydrating
              ? '기존 내용을 불러오는 중…'
              : '예: 서울 3박 4일 완벽 여행 코스'
          }
          editable={!isHydrating}
          maxLength={POST_TITLE_MAX_LENGTH}
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
          accessibilityLabel="여행기 제목"
        />

        <View style={styles.editorLabelRow}>
          <Text style={styles.label}>여행 후기</Text>
          <TouchableOpacity
            style={styles.slashBadge}
            onPress={() => setShowSlashMenu(prev => !prev)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="서식 메뉴 열기"
          >
            <Text style={styles.slashBadgeText}>서식 메뉴</Text>
            <View style={styles.slashKeyBox}>
              <Text style={styles.slashKeyChar}>/</Text>
            </View>
          </TouchableOpacity>
        </View>

        {showSlashMenu && (
          <View style={styles.slashDropdown}>
            <TouchableOpacity
              style={styles.slashItem}
              onPress={() => handleInsertFormat('# ')}
            >
              <Text style={styles.slashItemIcon}>H1</Text>
              <Text style={styles.slashItemLabel}>제목 1 (큰 제목)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.slashItem}
              onPress={() => handleInsertFormat('## ')}
            >
              <Text style={styles.slashItemIcon}>H2</Text>
              <Text style={styles.slashItemLabel}>제목 2 (중간 제목)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.slashItem}
              onPress={() => handleInsertFormat('- ')}
            >
              <Text style={styles.slashItemIcon}>•</Text>
              <Text style={styles.slashItemLabel}>글머리 기호 목록</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.slashItem}
              onPress={() => handleInsertFormat('1. ')}
            >
              <Text style={styles.slashItemIcon}>1.</Text>
              <Text style={styles.slashItemLabel}>번호 매기기 목록</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.slashItem}
              onPress={() => handleInsertFormat('> ')}
            >
              <Text style={styles.slashItemIcon}>❝</Text>
              <Text style={styles.slashItemLabel}>인용구</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.slashItem}
              onPress={() => handleInsertFormat('\n---\n')}
            >
              <Text style={styles.slashItemIcon}>―</Text>
              <Text style={styles.slashItemLabel}>구분선</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.slashItem}
              onPress={() => handleInsertFormat('**', '**')}
            >
              <Text style={[styles.slashItemIcon, { fontWeight: 'bold' }]}>
                B
              </Text>
              <Text style={styles.slashItemLabel}>굵게 (**텍스트**)</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarScroll}
          style={styles.formatToolbar}
        >
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormat('# ')}
          >
            <Text style={styles.toolBtnText}>H1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormat('## ')}
          >
            <Text style={styles.toolBtnText}>H2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormat('- ')}
          >
            <Text style={styles.toolBtnText}>• 목록</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormat('1. ')}
          >
            <Text style={styles.toolBtnText}>1. 번호</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormat('> ')}
          >
            <Text style={styles.toolBtnText}>❝ 인용</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormat('\n---\n')}
          >
            <Text style={styles.toolBtnText}>― 선</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormat('**', '**')}
          >
            <Text style={[styles.toolBtnText, { fontWeight: 'bold' }]}>
              B 굵게
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <TextInput
          ref={contentRef}
          value={content}
          onChangeText={value => {
            setContent(value);
            if (value.endsWith('\n/') || value === '/') {
              setShowSlashMenu(true);
            }
          }}
          onSelectionChange={e => {
            contentSelection.current = e.nativeEvent.selection;
          }}
          style={[styles.input, styles.contentInput]}
          placeholder="여행을 소개해 주세요 ('/' 입력 시 서식 메뉴)"
          editable={!isHydrating}
          multiline
          textAlignVertical="top"
          accessibilityLabel="여행기 설명"
        />

        <Text style={styles.label}>썸네일</Text>
        <TouchableOpacity
          style={styles.imageSelectButton}
          onPress={handleSelectThumbnail}
          disabled={isHydrating || isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="썸네일 이미지 선택"
        >
          <Text style={styles.imageSelectText}>
            {thumbnailFile ? '사진 다시 선택' : '기기에서 사진 선택'}
          </Text>
        </TouchableOpacity>
        {thumbnailFile && (
          <Text style={styles.selectedImageName}>{thumbnailFile.name}</Text>
        )}
        <TextInput
          value={thumbnailUrl}
          onChangeText={value => {
            setThumbnailUrl(value);
            setThumbnailFile(null);
          }}
          style={styles.input}
          editable={!isHydrating}
          placeholder="사진을 선택하거나 이미지 URL을 입력하세요"
          autoCapitalize="none"
        />
      </ScrollView>

      {/* 지역은 직접 적지 않고 고른다. 적어 넣으면 같은 곳이 '속초'와
        '속초시'로 갈라져 지역으로 묶어 보는 자리가 흐트러진다. */}
      <SearchLocationModal
        visible={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        currentValue={region}
        onSelect={location => setRegion(location)}
        onDone={() => setIsRegionModalOpen(false)}
      />

      <Modal
        visible={isPlanModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPlanModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>내 플랜 선택</Text>
              <TouchableOpacity
                onPress={() => setIsPlanModalOpen(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="닫기"
              >
                <X size={normalize(20)} color={tokens.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Search size={normalize(16)} color={tokens.colors.textTertiary} />
              <TextInput
                value={planSearch}
                onChangeText={setPlanSearch}
                placeholder="플랜 이름 검색..."
                placeholderTextColor={tokens.colors.textTertiary}
                style={styles.searchInput}
              />
              {planSearch.length > 0 && (
                <TouchableOpacity onPress={() => setPlanSearch('')} hitSlop={6}>
                  <X size={normalize(14)} color={tokens.colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
            >
              {isProfileLoading ? (
                <ActivityIndicator
                  color={tokens.colors.primary}
                  style={{ marginVertical: normalize(24) }}
                />
              ) : filteredPlans.length === 0 ? (
                <Text style={styles.emptyText}>
                  {planSearch
                    ? '검색 결과가 없어요.'
                    : '가져올 수 있는 일정이 없어요.'}
                </Text>
              ) : (
                filteredPlans.map(plan => {
                  const selected = snapshot?.planId === plan.planId;
                  const isLoading = loadingPlanId === plan.planId;
                  return (
                    <TouchableOpacity
                      key={plan.planId}
                      style={[
                        styles.planCard,
                        selected && styles.planCardSelected,
                      ]}
                      onPress={async () => {
                        await handleSelectPlan(plan.planId);
                        setIsPlanModalOpen(false);
                      }}
                      disabled={loadingPlanId !== null}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.planName}>{plan.planName}</Text>
                        <Text style={styles.planDate}>
                          {plan.startDate ?? '일정 날짜 없음'}
                        </Text>
                      </View>
                      {isLoading ? (
                        <ActivityIndicator color={tokens.colors.primary} />
                      ) : selected ? (
                        <Check size={20} color={tokens.colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitBlocked && styles.submitDisabled,
          ]}
          onPress={() => {
            handleSubmit();
          }}
          disabled={isSubmitBlocked}
          accessibilityRole="button"
          // 글자는 '등록 중…'으로 바뀌므로 이름은 따로 박아 둔다.
          accessibilityLabel={isEditMode ? '수정 완료' : '피드 등록하기'}
          accessibilityState={{ disabled: isSubmitBlocked }}
        >
          <Text
            style={[styles.submitText, isSubmitBlocked && styles.submitTextOff]}
          >
            {createPost.isPending || updatePost.isPending
              ? isEditMode
                ? '수정 중…'
                : '등록 중…'
              : isEditMode
              ? '수정 완료'
              : '피드 등록하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.white },
  header: {
    height: normalize(56),
    paddingHorizontal: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  headerText: { flex: 1, alignItems: 'center' },
  headerSpacer: { width: normalize(24) },
  headerTitle: {
    fontSize: normalize(17),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  // 웹 CreatePostHeader의 부제. 무엇을 쓰는 곳인지 한 줄로 알린다.
  headerSubtitle: {
    marginTop: normalize(2),
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  // 웹은 카드 두 장으로 나누지만 앱은 제목만 놓는다. 라벨(14)보다 한 단계 위다.
  section: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  sectionGap: { marginTop: normalize(18) },
  // 미리보기 카드의 마지막 줄. 카드 나머지는 읽기 전용이므로
  // surface 배경으로 "여기는 누르는 자리"를 구분한다.
  memoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(11),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.surface,
  },
  memoBox: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(6),
    borderWidth: 1.5,
    borderColor: tokens.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoBoxOn: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  memoTextWrap: { flex: 1 },
  memoLabel: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.text,
  },
  memoHint: {
    marginTop: normalize(2),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  body: { padding: normalize(20), gap: normalize(10) },
  label: {
    marginTop: normalize(8),
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textLabel,
  },
  /** 앞 칸과 붙어 보이지 않게 한 칸 더 띄운다. */
  labelGap: { marginTop: normalize(16) },
  dayCountRow: {
    marginTop: normalize(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  dayCountButton: {
    width: normalize(34),
    height: normalize(34),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface,
  },
  dayCountButtonText: {
    fontSize: normalize(18),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  dayCountValue: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  planPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: normalize(14),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    borderStyle: 'dashed',
    backgroundColor: tokens.colors.surface,
  },
  planPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
    flex: 1,
  },
  planPickerIconWrap: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(10),
    backgroundColor: tokens.colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPickerTitle: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  planPickerSubtitle: {
    marginTop: normalize(2),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  selectedPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: normalize(14),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primarySurface,
  },
  selectedPlanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
    flex: 1,
    marginRight: normalize(8),
  },
  selectedPlanIconWrap: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(10),
    backgroundColor: tokens.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPlanInfo: {
    flex: 1,
  },
  selectedPlanName: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  selectedPlanMeta: {
    marginTop: normalize(2),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.primary,
  },
  planCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  changePlanButton: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  changePlanButtonText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textSecondary,
  },
  planCard: {
    minHeight: normalize(64),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: normalize(12),
    padding: normalize(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planCardSelected: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primarySurface,
  },
  planName: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  planDate: {
    marginTop: normalize(4),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  emptyText: {
    paddingVertical: normalize(16),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
  },
  itineraryPreview: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: normalize(12),
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
    backgroundColor: tokens.colors.surface,
  },
  previewTitle: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textLabel,
  },
  durationPill: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(3),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.sub,
  },
  durationPillText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  previewDay: {
    flexDirection: 'row',
    gap: normalize(10),
    padding: normalize(12),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  previewDayLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    backgroundColor: tokens.colors.sub,
  },
  previewDayText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  previewPlaces: { flex: 1 },
  previewPlace: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
  },
  // 줄 간격을 행 사이(gap)가 아니라 행 안쪽(timelineContent)에 둔다.
  // 그래야 세로선이 그 간격까지 덮어 다음 번호에 닿는다.
  timelineItemRow: {
    flexDirection: 'row',
    gap: normalize(10),
  },
  timelineTrack: {
    alignItems: 'center',
    width: normalize(20),
  },
  timelineBadge: {
    width: normalize(18),
    height: normalize(18),
    borderRadius: normalize(9),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBadgeText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: normalize(10),
    borderRadius: 1,
    backgroundColor: tokens.colors.border,
    // 위는 번호에서 살짝 떼고, 아래는 다음 번호에 그대로 닿게 둔다.
    marginTop: normalize(3),
  },
  timelineContent: {
    flex: 1,
    paddingBottom: normalize(6),
  },
  // 뒤에 장소가 더 있을 때만 아래를 벌린다. 그 여백을 세로선이 채운다.
  timelineContentLinked: {
    paddingBottom: normalize(12),
  },
  timelinePlaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  timelinePlaceName: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
    flexShrink: 1,
  },
  timelineTimeChip: {
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(1),
    borderRadius: normalize(4),
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
  },
  timelineTimeText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  timelinePlaceDesc: {
    marginTop: normalize(2),
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  previewMore: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  editorLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(8),
  },
  slashBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
    backgroundColor: tokens.colors.primarySurface,
  },
  slashBadgeText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.primary,
  },
  slashKeyBox: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(3),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slashKeyChar: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
    lineHeight: normalize(13),
  },
  slashDropdown: {
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    borderRadius: normalize(10),
    paddingVertical: normalize(4),
    marginTop: normalize(4),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slashItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    gap: normalize(10),
  },
  slashItemIcon: {
    width: normalize(24),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
    textAlign: 'center',
  },
  slashItemLabel: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.text,
  },
  formatToolbar: {
    marginTop: normalize(6),
  },
  toolbarScroll: {
    flexDirection: 'row',
    gap: normalize(6),
    paddingVertical: normalize(4),
  },
  toolBtn: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: normalize(6),
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  toolBtnText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: tokens.colors.white,
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    maxHeight: '80%',
    paddingBottom: normalize(24),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  modalTitle: {
    fontSize: normalize(16),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    marginHorizontal: normalize(16),
    marginTop: normalize(12),
    paddingHorizontal: normalize(12),
    height: normalize(40),
    backgroundColor: tokens.colors.surface,
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    paddingVertical: 0,
  },
  modalList: {
    marginTop: normalize(8),
  },
  modalListContent: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    gap: normalize(8),
  },
  input: {
    minHeight: normalize(48),
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    borderRadius: normalize(10),
    paddingHorizontal: normalize(12),
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
  },
  contentInput: { minHeight: normalize(120), paddingTop: normalize(12) },
  imageSelectButton: {
    minHeight: normalize(46),
    borderWidth: 1,
    borderColor: tokens.colors.primary,
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSelectText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  selectedImageName: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  footer: {
    padding: normalize(16),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  submitButton: {
    minHeight: normalize(52),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { backgroundColor: tokens.colors.disabled },
  submitText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  submitTextOff: { color: tokens.colors.textTertiary },
});
