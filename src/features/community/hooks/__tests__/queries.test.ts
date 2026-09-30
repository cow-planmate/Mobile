import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  environmentManager,
  focusManager,
  InfiniteQueryObserver,
  QueryClient,
} from '@tanstack/query-core';
import { fetchFeedPosts, fetchPosts } from '../../services/communityApi';
import {
  useCreateComment,
  useCreatePost,
  useDeletePost,
  useFeedPosts,
  usePosts,
  useUpdateComment,
  useUpdatePost,
} from '../queries';

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('../../services/communityApi', () => ({
  fetchPosts: jest.fn(),
  fetchFeedPosts: jest.fn(),
}));

const invalidateQueries = jest.fn(() => Promise.resolve());
const removeQueries = jest.fn();
const queryClient = { invalidateQueries, removeQueries };
const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;

const mutationOptions = () => mockUseMutation.mock.calls.at(-1)[0];

describe('community mutation cache invalidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue(queryClient);
  });

  it('게시글 생성 후 목록, 내 활동, 지역 집계를 갱신한다', () => {
    useCreatePost();
    mutationOptions().onSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'posts'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'me'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'feed-regions'],
    });
  });

  it('게시글 수정 후 상세, 내 활동, 지역 집계를 갱신한다', () => {
    useUpdatePost(7);
    mutationOptions().onSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'post', '7'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'me'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'feed-regions'],
    });
  });

  it('여행기 수정 시 같은 번호의 커뮤니티 글 대신 여행기 상세를 갱신한다', () => {
    useUpdatePost(7, true);
    mutationOptions().onSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['feed', 'post', '7'],
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ['community', 'post', '7'],
    });
  });

  it('게시글 삭제 후 활성 상세를 재조회하지 않고 다음 진입만 새로 조회하게 한다', () => {
    useDeletePost();
    mutationOptions().onSuccess(undefined, 7);

    expect(removeQueries).not.toHaveBeenCalled();
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['community', 'post', '7'],
      refetchType: 'none',
    });
  });

  it.each([useCreateComment, useUpdateComment])(
    '댓글 변경 후 내 활동 캐시를 갱신한다',
    useCommentMutation => {
      useCommentMutation(7);
      mutationOptions().onSuccess();

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['community', 'me'],
      });
    },
  );
});

describe.each([
  ['커뮤니티', () => usePosts('free'), fetchPosts],
  ['여행기', () => useFeedPosts({}), fetchFeedPosts],
] as const)('%s 외부 변경 동기화', (_label, useList, fetchList) => {
  let client: QueryClient;
  let unsubscribe: (() => void) | undefined;
  let wasServer: boolean;
  const api = fetchList as jest.Mock;
  const page = (id: number) => ({ items: [{ id }], page: 0, totalPages: 1 });
  const observe = () => {
    useList();
    const options = (useInfiniteQuery as jest.Mock).mock.calls.at(-1)[0];
    const observer = new InfiniteQueryObserver(client, options);
    unsubscribe = observer.subscribe(() => undefined);
    return observer;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    wasServer = environmentManager.isServer();
    environmentManager.setIsServer(() => false);
    focusManager.setFocused(true);
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false, staleTime: 300_000 },
      },
    });
    client.mount();
    api.mockResolvedValue(page(1));
  });

  afterEach(() => {
    unsubscribe?.();
    client.unmount();
    client.clear();
    focusManager.setFocused(undefined);
    environmentManager.setIsServer(() => wasServer);
    jest.useRealTimers();
  });

  it('30초 후 외부 글을 받아오고 조회 실패 시 기존 목록을 유지한다', async () => {
    const observer = observe();
    await jest.advanceTimersByTimeAsync(0);
    expect(api).toHaveBeenCalledTimes(1);

    api.mockResolvedValue(page(2));
    await jest.advanceTimersByTimeAsync(30_000);
    expect(observer.getCurrentResult().data?.pages).toEqual([page(2)]);
    expect(api).toHaveBeenCalledTimes(2);

    api.mockRejectedValue(new Error('offline'));
    await jest.advanceTimersByTimeAsync(30_000);
    expect(observer.getCurrentResult().isRefetchError).toBe(true);
    expect(observer.getCurrentResult().data?.pages).toEqual([page(2)]);
  });

  it('백그라운드에서는 멈추고 캐시가 최신이어도 앱 복귀 시 조회한다', async () => {
    const observer = observe();
    await jest.advanceTimersByTimeAsync(0);
    focusManager.setFocused(false);
    await jest.advanceTimersByTimeAsync(60_000);
    expect(api).toHaveBeenCalledTimes(1);

    api.mockResolvedValue(page(2));
    focusManager.setFocused(true);
    await jest.advanceTimersByTimeAsync(0);
    expect(observer.getCurrentResult().data?.pages).toEqual([page(2)]);

    focusManager.setFocused(false);
    api.mockResolvedValue(page(3));
    focusManager.setFocused(true);
    await jest.advanceTimersByTimeAsync(0);
    expect(api).toHaveBeenCalledTimes(3);
    expect(observer.getCurrentResult().data?.pages).toEqual([page(3)]);
  });
});
