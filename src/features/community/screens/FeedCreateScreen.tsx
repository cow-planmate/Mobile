import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAlert } from '../../../contexts/AlertContext';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { FeedStackParamList } from '../../../navigation/types';
import { useCreatePost, usePost, useUpdatePost } from '../hooks/queries';
import { asBlocks, blocksToText, textToBlocks } from '../utils/blocks';
import { blocksToHtml, htmlToBlocks } from '../utils/richText';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import { useUnsavedChangesPrompt } from '../../../hooks/useUnsavedChangesPrompt';
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
import { FeedCreateScreenView } from './FeedCreateScreen.view';

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
  // 편집기는 HTML로 주고받는다. 서버에 보낼 때 richText.ts로 블록으로 옮긴다.
  const [contentHtml, setContentHtml] = useState('');
  // 수정 모드는 기존 글을 다 읽은 뒤에야 편집기를 띄운다. 그래야 initialContent가 맞다.
  const [initialHtml, setInitialHtml] = useState<string | null>(
    isEditMode ? null : '',
  );
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const initialForm = useRef({ title: '', content: '', thumbnailUrl: '' });
  const [includeMemo, setIncludeMemo] = useState(false);
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
    const html = blocksToHtml(
      asBlocks(post.content) ?? textToBlocks(post.contentText),
    );
    initialForm.current = {
      title: post.title,
      content: html,
      thumbnailUrl: post.image ?? '',
    };
    setTitle(post.title);
    setContentHtml(html);
    setInitialHtml(html);
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

  const previewDays =
    snapshot?.itinerary.days ?? existingPost.data?.itinerary?.days ?? [];
  // 고른 일정의 일수에서 그대로 나오는 값이라 사용자가 고칠 수 없다.
  // 미리보기 카드 헤더에 알약으로 붙여 "가져온 값"임을 자리로 드러낸다.
  const durationLabel =
    previewDays.length > 1
      ? `${previewDays.length - 1}박 ${previewDays.length}일`
      : '당일치기';

  // 웹처럼 여행지와 기간을 늘 보여 준다. 일정을 붙였으면 거기서 따온 값을
  // 그대로 비추고, 안 붙였으면 사람이 고른 값을 쓴다.
  const destinationLabel = snapshot?.destinationName ?? region;
  const travelDays = previewDays.length > 0 ? previewDays.length : dayCount;
  const travelNights = Math.max(0, travelDays - 1);

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
      contentHtml !== initialForm.current.content ||
      thumbnailUrl !== initialForm.current.thumbnailUrl ||
      thumbnailFile !== null ||
      snapshot !== null ||
      includeMemo,
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
      if (!title.trim()) {
        showAlert({
          title: '제목 입력',
          message: '여행기 제목을 입력해 주세요.',
          type: 'warning',
        });
        return;
      }
      if (!isEditMode && !regionToSend) {
        showAlert({
          title: '여행지 선택',
          message: '여행지를 선택해 주세요.',
          type: 'warning',
        });
        return;
      }
      if (isEditMode && !canEdit) {
        showAlert({
          title: '수정 불가',
          message: '수정할 수 없는 여행기예요.',
          type: 'error',
        });
        return;
      }

      const contentBlocks = htmlToBlocks(contentHtml);
      const contentText = blocksToText(contentBlocks).trim() || title.trim();
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
                contentBlocks,
                contentText,
                thumbnailUrl: resolvedThumbnailUrl ?? '',
              }),
            )
          : await createPost.mutateAsync({
              category: 'feed',
              title: title.trim(),
              content: contentBlocks,
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
    <FeedCreateScreenView
      isEditMode={isEditMode}
      screenInsets={screenInsets}
      onBack={() => navigation.goBack()}
      title={title}
      onChangeTitle={setTitle}
      isHydrating={isHydrating}
      thumbnailFile={thumbnailFile}
      thumbnailUrl={thumbnailUrl}
      onSelectThumbnail={handleSelectThumbnail}
      isSubmitting={isSubmitting}
      ownedPlans={ownedPlans}
      isPlanModalOpen={isPlanModalOpen}
      onOpenPlanModal={() => setIsPlanModalOpen(true)}
      onClosePlanModal={() => setIsPlanModalOpen(false)}
      isExistingPostLoading={existingPost.isLoading}
      isExistingPostError={
        existingPost.isError ||
        (existingPost.data && existingPost.data.category !== 'feed')
      }
      isProfileLoading={isProfileLoading}
      isProfileError={isProfileError}
      onRefetchProfile={() => refetchProfile()}
      destinationLabel={destinationLabel}
      snapshot={snapshot}
      onOpenRegionModal={() => setIsRegionModalOpen(true)}
      isRegionModalOpen={isRegionModalOpen}
      onCloseRegionModal={() => setIsRegionModalOpen(false)}
      region={region}
      onSelectRegion={location => setRegion(location)}
      travelDays={travelDays}
      travelNights={travelNights}
      onDecreaseDay={() => setDayCount(current => Math.max(1, current - 1))}
      onIncreaseDay={() => setDayCount(current => Math.min(30, current + 1))}
      includeMemo={includeMemo}
      onToggleIncludeMemo={() => setIncludeMemo(current => !current)}
      onRemoveSnapshot={() => setSnapshot(null)}
      durationLabel={durationLabel}
      previewDays={previewDays}
      initialHtml={initialHtml}
      onChangeContentHtml={setContentHtml}
      planSearch={planSearch}
      onChangePlanSearch={setPlanSearch}
      filteredPlans={filteredPlans}
      loadingPlanId={loadingPlanId}
      onSelectPlan={async planId => {
        await handleSelectPlan(planId);
        setIsPlanModalOpen(false);
      }}
      isSubmitBlocked={isSubmitBlocked}
      onSubmit={handleSubmit}
      isPendingSubmit={createPost.isPending || updatePost.isPending}
    />
  );
}
