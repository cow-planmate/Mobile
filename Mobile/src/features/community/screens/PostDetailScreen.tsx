import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CheckCircle2 from 'lucide-react-native/dist/esm/icons/circle-check';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import ThumbsDown from 'lucide-react-native/dist/esm/icons/thumbs-down';
import ThumbsUp from 'lucide-react-native/dist/esm/icons/thumbs-up';
import Trash2 from 'lucide-react-native/dist/esm/icons/trash-2';
import { normalize } from '../../../utils/normalize';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { CommunityStackParamList } from '../../../navigation/types';
import {
  useDeletePost,
  usePost,
  useReactToPost,
  useUpdateAnswered,
} from '../hooks/queries';
import PostContentView from '../components/PostContentView';
import CommentSection from '../components/CommentSection';
import UserAvatar from '../../../components/common/UserAvatar';
import PublicProfileModal from '../components/PublicProfileModal';
import { ReactionType } from '../types';
import { styles, COLORS } from './PostDetailScreen.styles';
import { tokens } from '../../../theme/tokens';
import { useSubmitLock } from '../../../hooks/useSubmitLock';
import { useScreenInsets } from '../../../hooks/useScreenInsets';

type DetailRoute = RouteProp<CommunityStackParamList, 'CommunityDetail'>;

export default function PostDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<DetailRoute>();
  const { showAlert } = useAlert();
  const [isAuthorProfileVisible, setAuthorProfileVisible] = useState(false);

  const postId = route.params?.postId;
  const screenInsets = useScreenInsets(false);
  const user = useAuthStore(state => state.user);
  const isLoggedIn = !!user;

  const { data: post, isLoading, isError } = usePost(postId);
  const react = useReactToPost(postId ?? '');
  const updateAnswered = useUpdateAnswered(postId ?? '');
  const deletePost = useDeletePost();

  const isAuthor = !!post && user?.userId === post.userId;

  const reactLock = useSubmitLock();
  const postActionLock = useSubmitLock();
  const handleReact = (type: ReactionType) => {
    if (!isLoggedIn) {
      showAlert({ title: '로그인 필요', message: '로그인 후 이용할 수 있어요.' });
      return;
    }
    return reactLock.runExclusive(async () => {
      try {
        await react.mutateAsync(type);
      } catch (error) {
        showAlert({
          title: '반응 등록 실패',
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    });
  };

  const handleDelete = () => {
    if (!post) return;
    showAlert({
      title: '게시글 삭제',
      message: '게시글을 삭제할까요? 되돌릴 수 없어요.',
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost.mutateAsync(post.id);
              navigation.goBack();
            } catch (error) {
              showAlert({
                title: '삭제 실패',
                message: getBackendErrorMessage(error),
                type: 'error',
              });
            }
          },
        },
      ],
    });
  };

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.topBarButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        hitSlop={8}
      >
        <ChevronLeft size={normalize(22)} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.topBarTitle}>게시글</Text>
      <View style={styles.topBarButton} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, screenInsets]}>
        {renderTopBar()}
        <View style={styles.stateBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.stateText}>게시글을 불러오는 중…</Text>
        </View>
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={[styles.container, screenInsets]}>
        {renderTopBar()}
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            게시글을 찾을 수 없어요.{'\n'}삭제됐거나 접근할 수 없는 글이에요.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.stateLink}>목록으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  return (
    <View style={[styles.container, screenInsets]}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.white} />
      {renderTopBar()}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {post.category === 'qna' && (
            <View style={styles.statusRow}>
              <View
                  style={[
                    styles.statusTag,
                    post.isAnswered ? styles.statusTagAnswered : styles.statusTagPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      post.isAnswered ? styles.statusTagTextAnswered : styles.statusTagTextPending,
                    ]}
                  >
                    {post.isAnswered ? '답변완료' : '답변대기'}
                  </Text>
              </View>
            </View>
          )}

          <Text style={styles.title}>{post.title}</Text>

          <View style={styles.metaRow}>

            <TouchableOpacity
              style={styles.authorTouchable}
              onPress={() => setAuthorProfileVisible(true)}
              activeOpacity={0.7}
              hitSlop={6}
            >
              <UserAvatar
                name={post.author}
                imageUrl={post.authorImage}
                avatarHash={post.authorAvatarHash}
                size={normalize(24)}
              />
              <Text style={styles.metaAuthor}>{post.author}</Text>
            </TouchableOpacity>
            <Text style={styles.metaText}>· {post.createdAt}</Text>
            <View style={styles.metaViews}>
              <Eye size={normalize(12)} color={COLORS.textTertiary} />
              <Text style={styles.metaText}>{post.views.toLocaleString()}</Text>
            </View>
          </View>

          {isAuthor && (
            <View style={styles.authorActions}>
              {post.category === 'qna' && (
                <TouchableOpacity
                  style={[styles.authorActionButton, styles.authorActionAccent]}
                  onPress={() =>
                    postActionLock.runExclusive(() =>
                      updateAnswered.mutateAsync(!post.isAnswered),
                    )
                  }
                  disabled={
                    updateAnswered.isPending || postActionLock.isSubmitting
                  }
                  accessibilityState={{
                    disabled:
                      updateAnswered.isPending || postActionLock.isSubmitting,
                  }}
                  activeOpacity={0.8}
                >
                  <CheckCircle2
                    size={normalize(12)}
                    color={tokens.tones.success.fg}
                  />
                  <Text
                    style={[
                      styles.authorActionText,
                      styles.authorActionAccentText,
                    ]}
                  >
                    {post.isAnswered ? '답변대기로' : '답변완료로'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.authorActionButton}
                onPress={() =>
                  navigation.navigate('CommunityCreate', {
                    postId: String(post.id),
                  })
                }
                activeOpacity={0.8}
              >
                <Pencil size={normalize(12)} color={COLORS.textSecondary} />
                <Text style={styles.authorActionText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authorActionButton, styles.authorActionDanger]}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Trash2 size={normalize(12)} color={tokens.tones.danger.fg} />
                <Text
                  style={[
                    styles.authorActionText,
                    styles.authorActionDangerText,
                  ]}
                >
                  삭제
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>

        <View style={styles.body}>
          <PostContentView
            content={post.content}
            contentText={post.contentText}
          />
        </View>

        <View style={styles.reactionRow}>
          <TouchableOpacity
            style={[
              styles.reactionButton,
              post.myReaction === 'like' && styles.reactionButtonActive,
            ]}
            onPress={() => handleReact('like')}
            activeOpacity={0.85}
            disabled={react.isPending || reactLock.isSubmitting}
            accessibilityState={{ disabled: react.isPending || reactLock.isSubmitting }}
          >
            <ThumbsUp
              size={normalize(14)}
              color={
                post.myReaction === 'like' ? COLORS.white : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.reactionText,
                post.myReaction === 'like' && styles.reactionTextActive,
              ]}
            >
              좋아요 {post.likes.toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reactionButton,
              post.myReaction === 'dislike' && styles.reactionButtonActiveDislike,
            ]}
            onPress={() => handleReact('dislike')}
            activeOpacity={0.85}
            disabled={react.isPending || reactLock.isSubmitting}
            accessibilityState={{ disabled: react.isPending || reactLock.isSubmitting }}
          >
            <ThumbsDown
              size={normalize(14)}
              color={
                post.myReaction === 'dislike'
                  ? COLORS.white
                  : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.reactionText,
                post.myReaction === 'dislike' && styles.reactionTextActive,
              ]}
            >
              싫어요 {post.dislikes}
            </Text>
          </TouchableOpacity>
        </View>

        <CommentSection postId={post.id} commentCount={post.comments} />

      <PublicProfileModal
        visible={isAuthorProfileVisible}
        onClose={() => setAuthorProfileVisible(false)}
        userId={post.userId ?? null}
        fallbackName={post.author}
      />
      </ScrollView>
    </View>
  );
}
