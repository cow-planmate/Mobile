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
import Lightbulb from 'lucide-react-native/dist/esm/icons/lightbulb';
import Star from 'lucide-react-native/dist/esm/icons/star';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAlert } from '../../../contexts/AlertContext';
import { CommunityStackParamList } from '../../../navigation/types';
import {
  BOARDS,
  BOARD_TIPS,
  BoardKey,
  boardLabel,
  POST_TITLE_MAX_LENGTH,
} from '../constants/board';
import { useCreatePost, usePost, useUpdatePost } from '../hooks/queries';
import { buildPostPayload } from '../utils/postPayload';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import { useUnsavedChangesPrompt } from '../../../hooks/useUnsavedChangesPrompt';
import { searchPlacesByKeyword } from '../../../api/trips';
import { styles, COLORS, STAR_ON, STAR_OFF } from './PostCreateScreen.styles';
import { tokens } from '../../../theme/tokens';
import { useScreenInsets } from '../../../hooks/useScreenInsets';

type CreateRoute = RouteProp<CommunityStackParamList, 'CommunityCreate'>;

export default function PostCreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<CreateRoute>();
  const { showAlert } = useAlert();

  // 없어진 갈래로 들어오면 자유게시판으로 되돌린다.
  const requested = route.params?.category;
  const [category, setCategory] = useState<BoardKey>(
    BOARDS.some(board => board.key === requested)
      ? (requested as BoardKey)
      : 'free',
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  // 0이면 고르지 않은 것. 웹은 장소마다 평점을 매기지만 앱은 장소가 하나라 글에 하나만 붙인다.
  const [rating, setRating] = useState(0);
  const initialForm = useRef({ title: '', content: '', location: '', rating: 0, category });

  useEffect(() => {
    const timer = setTimeout(() => setLocationQuery(location.trim()), 300);
    return () => clearTimeout(timer);
  }, [location]);

  const screenInsets = useScreenInsets(false);
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
    initialForm.current = {
      title: post.title,
      content: post.contentText,
      location: post.location ?? '',
      rating: Number(post.rating ?? 0) || 0,
      category: post.category as BoardKey,
    };
    setCategory(post.category as BoardKey);
    setTitle(post.title);
    setContent(post.contentText);
    setLocation(post.location ?? '');
    setRating(Number(post.rating ?? 0) || 0);
  }, [existingPost.data, postId]);

  const { isSubmitting, runExclusive } = useSubmitLock();

  const { allowLeave } = useUnsavedChangesPrompt({
    hasUnsavedChanges:
      title !== initialForm.current.title || content !== initialForm.current.content ||
      location !== initialForm.current.location || rating !== initialForm.current.rating ||
      category !== initialForm.current.category,
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
        location,
        rating,
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
      style={[styles.container, screenInsets]}
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

        {category === 'recommend' && (
          <View>
            <Text style={styles.fieldLabel}>장소 (선택)</Text>
            <TextInput
              style={styles.input}
              placeholder="장소 검색 (예: 카페 델문도)"
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

        {category === 'recommend' && (
          <View>
            <Text style={styles.fieldLabel}>평점 (선택)</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(score => {
                const filled = score <= rating;
                return (
                  <TouchableOpacity
                    key={score}
                    // 같은 별을 다시 누르면 지운다 — 그래야 '선택'이라는 말이 참이 된다.
                    onPress={() => setRating(rating === score ? 0 : score)}
                    hitSlop={4}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`평점 ${score}점`}
                    accessibilityState={{ selected: filled }}
                  >
                    <Star
                      size={normalize(24)}
                      color={filled ? STAR_ON : STAR_OFF}
                      fill={filled ? STAR_ON : 'transparent'}
                    />
                  </TouchableOpacity>
                );
              })}
              {rating > 0 && (
                <View style={styles.ratingPill}>
                  <Text style={styles.ratingPillText}>{rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
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

        <View style={styles.tipsBox}>
          <View style={styles.tipsHead}>
            <Lightbulb size={normalize(14)} color={COLORS.primary} />
            <Text style={styles.tipsTitle}>
              {`${boardLabel(category)} 작성 팁`}
            </Text>
          </View>
          {BOARD_TIPS[category].map(tip => (
            <View key={tip} style={styles.tipRow}>
              <Text style={styles.tipDot}>·</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
