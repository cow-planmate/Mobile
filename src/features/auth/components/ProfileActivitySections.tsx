import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Heart from 'lucide-react-native/dist/esm/icons/heart';
import MessageCircle from 'lucide-react-native/dist/esm/icons/message-circle';
import {
  Card,
  EmptyState,
  SectionHeader,
  UnderlineTabs,
} from '../../../components/ui';
import { ProfilePlan } from '../../../hooks/useUserProfile';
import {
  useLikedPosts,
  useMyComments,
  useMyPosts,
} from '../../community/hooks/queries';
import { CommunityComment, CommunityPostSummary } from '../../community/types';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
type ActivityTab = 'posts' | 'likes' | 'comments';

const CATEGORY_LABEL: Record<string, string> = {
  free: '자유',
  qna: 'Q&A',
  recommend: '추천',
  feed: '여행기',
};

// 하위 탭 이름은 웹 마이페이지를 그대로 따른다. 웹에 있는 '좋아요한 여행'은
// 앱에 목록 자체가 없어 여기 넣지 않았다.
const TRAVEL_LOG_TABS = [
  { key: 'logs', label: '작성한 여행기' },
  { key: 'comments', label: '내가 쓴 댓글' },
];

const ACTIVITY_TABS = [
  { key: 'posts', label: '작성글' },
  { key: 'likes', label: '좋아요한 글' },
  { key: 'comments', label: '작성 댓글' },
];

const PostRow = ({
  post,
  onPress,
}: {
  post: CommunityPostSummary;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.activityRow}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`${post.title} 상세 보기`}
  >
    <View style={styles.rowMeta}>
      <Text style={styles.category}>
        {CATEGORY_LABEL[post.category] ?? '커뮤니티'}
      </Text>
      <Text style={styles.date}>{post.createdAt}</Text>
    </View>
    <Text style={styles.rowTitle} numberOfLines={2}>
      {post.title}
    </Text>
    <View style={styles.counts}>
      <Heart size={12} color={tokens.colors.textSecondary} />
      <Text style={styles.countText}>{post.likes.toLocaleString()}</Text>
      <MessageCircle size={12} color={tokens.colors.textSecondary} />
      <Text style={styles.countText}>{post.comments.toLocaleString()}</Text>
    </View>
  </TouchableOpacity>
);

const CommentRow = ({
  comment,
  onPress,
}: {
  comment: CommunityComment;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.activityRow}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`${comment.postTitle ?? '게시글'} 상세 보기`}
  >
    <Text style={styles.rowTitle} numberOfLines={2}>
      {comment.postTitle ?? '게시글'}
    </Text>
    <Text style={styles.commentText} numberOfLines={2}>
      {comment.content}
    </Text>
    <Text style={styles.date}>{comment.createdAt}</Text>
  </TouchableOpacity>
);

const LoadMoreButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={styles.loadMoreButton}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel="활동 더 보기"
  >
    <Text style={styles.loadMoreText}>더 보기</Text>
  </TouchableOpacity>
);

export function ProfileFootprintSection({ plans }: { plans: ProfilePlan[] }) {
  return (
    <Card style={styles.card} variant="flat">
      <SectionHeader
        title="여행 발자취"
        count={plans.length > 0 ? `총 ${plans.length}곳` : undefined}
      />
      {plans.length === 0 ? (
        <EmptyState
          title="아직 발자취가 없어요"
          description="완료한 여행을 추가하면 발자취가 쌓여요."
          style={styles.innerEmpty}
        />
      ) : (
        <View style={styles.footprintList}>
          {plans.slice(0, 6).map(plan => (
            <View key={plan.planId} style={styles.footprintRow}>
              <View style={styles.footprintMarker} />
              <View style={styles.footprintText}>
                <Text style={styles.footprintName} numberOfLines={1}>
                  {plan.planName}
                </Text>
                <Text style={styles.footprintDate}>
                  {plan.startDate ?? '일정 날짜 확인 필요'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

// 여행기 댓글은 커뮤니티 댓글과 별개 도메인이라 커뮤니티 활동이 아니라 이 섹션에서 다룬다.
export function ProfileTravelLogSection() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'logs' | 'comments'>('logs');
  const [logSize, setLogSize] = useState(6);
  const [commentSize, setCommentSize] = useState(6);
  const { data, isLoading, isError, refetch } = useMyPosts('feed', logSize);
  const {
    data: commentData,
    isLoading: isCommentLoading,
    isError: isCommentError,
    refetch: refetchComments,
  } = useMyComments(commentSize, true);
  const travelLogs = data?.items ?? [];
  const comments = commentData?.items ?? [];

  const renderBody = () => {
    if (tab === 'comments') {
      if (isCommentLoading) {
        return <ActivityIndicator color={tokens.colors.primary} />;
      }
      if (isCommentError) {
        return (
          <EmptyState
            title="여행기 댓글을 불러오지 못했어요"
            actionLabel="다시 시도"
            onAction={() => void refetchComments()}
            style={styles.innerEmpty}
          />
        );
      }
      if (comments.length === 0) {
        return (
          <EmptyState
            title="여행기에 남긴 댓글이 없어요"
            description="마음에 든 여행기에 한마디 남겨보세요."
            actionLabel="여행기 피드 둘러보기"
            onAction={() =>
              navigation.navigate('MainTabs', { screen: 'FeedTab' })
            }
            style={styles.innerEmpty}
          />
        );
      }
      return (
        <>
          {comments.map(comment => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'FeedTab',
                  params: {
                    screen: 'FeedDetail',
                    params: { postId: String(comment.postId) },
                  },
                })
              }
            />
          ))}
          {(commentData?.totalElements ?? 0) > comments.length && (
            <LoadMoreButton onPress={() => setCommentSize(size => size + 6)} />
          )}
        </>
      );
    }

    if (isLoading) {
      return <ActivityIndicator color={tokens.colors.primary} />;
    }
    if (isError) {
      return (
        <EmptyState
          title="여행기를 불러오지 못했어요"
          actionLabel="다시 시도"
          onAction={() => void refetch()}
          style={styles.innerEmpty}
        />
      );
    }
    if (travelLogs.length === 0) {
      return (
        <EmptyState
          title="아직 작성한 여행기가 없습니다."
          description="완성한 일정을 피드에 공유해 보세요!"
          actionLabel="여행기 피드 둘러보기"
          onAction={() =>
            navigation.navigate('MainTabs', { screen: 'FeedTab' })
          }
          style={styles.innerEmpty}
        />
      );
    }
    return (
      <>
        {travelLogs.map(post => (
          <PostRow
            key={post.id}
            post={post}
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'FeedTab',
                params: {
                  screen: 'FeedDetail',
                  params: { postId: String(post.id) },
                },
              })
            }
          />
        ))}
        {(data?.totalElements ?? 0) > travelLogs.length && (
          <LoadMoreButton onPress={() => setLogSize(size => size + 6)} />
        )}
      </>
    );
  };

  return (
    <Card style={styles.card} variant="flat" padding="none">
      <View style={styles.cardInnerHeader}>
        <SectionHeader title="나의 여행기" />
      </View>
      <UnderlineTabs
        items={TRAVEL_LOG_TABS}
        selectedKey={tab}
        onSelect={key => setTab(key as 'logs' | 'comments')}
        scrollable={false}
        align="start"
        style={styles.subTabs}
      />
      <View style={styles.cardInnerBody}>{renderBody()}</View>
    </Card>
  );
}

export function ProfileCommunitySection() {
  const navigation = useNavigation<any>();
  const [activityTab, setActivityTab] = useState<ActivityTab>('posts');
  const [activitySize, setActivitySize] = useState(8);
  const [commentSize, setCommentSize] = useState(8);
  const {
    data: postData,
    isLoading: isPostLoading,
    isError: isPostError,
    refetch: refetchPosts,
  } = useMyPosts(undefined, activitySize);
  const {
    data: likedData,
    isLoading: isLikedLoading,
    isError: isLikedError,
    refetch: refetchLikes,
  } = useLikedPosts(undefined, activitySize);
  const {
    data: commentData,
    isLoading: isCommentLoading,
    isError: isCommentError,
    refetch: refetchComments,
  } = useMyComments(commentSize);

  const communityPosts = useMemo(
    () => (postData?.items ?? []).filter(post => post.category !== 'feed'),
    [postData?.items],
  );
  const communityLikes = useMemo(
    () => (likedData?.items ?? []).filter(post => post.category !== 'feed'),
    [likedData?.items],
  );

  const activeItems = activityTab === 'posts' ? communityPosts : communityLikes;
  const isActivityLoading =
    activityTab === 'posts' ? isPostLoading : isLikedLoading;
  const isActivityError = activityTab === 'posts' ? isPostError : isLikedError;

  const renderBody = () => {
    if (activityTab === 'comments') {
      if (isCommentLoading) {
        return <ActivityIndicator color={tokens.colors.primary} />;
      }
      if (isCommentError) {
        return (
          <EmptyState
            title="댓글 활동을 불러오지 못했어요"
            actionLabel="다시 시도"
            onAction={() => void refetchComments()}
            style={styles.innerEmpty}
          />
        );
      }
      const comments = commentData?.items ?? [];
      if (comments.length === 0) {
        return (
          <EmptyState
            title="작성한 댓글이 없어요"
            actionLabel="커뮤니티 둘러보기"
            onAction={() =>
              navigation.navigate('MainTabs', { screen: 'CommunityTab' })
            }
            style={styles.innerEmpty}
          />
        );
      }
      return (
        <>
          {comments.map(comment => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'CommunityTab',
                  params: {
                    screen: 'CommunityDetail',
                    params: { postId: String(comment.postId) },
                  },
                })
              }
            />
          ))}
          {(commentData?.totalElements ?? 0) > comments.length && (
            <LoadMoreButton onPress={() => setCommentSize(size => size + 8)} />
          )}
        </>
      );
    }

    if (isActivityLoading) {
      return <ActivityIndicator color={tokens.colors.primary} />;
    }
    if (isActivityError) {
      return (
        <EmptyState
          title="커뮤니티 활동을 불러오지 못했어요"
          actionLabel="다시 시도"
          onAction={() =>
            void (activityTab === 'posts' ? refetchPosts() : refetchLikes())
          }
          style={styles.innerEmpty}
        />
      );
    }
    if (activeItems.length === 0) {
      return (
        <EmptyState
          title={
            activityTab === 'posts'
              ? '작성한 글이 없습니다.'
              : '좋아요한 글이 없습니다.'
          }
          actionLabel="커뮤니티 둘러보기"
          onAction={() =>
            navigation.navigate('MainTabs', { screen: 'CommunityTab' })
          }
          style={styles.innerEmpty}
        />
      );
    }
    const totalElements =
      activityTab === 'posts'
        ? postData?.totalElements
        : likedData?.totalElements;
    return (
      <>
        {activeItems.map(post => (
          <PostRow
            key={post.id}
            post={post}
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'CommunityTab',
                params: {
                  screen: 'CommunityDetail',
                  params: { postId: String(post.id) },
                },
              })
            }
          />
        ))}
        {(totalElements ?? 0) > activeItems.length && (
          <LoadMoreButton onPress={() => setActivitySize(size => size + 8)} />
        )}
      </>
    );
  };

  return (
    <Card style={styles.card} variant="flat" padding="none">
      <View style={styles.cardInnerHeader}>
        <SectionHeader title="게시글 활동" />
      </View>
      <UnderlineTabs
        items={ACTIVITY_TABS}
        selectedKey={activityTab}
        onSelect={key => setActivityTab(key as ActivityTab)}
        scrollable={false}
        align="start"
        style={styles.subTabs}
      />
      <View style={styles.cardInnerBody}>{renderBody()}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // 회색 바탕 위 흰 덩어리는 화면 폭을 그대로 쓴다 — 모서리도 바깥 여백도
  // 두지 않는다. 덩어리 사이는 화면 쪽 20px 띠가 벌려 준다.
  card: {
    borderRadius: 0,
  },
  // 탭 하나가 가로 12를 이미 쓰므로 4만 더해 본문 여백 16에 맞춘다.
  subTabs: {
    paddingHorizontal: normalize(4),
  },
  cardInnerHeader: {
    padding: normalize(16),
    paddingBottom: normalize(12),
  },
  cardInnerBody: {
    padding: normalize(16),
    paddingTop: normalize(4),
  },
  innerEmpty: {
    borderWidth: 0,
    paddingVertical: normalize(24),
  },
  loadMoreButton: {
    minHeight: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(8),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  loadMoreText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },

  planBarHidden: {
    backgroundColor: 'transparent',
  },

  footprintList: {
    gap: normalize(12),
    marginTop: normalize(14),
  },
  footprintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  footprintMarker: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primaryTint,
    borderWidth: 3,
    borderColor: tokens.colors.primary,
  },
  footprintText: {
    flex: 1,
  },
  footprintName: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  footprintDate: {
    marginTop: normalize(2),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },

  activityRow: {
    gap: normalize(4),
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  category: {
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  date: {
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textMuted,
  },
  rowTitle: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },
  countText: {
    marginRight: normalize(6),
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  commentText: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
});
