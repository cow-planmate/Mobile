import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Search from 'lucide-react-native/dist/esm/icons/search';
import { styles } from './CommunityScreen.styles';
import { Header, NotificationModal } from '../../../components/common';
import {
  EmptyState,
  UnderlineTabs,
} from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import { CommunityPostSummary } from '../types';
import { BoardKey, SortKey, SORT_OPTIONS } from '../constants/board';
import PostListItem from '../components/PostListItem';

export interface CommunityScreenViewProps {
  posts: CommunityPostSummary[];
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

        <View style={styles.searchBarRow}>
          <View style={styles.searchBarContainer}>
            <Search
              size={18}
              color={tokens.colors.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={`${selectedLabel} 내 검색...`}
              placeholderTextColor={tokens.colors.textTertiary}
              value={searchQuery}
              onChangeText={onSearchChange}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={styles.writeButton}
            onPress={onWritePost}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="글쓰기"
          >
            <Text style={styles.writeButtonText}>글쓰기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sortRow}>
          {SORT_OPTIONS.map(option => {
            const selected = selectedSort === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortTab, selected && styles.sortTabOn]}
                onPress={() => onSelectSort(option.key)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[styles.sortTabText, selected && styles.sortTabTextOn]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ),
    [
      tabItems,
      selectedCategory,
      selectedLabel,
      selectedSort,
      searchQuery,
      onSelectCategory,
      onSelectSort,
      onSearchChange,
      onWritePost,
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
          title="게시글을 불러오지 못했어요"
          description="아래로 당겨 다시 시도해 주세요."
          style={styles.listStateBox}
        />
      );
    }
    return (
      <EmptyState
        title={searchQuery ? '검색 결과가 없어요' : '아직 게시글이 없어요'}
        description={
          searchQuery ? undefined : '첫 글을 작성해 이야기를 시작해 보세요.'
        }
        actionLabel={searchQuery ? undefined : '글쓰기'}
        onAction={searchQuery ? undefined : onWritePost}
        style={styles.listStateBox}
      />
    );
  }, [isLoading, isError, searchQuery, onWritePost]);

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
