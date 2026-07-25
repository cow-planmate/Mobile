import React, { useState, useCallback, useEffect } from 'react';
import { useAlert } from '../../../contexts/AlertContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getPendingInvitations, PendingInvitation } from '../../../api/trips';
import CommunityScreenView, { Post } from './CommunityScreen.view';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '자유게시판 게시글 1',
    content: '여행에 대한 자유로운 이야기를 나누는 공간입니다. 서로의 경험을 공유해보세요!',
    author: '사용자1',
    level: 4,
    time: '6시간 전',
    category: '자유게시판',
    likes: 4,
    comments: 29,
    views: 648,
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop',
  },
  {
    id: '2',
    title: '자유게시판 게시글 2',
    content: '여행에 대한 자유로운 이야기를 나누는 공간입니다. 서로의 경험을 공유해보세요!',
    author: '사용자2',
    level: 1,
    time: '3시간 전',
    category: '자유게시판',
    likes: 74,
    comments: 9,
    views: 488,
    thumbnail: null,
  },
  {
    id: '3',
    title: '자유게시판 게시글 3',
    content: '여행에 대한 자유로운 이야기를 나누는 공간입니다. 서로의 경험을 공유해보세요!',
    author: '사용자3',
    level: 1,
    time: '14시간 전',
    category: '자유게시판',
    likes: 58,
    comments: 29,
    views: 961,
    thumbnail: null,
  },
  {
    id: '4',
    title: '자유게시판 게시글 4',
    content: '여행에 대한 자유로운 이야기를 나누는 공간입니다. 서로의 경험을 공유해보세요!',
    author: '사용자4',
    level: 3,
    time: '3시간 전',
    category: '자유게시판',
    likes: 75,
    comments: 10,
    views: 294,
    thumbnail: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=150&auto=format&fit=crop',
  },
  {
    id: '5',
    title: '자유게시판 게시글 5',
    content: '여행에 대한 자유로운 이야기를 나누는 공간입니다. 서로의 경험을 공유해보세요!',
    author: '사용자5',
    level: 2,
    time: '2시간 전',
    category: '자유게시판',
    likes: 57,
    comments: 37,
    views: 251,
    thumbnail: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=150&auto=format&fit=crop',
  },
  {
    id: '6',
    title: 'Q&A 질문 게시글 1',
    content: '일본 도쿄 3박 4일 일정 짜는데 비행기 편명이랑 시간대 추천부탁드려요!',
    author: '도쿄러버',
    level: 2,
    time: '5시간 전',
    category: 'Q&A',
    likes: 12,
    comments: 32,
    views: 180,
    thumbnail: null,
  },
  {
    id: '7',
    title: '메이트 찾기 게시글 1',
    content: '다음달 8월에 파리 가시는 분 계신가요? 에펠탑 보면서 맥주 한잔해요!',
    author: '파리메이트',
    level: 5,
    time: '12시간 전',
    category: '메이트 찾기',
    likes: 22,
    comments: 15,
    views: 310,
    thumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=150&auto=format&fit=crop',
  },
  {
    id: '8',
    title: '장소 추천 게시글 1',
    content: '강릉 안목해변 카페거리 말고 진짜 숨겨진 로컬 오션뷰 스팟 알려드림!',
    author: '숨은명소',
    level: 4,
    time: '1일 전',
    category: '장소 추천',
    likes: 95,
    comments: 42,
    views: 890,
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop',
  },
  {
    id: '9',
    title: '자유게시판 게시글 8',
    content: '여행에 대한 자유로운 이야기를 나누는 공간입니다. 서로의 경험을 공유해보세요!',
    author: '사용자8',
    level: 3,
    time: '23시간 전',
    category: '자유게시판',
    likes: 68,
    comments: 20,
    views: 787,
    thumbnail: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=150&auto=format&fit=crop',
  }
];

const CATEGORIES = ['자유게시판', 'Q&A', '메이트 찾기', '장소 추천'];

export default function CommunityScreen() {
  const { showAlert } = useAlert();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const user = useAuthStore((state) => state.user);

  const [selectedCategory, setSelectedCategory] = useState('자유게시판');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingInvitation[]>([]);

  const fetchPendingRequests = useCallback(async (silent = false) => {
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
      void fetchPendingRequests(true);
    }, [fetchPendingRequests])
  );

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleWritePost = () => {
    showAlert({
      title: '글쓰기',
      message: '커뮤니티 글쓰기 기능은 준비 중입니다.',
    });
  };

  const handlePostPress = (postId: string) => {
    const post = MOCK_POSTS.find((p) => p.id === postId);
    if (post) {
      showAlert({
        title: post.title,
        message: post.content,
      });
    }
  };

  const handleNotificationPress = () => {
    setNotificationModalVisible(true);
  };

  const handleNavigateProfile = () => {
    navigation.navigate('Profile');
  };

  // Filter posts based on selected category and search query
  const filteredPosts = MOCK_POSTS.filter((post) => {
    const matchesCategory = post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hotPosts = [...MOCK_POSTS]
    .filter(p => p.category === selectedCategory)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  return (
    <CommunityScreenView
      posts={filteredPosts}
      hotPosts={hotPosts}
      categories={CATEGORIES}
      selectedCategory={selectedCategory}
      onSelectCategory={handleSelectCategory}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onWritePost={handleWritePost}
      onPostPress={handlePostPress}
      user={user}
      pendingRequests={pendingRequests}
      isNotificationModalVisible={isNotificationModalVisible}
      setNotificationModalVisible={setNotificationModalVisible}
      onNotificationPress={handleNotificationPress}
      onNavigateProfile={handleNavigateProfile}
      fetchPendingRequests={fetchPendingRequests}
    />
  );
}
