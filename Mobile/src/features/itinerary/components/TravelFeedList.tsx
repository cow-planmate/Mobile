import React, { useState, useEffect, useCallback } from 'react';
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
  const mockTagsList = [
    ['#뚜벅이최적화', '#동선낭비없는'],
    ['#여유로운P', '#극한의J'],
    ['#뚜벅이최적화', '#극한의J'],
    ['#여유로운P', '#동선낭비없는'],
  ];
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
      tags: mockTagsList[currentId % 4],
      location: ['서울', '부산', '제주도', '강릉', '경주', '전주'][currentId % 6],
    };
  });
};

interface TravelFeedListProps {
  onItemPress?: (item: TravelFeedItem) => void;
  searchQuery?: string;
  selectedTag?: string | null;
  viewMode?: 'list' | 'grid';
  sortBy?: string;
  filterRegion?: string;
  filterDuration?: string;
}

export default function TravelFeedList({
  onItemPress,
  searchQuery = '',
  selectedTag = null,
  viewMode = 'list',
  sortBy = '최신순',
  filterRegion = '전체',
  filterDuration = '전체',
}: TravelFeedListProps) {
  const [feeds, setFeeds] = useState<TravelFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Filter feeds based on search query, selected tag, region, and duration
  const processedFeeds = feeds.filter(
    (item) =>
      // Search filter
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.author.toLowerCase().includes(searchQuery.toLowerCase())) &&
      // Tag filter
      (selectedTag === null || item.tags.includes(selectedTag)) &&
      // Region filter
      (filterRegion === '전체' || item.location === filterRegion) &&
      // Duration filter
      (filterDuration === '전체' ||
       (filterDuration === '1일' && item.createdAt === '1일 전') ||
       (filterDuration === '2-3일' && (item.createdAt === '2일 전' || item.createdAt === '3일 전')) ||
       (filterDuration === '4일 이상' && (item.createdAt.includes('4일') || item.createdAt.includes('5일') || item.createdAt.includes('주') || item.createdAt.includes('달'))))
  );

  // Apply sorting
  if (sortBy === '인기순') {
    processedFeeds.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
  } else if (sortBy === '좋아요순') {
    processedFeeds.sort((a, b) => b.likes - a.likes);
  } else if (sortBy === '최신순') {
    processedFeeds.sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }

  // Mock API Call
  const fetchFeeds = useCallback(async (pageNumber: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newFeeds = generateMockFeedData(pageNumber, 10);
      
      if (isRefresh) {
        setFeeds(newFeeds);
        setHasMore(true);
      } else {
        setFeeds((prev) => [...prev, ...newFeeds]);
      }
      
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

  const renderItem = useCallback(({ item }: { item: TravelFeedItem }) => {
    const isGrid = viewMode === 'grid';
    return (
      <TouchableOpacity
        style={[styles.feedCard, isGrid && styles.feedCardGrid]}
        onPress={() => onItemPress && onItemPress(item)}
        activeOpacity={0.9}
      >
        <FastImage
          source={{ uri: item.thumbnailUrl, priority: FastImage.priority.normal }}
          style={[styles.thumbnail, isGrid && styles.thumbnailGrid]}
          resizeMode={FastImage.resizeMode.cover}
        />
        
        <View style={[styles.cardContent, isGrid && styles.cardContentGrid]}>
          <View style={styles.locationTag}>
            <MapPin size={10} color={COLORS.primary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          <Text style={[styles.title, isGrid && styles.titleGrid]} numberOfLines={isGrid ? 1 : 2}>
            {item.title}
          </Text>

          {!isGrid && (
            <View style={styles.tagContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.footer, isGrid && styles.footerGrid]}>
            <View style={styles.authorContainer}>
              <FastImage
                source={{ uri: item.authorAvatar, priority: FastImage.priority.low }}
                style={[styles.avatar, isGrid && styles.avatarGrid]}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={[styles.authorName, isGrid && styles.authorNameGrid]} numberOfLines={1}>
                {item.author}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Heart size={12} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{item.likes}</Text>
              </View>
              {!isGrid && (
                <View style={styles.statItem}>
                  <MessageSquare size={12} color={COLORS.textSecondary} />
                  <Text style={styles.statText}>{item.comments}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [onItemPress, viewMode]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }, [loading]);

  const renderEmpty = useCallback(() => {
    if (loading && processedFeeds.length === 0) return null;
    const isFiltered = searchQuery || selectedTag !== null || filterRegion !== '전체' || filterDuration !== '전체';
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {isFiltered ? '검색 결과와 일치하는 여행기가 없습니다.' : '등록된 여행기가 없습니다.'}
        </Text>
      </View>
    );
  }, [loading, processedFeeds.length, searchQuery, selectedTag, filterRegion, filterDuration]);

  return (
    <View style={styles.container}>
      <FlashList
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        data={processedFeeds}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={viewMode === 'grid' ? 200 : 340}
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
    paddingHorizontal: normalize(10),
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
  feedCardGrid: {
    flex: 1,
    margin: normalize(6),
    marginBottom: normalize(12),
  },
  thumbnail: {
    width: '100%',
    height: normalize(180),
    backgroundColor: COLORS.surface,
  },
  thumbnailGrid: {
    height: normalize(110),
  },
  cardContent: {
    padding: normalize(16),
  },
  cardContentGrid: {
    padding: normalize(10),
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
  titleGrid: {
    fontSize: normalize(13),
    lineHeight: normalize(18),
    height: normalize(18),
    marginBottom: normalize(4),
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
  footerGrid: {
    paddingTop: normalize(8),
    marginTop: normalize(2),
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
  avatarGrid: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
  },
  authorName: {
    fontSize: normalize(13),
    fontWeight: '500',
    color: COLORS.text,
  },
  authorNameGrid: {
    fontSize: normalize(10),
    maxWidth: normalize(60),
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
