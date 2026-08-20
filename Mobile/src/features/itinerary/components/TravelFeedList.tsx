import React, { useCallback, useState } from 'react';
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import ThumbsUp from 'lucide-react-native/dist/esm/icons/thumbs-up';
import ThumbsDown from 'lucide-react-native/dist/esm/icons/thumbs-down';
import MessageSquare from 'lucide-react-native/dist/esm/icons/message-square';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import Copy from 'lucide-react-native/dist/esm/icons/copy';
import Clock from 'lucide-react-native/dist/esm/icons/clock';
import { Badge, Card, EmptyState, StatItem, StatRow } from '../../../components/ui';
import LevelBadge from '../../community/components/LevelBadge';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export interface TravelFeedItem {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  authorLevel: number;
  thumbnailUrl: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  comments: number;
  views: number;
  forks: number;
  tags: string[];
  location: string;
  duration: string;
}

interface TravelFeedListProps {
  items: TravelFeedItem[];
  onItemPress?: (item: TravelFeedItem) => void;
  viewMode?: 'list' | 'grid';

  isLoading?: boolean;

  isLoadingMore?: boolean;
  isRefreshing?: boolean;

  isFiltered?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}

const FeedAvatar = ({ uri, name }: { uri: string; name: string }) => {
  const [failed, setFailed] = useState(false);

  if (uri && !failed) {
    return (
      <FastImage
        source={{ uri, priority: FastImage.priority.low }}
        style={styles.avatar}
        resizeMode={FastImage.resizeMode.cover}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarFallbackText}>{(name || '?').charAt(0)}</Text>
    </View>
  );
};

const FeedStats = ({ item }: { item: TravelFeedItem }) => (
  <StatRow divided>
    <StatItem
      icon={<ThumbsUp size={13} color={tokens.colors.primary} />}
      value={item.likes}
      label="좋아요"
      active
    />
    <StatItem
      icon={<ThumbsDown size={13} color={tokens.colors.textSecondary} />}
      value={item.dislikes}
      label="싫어요"
    />
    <StatItem
      icon={<MessageSquare size={13} color={tokens.colors.textSecondary} />}
      value={item.comments}
      label="댓글"
    />
    <StatItem
      icon={<Eye size={13} color={tokens.colors.textSecondary} />}
      value={item.views}
      label="조회"
    />
    <StatItem
      icon={<Copy size={13} color={tokens.colors.textSecondary} />}
      value={item.forks}
      label="가져가기"
    />
  </StatRow>
);

const FeedListItem = React.memo(function FeedListItem({
  item,
  isGrid,
  onPress,
}: {
  item: TravelFeedItem;
  isGrid: boolean;
  onPress?: (item: TravelFeedItem) => void;
}) {
  const handlePress = useCallback(() => {
    if (onPress) onPress(item);
  }, [onPress, item]);

  if (isGrid) {
    return (
      <Card
        padding="none"
        style={styles.feedCard}
        onPress={handlePress}
        accessibilityLabel={item.title}
      >
        <View style={styles.thumbnailContainer}>
          <FastImage
            source={{
              uri: item.thumbnailUrl,
              priority: FastImage.priority.normal,
            }}
            style={styles.thumbnail}
            resizeMode={FastImage.resizeMode.cover}
          />
          {item.location ? (
            <View style={styles.locationBadge}>
              <Text style={styles.locationBadgeText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.authorContainer}>
            <FeedAvatar uri={item.authorAvatar} name={item.author} />
            <View style={styles.authorInfo}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName} numberOfLines={1}>
                  {item.author}
                </Text>
                <LevelBadge level={item.authorLevel} />
              </View>
              <Text style={styles.createdAtText}>{item.createdAt}</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.tagDurationContainer}>
            {item.tags.slice(0, 2).map(tag => (
              <Badge key={tag} label={tag} tone="primary" />
            ))}
            {item.duration ? (
              <Badge
                label={item.duration}
                tone="neutral"
                icon={<Clock size={9} color={tokens.tones.neutral.fg} />}
              />
            ) : null}
          </View>

          <FeedStats item={item} />
        </View>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      style={styles.listCard}
      onPress={handlePress}
      accessibilityLabel={item.title}
    >
      <View style={styles.listLeftContent}>
        <View style={styles.listBadgeRow}>
          {item.location ? (
            <Badge label={item.location} tone="primary" />
          ) : null}
          {item.duration ? (
            <Badge
              label={item.duration}
              tone="neutral"
              icon={<Clock size={9} color={tokens.tones.neutral.fg} />}
            />
          ) : null}
        </View>

        <Text style={styles.listTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.description ? (
          <Text style={styles.listDescription} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.listMetaRow}>
          <Text style={styles.listAuthorName} numberOfLines={1}>
            {item.author}
          </Text>
          <LevelBadge level={item.authorLevel} />
          <Text style={styles.listCreatedAt}>{item.createdAt}</Text>
        </View>

        <FeedStats item={item} />
      </View>

      {item.thumbnailUrl ? (
        <View style={styles.listRightContent}>
          <FastImage
            source={{
              uri: item.thumbnailUrl,
              priority: FastImage.priority.normal,
            }}
            style={styles.listThumbnail}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      ) : null}
    </Card>
  );
});

export default function TravelFeedList({
  items,
  onItemPress,
  viewMode = 'list',
  isLoading = false,
  isLoadingMore = false,
  isRefreshing = false,
  isFiltered = false,
  onRefresh,
  onLoadMore,
}: TravelFeedListProps) {
  const renderItem = useCallback(
    ({ item }: { item: TravelFeedItem }) => (
      <FeedListItem
        item={item}
        isGrid={viewMode === 'grid'}
        onPress={onItemPress}
      />
    ),
    [onItemPress, viewMode],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={tokens.colors.primary} />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return <EmptyState title="여행기를 불러오는 중..." loading />;
    }
    return (
      <EmptyState
        title={
          isFiltered ? '조건에 맞는 여행기가 없어요' : '등록된 여행기가 없어요'
        }
        description={
          isFiltered
            ? '필터를 조정하면 더 많은 여행기를 볼 수 있어요.'
            : '첫 여행기를 발행해 보세요.'
        }
      />
    );
  }, [isLoading, isFiltered]);

  return (
    <View style={styles.container}>
      <FlashList
        key={viewMode}
        numColumns={1}
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[tokens.colors.primary]}
            tintColor={tokens.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },
  listContent: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },

  feedCard: {
    marginBottom: normalize(16),
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: tokens.colors.surface,
  },
  locationBadge: {
    position: 'absolute',
    top: normalize(12),
    right: normalize(12),
    maxWidth: '55%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: tokens.radius.round,
    ...tokens.shadows.sm,
  },
  locationBadgeText: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  cardContent: {
    padding: normalize(16),
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
    gap: normalize(8),
  },
  avatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: tokens.colors.surface,
  },
  avatarFallback: {
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  authorName: {
    flexShrink: 1,
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  createdAtText: {
    marginTop: normalize(2),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  title: {
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    lineHeight: normalize(22),
    marginBottom: normalize(6),
  },
  description: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    lineHeight: normalize(19),
    marginBottom: normalize(10),
  },
  tagDurationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: normalize(5),
  },

  footerLoading: {
    paddingVertical: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },

  listCard: {
    flexDirection: 'row',
    marginBottom: normalize(10),
  },
  listLeftContent: {
    flex: 1,
  },
  listBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: normalize(4),
    marginBottom: normalize(6),
  },
  listTitle: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    marginBottom: normalize(4),
  },
  listDescription: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    marginBottom: normalize(8),
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  listAuthorName: {
    flexShrink: 1,
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  listCreatedAt: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  listRightContent: {
    marginLeft: normalize(12),
    justifyContent: 'center',
  },
  listThumbnail: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: tokens.radius.m,
    backgroundColor: tokens.colors.surface,
  },
});
