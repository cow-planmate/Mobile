import React, { useState } from 'react';
import { useAlert } from '../../../contexts/AlertContext';
import CommunityScreenView, { Post } from './CommunityScreen.view';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '제주도 3박 4일 뚜벅이 최적 동선 코스 추천! 🌴',
    content: '차 없이 떠나는 제주 동쪽 코스입니다. 함덕부터 성산까지 버스로 이동하기 수월하고 힐링할 수 있는 스팟들 위주로 구성해봤어요. 상세 일정 및 맛집 리스트 참고하세요!',
    author: '감귤사랑',
    time: '2시간 전',
    category: '일정 공유',
    likes: 28,
    comments: 12,
    views: 156,
  },
  {
    id: '2',
    title: '일본 교토 전통 가옥 감성 숙소 정보 공유합니다 🏠',
    content: '교토 기온 거리에 위치한 100년 된 료칸풍 에어비앤비 후기입니다. 다다미방과 아담한 정원이 있어 교토 특유의 고즈넉한 분위기를 제대로 느낄 수 있어요.',
    author: '교토매니아',
    time: '4시간 전',
    category: '자유',
    likes: 45,
    comments: 8,
    views: 242,
  },
  {
    id: '3',
    title: '올여름 가족 휴가: 여수 vs 남해 어디가 좋을까요? 🤔',
    content: '부모님 모시고 2박 3일로 다녀오려고 하는데, 맛있는 해산물과 여유로운 오션뷰 중 고민이네요. 부모님 만족도가 더 높았던 여행지 추천 부탁드려요!',
    author: '결정장애',
    time: '6시간 전',
    category: '질문',
    likes: 14,
    comments: 29,
    views: 198,
  },
  {
    id: '4',
    title: '유럽 유레일 패스 vs 구간권 완벽 비교 & 할인 꿀팁 🚄',
    content: '유럽 배낭여행 갈 때 가장 고민되는 교통권 정리글입니다. 국가 간 이동 횟수와 나이대에 따라 어떤 티켓이 더 이득인지 엑셀식 계산기로 비교해 알려드립니다.',
    author: '유럽방랑자',
    time: '1일 전',
    category: '정보',
    likes: 89,
    comments: 21,
    views: 524,
  },
  {
    id: '5',
    title: '혼자 떠나는 강릉 당일치기 바다 힐링 여행 후기 🌊',
    content: '주말에 급 KTX 예매해서 다녀온 강릉 안목해변과 초당순두부마을 후기입니다. 혼밥하기 좋은 감성 맛집들과 바다 전망 카페 추천 포함되어 있습니다.',
    author: '바다조아',
    time: '2일 전',
    category: '자유',
    likes: 37,
    comments: 6,
    views: 145,
  },
];

const CATEGORIES = ['전체', '일정 공유', '자유', '정보', '질문'];

export default function CommunityScreen() {
  const { showAlert } = useAlert();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter posts based on selected category and search query
  const filteredPosts = MOCK_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === '전체' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <CommunityScreenView
      posts={filteredPosts}
      categories={CATEGORIES}
      selectedCategory={selectedCategory}
      onSelectCategory={handleSelectCategory}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onWritePost={handleWritePost}
      onPostPress={handlePostPress}
    />
  );
}
