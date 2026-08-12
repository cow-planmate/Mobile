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
import { BOARDS, BoardKey } from '../constants/levels';
import { useHotPosts, usePosts } from '../hooks/queries';
import CommunityScreenView from './CommunityScreen.view';

/** 검색어를 매 글자마다 서버로 보내지 않기 위한 지연(ms) */
const SEARCH_DEBOUNCE_MS = 350;

export default function CommunityScreen() {
  const { showAlert } = useAlert();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const [category, setCategory] = useState<BoardKey>('free');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const { data: pendingRequests = [] } = usePendingInvitations(!!user);
  const pendingInvitations = usePendingInvitationActions();

  // 검색어 입력이 멈춘 뒤에만 조회한다
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(searchQuery.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const postsQuery = usePosts(category, 'latest', debouncedQuery);
  const hotQuery = useHotPosts(category);

  /** 무한 스크롤로 받아온 페이지를 한 배열로 합친다 */
  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap(page => page.items) ?? [],
    [postsQuery.data],
  );

  // 검색 중에는 핫글이 맥락에 맞지 않으므로 숨긴다
  const hotPosts = debouncedQuery ? [] : hotQuery.data ?? [];

  // 목록은 홈·여행기 화면과 같은 캐시를 본다. 탭을 옮길 때마다 다시 부르지 않고,
  // 한 화면에서 처리한 결과가 다른 화면 배지에도 그대로 반영된다.
  const fetchPendingRequests = pendingInvitations.invalidate;

  /** 실패 안내 제목은 초대/편집 권한 요청에 따라 달라진다. */
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
        // 편집 권한이 생겨 프로필의 editablePlans가 바뀐다.
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
      onSelectCategory={setCategory}
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
