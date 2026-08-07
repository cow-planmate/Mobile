import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAlert } from '../../../contexts/AlertContext';
import { getBackendErrorMessage } from '../../../utils/errorHandler';
import { useAuthStore } from '../../../store/useAuthStore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  acceptInvitation,
  getPendingInvitations,
  PendingInvitation,
  rejectInvitation,
} from '../../../api/trips';
import { collaborationRequestNoun } from '../../../utils/collaborationRequest';
import { BOARDS, BoardKey } from '../constants/levels';
import { useHotPosts, usePosts } from '../hooks/queries';
import CommunityScreenView from './CommunityScreen.view';

/** 검색어를 매 글자마다 서버로 보내지 않기 위한 지연(ms) */
const SEARCH_DEBOUNCE_MS = 350;

export default function CommunityScreen() {
  const { showAlert } = useAlert();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const user = useAuthStore(state => state.user);

  const [category, setCategory] = useState<BoardKey>('free');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingInvitation[]>(
    [],
  );

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

  const fetchPendingRequests = useCallback(async () => {
    try {
      const requests = await getPendingInvitations();
      if (requests) {
        setPendingRequests(requests);
      }
    } catch (error) {
      console.log('초대 요청 목록 조회 실패:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchPendingRequests();
    }, [fetchPendingRequests]),
  );

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
        await fetchPendingRequests();
      } catch (error) {
        showAlert({
          title: `${noun} 수락 실패`,
          message: getBackendErrorMessage(error),
          type: 'error',
        });
      }
    },
    [fetchPendingRequests, findRequestNoun, showAlert],
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
