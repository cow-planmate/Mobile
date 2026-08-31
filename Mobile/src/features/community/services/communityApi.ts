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
import type { FeedImageUploadFile } from '../utils/feedImage';

const url = (path: string) => resolveApiUrl(`/api/community${path}`);
const feedUrl = (path: string) => resolveApiUrl(`/api/feed${path}`);

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

  const response = await axios.get(feedUrl('/posts'), { params, signal });
  return mapPage(response.data);
}

export async function fetchFeedRegionCounts(
  signal?: AbortSignal,
): Promise<RegionCount[]> {
  const response = await axios.get(feedUrl('/posts/regions'), { signal });
  return response.data ?? [];
}

export async function forkPost(
  postId: number | string,
): Promise<ForkResult> {
  const response = await axios.post(feedUrl(`/posts/${postId}/fork`));
  return response.data;
}

/**
 * 정렬 방향 라벨.
 *
 * 기준마다 방향의 뜻이 달라 라벨을 따로 준다. 최신순의 오름차순은 "오래된순"이지
 * "낮은순"이 아니다. 웹의 DetailFilterPanel과 같은 규칙이다.
 */
const ORDER_LABELS: Record<string, { desc: string; asc: string }> = {
  최신순: { desc: '최신순', asc: '오래된순' },
};
const DEFAULT_ORDER_LABELS = { desc: '높은순', asc: '낮은순' };

export function orderLabelsFor(sortBy: string): { desc: string; asc: string } {
  return ORDER_LABELS[sortBy] ?? DEFAULT_ORDER_LABELS;
}

export function formatDuration(durationDays?: number): string {
  if (!durationDays || durationDays < 1) return '';
  return durationDays === 1 ? '1일' : `${durationDays - 1}박 ${durationDays}일`;
}

export async function fetchHotPosts(
  category: string,
  signal?: AbortSignal,
): Promise<CommunityPostSummary[]> {
  const isFeed = category.toLowerCase() === 'feed';
  const response = isFeed
    ? await axios.get(feedUrl('/posts/hot'), { signal })
    : await axios.get(url('/posts/hot'), { params: { category }, signal });
  return (response.data ?? []).map(mapCreatedAt);
}

export async function fetchPost(
  postId: number | string,
  signal?: AbortSignal,
  feed = false,
): Promise<CommunityPostDetail> {
  const response = await axios.get((feed ? feedUrl : url)(`/posts/${postId}`), { signal });
  return mapCreatedAt(response.data);
}

export async function createPost(
  payload: CreatePostPayload,
): Promise<CommunityPostDetail> {
  const response = await axios.post(payload.category.toLowerCase() === 'feed' ? feedUrl('/posts') : url('/posts'), payload);
  return mapCreatedAt(response.data);
}

export async function updatePost(
  postId: number,
  payload: Partial<CreatePostPayload>,
  feed = false,
): Promise<CommunityPostDetail> {
  const response = await axios.patch((feed ? feedUrl : url)(`/posts/${postId}`), payload);
  return mapCreatedAt(response.data);
}

export async function deletePost(postId: number, feed = false): Promise<void> {
  await axios.delete((feed ? feedUrl : url)(`/posts/${postId}`));
}

export async function uploadCommunityImage(
  file: FeedImageUploadFile,
): Promise<string> {
  const form = new FormData();
  form.append('file', file as unknown as Blob);
  const response = await axios.post<{ url: string }>(url('/images'), form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const imageUrl = response.data?.url;
  if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
    throw new Error('이미지 업로드 응답이 올바르지 않아요.');
  }
  return imageUrl.trim();
}

export async function deleteCommunityImage(imageUrl: string): Promise<void> {
  await axios.delete(url(`/images?url=${encodeURIComponent(imageUrl)}`));
}

export async function reactToPost(
  postId: number,
  type: ReactionType,
  feed = false,
): Promise<ReactionResult> {
  const response = await axios.put((feed ? feedUrl : url)(`/posts/${postId}/reaction`), { type });
  return response.data;
}

export async function fetchComments(
  postId: number | string,
  page = 0,
  size = 50,
  signal?: AbortSignal,
  feed = false,
): Promise<PageData<CommunityComment>> {
  const response = await axios.get((feed ? feedUrl : url)(`/posts/${postId}/comments`), {
    params: { page: String(page), size: String(size) },
    signal,
  });
  return mapPage(response.data);
}

export async function createComment(
  postId: number,
  content: string,
  parentId?: number,
  feed = false,
): Promise<CommunityComment> {
  const body = parentId != null ? { content, parentId } : { content };
  const response = await axios.post((feed ? feedUrl : url)(`/posts/${postId}/comments`), body);
  return mapCreatedAt(response.data);
}

export async function updateComment(
  commentId: number,
  content: string,
  feed = false,
): Promise<CommunityComment> {
  const response = await axios.patch((feed ? feedUrl : url)(`/comments/${commentId}`), { content });
  return mapCreatedAt(response.data);
}

export async function deleteComment(commentId: number, feed = false): Promise<void> {
  await axios.delete((feed ? feedUrl : url)(`/comments/${commentId}`));
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

export async function fetchMyStats(signal?: AbortSignal): Promise<MyStats> {
  const response = await axios.get(url('/me/stats'), { signal });
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
  signal?: AbortSignal,
): Promise<PageData<CommunityPostSummary>> {
  const response = await axios.get(
    (category?.toLowerCase() === 'feed' ? feedUrl : url)(
      `/me/posts?${activityParams(page, size, category?.toLowerCase() === 'feed' ? undefined : category)}`,
    ),
    { signal },
  );
  return mapPage(response.data);
}

export async function fetchLikedPosts(
  page = 0,
  size = 20,
  category?: string,
  signal?: AbortSignal,
): Promise<PageData<CommunityPostSummary>> {
  const response = await axios.get(
    (category?.toLowerCase() === 'feed' ? feedUrl : url)(
      `/me/liked?${activityParams(page, size, category?.toLowerCase() === 'feed' ? undefined : category)}`,
    ),
    { signal },
  );
  return mapPage(response.data);
}

/** 내가 쓴 댓글. 여행기 댓글은 feed=true 로 따로 조회한다 (별개 도메인) */
export async function fetchMyComments(
  page = 0,
  size = 20,
  signal?: AbortSignal,
  feed = false,
): Promise<PageData<CommunityComment>> {
  const path = (feed ? feedUrl : url)(`/me/comments?page=${page}&size=${size}`);
  const response = await axios.get(path, { signal });
  return mapPage(response.data);
}
