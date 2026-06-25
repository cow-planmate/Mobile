import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Heart, MessageSquare, Eye } from 'lucide-react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

const COLORS = theme.colors;

export interface BoardItem {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
}

const generateMockBoardData = (page: number, limit: number = 15): BoardItem[] => {
  const startIndex = (page - 1) * limit;
  const categories = ['자유', '질문', '정보', '일정공유', '동행찾기'];
  return Array.from({ length: limit }).map((_, index) => {
    const currentId = startIndex + index + 1;
    const id = currentId.toString();
    return {
      id,
      title: `[${categories[currentId % categories.length]}] 게시판 테스트 게시글 #${id} 제목입니다.`,
      content: `이 글은 무한 스크롤 성능 테스트를 위한 게시판 내용입니다. @shopify/flash-list는 대규모 리스트를 부드럽게 렌더링하기 위한 고성능 컴포넌트입니다. 스크롤을 내려 추가 데이터를 로드하세요.`,
      author: `유저_${id}`,
      createdAt: `${Math.floor((currentId * 1.2) % 24) + 1}시간 전`,
      category: categories[currentId % categories.length],
      likes: ((currentId * 7) % 80) + 2,
      comments: ((currentId * 2) % 25) + 1,
      views: ((currentId * 25) % 400) + 10,
    };
  });
};

interface BoardListProps {
  onItemPress?: (item: BoardItem) => void;
}

export default function BoardList({ onItemPress }: BoardListProps) {
  const [posts, setPosts] = useState<BoardItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNumber: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      const newPosts = generateMockBoardData(pageNumber, 15);
      
      if (isRefresh) {
        setPosts(newPosts);
        setHasMore(true);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      // Limit to 6 pages for simulation
      if (pageNumber >= 6) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch board posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [loading, hasMore, page, fetchPosts]);

  const renderItem = useCallback(({ item }: { item: BoardItem }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => onItemPress && onItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.timeText}>{item.createdAt}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.content} numberOfLines={2}>
        {item.content}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.authorText}>{item.author}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Heart size={13} color={COLORS.textSecondary} />
            <Text style={styles.statValue}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageSquare size={13} color={COLORS.textSecondary} />
            <Text style={styles.statValue}>{item.comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Eye size={13} color={COLORS.textSecondary} />
            <Text style={styles.statValue}>{item.views}</Text>
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
    if (loading && posts.length === 0) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>게시글이 존재하지 않습니다.</Text>
      </View>
    );
  }, [loading, posts.length]);

  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={140}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
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
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(12),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  categoryBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  timeText: {
    fontSize: normalize(11),
    color: COLORS.textTertiary,
  },
  title: {
    fontSize: normalize(15),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: normalize(6),
  },
  content: {
    fontSize: normalize(13),
    color: COLORS.textLabel,
    lineHeight: normalize(18),
    marginBottom: normalize(12),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: normalize(10),
  },
  authorText: {
    fontSize: normalize(12),
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: normalize(10),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },
  statValue: {
    fontSize: normalize(11),
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
