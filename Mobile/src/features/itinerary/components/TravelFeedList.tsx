import React, { useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import ThumbsUp from 'lucide-react-native/dist/esm/icons/thumbs-up';
import ThumbsDown from 'lucide-react-native/dist/esm/icons/thumbs-down';
import MessageSquare from 'lucide-react-native/dist/esm/icons/message-square';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import Copy from 'lucide-react-native/dist/esm/icons/copy';
import Clock from 'lucide-react-native/dist/esm/icons/clock';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

const COLORS = theme.colors;

export interface TravelFeedItem {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
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
  /** 표시할 여행기 목록 (조회·필터는 화면이 담당한다) */
  items: TravelFeedItem[];
  onItemPress?: (item: TravelFeedItem) => void;
  viewMode?: 'list' | 'grid';
  /** 첫 조회 중 */
  isLoading?: boolean;
  /** 다음 페이지를 불러오는 중 */
  isLoadingMore?: boolean;
  isRefreshing?: boolean;
  /** 필터/검색이 걸린 상태인지 — 빈 목록 문구를 가른다 */
  isFiltered?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}

/**
 * 여행기 카드 한 장.
 *
 * memo로 감싸 목록이 리렌더될 때 카드까지 함께 다시 그려지지 않게 한다.
 * 카드마다 FastImage가 1~2개씩 들어 있어 재렌더 비용이 크다.
 */
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
      <TouchableOpacity
        style={[styles.feedCard, styles.feedCardGrid]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.thumbnailContainer}>
          <FastImage
            source={{ uri: item.thumbnailUrl, priority: FastImage.priority.normal }}
            style={styles.thumbnail}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.locationBadge}>
            <Text style={styles.locationBadgeText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.authorContainer}>
            <FastImage
              source={{ uri: item.authorAvatar, priority: FastImage.priority.low }}
              style={styles.avatar}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName} numberOfLines={1}>
                {item.author}
              </Text>
              <Text style={styles.createdAtText}>{item.createdAt}</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.tagDurationContainer}>
            <View style={styles.tagContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={styles.durationBadge}>
              <Clock size={12} color="#6B7280" style={styles.durationIcon} />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThumbsUp size={14} color="#1344FF" />
                <Text style={[styles.statText, styles.statTextLikes]}>
                  {item.likes}
                </Text>
              </View>
              <View style={styles.statItem}>
                <ThumbsDown size={14} color="#6B7280" />
                <Text style={styles.statText}>{item.dislikes}</Text>
              </View>
              <View style={styles.statItem}>
                <MessageSquare size={14} color="#6B7280" />
                <Text style={styles.statText}>{item.comments}</Text>
              </View>
              <View style={styles.statItem}>
                <Eye size={14} color="#6B7280" />
                <Text style={styles.statText}>{item.views.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Copy size={14} color="#6B7280" />
                <Text style={styles.statText}>{item.forks}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.listLeftContent}>
        <View style={styles.listTitleRow}>
          <View style={styles.listLocationBadge}>
            <Text style={styles.listLocationBadgeText}>{item.location}</Text>
          </View>
          <Text style={styles.listTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <Text style={styles.listDescription} numberOfLines={1}>
          {item.description}
        </Text>

        <View style={styles.listMetaRow}>
          <Text style={styles.listAuthorName} numberOfLines={1}>
            {item.author}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>LV.2</Text>
          </View>
          <Text style={styles.listDivider}>•</Text>
          <Text style={styles.listCreatedAt}>{item.createdAt}</Text>
          <Text style={styles.listDivider}>•</Text>
          <View style={styles.listDurationContainer}>
            <Clock size={11} color="#9CA3AF" style={styles.listDurationIcon} />
            <Text style={styles.listDurationText}>{item.duration}</Text>
          </View>
        </View>

        <View style={styles.listStatsRow}>
          <View style={styles.listStatItem}>
            <ThumbsUp size={11} color="#9CA3AF" />
            <Text style={styles.listStatText}>{item.likes}</Text>
          </View>
          <View style={styles.listStatItem}>
            <MessageSquare size={11} color="#9CA3AF" />
            <Text style={styles.listStatText}>{item.comments}</Text>
          </View>
          <View style={styles.listStatItem}>
            <Eye size={11} color="#9CA3AF" />
            <Text style={styles.listStatText}>{item.views}</Text>
          </View>
        </View>
      </View>

      <View style={styles.listRightContent}>
        {item.thumbnailUrl ? (
          <FastImage
            source={{ uri: item.thumbnailUrl, priority: FastImage.priority.normal }}
            style={styles.listThumbnail}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

/**
 * 여행기 목록 (표시 전용).
 *
 * 조회·필터·페이지네이션은 서버가 처리하고 화면(TravelFeedScreen)이 관리한다.
 * 이 컴포넌트는 받은 목록을 그리는 일만 한다.
 */
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
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {isFiltered
            ? '검색 결과와 일치하는 여행기가 없습니다.'
            : '등록된 여행기가 없습니다.'}
        </Text>
      </View>
    );
  }, [isLoading, isFiltered]);

  return (
    <View style={styles.container}>
      <FlashList
        key={viewMode}
        numColumns={1}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={[styles.listContent, viewMode === 'grid' && styles.listContentGrid]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  listContentGrid: {
    paddingHorizontal: normalize(16),
  },
  feedCard: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(16),
    marginBottom: normalize(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  feedCardGrid: {
    flex: 1,
    marginBottom: normalize(20),
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: normalize(180),
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
  },
  locationBadge: {
    position: 'absolute',
    top: normalize(12),
    right: normalize(12),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationBadgeText: {
    fontSize: normalize(11),
    fontWeight: 'bold',
    color: '#1344FF',
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
    backgroundColor: COLORS.surface,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: normalize(13),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  createdAtText: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
    marginTop: normalize(1),
  },
  title: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: normalize(22),
    marginBottom: normalize(6),
  },
  description: {
    fontSize: normalize(13),
    color: COLORS.textSecondary,
    lineHeight: normalize(18),
    marginBottom: normalize(12),
  },
  tagDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(12),
  },
  tagContainer: {
    flexDirection: 'row',
    gap: normalize(6),
  },
  tag: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
  },
  tagText: {
    fontSize: normalize(11),
    color: '#1344FF',
    fontWeight: 'bold',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
  },
  durationIcon: {
    marginRight: normalize(4),
  },
  durationText: {
    fontSize: normalize(11),
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: normalize(12),
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  statText: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
  },
  statTextLikes: {
    color: '#1344FF',
    fontWeight: 'bold',
  },
  footerLoading: {
    paddingVertical: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: normalize(14),
    color: COLORS.textTertiary,
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(12),
    marginBottom: normalize(12),
    padding: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  listLeftContent: {
    flex: 1,
    marginRight: normalize(12),
    justifyContent: 'center',
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(6),
  },
  listLocationBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
    marginRight: normalize(8),
  },
  listLocationBadgeText: {
    fontSize: normalize(11),
    fontWeight: 'bold',
    color: '#1A73E8',
  },
  listTitle: {
    fontSize: normalize(15),
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  listDescription: {
    fontSize: normalize(13),
    color: COLORS.textSecondary,
    marginBottom: normalize(10),
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  listAuthorName: {
    fontSize: normalize(12),
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: normalize(4),
  },
  levelBadge: {
    backgroundColor: '#F1F3F4',
    paddingHorizontal: normalize(5),
    paddingVertical: normalize(1),
    borderRadius: normalize(4),
  },
  levelBadgeText: {
    fontSize: normalize(9),
    color: '#5F6368',
    fontWeight: 'bold',
  },
  listDivider: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
    marginHorizontal: normalize(6),
  },
  listCreatedAt: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
  },
  listDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDurationIcon: {
    marginRight: normalize(2),
  },
  listDurationText: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
  },
  listRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    marginTop: normalize(6),
  },
  listStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(2),
  },
  listStatText: {
    fontSize: normalize(11),
    color: '#5F6368',
  },
  listThumbnail: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(8),
    backgroundColor: COLORS.surface,
  },
});
