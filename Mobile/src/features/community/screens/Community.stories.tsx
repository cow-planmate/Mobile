import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import CommunityScreenView from './CommunityScreen.view';
import { BOARDS, BoardKey, SortKey } from '../constants/levels';
import { CommunityPostSummary } from '../types';

const noop = () => {};

const post = (
  id: number,
  overrides: Partial<CommunityPostSummary> = {},
): CommunityPostSummary => ({
  id,
  userId: `u${id}`,
  category: 'free',
  title: '제주 3일, 뚜벅이로 다녀온 후기',
  author: '한서준',
  level: 3,
  likes: 42,
  dislikes: 1,
  comments: 12,
  views: 1840,
  createdAt: '3시간 전',
  createdAtIso: '2026-08-17T09:00:00Z',
  ...overrides,
});

const POSTS = [
  post(1),
  post(2, {
    title: '성산일출봉 근처 주차 팁 있을까요?',
    author: '오유진',
    level: 1,
    likes: 3,
    comments: 2,
    views: 96,
    createdAt: '방금',
  }),
  post(3, {
    title: '9월 마지막 주 부산 같이 가실 분',
    author: '문지호',
    level: 5,
    likes: 18,
    comments: 31,
    views: 720,
    createdAt: '어제',
  }),
];

const HOT_POSTS = [
  post(11, {
    title: '숙소값 아끼는 법 총정리',
    author: '배수아',
    level: 4,
    likes: 210,
    views: 9800,
  }),
  post(12, {
    title: '렌터카 없이 제주 일주하기',
    author: '정하람',
    level: 2,
    likes: 154,
    views: 6100,
  }),
];

const meta = {
  title: '05. 커뮤니티/01. 게시판',
  component: CommunityScreenView,
  args: {
    posts: POSTS,
    hotPosts: HOT_POSTS,
    boards: BOARDS,
    selectedCategory: 'free' as BoardKey,
    onSelectCategory: action('게시판 전환'),
    selectedSort: 'latest' as SortKey,
    onSelectSort: action('정렬 변경'),
    searchQuery: '',
    onSearchChange: action('검색어 입력'),
    onWritePost: action('글쓰기'),
    onPostPress: action('게시글 열기'),
    isLoading: false,
    isRefreshing: false,
    isFetchingNextPage: false,
    isError: false,
    onRefresh: action('당겨서 새로고침'),
    onLoadMore: action('다음 페이지 로드'),
    user: { nickname: '민영', email: 'minyeong@planmate.app' },
    pendingRequests: [],
    isNotificationModalVisible: false,
    setNotificationModalVisible: noop,
    onNotificationPress: action('알림 열기'),
    onNavigateProfile: action('마이페이지 이동'),
    onAcceptInvitation: action('초대 수락'),
    onRejectInvitation: action('초대 거절'),
  },
} satisfies Meta<typeof CommunityScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const QnA: Story = {
  args: {
    selectedCategory: 'qna',
    hotPosts: [],
    posts: [
      post(21, {
        category: 'qna',
        title: '우도 배편 예약, 당일도 되나요?',
        isAnswered: true,
      }),
      post(22, {
        category: 'qna',
        title: '9월 제주 날씨 어떤가요?',
        isAnswered: false,
      }),
    ],
  },
};

export const MateAndPlace: Story = {
  args: {
    selectedCategory: 'mate',
    hotPosts: [],
    posts: [
      post(31, {
        category: 'mate',
        title: '10월 경주 벚꽃길 동행 구해요',
        participants: 2,
        maxParticipants: 4,
      }),
      post(32, {
        category: 'mate',
        title: '통영 1박 모집 마감',
        status: 'closed',
      }),
    ],
  },
};

export const Loading: Story = {
  args: { posts: [], hotPosts: [], isLoading: true },
};

export const EmptyResult: Story = {
  args: { posts: [], hotPosts: [], searchQuery: '없는검색어' },
};

export const LoadError: Story = {
  args: { posts: [], hotPosts: [], isError: true },
};

/** 게시판·정렬·검색을 실제로 눌러보는 상태 (필터링은 로컬 목데이터로 흉내) */
function InteractiveCommunity() {
  const [category, setCategory] = useState<BoardKey>('free');
  const [sort, setSort] = useState<SortKey>('latest');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const sorted = [...POSTS].sort((a, b) => {
      if (sort === 'likes') return b.likes - a.likes;
      if (sort === 'views') return b.views - a.views;
      return b.id - a.id;
    });
    return query
      ? sorted.filter(item => item.title.includes(query))
      : sorted;
  }, [sort, query]);

  return (
    <CommunityScreenView
      {...meta.args}
      posts={visible}
      hotPosts={query ? [] : HOT_POSTS}
      selectedCategory={category}
      onSelectCategory={next => {
        action('게시판 전환')(next);
        setCategory(next);
        setSort('latest');
        setQuery('');
      }}
      selectedSort={sort}
      onSelectSort={next => {
        action('정렬 변경')(next);
        setSort(next);
      }}
      searchQuery={query}
      onSearchChange={next => {
        action('검색어 입력')(next);
        setQuery(next);
      }}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveCommunity />,
};
