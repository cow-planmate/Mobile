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
import {
  CreatePostPayload,
  FeedFilterParams,
  Itinerary,
  MateStatus,
  ReactionType,
} from '../types';

/**
 * 커뮤니티 React Query 훅.
 *
 * 웹은 페이지 번호 방식이지만 앱 목록은 무한 스크롤이므로 목록만
 * `useInfiniteQuery`로 바꿨다. 나머지 키 구조와 무효화 규칙은 웹과 맞춘다.
 */

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

// ────────────────────────────────────────────────
// 조회
// ────────────────────────────────────────────────

/** 게시판 목록 (무한 스크롤) */
export const usePosts = (category: string, sort = 'latest', q = '') =>
  useInfiniteQuery({
    queryKey: KEYS.posts(category, sort, q),
    queryFn: ({ pageParam }) =>
      fetchPosts(category, pageParam as number, PAGE_SIZE, sort, q),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  });

/** 여행기(FEED) 목록 — 지역·기간·태그 필터는 서버가 처리한다 */
export const useFeedPosts = (filters: FeedFilterParams, size = 12) =>
  useInfiniteQuery({
    queryKey: ['community', 'posts', 'feed', filters, size] as const,
    queryFn: ({ pageParam }) =>
      fetchFeedPosts(pageParam as number, size, filters),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  });

/** 여행기 지역별 글 수 */
export const useFeedRegionCounts = () =>
  useQuery({
    queryKey: ['community', 'feed-regions'],
    queryFn: fetchFeedRegionCounts,
    staleTime: 60_000,
  });

/** 게시판별 핫글 */
export const useHotPosts = (category: string) =>
  useQuery({
    queryKey: KEYS.hot(category),
    queryFn: () => fetchHotPosts(category),
    staleTime: 60_000,
  });

/** 게시글 상세 */
export const usePost = (postId: number | string | undefined) =>
  useQuery({
    queryKey: KEYS.post(postId ?? ''),
    queryFn: () => fetchPost(postId as number | string),
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

/** 댓글 목록 */
export const useComments = (
  postId: number | string | undefined,
  size = 20,
) =>
  useInfiniteQuery({
    queryKey: KEYS.comments(postId ?? ''),
    queryFn: ({ pageParam }) =>
      fetchComments(postId as number | string, pageParam as number, size),
    initialPageParam: 0,
    getNextPageParam: lastPage =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

/** 내 활동 통계 */
export const useMyStats = (enabled = true) =>
  useQuery({
    queryKey: ['community', 'me', 'stats'],
    queryFn: fetchMyStats,
    enabled,
  });

export const useMyPosts = (category?: string, size = PAGE_SIZE) =>
  useQuery({
    queryKey: ['community', 'me', 'posts', category ?? 'all', size] as const,
    queryFn: () => fetchMyPosts(0, size, category),
    staleTime: 30_000,
  });

export const useLikedPosts = (category?: string, size = PAGE_SIZE) =>
  useQuery({
    queryKey: ['community', 'me', 'liked', category ?? 'all', size] as const,
    queryFn: () => fetchLikedPosts(0, size, category),
    staleTime: 30_000,
  });

export const useMyComments = (size = PAGE_SIZE) =>
  useQuery({
    queryKey: ['community', 'me', 'comments', size] as const,
    queryFn: () => fetchMyComments(0, size),
    staleTime: 30_000,
  });

// ────────────────────────────────────────────────
// 변경 (공통 무효화 규칙)
// ────────────────────────────────────────────────

/**
 * 변경 후 어떤 캐시를 버릴지 한곳에 모은다.
 * 예를 들어 댓글을 달면 댓글 목록뿐 아니라 목록의 댓글 수도 틀어지므로 함께
 * 무효화한다.
 */
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
  };
};

export const useCreatePost = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(payload),
    onSuccess: () => {
      void invalidate.lists();
      void invalidate.me();
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
    },
  });
};

export const useDeletePost = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      void invalidate.lists();
      void invalidate.me();
    },
  });
};

export const useReactToPost = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (type: ReactionType) => reactToPost(Number(postId), type),
    onSuccess: () => {
      void invalidate.post(postId);
      void invalidate.lists();
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

/**
 * 여행기 가져가기.
 * 스냅샷으로 새 플랜을 만든 뒤 포크를 집계하므로, 성공하면 내 일정 목록과
 * 여행기 집계가 모두 바뀐다.
 */
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
      void queryClient.invalidateQueries({ queryKey: ['myPlans'] });
      void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
