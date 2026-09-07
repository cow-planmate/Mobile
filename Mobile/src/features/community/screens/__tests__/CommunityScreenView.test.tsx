import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import CommunityScreenView, {
  CommunityScreenViewProps,
} from '../CommunityScreen.view';
import { styles } from '../CommunityScreen.styles';
import { BOARDS } from '../../constants/board';
import { CommunityPostSummary } from '../../types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

const post = (
  id: number,
  overrides: Partial<CommunityPostSummary> = {},
): CommunityPostSummary => ({
  id,
  userId: `u${id}`,
  category: 'free',
  title: `글 ${id}`,
  author: '한서준',
  level: 1,
  likes: 4,
  dislikes: 0,
  comments: 2,
  views: 100,
  createdAt: '3시간 전',
  createdAtIso: '2026-09-07T09:00:00Z',
  ...overrides,
});

const baseProps = (
  overrides: Partial<CommunityScreenViewProps> = {},
): CommunityScreenViewProps => ({
  posts: [post(1), post(2)],
  hotPosts: [],
  boards: BOARDS,
  selectedCategory: 'free',
  onSelectCategory: jest.fn(),
  selectedSort: 'latest',
  onSelectSort: jest.fn(),
  searchQuery: '',
  onSearchChange: jest.fn(),
  onWritePost: jest.fn(),
  onPostPress: jest.fn(),
  isLoading: false,
  isRefreshing: false,
  isFetchingNextPage: false,
  isError: false,
  onRefresh: jest.fn(),
  onLoadMore: jest.fn(),
  user: { nickname: '민영', email: 'minyeong@planmate.app' },
  pendingRequests: [],
  isNotificationModalVisible: false,
  setNotificationModalVisible: jest.fn(),
  onNotificationPress: jest.fn(),
  onNavigateProfile: jest.fn(),
  onAcceptInvitation: jest.fn(),
  onRejectInvitation: jest.fn(),
  ...overrides,
});

const render = (props: Partial<CommunityScreenViewProps> = {}) => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<CommunityScreenView {...baseProps(props)} />);
  });
  return tree!;
};

/**
 * 화면에 그려진 모든 글자를 모은다.
 * 제목처럼 조각난 children은 펼치고, 순위처럼 숫자로 들어간 것은 글자로 맞춘다.
 */
const allText = (tree: renderer.ReactTestRenderer): string[] =>
  tree.root
    .findAllByType(Text)
    .flatMap(node => {
      const children = node.props.children;
      return Array.isArray(children) ? children : [children];
    })
    .filter(child => typeof child === 'string' || typeof child === 'number')
    .map(String);

describe('지금 뜨는 글', () => {
  it('인기 글이 있으면 머리와 순위를 그린다', () => {
    const tree = render({
      hotPosts: [post(9, { title: '제주 3일' }), post(8, { title: '부산 맛집' })],
    });

    const texts = allText(tree);
    expect(texts).toContain('지금 뜨는 글');
    expect(texts).toContain('최근 24시간');
    expect(texts).toContain('제주 3일');
    expect(texts).toContain('1');
    expect(texts).toContain('2');

    act(() => tree.unmount());
  });

  it('인기 글이 비면 섹션 자체를 그리지 않는다', () => {
    const tree = render({ hotPosts: [] });

    expect(allText(tree)).not.toContain('지금 뜨는 글');

    act(() => tree.unmount());
  });

  it('네 번째부터는 자르고 세 장만 보여준다', () => {
    const tree = render({
      hotPosts: [post(1), post(2), post(3), post(4)],
    });

    const ranks = allText(tree).filter(text => /^[1-4]$/.test(text));
    expect(ranks).toEqual(['1', '2', '3']);

    act(() => tree.unmount());
  });
});

describe('정렬 알약', () => {
  it('고른 알약에만 켜진 배경이 붙는다', () => {
    const tree = render({ selectedSort: 'likes' });

    const pills = tree.root
      .findAllByType(TouchableOpacity)
      .filter(
        node =>
          Array.isArray(node.props.style) &&
          node.props.style.includes(styles.sortPill),
      );

    expect(pills).toHaveLength(3);
    const on = pills.filter(node =>
      (node.props.style as unknown[]).includes(styles.sortPillOn),
    );
    expect(on).toHaveLength(1);
    expect(on[0].props.accessibilityState.selected).toBe(true);

    act(() => tree.unmount());
  });
});

describe('글쓰기 FAB', () => {
  it('목록 위에 늘 떠 있고 누르면 글쓰기로 간다', () => {
    const onWritePost = jest.fn();
    const tree = render({ onWritePost });

    const fab = tree.root
      .findAllByType(TouchableOpacity)
      .find(node => node.props.accessibilityLabel === '글쓰기');

    expect(fab).toBeDefined();
    act(() => fab!.props.onPress());
    expect(onWritePost).toHaveBeenCalledTimes(1);

    act(() => tree.unmount());
  });
});

describe('빈 목록 문구', () => {
  it('글이 없으면 웹과 같은 문구를 쓴다', () => {
    const tree = render({ posts: [] });

    const texts = allText(tree);
    expect(texts).toContain('아직 게시글이 없어요');
    expect(texts).toContain('첫 글을 작성해보세요!');

    act(() => tree.unmount());
  });

  it('검색 중이면 검색 결과 문구로 바꾼다', () => {
    const tree = render({ posts: [], searchQuery: '부산' });

    const texts = allText(tree);
    expect(texts).toContain('검색 결과가 없습니다.');
    expect(texts).not.toContain('첫 글을 작성해보세요!');

    act(() => tree.unmount());
  });

  it('불러오지 못하면 웹 문구에 다시 시도 안내를 더한다', () => {
    const tree = render({ posts: [], isError: true });

    const texts = allText(tree);
    expect(texts).toContain('게시글을 불러오지 못했습니다');
    expect(texts).toContain('아래로 당겨 다시 시도해 주세요.');

    act(() => tree.unmount());
  });
});
