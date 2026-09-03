import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import FallbackImage from '../../../components/common/FallbackImage';
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

  const meta = [item.author, item.createdAt, `조회 ${item.views.toLocaleString()}`]
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
        </Text>

        <View style={styles.footRow}>
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
          <Text style={styles.counts}>
            <Text style={item.likes > 0 ? styles.countsOn : undefined}>
              {`추천 ${item.likes}`}
            </Text>
            {` · 댓글 ${item.comments}`}
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
    marginBottom: normalize(6),
  },
  footRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: normalize(10),
    marginTop: normalize(6),
  },
  meta: {
    flex: 1,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  counts: {
    flex: 0,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  countsOn: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
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
