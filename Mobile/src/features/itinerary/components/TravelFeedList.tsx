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
import { ThumbsUp, ThumbsDown, MessageSquare, Eye, Copy, Clock } from 'lucide-react-native';
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

const generateMockFeedData = (page: number, limit: number = 10): TravelFeedItem[] => {
  const startIndex = (page - 1) * limit;
  const mockTagsList = [
    ['#뚜벅이최적화', '#동선낭비없는'],
    ['#여유로운P', '#극한의J'],
    ['#뚜벅이최적화', '#극한의J'],
    ['#여유로운P', '#동선낭비없는'],
  ];
  const landscapeImages = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', // 해변
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop', // 산
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop', // 안개 낀 강
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop', // 요세미티 계곡
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop', // 호수와 산
    'https://images.unsplash.com/photo-1472214222541-d510753a4907?w=600&h=400&fit=crop', // 초원
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&h=400&fit=crop', // 숲길
    'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?w=600&h=400&fit=crop', // 열기구와 풍경
  ];
  return Array.from({ length: limit }).map((_, index) => {
    const currentId = startIndex + index + 1;
    const id = currentId.toString();
    return {
      id,
      title: currentId % 3 === 1 ? '서울 3박 4일 완벽 여행 코스' : `나만 알고 싶은 인생 여행지 #${id}`,
      description: currentId % 3 === 1 ? '경복궁, 북촌한옥마을, 명동까지 핫플 다 담았어요!' : '상세 일정 및 꿀팁, 맛집 정보가 가득 포함된 알찬 코스입니다.',
      author: `여행러_${id}`,
      authorAvatar: `https://picsum.photos/id/${(currentId * 3) % 70}/100/100`,
      thumbnailUrl: landscapeImages[currentId % landscapeImages.length],
      createdAt: `${Math.floor((currentId * 1.5) % 6) + 1}일 전`,
      likes: ((currentId * 12) % 150) + 5,
      dislikes: ((currentId * 2) % 15) + 1,
      comments: ((currentId * 3) % 40) + 1,
      views: ((currentId * 110) % 1800) + 80,
      forks: ((currentId * 15) % 90) + 5,
      tags: mockTagsList[currentId % 4],
      location: ['서울', '부산', '제주도', '강릉', '경주', '전주'][currentId % 6],
      duration: ['1일', '2박 3일', '3박 4일', '4일 이상'][currentId % 4],
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
    const isActualGrid = viewMode === 'grid';
    return (
      <TouchableOpacity
        style={[styles.feedCard, isActualGrid && styles.feedCardGrid]}
        onPress={() => onItemPress && onItemPress(item)}
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
              <Clock size={12} color="#6B7280" style={{ marginRight: 4 }} />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThumbsUp size={14} color="#1344FF" />
                <Text style={[styles.statText, { color: '#1344FF', fontWeight: 'bold' }]}>
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
        numColumns={1}
        data={processedFeeds}
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
