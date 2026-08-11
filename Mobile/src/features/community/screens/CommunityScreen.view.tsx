import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Search from 'lucide-react-native/dist/esm/icons/search';
import ThumbsUp from 'lucide-react-native/dist/esm/icons/thumbs-up';
import MessageSquare from 'lucide-react-native/dist/esm/icons/message-square';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import PenSquare from 'lucide-react-native/dist/esm/icons/square-pen';
import Flame from 'lucide-react-native/dist/esm/icons/flame';
import FastImage from 'react-native-fast-image';
import { styles } from './CommunityScreen.styles';
import { Header, NotificationModal } from '../../../components/common';
import { theme } from '../../../theme/theme';
import { CommunityPostSummary } from '../types';
import { BoardKey } from '../constants/levels';
import LevelBadge from '../components/LevelBadge';
import UserAvatar from '../components/UserAvatar';

export interface CommunityScreenViewProps {
  posts: CommunityPostSummary[];
  hotPosts: CommunityPostSummary[];
  boards: readonly { key: BoardKey; label: string }[];
  selectedCategory: BoardKey;
  onSelectCategory: (category: BoardKey) => void;
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

  // Header & Notification Modal Props
  user?: any;
  pendingRequests: any[];
  isNotificationModalVisible: boolean;
  setNotificationModalVisible: (visible: boolean) => void;
  onNotificationPress: () => void;
  onNavigateProfile: () => void;
  onAcceptInvitation: (requestId: number) => void;
  onRejectInvitation: (requestId: number) => void;
}

/**
 * 게시글 목록 카드.
 *
 * memo로 감싸 목록이 리렌더될 때 항목까지 함께 다시 그려지지 않게 한다.
 * onPress는 item을 클로저로 잡지 않고 id만 넘겨 부모의 핸들러 identity가
 * 유지되도록 한다(그래야 memo가 실제로 걸린다).
 */
const PostListItem = React.memo(function PostListItem({
  item,
  onPress,
}: {
  item: CommunityPostSummary;
  onPress: (postId: string) => void;
}) {
  const handlePress = useCallback(
    () => onPress(String(item.id)),
    [onPress, item.id],
  );

  return (
    <TouchableOpacity
      style={styles.postCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.postLeftSection}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.postMetaRow}>
          <Text style={styles.authorName}>{item.author}</Text>
          <LevelBadge level={item.level} />
          <Text style={styles.metaDivider}>|</Text>
          <Text style={styles.postTime}>{item.createdAt}</Text>
        </View>
      </View>

      {/* 썸네일 + 통계 */}
      <View style={styles.postRightSection}>
        {item.image ? (
          <FastImage
            style={styles.thumbnailImage}
            source={{ uri: item.image }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <View style={styles.imagePlaceholderSymbol} />
          </View>
        )}

        <View style={styles.postStatsOverlay}>
          <View style={styles.statItem}>
            <ThumbsUp size={11} color="#3B82F6" style={styles.statIcon} />
            <Text style={[styles.statText, styles.statTextLikes]}>
              {item.likes}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MessageSquare size={11} color="#6B7280" style={styles.statIcon} />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Eye size={11} color="#9CA3AF" style={styles.statIcon} />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function CommunityScreenView({
  posts,
  hotPosts,
  boards,
  selectedCategory,
  onSelectCategory,
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
}: CommunityScreenViewProps) {
  const selectedLabel =
    boards.find(board => board.key === selectedCategory)?.label ?? '';

  const renderPostItem = useCallback(
    ({ item }: { item: CommunityPostSummary }) => (
      <PostListItem item={item} onPress={onPostPress} />
    ),
    [onPostPress],
  );

  /**
   * 아래 세 개는 FlatList에 **엘리먼트**로 넘긴다.
   *
   * 컴포넌트(함수)로 넘기면 렌더마다 함수 identity가 바뀌어 React가 다른 타입으로
   * 보고 헤더 전체를 언마운트 후 다시 마운트한다. 헤더에 검색 TextInput이 있어
   * 한 글자 입력할 때마다 포커스와 키보드가 사라졌다.
   *
   * 엘리먼트는 useMemo로 고정한다. 헤더가 가로 ScrollView 두 개(게시판 탭·핫글)를
   * 품고 있어, 목록이 리렌더될 때마다 새로 만들면 그 트리 전체가 함께 다시 그려진다.
   */
  const listHeader = useMemo(
    () => (
    <View style={styles.listHeaderContainer}>
      {/* 게시판 탭 */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {boards.map(board => {
            const isActive = selectedCategory === board.key;
            return (
              <TouchableOpacity
                key={board.key}
                style={[styles.tabBarItem, isActive && styles.tabBarItemActive]}
                onPress={() => onSelectCategory(board.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabBarText,
                    isActive && styles.tabBarTextActive,
                  ]}
                >
                  {board.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 검색 + 글쓰기 */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBarContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`${selectedLabel} 내 검색...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={styles.writeButton}
          onPress={onWritePost}
          activeOpacity={0.8}
        >
          <PenSquare size={14} color="#FFFFFF" style={styles.writeIcon} />
          <Text style={styles.writeButtonText}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* 핫글 */}
      {hotPosts.length > 0 && (
        <View style={styles.hotSectionContainer}>
          <View style={styles.hotHeaderRow}>
            <View style={styles.hotTitleRow}>
              <View style={styles.hotIconWrap}>
                <Flame size={16} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.hotTitle}>지금 뜨는 핫글</Text>
                <Text style={styles.hotSubtitle}>
                  실시간 가장 반응이 뜨거운 게시글입니다
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotListScroll}
          >
            {hotPosts.map((post, idx) => (
              <TouchableOpacity
                key={post.id}
                style={styles.hotPostCard}
                onPress={() => onPostPress(String(post.id))}
                activeOpacity={0.8}
              >
                <View style={styles.hotCardLeft}>
                  <View style={styles.hotRankRow}>
                    <Text style={styles.hotRankNum}>{idx + 1}</Text>
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotBadgeText}>HOT</Text>
                    </View>
                    <View style={styles.hotViewsWrap}>
                      <Eye size={10} color="#9CA3AF" style={styles.statIcon} />
                      <Text style={styles.hotViewsText}>{post.views}</Text>
                    </View>
                  </View>

                  <Text style={styles.hotCardTitle} numberOfLines={1}>
                    {post.title}
                  </Text>

                  <View style={styles.hotCardFooter}>
                    <View style={styles.hotCardAuthorRow}>
                      <UserAvatar
                        name={post.author}
                        imageUrl={post.authorImage}
                        avatarHash={post.authorAvatarHash}
                        size={18}
                      />
                      <Text style={styles.hotAuthorText}>{post.author}</Text>
                    </View>
                    <View style={styles.hotLikesWrap}>
                      <ThumbsUp
                        size={11}
                        color="#EF4444"
                        style={styles.statIcon}
                      />
                      <Text style={styles.hotLikesText}>{post.likes}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.hotCardRight}>
                  {post.image ? (
                    <FastImage
                      style={styles.hotThumbnail}
                      source={{ uri: post.image }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : (
                    <View style={styles.hotThumbnailPlaceholder}>
                      <View style={styles.imagePlaceholderSymbol} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      </View>
    ),
    [
      boards,
      selectedCategory,
      selectedLabel,
      searchQuery,
      hotPosts,
      onSelectCategory,
      onSearchChange,
      onWritePost,
      onPostPress,
    ],
  );

  const listFooter = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.listFooterLoading}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  const listEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.listStateBox}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.listStateBox}>
        <Text style={styles.listStateText}>
          {isError
            ? '게시글을 불러오지 못했어요.\n아래로 당겨 다시 시도해 주세요.'
            : searchQuery
            ? '검색 결과가 없습니다'
            : '아직 게시글이 없습니다'}
        </Text>
      </View>
    );
  }, [isLoading, isError, searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
        // 게시글 카드는 높이가 일정하지 않아 getItemLayout을 줄 수 없다.
        // 대신 초기 렌더량과 유지 창을 좁혀 스크롤 중 렌더 부하를 낮춘다.
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
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
