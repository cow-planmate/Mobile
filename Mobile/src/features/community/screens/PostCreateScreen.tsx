import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAlert } from '../../../contexts/AlertContext';
import { CommunityStackParamList } from '../../../navigation/types';
import { BOARDS, BoardKey, POST_TITLE_MAX_LENGTH } from '../constants/levels';
import { useCreatePost, usePost, useUpdatePost } from '../hooks/queries';
import { buildPostPayload } from '../utils/postPayload';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import { useUnsavedChangesPrompt } from '../../../hooks/useUnsavedChangesPrompt';
import { searchPlacesByKeyword } from '../../../api/trips';
import { styles, COLORS } from './PostCreateScreen.styles';
import { tokens } from '../../../theme/tokens';

type CreateRoute = RouteProp<CommunityStackParamList, 'CommunityCreate'>;

export default function PostCreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<CreateRoute>();
  const { showAlert } = useAlert();

  const [category, setCategory] = useState<BoardKey>(
    route.params?.category ?? 'free',
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [location, setLocation] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLocationQuery(location.trim()), 300);
    return () => clearTimeout(timer);
  }, [location]);

  const locationSuggestions = useQuery({
    queryKey: ['place-search', locationQuery],
    queryFn: ({ signal }) => searchPlacesByKeyword(locationQuery, 8, signal),
    enabled: category === 'recommend' && showLocationSuggestions && locationQuery.length > 1,
    staleTime: 30_000,
  });

  const createPost = useCreatePost();
  const postId = route.params?.postId;
  const isEditMode = !!postId;
  const existingPost = usePost(postId);
  const updatePost = useUpdatePost(Number(postId ?? 0));

  const contentRef = useRef<TextInput>(null);
  const hydratedPostId = useRef<string | undefined>(undefined);
  useEffect(() => {
    const post = existingPost.data;
    if (!post || post.category === 'feed') return;
    if (hydratedPostId.current === postId) return;

    hydratedPostId.current = postId;
    setCategory(post.category as BoardKey);
    setTitle(post.title);
    setContent(post.contentText);
    setMaxParticipants(post.maxParticipants ? String(post.maxParticipants) : '');
    setLocation(post.location ?? '');
  }, [existingPost.data, postId]);

  const { isSubmitting, runExclusive } = useSubmitLock();

  const { allowLeave } = useUnsavedChangesPrompt({
    hasUnsavedChanges: !!title.trim() || !!content.trim(),
  });

  const canSubmit =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    (!isEditMode ||
      (!!existingPost.data && existingPost.data.category !== 'feed')) &&
    !createPost.isPending &&
    !updatePost.isPending &&
    !isSubmitting;

  const handleSubmit = () =>
    runExclusive(async () => {
      if (!canSubmit) return;

      const payload = buildPostPayload({
        category,
        title,
        content,
        maxParticipants,
        location,
      });

      try {
        const created = isEditMode
          ? await updatePost.mutateAsync(payload)
          : await createPost.mutateAsync(payload);

        allowLeave();
        // 수정은 상세 화면에서 진입하므로 되돌아가면 된다. replace 하면
        // 같은 글 상세가 스택에 두 번 쌓여 뒤로가기가 한 번 헛돈다.
        if (isEditMode || created?.id == null) {
          navigation.goBack();
        } else {
          navigation.replace('CommunityDetail', { postId: String(created.id) });
        }
      } catch (error) {
        showAlert({
          title: isEditMode ? '수정 실패' : '등록 실패',
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    });

  const handleBack = () => navigation.goBack();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.white} />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={8}
        >
          <ChevronLeft size={normalize(22)} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {isEditMode ? '게시글 수정' : '글쓰기'}
        </Text>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
          accessibilityState={{ disabled: !canSubmit }}
        >
          <Text style={styles.submitButtonText}>
            {createPost.isPending || updatePost.isPending
              ? isEditMode
                ? '수정 중'
                : '등록 중'
              : isEditMode
                ? '수정'
                : '등록'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.fieldLabel}>게시판</Text>
          <View style={styles.boardRow}>
            {BOARDS.map(board => {
              const isActive = category === board.key;
              return (
                <TouchableOpacity
                  key={board.key}
                  style={[
                    styles.boardChip,
                    isActive && styles.boardChipActive,
                  ]}
                  onPress={() => {
                    if (!isEditMode) setCategory(board.key);
                  }}
                  disabled={isEditMode}
                  activeOpacity={0.85}
                  accessibilityState={{ disabled: isEditMode }}
                >
                  <Text
                    style={[
                      styles.boardChipText,
                      isActive && styles.boardChipTextActive,
                    ]}
                  >
                    {board.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="제목을 입력하세요"
            placeholderTextColor={COLORS.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={POST_TITLE_MAX_LENGTH}
            returnKeyType="next"
            onSubmitEditing={() => contentRef.current?.focus()}
            accessibilityLabel="제목"
          />
        </View>

        {category === 'mate' && (
          <View>
            <Text style={styles.fieldLabel}>모집 인원 (선택)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 4"
              placeholderTextColor={COLORS.textTertiary}
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>비워두면 인원 제한 없이 모집해요.</Text>
          </View>
        )}

        {category === 'recommend' && (
          <View>
            <Text style={styles.fieldLabel}>장소 (선택)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 갑천생태호수공원"
              placeholderTextColor={COLORS.textTertiary}
              value={location}
              onChangeText={text => {
                setLocation(text);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
            />
            {showLocationSuggestions && (locationSuggestions.data?.length ?? 0) > 0 && (
              <View style={styles.suggestionList}>
                {locationSuggestions.data!.map(place => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setLocation(place.name);
                      setShowLocationSuggestions(false);
                    }}
                  >
                    <Text style={styles.suggestionName} numberOfLines={1}>{place.name}</Text>
                    <Text style={styles.suggestionAddress} numberOfLines={1}>
                      {place.address || place.jibunAddress}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View>
          <Text style={styles.fieldLabel}>내용</Text>
          <TextInput
            ref={contentRef}
            style={[styles.input, styles.contentInput]}
            placeholder="내용을 입력하세요"
            placeholderTextColor={COLORS.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            accessibilityLabel="내용"
          />
          <Text style={styles.hint}>
            앱에서는 글자 서식 없이 작성해요. 줄바꿈은 그대로 유지되고,
            웹에서도 같은 문단으로 보여요.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
