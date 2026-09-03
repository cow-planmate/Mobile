import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import Check from 'lucide-react-native/dist/esm/icons/check';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import {
  buildFeedUpdatePayload,
  parseFeedTags,
} from '../utils/feedPostPayload';
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
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] =
    useState<FeedImageUploadFile | null>(null);

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
    setTitle(post.title);
    setContent(post.contentText);
    setTags((post.tags ?? []).join(', '));
    setThumbnailUrl(post.image ?? '');
  }, [existingPost.data, postId]);

  const isHydrating = isEditMode && hydratedPostId.current !== postId;

  const ownedPlans = useMemo(
    () => (profile?.myPlans ?? []).filter(plan => !plan.isShared),
    [profile?.myPlans],
  );
  const previewDays =
    snapshot?.itinerary.days ?? existingPost.data?.itinerary?.days ?? [];

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
        showAlert({ title: '이미지 확인', message: selected.error, type: 'error' });
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
    hasUnsavedChanges: !!title.trim() || !!content.trim(),
    title: '작성 취소',
    message: '작성 중인 여행기가 사라져요. 나갈까요?',
  });

  const handleSubmit = () =>
    runExclusive(async () => {
      const canEdit =
        isEditMode &&
        existingPost.data?.category === 'feed' &&
        !!existingPost.data.itinerary;

      if (
        (!isEditMode && !snapshot) ||
        (isEditMode && !canEdit) ||
        !title.trim()
      ) {
        showAlert({
          title: '입력 확인',
          message: '공개할 일정과 여행기 제목을 입력해 주세요.',
          type: 'error',
        });
        return;
      }

      const contentText = content.trim() || title.trim();
      let uploadedThumbnailUrl: string | null = null;
      try {
        const resolvedThumbnailUrl = thumbnailFile
          ? await uploadCommunityImage(thumbnailFile)
          : thumbnailUrl.trim() || null;
        if (thumbnailFile) {
          uploadedThumbnailUrl = resolvedThumbnailUrl;
          if (!isMountedRef.current) {
            if (uploadedThumbnailUrl) {
              void deleteCommunityImage(uploadedThumbnailUrl).catch(() => undefined);
            }
            return;
          }
        }

        const created = isEditMode
          ? await updatePost.mutateAsync(
              buildFeedUpdatePayload({
                title,
                content,
                tags,
                thumbnailUrl: resolvedThumbnailUrl ?? '',
              }),
            )
          : await createPost.mutateAsync({
              category: 'feed',
              title: title.trim(),
              content: textToBlocks(contentText),
              contentText,
              thumbnailUrl: resolvedThumbnailUrl,
              region: snapshot!.destinationName,
              location: snapshot!.destinationName,
              durationDays: snapshot!.itinerary.days.length,
              itinerary: snapshot!.itinerary,
              tags: parseFeedTags(tags),
              sourcePlanId: snapshot!.planId,
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
          void deleteCommunityImage(uploadedThumbnailUrl).catch(() => undefined);
        }
        if (!isMountedRef.current) return;
        showAlert({
          title: isEditMode ? '여행기 수정 실패' : '여행기 발행 실패',
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    });

  // 발행 단추가 잠기는 조건. 세 자리(모양·비활성·스크린리더)가 같은 값을 봐야 한다.
  const isSubmitBlocked =
    (!isEditMode && !snapshot) ||
    (isEditMode &&
      (!existingPost.data?.itinerary ||
        existingPost.data.category !== 'feed')) ||
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
        <Text style={styles.headerTitle}>
          {isEditMode ? '여행기 수정' : '여행기 발행'}
        </Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>공개할 일정</Text>
        {isEditMode && existingPost.isLoading ? (
          <ActivityIndicator color={tokens.colors.primary} />
        ) : isEditMode &&
          (existingPost.isError ||
            (existingPost.data &&
              (existingPost.data.category !== 'feed' ||
                !existingPost.data.itinerary))) ? (
          <Text style={styles.emptyText}>여행기를 불러올 수 없어요.</Text>
        ) : isEditMode && existingPost.data?.itinerary ? (
          <View style={styles.snapshotInfo}>
            <MapPin size={16} color={tokens.colors.primary} />
            <Text style={styles.snapshotText}>
              {existingPost.data.itinerary.plan?.destinationName ??
                existingPost.data.location ??
                existingPost.data.region ?? ''}
              {' '}· {existingPost.data.itinerary.days.length}일 일정은 그대로 유지돼요.
            </Text>
          </View>
        ) : isProfileLoading ? (
          <ActivityIndicator color={tokens.colors.primary} />
        ) : isProfileError ? (
          <Pressable onPress={() => refetchProfile()}>
            <Text style={styles.emptyText}>
              일정을 불러오지 못했어요. 다시 시도하려면 눌러 주세요.
            </Text>
          </Pressable>
        ) : ownedPlans.length === 0 ? (
          <Text style={styles.emptyText}>발행할 내 일정이 없어요.</Text>
        ) : (
          ownedPlans.map(plan => {
            const selected = snapshot?.planId === plan.planId;
            const isLoading = loadingPlanId === plan.planId;
            return (
              <Pressable
                key={plan.planId}
                style={[styles.planCard, selected && styles.planCardSelected]}
                onPress={() => {
                  handleSelectPlan(plan.planId);
                }}
                disabled={loadingPlanId !== null}
                accessibilityState={{ disabled: loadingPlanId !== null }}
              >
                <View>
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
              </Pressable>
            );
          })
        )}

        {!isEditMode && snapshot && (
          <View style={styles.snapshotInfo}>
            <MapPin size={16} color={tokens.colors.primary} />
            <Text style={styles.snapshotText}>
              {snapshot.destinationName} · {snapshot.itinerary.days.length}일 일정이 공개돼요.
            </Text>
          </View>
        )}

        {previewDays.length > 0 && (
          <View style={styles.itineraryPreview}>
            <Text style={styles.previewTitle}>일정 미리보기</Text>
            {previewDays.map(day => (
              <View key={day.day} style={styles.previewDay}>
                <View style={styles.previewDayLabel}>
                  <Text style={styles.previewDayText}>DAY {day.day}</Text>
                </View>
                <View style={styles.previewPlaces}>
                  {day.items.slice(0, 2).map(item => (
                    <Text
                      key={`${day.day}-${item.time}-${item.place}`}
                      style={styles.previewPlace}
                      numberOfLines={1}
                    >
                      {item.time} {item.place}
                    </Text>
                  ))}
                  {day.items.length > 2 && (
                    <Text style={styles.previewMore}>외 {day.items.length - 2}곳</Text>
                  )}
                  {day.items.length === 0 && (
                    <Text style={styles.previewMore}>등록한 장소가 없어요.</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.label}>제목</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder={
            isHydrating ? '기존 내용을 불러오는 중…' : '여행기 제목을 입력하세요'
          }
          editable={!isHydrating}
          maxLength={POST_TITLE_MAX_LENGTH}
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
          accessibilityLabel="여행기 제목"
        />

        <Text style={styles.label}>설명</Text>
        <TextInput
          ref={contentRef}
          value={content}
          onChangeText={setContent}
          style={[styles.input, styles.contentInput]}
          placeholder="여행을 소개해 주세요"
          editable={!isHydrating}
          multiline
          textAlignVertical="top"
          accessibilityLabel="여행기 설명"
        />

        <Text style={styles.label}>태그</Text>
        <TextInput
          value={tags}
          onChangeText={setTags}
          style={styles.input}
          placeholder="#뚜벅이, #가족여행"
          editable={!isHydrating}
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
          accessibilityState={{ disabled: isSubmitBlocked }}
        >
          <Text
            style={[styles.submitText, isSubmitBlocked && styles.submitTextOff]}
          >
            {createPost.isPending || updatePost.isPending
              ? isEditMode
                ? '수정 중…'
                : '발행 중…'
              : isEditMode
                ? '여행기 수정하기'
                : '여행기 발행하기'}
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
  headerTitle: {
    fontSize: normalize(17),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  headerSpace: { width: normalize(24) },
  body: { padding: normalize(20), gap: normalize(10) },
  label: {
    marginTop: normalize(8),
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textLabel,
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
  snapshotInfo: {
    flexDirection: 'row',
    gap: normalize(6),
    alignItems: 'center',
    backgroundColor: tokens.colors.primarySurface,
    borderRadius: normalize(8),
    padding: normalize(12),
  },
  snapshotText: {
    flex: 1,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.primary,
  },
  itineraryPreview: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: normalize(12),
    overflow: 'hidden',
  },
  previewTitle: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textLabel,
    backgroundColor: tokens.colors.surface,
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
  previewPlaces: { flex: 1, gap: normalize(3) },
  previewPlace: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
  },
  previewMore: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
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
  // 회색 바탕에 흰 글자는 읽히지 않는다. 잠겼을 때는 글자도 함께 낮춘다.
  submitTextOff: { color: tokens.colors.textTertiary },
});
