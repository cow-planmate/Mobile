import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAlert } from '../../../contexts/AlertContext';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  acceptInvitation,
  rejectInvitation,
} from '../../../api/trips';
import { collaborationRequestNoun } from '../../../utils/collaborationRequest';
import { useQueryClient } from '@tanstack/react-query';
import { invalidatePlanCaches } from '../../../hooks/planCache';
import {
  usePendingInvitationActions,
  usePendingInvitations,
} from '../../../hooks/usePendingInvitations';
import { BOARDS, BoardKey, SortKey } from '../constants/board';
import { useHotPosts, usePosts } from '../hooks/queries';
import CommunityScreenView from './CommunityScreen.view';

const SEARCH_DEBOUNCE_MS = 350;

export default function CommunityScreen() {
  const { showAlert } = useAlert();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const [category, setCategory] = useState<BoardKey>('free');
  const [sort, setSort] = useState<SortKey>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const { data: pendingRequests = [] } = usePendingInvitations(!!user);
  const pendingInvitations = usePendingInvitationActions();

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(searchQuery.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const postsQuery = usePosts(category, sort, debouncedQuery);
  const hotQuery = useHotPosts(category);

  // 게시판을 바꾸면 정렬·검색어를 초기 상태로 되돌린다 (웹 CommunityPage와 동일)
  const handleSelectCategory = useCallback((next: BoardKey) => {
    setCategory(next);
    setSort('latest');
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap(page => page.items) ?? [],
    [postsQuery.data],
  );

  const hotPosts = debouncedQuery ? [] : hotQuery.data ?? [];

  const fetchPendingRequests = pendingInvitations.invalidate;

  const findRequestNoun = useCallback(
    (requestId: number) =>
      collaborationRequestNoun(
        pendingRequests.find(r => r.requestId === requestId)?.type,
      ),
    [pendingRequests],
  );

  const handleAcceptInvitation = useCallback(
    async (requestId: number) => {
      const noun = findRequestNoun(requestId);
      try {
        await acceptInvitation(requestId);

        void invalidatePlanCaches(queryClient);
        await fetchPendingRequests();
      } catch (error) {
        showAlert({
          title: `${noun} 수락 실패`,
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    },
    [fetchPendingRequests, findRequestNoun, queryClient, showAlert],
  );

  const handleRejectInvitation = useCallback(
    async (requestId: number) => {
      const noun = findRequestNoun(requestId);
      try {
        await rejectInvitation(requestId);
        await fetchPendingRequests();
      } catch (error) {
        showAlert({
          title: `${noun} 거절 실패`,
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    },
    [fetchPendingRequests, findRequestNoun, showAlert],
  );

  const handleWritePost = useCallback(() => {
    if (!user) {
      showAlert({
        title: '로그인 필요',
        message: '글을 쓰려면 로그인이 필요해요.',
      });
      return;
    }
    navigation.navigate('CommunityCreate', { category });
  }, [user, navigation, category, showAlert]);

  const handlePostPress = useCallback(
    (postId: string) => {
      navigation.navigate('CommunityDetail', { postId });
    },
    [navigation],
  );

  const handleLoadMore = useCallback(() => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
      void postsQuery.fetchNextPage();
    }
  }, [postsQuery]);

  const handleRefresh = useCallback(() => {
    void postsQuery.refetch();
    void hotQuery.refetch();
  }, [postsQuery, hotQuery]);

  return (
    <CommunityScreenView
      posts={posts}
      hotPosts={hotPosts}
      boards={BOARDS}
      selectedCategory={category}
      onSelectCategory={handleSelectCategory}
      selectedSort={sort}
      onSelectSort={setSort}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onWritePost={handleWritePost}
      onPostPress={handlePostPress}
      isLoading={postsQuery.isLoading}
      isRefreshing={postsQuery.isRefetching && !postsQuery.isFetchingNextPage}
      isFetchingNextPage={postsQuery.isFetchingNextPage}
      isError={postsQuery.isError}
      onRefresh={handleRefresh}
      onLoadMore={handleLoadMore}
      user={user}
      pendingRequests={pendingRequests}
      isNotificationModalVisible={isNotificationModalVisible}
      setNotificationModalVisible={setNotificationModalVisible}
      onNotificationPress={() => setNotificationModalVisible(true)}
      onNavigateProfile={() => navigation.navigate('Profile')}
      onAcceptInvitation={handleAcceptInvitation}
      onRejectInvitation={handleRejectInvitation}
    />
  );
}
