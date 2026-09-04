import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  fetchComments,
  fetchFeedPosts,
  fetchFeedRegionCounts,
  fetchHotPosts,
  fetchLikedPosts,
  fetchMyComments,
  fetchMyPosts,
  fetchMyStats,
  fetchPost,
  fetchPosts,
  reactToPost,
  updateAnswered,
  updateComment,
  updatePost,
} from '../services/communityApi';
import { forkItinerary } from '../services/forkItinerary';
import { invalidatePlanCaches } from '../../../hooks/planCache';
import {
  CommunityPostSummary,
  CreatePostPayload,
  FeedFilterParams,
  Itinerary,
  PageData,
  ReactionResult,
  ReactionType,
} from '../types';

const PAGE_SIZE = 20;

const KEYS = {
  posts: (category: string, sort: string, q: string) =>
    ['community', 'posts', category, sort, q] as const,
  hot: (category: string) => ['community', 'hot', category] as const,
  // 피드와 커뮤니티는 ID 시퀀스가 분리돼 있어 같은 번호가 양쪽에 존재할 수 있다.
  // 캐시 키도 네임스페이스로 갈라 두어야 서로 덮어쓰지 않는다.
  post: (postId: number | string, feed = false) =>
    [feed ? 'feed' : 'community', 'post', String(postId)] as const,
  comments: (postId: number | string, feed = false) =>
    [feed ? 'feed' : 'community', 'comments', String(postId)] as const,
};

export const usePosts = (category: string, sort = 'latest', q = '') =>
  useInfiniteQuery({
    queryKey: KEYS.posts(category, sort, q),
    queryFn: ({ pageParam, signal }) =>
      fetchPosts(category, pageParam as number, PAGE_SIZE, sort, q, signal),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  });

export const useFeedPosts = (filters: FeedFilterParams, size = 12) =>
  useInfiniteQuery({
    queryKey: ['community', 'posts', 'feed', filters, size] as const,
    queryFn: ({ pageParam, signal }) =>
      fetchFeedPosts(pageParam as number, size, filters, signal),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  });

/**
 * 지금 보는 여행기와 같은 지역의 다른 여행기. 웹과 같은 자리·같은 규칙이다.
 *
 * 추천이 많은 순으로 받아 지금 글을 걸러내고 넷만 남긴다 — 넉넉히 받는 이유는
 * 지금 글이 그 안에 섞여 나오기 때문이다. 지역을 모르면 고를 근거가 없어 쉰다.
 */
export const useSimilarFeedPosts = (
  region: string | undefined,
  excludePostId: number | string | undefined,
) =>
  useQuery({
    queryKey: ['community', 'posts', 'feed', 'similar', region, excludePostId] as const,
    queryFn: ({ signal }) =>
      fetchFeedPosts(0, 9, { region, sort: 'likes' }, signal),
    enabled: !!region && region !== '전국' && !!excludePostId,
    staleTime: 30_000,
    select: page =>
      page.items
        .filter(item => String(item.id) !== String(excludePostId))
        .slice(0, 4),
  });

export const useFeedRegionCounts = () =>
  useQuery({
    queryKey: ['community', 'feed-regions'],
    queryFn: ({ signal }) => fetchFeedRegionCounts(signal),
    staleTime: 60_000,
  });

export const useHotPosts = (category: string) =>
  useQuery({
    queryKey: KEYS.hot(category),
    queryFn: ({ signal }) => fetchHotPosts(category, signal),
    staleTime: 60_000,
  });

export const usePost = (postId: number | string | undefined, feed = false) =>
  useQuery({
    queryKey: KEYS.post(postId ?? '', feed),
    queryFn: ({ signal }) => fetchPost(postId as number | string, signal, feed),
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

export const useComments = (
  postId: number | string | undefined,
  size = 20,
  feed = false,
) =>
  useInfiniteQuery({
    queryKey: KEYS.comments(postId ?? '', feed),
    queryFn: ({ pageParam, signal }) =>
      fetchComments(postId as number | string, pageParam as number, size, signal, feed),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

export const useMyStats = (enabled = true) =>
  useQuery({
    queryKey: ['community', 'me', 'stats'],
    queryFn: ({ signal }) => fetchMyStats(signal),
    enabled,
  });

export const useMyPosts = (category?: string, size = PAGE_SIZE) =>
  useQuery({
    queryKey: ['community', 'me', 'posts', category ?? 'all', size] as const,
    queryFn: ({ signal }) => fetchMyPosts(0, size, category, signal),
    staleTime: 30_000,
  });

export const useLikedPosts = (category?: string, size = PAGE_SIZE) =>
  useQuery({
    queryKey: ['community', 'me', 'liked', category ?? 'all', size] as const,
    queryFn: ({ signal }) => fetchLikedPosts(0, size, category, signal),
    staleTime: 30_000,
  });

export const useMyComments = (size = PAGE_SIZE, feed = false) =>
  useQuery({
    queryKey: [feed ? 'feed' : 'community', 'me', 'comments', size] as const,
    queryFn: ({ signal }) => fetchMyComments(0, size, signal, feed),
    staleTime: 30_000,
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return {
    lists: () =>
      queryClient
        .invalidateQueries({ queryKey: ['community', 'posts'] })
        .then(() =>
          queryClient.invalidateQueries({ queryKey: ['community', 'hot'] }),
        ),
    post: (postId: number | string, feed = false) =>
      queryClient.invalidateQueries({ queryKey: KEYS.post(postId, feed) }),
    comments: (postId: number | string, feed = false) =>
      queryClient.invalidateQueries({ queryKey: KEYS.comments(postId, feed) }),
    me: () => queryClient.invalidateQueries({ queryKey: ['community', 'me'] }),
    feedRegions: () =>
      queryClient.invalidateQueries({ queryKey: ['community', 'feed-regions'] }),
    deferPostRefetch: (postId: number | string, feed = false) =>
      queryClient.invalidateQueries({
        queryKey: KEYS.post(postId, feed),
        refetchType: 'none',
      }),
  };
};

export const useCreatePost = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(payload),
    onSuccess: () => {
      void invalidate.lists();
      void invalidate.me();
      void invalidate.feedRegions();
    },
  });
};

export const useUpdatePost = (postId: number, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<CreatePostPayload>) =>
      updatePost(postId, payload, feed),
    onSuccess: () => {
      void invalidate.post(postId);
      void invalidate.lists();
      void invalidate.me();
      void invalidate.feedRegions();
    },
  });
};

export const useDeletePost = (feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId, feed),
    onSuccess: (_data, postId) => {
      void invalidate.deferPostRefetch(postId, feed);
      void invalidate.lists();
      void invalidate.me();
      void invalidate.feedRegions();
    },
  });
};

const patchPostSummaryInCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number | string,
  patch: Partial<CommunityPostSummary>,
  feed = false,
) => {
  const idStr = String(postId);
  const patchItem = (item: CommunityPostSummary) =>
    String(item.id) === idStr ? { ...item, ...patch } : item;

  // 피드 목록만, 혹은 커뮤니티 목록만 건드린다 — ID 가 겹쳐도 남의 글을 고치지 않는다.
  const listKey = feed
    ? (['community', 'posts', 'feed'] as const)
    : (['community', 'posts'] as const);

  queryClient.setQueriesData({ queryKey: listKey }, (data: any) => {
    if (!data?.pages) return data;
    return {
      ...data,
      pages: data.pages.map((page: PageData<CommunityPostSummary>) => ({
        ...page,
        items: page.items.map(patchItem),
      })),
    };
  });

  queryClient.setQueriesData(
    { queryKey: ['community', 'hot'] },
    (data: CommunityPostSummary[] | undefined) => data?.map(patchItem),
  );

  (['posts', 'liked'] as const).forEach(key => {
    queryClient.setQueriesData(
      { queryKey: ['community', 'me', key] },
      (data: PageData<CommunityPostSummary> | undefined) =>
        data ? { ...data, items: data.items.map(patchItem) } : data,
    );
  });
};

export const useReactToPost = (postId: number | string, feed = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: ReactionType) => reactToPost(Number(postId), type, feed),
    onSuccess: (result: ReactionResult) => {
      queryClient.setQueryData(
        KEYS.post(postId, feed),
        (prev: (CommunityPostSummary & { myReaction?: ReactionType | null }) | undefined) =>
          prev
            ? {
                ...prev,
                likes: result.likes,
                dislikes: result.dislikes,
                myReaction: result.myReaction,
              }
            : prev,
      );
      patchPostSummaryInCaches(queryClient, postId, {
        likes: result.likes,
        dislikes: result.dislikes,
      }, feed);
      // 좋아요를 취소하면 '좋아요한 글' 목록에서 빠져야 하므로 개수만
      // 갱신하지 않고 목록 자체를 다시 받는다.
      void queryClient.invalidateQueries({
        queryKey: ['community', 'me', 'liked'],
      });
    },
  });
};

export const useCreateComment = (postId: number | string, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: number;
    }) => createComment(Number(postId), content, parentId, feed),
    onSuccess: () => {
      void invalidate.comments(postId, feed);
      void invalidate.post(postId, feed);
      void invalidate.lists();
      void invalidate.me();
    },
  });
};

export const useUpdateComment = (postId: number | string, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => updateComment(commentId, content, feed),
    onSuccess: () => {
      void invalidate.comments(postId, feed);
      void invalidate.me();
    },
  });
};

export const useDeleteComment = (postId: number | string, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId, feed),
    onSuccess: () => {
      void invalidate.comments(postId, feed);
      void invalidate.post(postId, feed);
      void invalidate.lists();
      void invalidate.me();
    },
  });
};

export const useUpdateAnswered = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (isAnswered: boolean) =>
      updateAnswered(Number(postId), isAnswered),
    onSuccess: () => {
      void invalidate.post(postId);
      void invalidate.lists();
    },
  });
};

export const useForkItinerary = (postId: number | string) => {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itinerary,
      startDate,
      title,
    }: {
      itinerary: Itinerary;
      startDate: Date;
      title: string;
    }) => forkItinerary(postId, itinerary, startDate, title),
    onSuccess: () => {
      void invalidate.post(postId);
      void invalidate.lists();
      void invalidatePlanCaches(queryClient);
    },
  });
};
