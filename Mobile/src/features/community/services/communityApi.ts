import axios from 'axios';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { timeAgo } from '../utils/timeAgo';
import {
  CommunityComment,
  CommunityPostDetail,
  CommunityPostSummary,
  CreatePostPayload,
  FeedFilterParams,
  ForkResult,
  MateParticipation,
  MateStatus,
  MyStats,
  PageData,
  ReactionResult,
  ReactionType,
  RegionCount,
} from '../types';

const url = (path: string) => resolveApiUrl(`/api/community${path}`);

const mapCreatedAt = <T extends { createdAt?: string }>(
  item: T,
): T & { createdAtIso?: string } => {
  if (!item || typeof item !== 'object' || typeof item.createdAt !== 'string') {
    return item;
  }
  return {
    ...item,
    createdAtIso: item.createdAt,
    createdAt: timeAgo(item.createdAt),
  };
};

const mapPage = <T extends { createdAt: string }>(page: PageData<T>) => ({
  ...page,
  items: (page.items ?? []).map(mapCreatedAt),
});

export async function fetchPosts(
  category: string,
  page: number,
  size: number,
  sort = 'latest',
  q?: string,
  signal?: AbortSignal,
): Promise<PageData<CommunityPostSummary>> {
  const params: Record<string, string> = {
    category,
    page: String(page),
    size: String(size),
    sort,
  };
  if (q && q.trim()) {
    params.q = q.trim();
  }

  const response = await axios.get(url('/posts'), { params, signal });
  return mapPage(response.data);
}

export async function fetchFeedPosts(
  page: number,
  size: number,
  filters: FeedFilterParams = {},
  signal?: AbortSignal,
): Promise<PageData<CommunityPostSummary>> {
  const params: Record<string, string> = {
    category: 'feed',
    page: String(page),
    size: String(size),
    sort: filters.sort ?? 'latest',

    order: filters.order ?? 'desc',
  };
  if (filters.region) params.region = filters.region;
  if (filters.minDays !== undefined) params.minDays = String(filters.minDays);
  if (filters.maxDays !== undefined) params.maxDays = String(filters.maxDays);
  if (filters.tag) params.tag = filters.tag;
  if (filters.q && filters.q.trim()) params.q = filters.q.trim();

  const response = await axios.get(url('/posts'), { params, signal });
  return mapPage(response.data);
}

export async function fetchFeedRegionCounts(): Promise<RegionCount[]> {
  const response = await axios.get(url('/posts/regions'), {
    params: { category: 'feed' },
  });
  return response.data ?? [];
}

export async function forkPost(
  postId: number | string,
): Promise<ForkResult> {
  const response = await axios.post(url(`/posts/${postId}/fork`));
  return response.data;
}

export function formatDuration(durationDays?: number): string {
  if (!durationDays || durationDays < 1) return '';
  return durationDays === 1 ? '1일' : `${durationDays - 1}박 ${durationDays}일`;
}

export async function fetchHotPosts(
  category: string,
): Promise<CommunityPostSummary[]> {
  const response = await axios.get(url('/posts/hot'), { params: { category } });
  return (response.data ?? []).map(mapCreatedAt);
}

export async function fetchPost(
  postId: number | string,
  signal?: AbortSignal,
): Promise<CommunityPostDetail> {
  const response = await axios.get(url(`/posts/${postId}`), { signal });
  return mapCreatedAt(response.data);
}

export async function createPost(
  payload: CreatePostPayload,
): Promise<CommunityPostDetail> {
  const response = await axios.post(url('/posts'), payload);
  return mapCreatedAt(response.data);
}

export async function updatePost(
  postId: number,
  payload: Partial<CreatePostPayload>,
): Promise<CommunityPostDetail> {
  const response = await axios.patch(url(`/posts/${postId}`), payload);
  return mapCreatedAt(response.data);
}

export async function deletePost(postId: number): Promise<void> {
  await axios.delete(url(`/posts/${postId}`));
}

export async function reactToPost(
  postId: number,
  type: ReactionType,
): Promise<ReactionResult> {
  const response = await axios.put(url(`/posts/${postId}/reaction`), { type });
  return response.data;
}

export async function fetchComments(
  postId: number | string,
  page = 0,
  size = 50,
  signal?: AbortSignal,
): Promise<PageData<CommunityComment>> {
  const response = await axios.get(url(`/posts/${postId}/comments`), {
    params: { page: String(page), size: String(size) },
    signal,
  });
  return mapPage(response.data);
}

export async function createComment(
  postId: number,
  content: string,
  parentId?: number,
): Promise<CommunityComment> {
  const body = parentId != null ? { content, parentId } : { content };
  const response = await axios.post(url(`/posts/${postId}/comments`), body);
  return mapCreatedAt(response.data);
}

export async function updateComment(
  commentId: number,
  content: string,
): Promise<CommunityComment> {
  const response = await axios.patch(url(`/comments/${commentId}`), { content });
  return mapCreatedAt(response.data);
}

export async function deleteComment(commentId: number): Promise<void> {
  await axios.delete(url(`/comments/${commentId}`));
}

export async function joinMate(postId: number): Promise<MateParticipation> {
  const response = await axios.post(url(`/posts/${postId}/participants`));
  return response.data;
}

export async function leaveMate(postId: number): Promise<MateParticipation> {
  const response = await axios.delete(url(`/posts/${postId}/participants`));
  return response.data;
}

export async function changeMateStatus(
  postId: number,
  status: MateStatus,
): Promise<MateParticipation> {
  const response = await axios.patch(url(`/posts/${postId}/status`), { status });
  return response.data;
}

export async function updateAnswered(
  postId: number,
  isAnswered: boolean,
): Promise<CommunityPostDetail> {
  const response = await axios.patch(url(`/posts/${postId}/answered`), {
    isAnswered,
  });
  return mapCreatedAt(response.data);
}

export async function fetchMyStats(): Promise<MyStats> {
  const response = await axios.get(url('/me/stats'));
  return response.data;
}

const activityParams = (page: number, size: number, category?: string) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (category) params.set('category', category);
  return params.toString();
};

export async function fetchMyPosts(
  page = 0,
  size = 20,
  category?: string,
): Promise<PageData<CommunityPostSummary>> {
  const response = await axios.get(
    url(`/me/posts?${activityParams(page, size, category)}`),
  );
  return mapPage(response.data);
}

export async function fetchLikedPosts(
  page = 0,
  size = 20,
  category?: string,
): Promise<PageData<CommunityPostSummary>> {
  const response = await axios.get(
    url(`/me/liked?${activityParams(page, size, category)}`),
  );
  return mapPage(response.data);
}

export async function fetchMyComments(
  page = 0,
  size = 20,
): Promise<PageData<CommunityComment>> {
  const response = await axios.get(url(`/me/comments?page=${page}&size=${size}`));
  return mapPage(response.data);
}
