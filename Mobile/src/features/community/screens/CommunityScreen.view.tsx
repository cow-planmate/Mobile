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
import {
  Badge,
  Card,
  Chip,
  EmptyState,
  SectionHeader,
  StatItem,
  StatRow,
  UnderlineTabs,
} from '../../../components/ui';
import { tokens } from '../../../theme/tokens';
import { CommunityPostSummary } from '../types';
import { BoardKey, SortKey, SORT_OPTIONS } from '../constants/levels';
import LevelBadge from '../components/LevelBadge';
import PostTypeBadges from '../components/PostTypeBadges';
import UserAvatar from '../components/UserAvatar';

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

  return (
    <Card
      variant="outlined"
      style={styles.postCard}
      onPress={handlePress}
      accessibilityLabel={item.title}
    >
      <View style={styles.postLeftSection}>
        <PostTypeBadges post={item} category={category} />

        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.postMetaRow}>
          <UserAvatar
            name={item.author}
            imageUrl={item.authorImage}
            avatarHash={item.authorAvatarHash}
            size={18}
          />
          <Text style={styles.authorName} numberOfLines={1}>
            {item.author}
          </Text>
          <LevelBadge level={item.level} />
          <Text style={styles.postTime}>{item.createdAt}</Text>
        </View>

        <StatRow style={styles.postStatsRow}>
          <StatItem
            icon={<ThumbsUp size={12} color={tokens.colors.primary} />}
            value={item.likes}
            label="추천"
            active
          />
          <StatItem
            icon={
              <MessageSquare size={12} color={tokens.colors.textSecondary} />
            }
            value={item.comments}
            label="댓글"
          />
          <StatItem
            icon={<Eye size={12} color={tokens.colors.textSecondary} />}
            value={item.views}
            label="조회"
          />
        </StatRow>
      </View>

      {item.image ? (
        <View style={styles.postRightSection}>
          <FastImage
            style={styles.thumbnailImage}
            source={{ uri: item.image }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      ) : null}
    </Card>
  );
});

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
}: CommunityScreenViewProps) {
  const selectedLabel =
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
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="글쓰기"
          >
            <PenSquare
              size={14}
              color={tokens.colors.white}
              style={styles.writeIcon}
            />
            <Text style={styles.writeButtonText}>글쓰기</Text>
          </TouchableOpacity>
        </View>

        {hotPosts.length > 0 && (
          <View style={styles.hotSectionContainer}>
            <SectionHeader
              title="지금 뜨는 핫글"
              description="실시간 가장 반응이 뜨거운 게시글입니다"
              icon={
                <View style={styles.hotIconWrap}>
                  <Flame size={15} color={tokens.tones.hot.fg} />
                </View>
              }
              style={styles.hotHeaderRow}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hotListScroll}
            >
              {hotPosts.map((post, idx) => (
                <Card
                  key={post.id}
                  variant="outlined"
                  padding="s"
                  style={styles.hotPostCard}
                  onPress={() => onPostPress(String(post.id))}
                  accessibilityLabel={post.title}
                >
                  <View style={styles.hotCardLeft}>
                    <View style={styles.hotRankRow}>
                      <Text style={styles.hotRankNum}>{idx + 1}</Text>
                      <Badge label="HOT" tone="hot" />
                      <View style={styles.hotViewsWrap}>
                        <Eye size={10} color={tokens.colors.textTertiary} />
                        <Text style={styles.hotViewsText}>{post.views}</Text>
                      </View>
                    </View>

                    <Text style={styles.hotCardTitle} numberOfLines={2}>
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
                        <Text style={styles.hotAuthorText} numberOfLines={1}>
                          {post.author}
                        </Text>
                      </View>
                      <View style={styles.hotLikesWrap}>
                        <ThumbsUp size={10} color={tokens.tones.hot.fg} />
                        <Text style={styles.hotLikesText}>{post.likes}</Text>
                      </View>
                    </View>
                  </View>

                  {post.image ? (
                    <View style={styles.hotCardRight}>
                      <FastImage
                        style={styles.hotThumbnail}
                        source={{ uri: post.image }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>
                  ) : null}
                </Card>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sortRow}>
          {SORT_OPTIONS.map(option => (
            <Chip
              key={option.key}
              label={option.label}
              size="s"
              selected={selectedSort === option.key}
              onPress={() => onSelectSort(option.key)}
            />
          ))}
        </View>
      </View>
    ),
    [
      tabItems,
      selectedCategory,
      selectedLabel,
      selectedSort,
      searchQuery,
      hotPosts,
      onSelectCategory,
      onSelectSort,
      onSearchChange,
      onWritePost,
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
          title="게시글을 불러오는 중..."
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
        title={searchQuery ? '검색 결과가 없습니다' : '아직 게시글이 없어요'}
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
