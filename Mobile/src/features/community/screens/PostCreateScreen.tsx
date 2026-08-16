import React, { useEffect, useState } from 'react';
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
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAlert } from '../../../contexts/AlertContext';
import { CommunityStackParamList } from '../../../navigation/types';
import { BOARDS, BoardKey } from '../constants/levels';
import { useCreatePost, usePost, useUpdatePost } from '../hooks/queries';
import { buildPostPayload } from '../utils/postPayload';
import { styles, COLORS } from './PostCreateScreen.styles';

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

  const createPost = useCreatePost();
  const postId = route.params?.postId;
  const isEditMode = !!postId;
  const existingPost = usePost(postId);
  const updatePost = useUpdatePost(Number(postId ?? 0));

  useEffect(() => {
    const post = existingPost.data;
    if (!post || post.category === 'feed') return;

    setCategory(post.category as BoardKey);
    setTitle(post.title);
    setContent(post.contentText);
    setMaxParticipants(post.maxParticipants ? String(post.maxParticipants) : '');
    setLocation(post.location ?? '');
  }, [existingPost.data]);

  const canSubmit =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    (!isEditMode ||
      (!!existingPost.data && existingPost.data.category !== 'feed')) &&
    !createPost.isPending &&
    !updatePost.isPending;

  const handleSubmit = async () => {
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

      if (created?.id != null) {
        navigation.replace('CommunityDetail', { postId: String(created.id) });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      showAlert({
        title: isEditMode ? '수정 실패' : '등록 실패',
        message: getBackendErrorMessage(error),
        type: 'error',
      });
    }
  };

  const handleBack = () => {
    if (!title.trim() && !content.trim()) {
      navigation.goBack();
      return;
    }
    showAlert({
      title: '작성 취소',
      message: '작성 중인 내용이 사라집니다. 나갈까요?',
      type: 'confirm',
      buttons: [
        { text: '계속 작성', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleBack}
          activeOpacity={0.7}
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
            maxLength={100}
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
            <Text style={styles.hint}>비워두면 인원 제한 없이 모집합니다.</Text>
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
              onChangeText={setLocation}
            />
          </View>
        )}

        <View>
          <Text style={styles.fieldLabel}>내용</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="내용을 입력하세요"
            placeholderTextColor={COLORS.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
          />
          <Text style={styles.hint}>
            앱에서는 글자 서식 없이 작성합니다. 줄바꿈은 그대로 유지되며,
            웹에서도 같은 문단으로 보입니다.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
