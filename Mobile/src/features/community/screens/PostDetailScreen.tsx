import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CheckCircle2,
  ChevronLeft,
  Eye,
  MapPin,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Users,
} from 'lucide-react-native';
import { normalize } from '../../../utils/normalize';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAlert } from '../../../contexts/AlertContext';
import { CommunityStackParamList } from '../../../navigation/types';
import {
  useChangeMateStatus,
  useDeletePost,
  useJoinMate,
  useLeaveMate,
  usePost,
  useReactToPost,
  useUpdateAnswered,
} from '../hooks/queries';
import PostContentView from '../components/PostContentView';
import CommentSection from '../components/CommentSection';
import UserAvatar from '../components/UserAvatar';
import LevelBadge from '../components/LevelBadge';
import { ReactionType } from '../types';
import { styles, COLORS } from './PostDetailScreen.styles';

type DetailRoute = RouteProp<CommunityStackParamList, 'CommunityDetail'>;

/** 게시글 상세 (자유/Q&A/메이트/장소추천 공용) */
export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<DetailRoute>();
  const { showAlert } = useAlert();

  const postId = route.params?.postId;
  const user = useAuthStore(state => state.user);
  const isLoggedIn = !!user;

  const { data: post, isLoading, isError } = usePost(postId);
  const react = useReactToPost(postId ?? '');
  const joinMate = useJoinMate(postId ?? '');
  const leaveMate = useLeaveMate(postId ?? '');
  const changeStatus = useChangeMateStatus(postId ?? '');
  const updateAnswered = useUpdateAnswered(postId ?? '');
  const deletePost = useDeletePost();

  const isAuthor = !!post && user?.userId === post.userId;

  const handleReact = async (type: ReactionType) => {
    if (!isLoggedIn) {
      showAlert({ title: '로그인 필요', message: '로그인 후 이용할 수 있어요.' });
      return;
    }
    try {
      await react.mutateAsync(type);
    } catch (error) {
      showAlert({
        title: '반응 등록 실패',
        message: (error as Error).message,
        type: 'error',
      });
    }
  };

  const handleDelete = () => {
    if (!post) return;
    showAlert({
      title: '게시글 삭제',
      message: '게시글을 삭제할까요? 되돌릴 수 없습니다.',
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
                message: (error as Error).message,
                type: 'error',
              });
            }
          },
        },
      ],
    });
  };

  /**
   * 메이트 참여. 이미 참여한 상태면 서버가 에러를 주므로, 그때는 참여 취소를
   * 물어본다 (웹과 동일한 흐름).
   */
  const handleJoinMate = async () => {
    try {
      await joinMate.mutateAsync();
      showAlert({ title: '참여 완료', message: '메이트로 참여했어요!', type: 'success' });
    } catch (error) {
      const message = (error as Error).message ?? '';
      if (message.includes('이미 참여')) {
        showAlert({
          title: '이미 참여 중',
          message: '참여를 취소할까요?',
          type: 'confirm',
          buttons: [
            { text: '아니요', style: 'cancel' },
            {
              text: '참여 취소',
              style: 'destructive',
              onPress: async () => {
                try {
                  await leaveMate.mutateAsync();
                } catch (leaveError) {
                  showAlert({
                    title: '참여 취소 실패',
                    message: (leaveError as Error).message,
                    type: 'error',
                  });
                }
              },
            },
          ],
        });
        return;
      }
      showAlert({ title: '참여 실패', message, type: 'error' });
    }
  };

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.topBarButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <ChevronLeft size={normalize(22)} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.topBarTitle}>게시글</Text>
      <View style={styles.topBarButton} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {renderTopBar()}
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            게시글을 찾을 수 없어요.{'\n'}삭제되었거나 접근할 수 없는 글입니다.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.stateLink}>목록으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isRecruiting = post.status === 'recruiting';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderTopBar()}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {(post.category === 'qna' || post.category === 'mate') && (
            <View style={styles.statusRow}>
              {post.category === 'qna' && (
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: post.isAnswered ? '#D1FAE5' : '#FEF3C7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      { color: post.isAnswered ? '#059669' : '#D97706' },
                    ]}
                  >
                    {post.isAnswered ? '답변완료' : '답변대기'}
                  </Text>
                </View>
              )}
              {post.category === 'mate' && (
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: isRecruiting ? COLORS.sub : COLORS.borderLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      { color: isRecruiting ? COLORS.primary : COLORS.textSecondary },
                    ]}
                  >
                    {isRecruiting ? '모집중' : '모집마감'}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.title}>{post.title}</Text>

          <View style={styles.metaRow}>
            <UserAvatar
              name={post.author}
              imageUrl={post.authorImage}
              avatarHash={post.authorAvatarHash}
              size={normalize(24)}
            />
            <Text style={styles.metaAuthor}>{post.author}</Text>
            <LevelBadge level={post.level} />
            <Text style={styles.metaText}>· {post.createdAt}</Text>
            <View style={styles.metaViews}>
              <Eye size={normalize(12)} color={COLORS.textTertiary} />
              <Text style={styles.metaText}>{post.views}</Text>
            </View>
          </View>

          {isAuthor && (
            <View style={styles.authorActions}>
              {post.category === 'qna' && (
                <TouchableOpacity
                  style={[styles.authorActionButton, styles.authorActionAccent]}
                  onPress={() => updateAnswered.mutate(!post.isAnswered)}
                  activeOpacity={0.8}
                >
                  <CheckCircle2 size={normalize(12)} color="#059669" />
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
              {post.category === 'mate' && (
                <TouchableOpacity
                  style={styles.authorActionButton}
                  onPress={() =>
                    changeStatus.mutate(isRecruiting ? 'closed' : 'recruiting')
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.authorActionText}>
                    {isRecruiting ? '모집 마감하기' : '다시 모집하기'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.authorActionButton, styles.authorActionDanger]}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Trash2 size={normalize(12)} color={COLORS.danger} />
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

          {post.category === 'mate' && (
            <View style={styles.mateBar}>
              <View style={styles.mateCount}>
                <Users size={normalize(14)} color={COLORS.primary} />
                <Text style={styles.mateCountText}>
                  {post.participants ?? 0}
                  {post.maxParticipants
                    ? ` / ${post.maxParticipants}명`
                    : '명 (제한 없음)'}
                </Text>
              </View>
              {isLoggedIn && !isAuthor && (
                <TouchableOpacity
                  style={[
                    styles.mateButton,
                    !isRecruiting && styles.mateButtonDisabled,
                  ]}
                  onPress={handleJoinMate}
                  disabled={!isRecruiting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.mateButtonText}>
                    {isRecruiting ? '참여하기' : '모집 마감'}
                  </Text>
                </TouchableOpacity>
              )}
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
              좋아요 {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reactionButton,
              post.myReaction === 'dislike' && styles.reactionButtonActiveDislike,
            ]}
            onPress={() => handleReact('dislike')}
            activeOpacity={0.85}
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

        {post.category === 'mate' && !!post.region && (
          <View style={styles.regionRow}>
            <MapPin size={normalize(13)} color={COLORS.textTertiary} />
            <Text style={styles.metaText}>희망 지역: {post.region}</Text>
          </View>
        )}

        <CommentSection postId={post.id} commentCount={post.comments} />
      </ScrollView>
    </View>
  );
}
