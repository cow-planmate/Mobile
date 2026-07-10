import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
} from 'react-native';
import { Search, ThumbsUp, MessageSquare, Eye, PenSquare, Flame } from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import { styles, COLORS } from './CommunityScreen.styles';
import { normalize } from '../../../utils/normalize';
import { Header, NotificationModal } from '../../../components/common';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  level: number;
  time: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
  thumbnail?: string | null;
}

export interface CommunityScreenViewProps {
  posts: Post[];
  hotPosts: Post[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onWritePost: () => void;
  onPostPress: (postId: string) => void;
  
  // Header & Notification Modal Props
  user?: any;
  pendingRequests: any[];
  isNotificationModalVisible: boolean;
  setNotificationModalVisible: (visible: boolean) => void;
  onNotificationPress: () => void;
  onNavigateProfile: () => void;
  fetchPendingRequests: (silent?: boolean) => Promise<void>;
}

export default function CommunityScreenView({
  posts,
  hotPosts,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onWritePost,
  onPostPress,
  user,
  pendingRequests,
  isNotificationModalVisible,
  setNotificationModalVisible,
  onNotificationPress,
  onNavigateProfile,
  fetchPendingRequests,
}: CommunityScreenViewProps) {

  // 레벨 배지 색상 취득
  const getLevelBadgeStyle = (level: number) => {
    const colorMap: { [key: number]: { bg: string; text: string } } = {
      1: { bg: '#F3F4F6', text: '#6B7280' },
      2: { bg: '#DBEAFE', text: '#2563EB' },
      3: { bg: '#E0F2FE', text: '#0369A1' },
      4: { bg: '#FEF3C7', text: '#D97706' },
      5: { bg: '#FEE2E2', text: '#EF4444' },
    };
    return colorMap[level] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  // 일반 게시글 렌더링
  const renderPostItem = useCallback(({ item }: { item: Post }) => {
    const levelStyle = getLevelBadgeStyle(item.level);

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => onPostPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.postLeftSection}>
          <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
          
          <View style={styles.postMetaRow}>
            <Text style={styles.authorName}>{item.author}</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
              <Text style={[styles.levelBadgeText, { color: levelStyle.text }]}>
                Lv.{item.level}
              </Text>
            </View>
            <Text style={styles.metaDivider}>|</Text>
            <Text style={styles.postTime}>{item.time}</Text>
          </View>
        </View>

        {/* 썸네일 영역 */}
        <View style={styles.postRightSection}>
          {item.thumbnail ? (
            <FastImage
              style={styles.thumbnailImage}
              source={{ uri: item.thumbnail }}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <View style={styles.imagePlaceholderSymbol} />
            </View>
          )}

          {/* 좋아요, 댓글, 조회수 통계 누적 */}
          <View style={styles.postStatsOverlay}>
            <View style={styles.statItem}>
              <ThumbsUp size={11} color="#3B82F6" style={{ marginRight: 2 }} />
              <Text style={[styles.statText, { color: '#3B82F6', fontWeight: 'bold' }]}>{item.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <MessageSquare size={11} color="#6B7280" style={{ marginRight: 2 }} />
              <Text style={styles.statText}>{item.comments}</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={11} color="#9CA3AF" style={{ marginRight: 2 }} />
              <Text style={styles.statText}>{item.views}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [onPostPress]);

  // 리스트 헤더 영역 (지금 뜨는 핫글, 타이틀)
  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* 카테고리 가로 탭 바 (웹 탭 스타일) */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.tabBarItem,
                  isActive && styles.tabBarItemActive,
                ]}
                onPress={() => onSelectCategory(category)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabBarText,
                    isActive && styles.tabBarTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 검색 바 & 글쓰기 통합 영역 */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBarContainer}>
          <Search size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={`${selectedCategory} 내 검색...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
        <TouchableOpacity 
          style={styles.writeButton} 
          onPress={onWritePost}
          activeOpacity={0.8}
        >
          <PenSquare size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.writeButtonText}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* 핫글 섹션 */}
      {hotPosts.length > 0 && (
        <View style={styles.hotSectionContainer}>
          <View style={styles.hotHeaderRow}>
            <View style={styles.hotTitleRow}>
              <View style={styles.hotIconWrap}>
                <Flame size={16} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.hotTitle}>지금 뜨는 핫글</Text>
                <Text style={styles.hotSubtitle}>실시간 가장 반응이 뜨거운 게시글입니다</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.hotAllLink}>전체보기</Text>
            </TouchableOpacity>
          </View>

          {/* 핫글 가로 스크롤 리스트 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotListScroll}
          >
            {hotPosts.map((post, idx) => (
              <TouchableOpacity
                key={post.id}
                style={styles.hotPostCard}
                onPress={() => onPostPress(post.id)}
                activeOpacity={0.8}
              >
                <View style={styles.hotCardLeft}>
                  <View style={styles.hotRankRow}>
                    <Text style={styles.hotRankNum}>{idx + 1}</Text>
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotBadgeText}>HOT</Text>
                    </View>
                    <View style={styles.hotViewsWrap}>
                      <Eye size={10} color="#9CA3AF" style={{ marginRight: 2 }} />
                      <Text style={styles.hotViewsText}>{post.views}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.hotCardTitle} numberOfLines={1}>{post.title}</Text>
                  
                  <View style={styles.hotCardFooter}>
                    <View style={styles.hotCardAuthorRow}>
                      <View style={styles.hotAvatar}>
                        <Text style={styles.hotAvatarText}>{post.author.charAt(0)}</Text>
                      </View>
                      <Text style={styles.hotAuthorText}>{post.author}</Text>
                    </View>
                    <View style={styles.hotLikesWrap}>
                      <ThumbsUp size={11} color="#EF4444" style={{ marginRight: 3 }} />
                      <Text style={styles.hotLikesText}>{post.likes}</Text>
                    </View>
                  </View>
                </View>

                {/* 핫글 썸네일 */}
                <View style={styles.hotCardRight}>
                  {post.thumbnail ? (
                    <FastImage
                      style={styles.hotThumbnail}
                      source={{ uri: post.thumbnail }}
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
  );

  // 리스트 푸터 영역 (페이지네이션)
  const renderListFooter = () => (
    <View style={styles.listFooterPagination}>
      <TouchableOpacity style={[styles.pageButton, styles.pageButtonActive]} activeOpacity={0.8}>
        <Text style={[styles.pageText, styles.pageTextActive]}>1</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.pageButton} activeOpacity={0.8}>
        <Text style={styles.pageText}>2</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.pageButton} activeOpacity={0.8}>
        <Text style={styles.pageText}>3</Text>
      </TouchableOpacity>
      <Text style={styles.pageEllipsis}>...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 공통 헤더 */}
      <Header
        nickname={user?.nickname}
        email={user?.email}
        pendingRequestsCount={pendingRequests.length}
        onNotificationPress={onNotificationPress}
        onNavigateProfile={onNavigateProfile}
      />


      {/* 게시글 리스트 */}
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingBottom: 60 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>게시글이 존재하지 않습니다</Text>
          </View>
        }
      />

      {/* 알림 초대 수락/거절 모달 */}
      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        pendingRequests={pendingRequests}
        onRefresh={() => fetchPendingRequests(true)}
      />
    </View>
  );
}
