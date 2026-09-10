import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
import Search from 'lucide-react-native/dist/esm/icons/search';
import { styles } from './CommunityScreen.styles';
import { Header, NotificationModal } from '../../../components/common';
import {
  EmptyState,
  UnderlineTabs,
} from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { CommunityPostSummary } from '../types';
import { BoardKey, SortKey, SORT_OPTIONS } from '../constants/board';
import PostListItem from '../components/PostListItem';
import PostTypeBadges from '../components/PostTypeBadges';
import UserAvatar from '../../../components/common/UserAvatar';

/**
 * 지금 뜨는 글 카드 — 웹 HotPostCard와 같은 순서로 쌓는다.
 * 순위 → 배지 → 제목 두 줄 → 글쓴이 · 추천 · 댓글.
 */
const HotPostCard = ({
  post,
  rank,
  category,
  onPress,
}: {
  post: CommunityPostSummary;
  rank: number;
  category: BoardKey;
  onPress: (postId: string) => void;
}) => (
  <Pressable
    style={({ pressed }) => [styles.hotCard, pressed && styles.hotCardPressed]}
    onPress={() => onPress(String(post.id))}
    accessibilityRole="button"
    accessibilityLabel={`${rank}위 ${post.title}`}
  >
    <Text style={[styles.hotRank, rank > 1 && styles.hotRankRest]}>{rank}</Text>
    <View style={styles.hotBody}>
      <PostTypeBadges post={post} category={category} />
      <Text style={styles.hotCardTitle} numberOfLines={2}>
        {post.title}
      </Text>
      <View style={styles.hotMetaRow}>
        <UserAvatar
          name={post.author}
          imageUrl={post.authorImage}
          avatarHash={post.authorAvatarHash}
          size={normalize(18)}
        />
        <Text style={styles.hotMeta} numberOfLines={1}>
          {`${post.author} · 추천 ${post.likes} · 댓글 ${post.comments}`}
        </Text>
      </View>
    </View>
  </Pressable>
);

export interface CommunityScreenViewProps {
  posts: CommunityPostSummary[];
  hotPosts: CommunityPostSummary[];
  boards: readonly { key: BoardKey; label: string }[];
  selectedCategory: BoardKey;
  onSelectCategory: (category: BoardKey) => void;
  selectedSort: SortKey;
  onSelectSort: (sort: SortKey) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onWritePost: () => void;
  onPostPress: (postId: string) => void;

  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;

  user?: any;
  pendingRequests: any[];
  isNotificationModalVisible: boolean;
  setNotificationModalVisible: (visible: boolean) => void;
  onNotificationPress: () => void;
  onNavigateProfile: () => void;
  onAcceptInvitation: (requestId: number) => void;
  onRejectInvitation: (requestId: number) => void;
}

export default function CommunityScreenView({
  posts,
  hotPosts,
  boards,
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  searchQuery,
  onSearchChange,
  onWritePost,
  onPostPress,
  isLoading,
  isRefreshing,
  isFetchingNextPage,
  isError,
  onRefresh,
  onLoadMore,
  user,
  pendingRequests,
  isNotificationModalVisible,
  setNotificationModalVisible,
  onNotificationPress,
  onNavigateProfile,
  onAcceptInvitation,
  onRejectInvitation,
}: CommunityScreenViewProps) {  const selectedLabel =
    boards.find(board => board.key === selectedCategory)?.label ?? '';

  const tabItems = useMemo(
    () => boards.map(board => ({ key: board.key, label: board.label })),
    [boards],
  );

  const renderPostItem = useCallback(
    ({ item }: { item: CommunityPostSummary }) => (
      <PostListItem
        item={item}
        category={selectedCategory}
        onPress={onPostPress}
      />
    ),
    [onPostPress, selectedCategory],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeaderContainer}>
        <UnderlineTabs
          items={tabItems}
          selectedKey={selectedCategory}
          onSelect={key => onSelectCategory(key as BoardKey)}
        />

        {hotPosts.length > 0 ? (
          <View style={styles.hotSection}>
            <View style={styles.hotHead}>
              <Text style={styles.hotHeadTitle}>지금 뜨는 글</Text>
              <Text style={styles.hotHeadSub}>최근 24시간</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hotStrip}
            >
              {hotPosts.slice(0, 3).map((post, index) => (
                <HotPostCard
                  key={post.id}
                  post={post}
                  rank={index + 1}
                  category={selectedCategory}
                  onPress={onPostPress}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.searchBarRow}>
          <View style={styles.searchBarContainer}>
            <Search
              size={20}
              color={tokens.colors.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={`${selectedLabel} 내 검색...`}
              placeholderTextColor="#A6ABB5"
              value={searchQuery}
              onChangeText={onSearchChange}
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.sortTrack}>
          {SORT_OPTIONS.map(option => {
            const selected = selectedSort === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortPill, selected && styles.sortPillOn]}
                onPress={() => onSelectSort(option.key)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.sortPillText,
                    selected && styles.sortPillTextOn,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.listHeaderGap} />
      </View>
    ),
    [
      tabItems,
      hotPosts,
      selectedCategory,
      selectedLabel,
      selectedSort,
      searchQuery,
      onSelectCategory,
      onSelectSort,
      onSearchChange,
      onPostPress,
    ],
  );

  const listFooter = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.listFooterLoading}>
        <ActivityIndicator color={tokens.colors.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  const listEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <EmptyState
          title="게시글을 불러오는 중…"
          loading
          style={styles.listStateBox}
        />
      );
    }
    if (isError) {
      return (
        <EmptyState
          title="게시글을 불러오지 못했습니다"
          description="아래로 당겨 다시 시도해 주세요."
          loading={isRefreshing}
          actionLabel={isRefreshing ? undefined : '다시 시도'}
          onAction={onRefresh}
          style={styles.listStateBox}
        />
      );
    }
    return (
      <EmptyState
        title={searchQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없어요'}
        description={searchQuery ? undefined : '첫 글을 작성해보세요!'}
        style={styles.listStateBox}
      />
    );
  }, [isLoading, isError, searchQuery, isRefreshing, onRefresh]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.white} />

      <Header
        nickname={user?.nickname}
        email={user?.email}
        pendingRequestsCount={pendingRequests.length}
        onNotificationPress={onNotificationPress}
        onNavigateProfile={onNavigateProfile}
      />

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[tokens.colors.primary]}
            tintColor={tokens.colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={onWritePost}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="글쓰기"
      >
        <Plus
          size={normalize(18)}
          color={tokens.colors.white}
          strokeWidth={2.4}
        />
        <Text style={styles.fabText}>글쓰기</Text>
      </TouchableOpacity>

      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        invitations={pendingRequests}
        onAccept={onAcceptInvitation}
        onReject={onRejectInvitation}
      />
    </View>
  );
}
