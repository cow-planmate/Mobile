import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  changeMateStatus,
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
  joinMate,
  leaveMate,
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
  MateStatus,
  PageData,
  ReactionResult,
  ReactionType,
} from '../types';

const PAGE_SIZE = 20;

const KEYS = {
  posts: (category: string, sort: string, q: string) =>
    ['community', 'posts', category, sort, q] as const,
  hot: (category: string) => ['community', 'hot', category] as const,
  post: (postId: number | string) =>
    ['community', 'post', String(postId)] as const,
  comments: (postId: number | string) =>
    ['community', 'comments', String(postId)] as const,
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

export const usePost = (postId: number | string | undefined) =>
  useQuery({
    queryKey: KEYS.post(postId ?? ''),
    queryFn: ({ signal }) => fetchPost(postId as number | string, signal),
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

export const useComments = (
  postId: number | string | undefined,
  size = 20,
) =>
  useInfiniteQuery({
    queryKey: KEYS.comments(postId ?? ''),
    queryFn: ({ pageParam, signal }) =>
      fetchComments(postId as number | string, pageParam as number, size, signal),
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

export const useMyComments = (size = PAGE_SIZE) =>
  useQuery({
    queryKey: ['community', 'me', 'comments', size] as const,
    queryFn: ({ signal }) => fetchMyComments(0, size, signal),
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
    post: (postId: number | string) =>
      queryClient.invalidateQueries({ queryKey: KEYS.post(postId) }),
    comments: (postId: number | string) =>
      queryClient.invalidateQueries({ queryKey: KEYS.comments(postId) }),
    me: () => queryClient.invalidateQueries({ queryKey: ['community', 'me'] }),
    feedRegions: () =>
      queryClient.invalidateQueries({ queryKey: ['community', 'feed-regions'] }),
    deferPostRefetch: (postId: number | string) =>
      queryClient.invalidateQueries({
        queryKey: KEYS.post(postId),
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

export const useUpdatePost = (postId: number) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<CreatePostPayload>) =>
      updatePost(postId, payload),
    onSuccess: () => {
      void invalidate.post(postId);
      void invalidate.lists();
      void invalidate.me();
      void invalidate.feedRegions();
    },
  });
};

export const useDeletePost = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: (_data, postId) => {
      void invalidate.deferPostRefetch(postId);
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
) => {
  const idStr = String(postId);
  const patchItem = (item: CommunityPostSummary) =>
    String(item.id) === idStr ? { ...item, ...patch } : item;

  queryClient.setQueriesData({ queryKey: ['community', 'posts'] }, (data: any) => {
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

export const useReactToPost = (postId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: ReactionType) => reactToPost(Number(postId), type),
    onSuccess: (result: ReactionResult) => {
      queryClient.setQueryData(
        KEYS.post(postId),
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
      });
      // 좋아요를 취소하면 '좋아요한 글' 목록에서 빠져야 하므로 개수만
      // 갱신하지 않고 목록 자체를 다시 받는다.
      void queryClient.invalidateQueries({
        queryKey: ['community', 'me', 'liked'],
      });
    },
  });
};

export const useCreateComment = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: number;
    }) => createComment(Number(postId), content, parentId),
    onSuccess: () => {
      void invalidate.comments(postId);
      void invalidate.post(postId);
      void invalidate.lists();
      void invalidate.me();
    },
  });
};

export const useUpdateComment = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => updateComment(commentId, content),
    onSuccess: () => {
      void invalidate.comments(postId);
      void invalidate.me();
    },
  });
};

export const useDeleteComment = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      void invalidate.comments(postId);
      void invalidate.post(postId);
      void invalidate.lists();
      void invalidate.me();
    },
  });
};

export const useJoinMate = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => joinMate(Number(postId)),
    onSuccess: () => {
      void invalidate.post(postId);
      void invalidate.lists();
    },
  });
};

export const useLeaveMate = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => leaveMate(Number(postId)),
    onSuccess: () => {
      void invalidate.post(postId);
      void invalidate.lists();
    },
  });
};

export const useChangeMateStatus = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (status: MateStatus) => changeMateStatus(Number(postId), status),
    onSuccess: () => {
      void invalidate.post(postId);
      void invalidate.lists();
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
