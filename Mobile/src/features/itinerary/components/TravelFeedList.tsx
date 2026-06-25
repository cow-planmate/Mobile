import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Heart, MessageSquare, MapPin } from 'lucide-react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

const COLORS = theme.colors;

export interface TravelFeedItem {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  thumbnailUrl: string;
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
  location: string;
}

const generateMockFeedData = (page: number, limit: number = 10): TravelFeedItem[] => {
  const startIndex = (page - 1) * limit;
  return Array.from({ length: limit }).map((_, index) => {
    const currentId = startIndex + index + 1;
    const id = currentId.toString();
    return {
      id,
      title: `나만 알고 싶은 인생 여행지 #${id} - 환상적인 뷰와 맛집 코스`,
      author: `여행러_${id}`,
      authorAvatar: `https://picsum.photos/id/${(currentId * 3) % 70}/100/100`,
      thumbnailUrl: `https://picsum.photos/id/${(currentId * 7) % 70}/600/400`,
      createdAt: `${Math.floor((currentId * 1.5) % 6) + 1}일 전`,
      likes: ((currentId * 12) % 150) + 5,
      comments: ((currentId * 3) % 40) + 1,
      tags: ['힐링', '인생샷', '가족여행', '맛집투어'].slice(0, (currentId % 3) + 1),
      location: ['제주', '강릉', '여수', '부산', '교토', '발리'][currentId % 6],
    };
  });
};

interface TravelFeedListProps {
  onItemPress?: (item: TravelFeedItem) => void;
}

export default function TravelFeedList({ onItemPress }: TravelFeedListProps) {
  const [feeds, setFeeds] = useState<TravelFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Mock API Call
  const fetchFeeds = useCallback(async (pageNumber: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newFeeds = generateMockFeedData(pageNumber, 10);
      
      if (isRefresh) {
        setFeeds(newFeeds);
        setHasMore(true);
      } else {
        setFeeds((prev) => [...prev, ...newFeeds]);
      }
      
      // Limit to 5 pages for simulation
      if (pageNumber >= 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch travel feeds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchFeeds(1, true);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchFeeds(1, true);
  }, [fetchFeeds]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeeds(nextPage);
    }
  }, [loading, hasMore, page, fetchFeeds]);

  const renderItem = useCallback(({ item }: { item: TravelFeedItem }) => (
    <TouchableOpacity
      style={styles.feedCard}
      onPress={() => onItemPress && onItemPress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      
      <View style={styles.cardContent}>
        <View style={styles.locationTag}>
          <MapPin size={12} color={COLORS.primary} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.tagContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: item.authorAvatar }}
              style={styles.avatar}
            />
            <Text style={styles.authorName}>{item.author}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Heart size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{item.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <MessageSquare size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{item.comments}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [onItemPress]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }, [loading]);

  const renderEmpty = useCallback(() => {
    if (loading && feeds.length === 0) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>등록된 여행기가 없습니다.</Text>
      </View>
    );
  }, [loading, feeds.length]);

  return (
    <View style={styles.container}>
      <FlashList
        data={feeds}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={340}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
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
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  feedCard: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(16),
    marginBottom: normalize(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: normalize(180),
    backgroundColor: COLORS.surface,
  },
  cardContent: {
    padding: normalize(16),
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sub,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(4),
    alignSelf: 'flex-start',
    marginBottom: normalize(8),
    gap: normalize(4),
  },
  locationText: {
    fontSize: normalize(11),
    fontWeight: '600',
    color: COLORS.primary,
  },
  title: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: normalize(22),
    marginBottom: normalize(8),
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6),
    marginBottom: normalize(12),
  },
  tag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tagText: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: normalize(12),
    marginTop: normalize(4),
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  avatar: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: COLORS.surface,
  },
  authorName: {
    fontSize: normalize(13),
    fontWeight: '500',
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: normalize(12),
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
});
