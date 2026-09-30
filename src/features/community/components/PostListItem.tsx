import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import FallbackImage from '../../../components/common/FallbackImage';
import UserAvatar from '../../../components/common/UserAvatar';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { BoardKey } from '../constants/board';
import { CommunityPostSummary } from '../types';
import PostTypeBadges from './PostTypeBadges';

/**
 * 게시판 글 한 줄.
 *
 * 커뮤니티 목록과 글 상세 아래의 '다른 글'이 같은 줄을 쓴다 — 목록에서 보던
 * 것과 다른 모양이 상세 아래에 또 나오면 같은 게시판으로 읽히지 않는다.
 *
 * 구성은 웹 PostListItem의 좁은 화면 갈래(sm:hidden)를 따른다 — 제목 뒤에 댓글 수,
 * 그 아래 한 줄에 글쓴이 · 등록일 · 조회 · 추천. 썸네일만 웹과 다르게 사진을 그대로
 * 띄운다 — 여행 글은 사진이 곧 정보라 아이콘으로 바꾸면 목록에서 잃는 게 크다.
 */
const PostListItem = React.memo(function PostListItem({
  item,
  category,
  onPress,
}: {
  item: CommunityPostSummary;
  category: BoardKey;
  onPress: (postId: string) => void;
}) {
  const handlePress = useCallback(
    () => onPress(String(item.id)),
    [onPress, item.id],
  );

  const meta = [
    item.createdAt,
    `조회 ${item.views.toLocaleString()}`,
    `추천 ${item.likes.toLocaleString()}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={styles.left}>
        <PostTypeBadges post={item} category={category} />

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
          {item.comments > 0 ? (
            <Text style={styles.commentCount}>{` [${item.comments}]`}</Text>
          ) : null}
        </Text>

        <View style={styles.metaRow}>
          <UserAvatar
            name={item.author}
            imageUrl={item.authorImage}
            avatarHash={item.authorAvatarHash}
            size={normalize(20)}
          />
          <Text style={styles.meta} numberOfLines={1}>
            <Text style={styles.author}>{item.author}</Text>
            {` · ${meta}`}
          </Text>
        </View>
      </View>

      {item.image ? (
        <View style={styles.right}>
          <FallbackImage
            uri={item.image}
            style={styles.thumbnail}
            fallback={
              <View style={[styles.thumbnail, styles.thumbnailFallback]} />
            }
          />
        </View>
      ) : null}
    </Pressable>
  );
});

export default PostListItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.white,
  },
  rowPressed: {
    backgroundColor: tokens.colors.surface,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    lineHeight: normalize(20),
  },
  // 웹은 제목 뒤에 [12] 꼴로 댓글 수를 붙인다. 메타 줄에서 빼 자리다.
  commentCount: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginTop: normalize(7),
  },
  // #9CA3AF는 흰 바탕 대비 2.6:1로 본문 기준에 미달이라 웹 값(4.8:1)으로 올렸다.
  meta: {
    flex: 1,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: '#6B7280',
  },
  author: {
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textLabel,
  },
  right: {
    marginLeft: normalize(12),
  },
  thumbnail: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: tokens.radius.m,
  },
  thumbnailFallback: {
    backgroundColor: tokens.colors.surface,
  },
});
