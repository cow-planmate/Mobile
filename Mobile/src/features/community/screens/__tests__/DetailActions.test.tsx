import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import FeedDetailScreen from '../FeedDetailScreen';
import PostDetailScreen from '../PostDetailScreen';
import { styles as feedStyles } from '../FeedDetailScreen.styles';
import { styles as postStyles } from '../PostDetailScreen.styles';

const mockShowAlert = jest.fn();
const mockUsePost = jest.fn();
const mockReactRequest = jest.fn();
const mockUpdateAnsweredRequest = jest.fn();
const mockUsePosts = jest.fn();

describe.each([FeedDetailScreen, PostDetailScreen])('detail load recovery', Screen => {
  it.each([503, 403, 404])('distinguishes HTTP %s and offers retry only for failures', status => {
    const refetch = jest.fn();
    mockUsePost.mockReturnValue({
      isLoading: false, isError: true, error: { response: { status } }, refetch,
    });
    mockUsePosts.mockReturnValue({ data: undefined });
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<Screen />); });
    const retry = tree!.root.findAllByType(Text).find(node => node.props.children === '다시 시도');
    expect(!!retry).toBe(status === 503);
    if (retry) {
      const button = tree!.root.findAllByType(TouchableOpacity).find(node =>
        node.findAllByType(Text).some(text => text.props.children === '다시 시도'),
      )!;
      act(() => button.props.onPress());
      expect(refetch).toHaveBeenCalledTimes(1);
    }
    act(() => tree!.unmount());
  });
});

const mutation = (request = jest.fn()) => ({
  isPending: false,
  mutate: request,
  mutateAsync: request,
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
  useRoute: () => ({ params: { postId: '7' } }),
}));

jest.mock('../../../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { userId: 'viewer' } }),
}));

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock('../../hooks/queries', () => ({
  usePost: (...args: unknown[]) => mockUsePost(...args),
  usePosts: (...args: unknown[]) => mockUsePosts(...args),
  useReactToPost: () => mutation(mockReactRequest),
  useForkItinerary: () => mutation(),
  // 댓글 아래 '다른 여행기'. 이 시험들은 그 목록을 보지 않는다.
  useSimilarFeedPosts: () => ({ data: [] }),
  useUpdateAnswered: () => mutation(mockUpdateAnsweredRequest),
  useDeletePost: () => mutation(),
}));

jest.mock('../../components/PostContentView', () => () => null);
jest.mock('../../components/CommentSection', () => () => null);
jest.mock('../../components/PublicProfileModal', () => () => null);
jest.mock('../../../../components/common/UserAvatar', () => () => null);
jest.mock('../../../../components/common/FallbackImage', () => () => null);
jest.mock('../../../../components/common', () => ({
  CalendarModal: () => null,
}));

const basePost = {
  id: 7,
  userId: 'author',
  category: 'free',
  title: 'title',
  author: 'author',
  level: 1,
  likes: 0,
  dislikes: 0,
  comments: 0,
  views: 0,
  createdAt: 'today',
  createdAtIso: '2026-08-27T00:00:00Z',
  content: null,
  contentText: 'body',
  myReaction: null,
};

const findButtonByStyle = (
  tree: renderer.ReactTestRenderer,
  targetStyle: unknown,
) =>
  tree.root.findAllByType(TouchableOpacity).find(node => {
    const style = node.props.style;
    return (
      style === targetStyle ||
      (Array.isArray(style) && style[0] === targetStyle)
    );
  })!;

describe('community detail action locks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePost.mockReturnValue({
      data: basePost,
      isLoading: false,
      isError: false,
    });
    mockUsePosts.mockReturnValue({ data: undefined });
  });

  it('sends only one feed reaction for same-render presses', async () => {
    let resolveRequest: (() => void) | undefined;
    mockReactRequest.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveRequest = resolve;
        }),
    );

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<FeedDetailScreen />);
    });
    const button = findButtonByStyle(tree!, feedStyles.reactionButton);

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = button.props.onPress();
      second = button.props.onPress();
    });

    await act(async () => {
      resolveRequest?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(mockReactRequest).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'Q&A answer status',
      { category: 'qna', isAnswered: false },
      mockUpdateAnsweredRequest,
    ],
  ])(
    'sends only one %s update for same-render presses',
    async (_name, patch, request) => {
      let resolveRequest: (() => void) | undefined;
      request.mockImplementationOnce(
        () =>
          new Promise<void>(resolve => {
            resolveRequest = resolve;
          }),
      );
      mockUsePost.mockReturnValue({
        data: { ...basePost, ...patch, userId: 'viewer' },
        isLoading: false,
        isError: false,
      });

      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<PostDetailScreen />);
      });
      const authorButtons = tree!.root
        .findAllByType(TouchableOpacity)
        .filter(node => {
          const style = node.props.style;
          return (
            style === postStyles.authorActionButton ||
            (Array.isArray(style) && style[0] === postStyles.authorActionButton)
          );
        });
      const button = authorButtons[0];

      let first: Promise<unknown>;
      let second: Promise<unknown>;
      act(() => {
        first = button.props.onPress();
        second = button.props.onPress();
      });

      await act(async () => {
        resolveRequest?.();
        await Promise.all([first!, second!]);
      });
      act(() => tree!.unmount());
      expect(request).toHaveBeenCalledTimes(1);
    },
  );
});

// 상세가 목록이 되지 않게 다섯 줄로 끊고, 지금 읽는 글은 뺀다.
// 둘 중 하나라도 풀리면 같은 글이 제 아래에 또 나오거나 목록이 통째로 붙는다.
describe('글 아래 다른 글 목록', () => {
  const summary = (id: number) => ({
    id,
    title: `글 ${id}`,
    author: '글쓴이',
    createdAt: 'today',
    views: 0,
    likes: 0,
    comments: 0,
    category: 'free',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePost.mockReturnValue({
      data: basePost,
      isLoading: false,
      isError: false,
    });
  });

  it('지금 읽는 글은 빼고 다섯 줄까지만 보여준다', () => {
    mockUsePosts.mockReturnValue({
      data: { pages: [{ items: [7, 1, 2, 3, 4, 5, 6].map(summary) }] },
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PostDetailScreen />);
    });

    // 제목 Text는 댓글 수가 붙으면 children이 배열이 된다. 첫 조각만 본다.
    const titles = tree!.root
      .findAllByType(Text)
      .map(node => {
        const children = node.props.children;
        return Array.isArray(children) ? children[0] : children;
      })
      .filter(child => typeof child === 'string' && child.startsWith('글 '));

    expect(titles).toEqual(['글 1', '글 2', '글 3', '글 4', '글 5']);
    act(() => tree!.unmount());
  });

  it('다른 글이 없으면 목록 자체를 그리지 않는다', () => {
    mockUsePosts.mockReturnValue({ data: { pages: [{ items: [summary(7)] }] } });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PostDetailScreen />);
    });

    const headings = tree!.root
      .findAllByType(Text)
      .map(node => node.props.children)
      .filter(child => typeof child === 'string' && child.endsWith('의 다른 글'));

    expect(headings).toHaveLength(0);
    act(() => tree!.unmount());
  });
});

// 작성 화면이 빈 본문을 제목으로 채우므로, 그대로 그리면 제목이 두 번 나온다.
describe('여행기 본문 자리', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePosts.mockReturnValue({ data: undefined });
  });

  it('본문이 제목과 같은 문장이면 본문 자리를 비운다', () => {
    mockUsePost.mockReturnValue({
      data: { ...basePost, title: '제주 봄바다', contentText: '제주 봄바다' },
      isLoading: false,
      isError: false,
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<FeedDetailScreen />);
    });

    expect(tree!.root.findAllByProps({ style: feedStyles.body })).toHaveLength(0);
    act(() => tree!.unmount());
  });

  it('본문이 따로 있으면 그대로 그린다', () => {
    mockUsePost.mockReturnValue({
      data: { ...basePost, title: '제주 봄바다', contentText: '넷째 날이 좋았다' },
      isLoading: false,
      isError: false,
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<FeedDetailScreen />);
    });

    expect(
      tree!.root.findAllByProps({ style: feedStyles.body }).length,
    ).toBeGreaterThan(0);
    act(() => tree!.unmount());
  });
});

// 좋아요·싫어요를 일정 칸으로 옮기면서, 일정이 없는 여행기에서 통째로
// 사라질 뻔했다. 홀로 서는 자리를 남겨 뒀는지 지킨다.
describe('일정이 없는 여행기', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePost.mockReturnValue({
      data: { ...basePost, itinerary: null },
      isLoading: false,
      isError: false,
    });
  });

  it('좋아요·싫어요는 그대로 눌린다', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<FeedDetailScreen />);
    });

    expect(findButtonByStyle(tree!, feedStyles.reactionButton)).toBeDefined();
    act(() => tree!.unmount());
  });
});

// 웹 PostDetailPage와 같은 문구를 쓰는지 본다. 앱 말투로 되돌아가면 여기서 걸린다.
describe('웹과 맞춘 문구', () => {
  const textsOf = (tree: renderer.ReactTestRenderer): string[] =>
    tree.root
      .findAllByType(Text)
      .flatMap(node => {
        const children = node.props.children;
        return Array.isArray(children) ? children : [children];
      })
      .filter(child => typeof child === 'string' || typeof child === 'number')
      .map(String);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePosts.mockReturnValue({ data: { pages: [{ items: [] }] } });
  });

  it('글을 못 찾으면 한 줄로만 말한다', () => {
    mockUsePost.mockReturnValue({ data: null, isLoading: false, isError: true, error: { response: { status: 404 } } });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PostDetailScreen />);
    });

    const texts = textsOf(tree!);
    expect(texts).toContain('게시글 정보를 찾을 수 없어요.');
    expect(texts).toContain('목록으로 돌아가기');
    expect(texts.some(t => t.includes('삭제됐거나'))).toBe(false);

    act(() => tree!.unmount());
  });

  it('질문게시판 글쓴이에게는 답변완료로 표시가 보인다', () => {
    mockUsePost.mockReturnValue({
      data: { ...basePost, userId: 'viewer', category: 'qna', isAnswered: false },
      isLoading: false,
      isError: false,
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PostDetailScreen />);
    });

    expect(textsOf(tree!)).toContain('답변완료로 표시');

    act(() => tree!.unmount());
  });

  it('이미 답변완료면 답변대기로 변경이 보인다', () => {
    mockUsePost.mockReturnValue({
      data: { ...basePost, userId: 'viewer', category: 'qna', isAnswered: true },
      isLoading: false,
      isError: false,
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PostDetailScreen />);
    });

    expect(textsOf(tree!)).toContain('답변대기로 변경');

    act(() => tree!.unmount());
  });
});
