import React, { useEffect, useMemo, useState } from 'react';
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
import { ChevronLeft, Check, MapPin } from 'lucide-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAlert } from '../../../contexts/AlertContext';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { FeedStackParamList } from '../../../navigation/types';
import { useCreatePost, usePost, useUpdatePost } from '../hooks/queries';
import { textToBlocks } from '../utils/blocks';
import {
  buildFeedUpdatePayload,
  parseFeedTags,
} from '../utils/feedPostPayload';
import {
  buildFeedPlanSnapshot,
  CompletePlanResponse,
  FeedPlanSnapshot,
} from '../utils/planToItinerary';

type FeedCreateRoute = RouteProp<FeedStackParamList, 'FeedCreate'>;

export default function FeedCreateScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const route = useRoute<FeedCreateRoute>();
  const { showAlert } = useAlert();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const createPost = useCreatePost();
  const postId = route.params?.postId;
  const isEditMode = !!postId;
  const existingPost = usePost(postId);
  const updatePost = useUpdatePost(Number(postId ?? 0));

  const [snapshot, setSnapshot] = useState<FeedPlanSnapshot | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    const post = existingPost.data;
    if (!post || post.category !== 'feed') return;

    setTitle(post.title);
    setContent(post.contentText);
    setTags((post.tags ?? []).join(', '));
    setThumbnailUrl(post.image ?? '');
  }, [existingPost.data]);

  const ownedPlans = useMemo(
    () => (profile?.myPlans ?? []).filter(plan => !plan.isShared),
    [profile?.myPlans],
  );

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

  const handleSubmit = async () => {
    const canEdit =
      isEditMode &&
      existingPost.data?.category === 'feed' &&
      !!existingPost.data.itinerary;

    if ((!isEditMode && !snapshot) || (isEditMode && !canEdit) || !title.trim()) {
      showAlert({
        title: '입력 확인',
        message: '공개할 일정과 여행기 제목을 입력해 주세요.',
        type: 'error',
      });
      return;
    }

    const contentText = content.trim() || title.trim();
    try {
      const created = isEditMode
        ? await updatePost.mutateAsync(
            buildFeedUpdatePayload({ title, content, tags, thumbnailUrl }),
          )
        : await createPost.mutateAsync({
            category: 'feed',
            title: title.trim(),
            content: textToBlocks(contentText),
            contentText,
            thumbnailUrl: thumbnailUrl.trim() || null,
            region: snapshot!.destinationName,
            location: snapshot!.destinationName,
            durationDays: snapshot!.itinerary.days.length,
            itinerary: snapshot!.itinerary,
            tags: parseFeedTags(tags),
            sourcePlanId: snapshot!.planId,
          });
      navigation.replace('FeedDetail', { postId: String(created.id) });
    } catch (error) {
      showAlert({
        title: isEditMode ? '여행기 수정 실패' : '여행기 발행 실패',
        message: getBackendErrorMessage(error),
        type: 'error',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? '여행기 수정' : '여행기 발행'}
        </Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>공개할 일정</Text>
        {isEditMode && existingPost.isLoading ? (
          <ActivityIndicator color="#1344FF" />
        ) : isEditMode &&
          (existingPost.isError ||
            (existingPost.data &&
              (existingPost.data.category !== 'feed' ||
                !existingPost.data.itinerary))) ? (
          <Text style={styles.emptyText}>여행기를 불러올 수 없어요.</Text>
        ) : isEditMode && existingPost.data?.itinerary ? (
          <View style={styles.snapshotInfo}>
            <MapPin size={16} color="#1344FF" />
            <Text style={styles.snapshotText}>
              {existingPost.data.itinerary.plan?.destinationName ??
                existingPost.data.location ??
                existingPost.data.region ?? ''}
              {' '}· {existingPost.data.itinerary.days.length}일 일정은 그대로 유지됩니다.
            </Text>
          </View>
        ) : isProfileLoading ? (
          <ActivityIndicator color="#1344FF" />
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
              >
                <View>
                  <Text style={styles.planName}>{plan.planName}</Text>
                  <Text style={styles.planDate}>
                    {plan.startDate ?? '일정 날짜 없음'}
                  </Text>
                </View>
                {isLoading ? (
                  <ActivityIndicator color="#1344FF" />
                ) : selected ? (
                  <Check size={20} color="#1344FF" />
                ) : null}
              </Pressable>
            );
          })
        )}

        {!isEditMode && snapshot && (
          <View style={styles.snapshotInfo}>
            <MapPin size={16} color="#1344FF" />
            <Text style={styles.snapshotText}>
              {snapshot.destinationName} · {snapshot.itinerary.days.length}일 일정이 공개됩니다.
            </Text>
          </View>
        )}

        <Text style={styles.label}>제목</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="여행기 제목을 입력하세요"
          maxLength={100}
        />

        <Text style={styles.label}>설명</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          style={[styles.input, styles.contentInput]}
          placeholder="여행을 소개해 주세요"
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>태그</Text>
        <TextInput
          value={tags}
          onChangeText={setTags}
          style={styles.input}
          placeholder="#뚜벅이, #가족여행"
        />

        <Text style={styles.label}>썸네일 URL</Text>
        <TextInput
          value={thumbnailUrl}
          onChangeText={setThumbnailUrl}
          style={styles.input}
          placeholder="비워 두면 일정의 첫 사진을 사용합니다"
          autoCapitalize="none"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            ((!isEditMode && !snapshot) ||
              (isEditMode &&
                (!existingPost.data?.itinerary ||
                  existingPost.data.category !== 'feed')) ||
              createPost.isPending ||
              updatePost.isPending) &&
              styles.submitDisabled,
          ]}
          onPress={() => {
            handleSubmit();
          }}
          disabled={
            (!isEditMode && !snapshot) ||
            (isEditMode &&
              (!existingPost.data?.itinerary ||
                existingPost.data.category !== 'feed')) ||
            createPost.isPending ||
            updatePost.isPending
          }
        >
          <Text style={styles.submitText}>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerSpace: { width: 24 },
  body: { padding: 20, gap: 10 },
  label: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#374151' },
  planCard: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planCardSelected: { borderColor: '#1344FF', backgroundColor: '#EFF6FF' },
  planName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  planDate: { marginTop: 4, fontSize: 12, color: '#6B7280' },
  emptyText: { paddingVertical: 16, color: '#6B7280', textAlign: 'center' },
  snapshotInfo: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
  },
  snapshotText: { flex: 1, fontSize: 13, color: '#1D4ED8' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
  },
  contentInput: { minHeight: 120, paddingTop: 12 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  submitButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#1344FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { backgroundColor: '#9CA3AF' },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
