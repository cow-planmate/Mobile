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

/**
 * 커뮤니티 API 클라이언트.
 *
 * 커뮤니티는 Backend-v2와 별개인 마이크로서비스지만 nginx 경로 라우팅으로 같은
 * 도메인에 붙어 있어, 앱 입장에서는 `/api/community/*`를 부르면 된다. 별도
 * base URL을 두지 않는 이유다.
 *
 * 웹 클라이언트는 fetch에 토큰 주입·401 재발급을 직접 구현했지만, 앱은 이미
 * `api/axiosConfig`의 인터셉터가 그 일을 하므로 공용 axios를 그대로 쓴다.
 */

/** 목록/상세 조회는 비로그인도 가능하다. 작성·반응·댓글은 토큰이 필요하다. */
const url = (path: string) => resolveApiUrl(`/api/community${path}`);

// ────────────────────────────────────────────────
// 응답 매핑
// ────────────────────────────────────────────────

/**
 * createdAt을 상대시간으로 바꾸고 원본 ISO를 createdAtIso에 보존한다.
 * 화면은 "3시간 전"을 쓰고, 정렬·비교가 필요하면 ISO를 쓴다.
 *
 * 작성·수정 API는 본문 없이 201/204만 돌려줄 수도 있다. 그때 여기서 예외가
 * 나면 저장은 됐는데 앱에는 실패로 보이므로, 변환할 게 없으면 받은 값을
 * 그대로 통과시킨다.
 */
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

// ────────────────────────────────────────────────
// 게시글
// ────────────────────────────────────────────────

/**
 * 게시판 목록 조회
 * @param q 검색어 (제목/본문)
 */
export async function fetchPosts(
  category: string,
  page: number,
  size: number,
  sort = 'latest',
  q?: string,
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

  const response = await axios.get(url('/posts'), { params });
  return mapPage(response.data);
}

/**
 * 여행기(FEED) 목록 조회.
 *
 * 일반 게시판과 같은 엔드포인트지만 지역·기간·태그 필터를 서버가 처리한다.
 * 빈 값은 아예 보내지 않아야 서버가 "전체"로 해석한다.
 */
export async function fetchFeedPosts(
  page: number,
  size: number,
  filters: FeedFilterParams = {},
): Promise<PageData<CommunityPostSummary>> {
  const params: Record<string, string> = {
    category: 'feed',
    page: String(page),
    size: String(size),
    sort: filters.sort ?? 'latest',
    // 웹은 정렬 방향을 항상 명시해 보낸다. 앱만 생략하면 서버 기본값이 desc가
    // 아닐 때 같은 화면이 다른 순서로 보인다.
    order: filters.order ?? 'desc',
  };
  if (filters.region) params.region = filters.region;
  if (filters.minDays !== undefined) params.minDays = String(filters.minDays);
  if (filters.maxDays !== undefined) params.maxDays = String(filters.maxDays);
  if (filters.tag) params.tag = filters.tag;
  if (filters.q && filters.q.trim()) params.q = filters.q.trim();

  const response = await axios.get(url('/posts'), { params });
  return mapPage(response.data);
}

/** 여행기 지역별 글 수 (필터 칩에 개수를 붙이는 용도) */
export async function fetchFeedRegionCounts(): Promise<RegionCount[]> {
  const response = await axios.get(url('/posts/regions'), {
    params: { category: 'feed' },
  });
  return response.data ?? [];
}

/** 여행기 가져가기 집계 (실제 플랜 복제는 forkItinerary가 담당한다) */
export async function forkPost(
  postId: number | string,
): Promise<ForkResult> {
  const response = await axios.post(url(`/posts/${postId}/fork`));
  return response.data;
}

/** durationDays → "N박 M일" 표기 (1일 여행은 "1일") */
export function formatDuration(durationDays?: number): string {
  if (!durationDays || durationDays < 1) return '';
  return durationDays === 1 ? '1일' : `${durationDays - 1}박 ${durationDays}일`;
}

/** 게시판별 인기 게시글 (핫글) */
export async function fetchHotPosts(
  category: string,
): Promise<CommunityPostSummary[]> {
  const response = await axios.get(url('/posts/hot'), { params: { category } });
  return (response.data ?? []).map(mapCreatedAt);
}

/** 게시글 상세 조회 (조회수가 증가한다) */
export async function fetchPost(
  postId: number | string,
): Promise<CommunityPostDetail> {
  const response = await axios.get(url(`/posts/${postId}`));
  return mapCreatedAt(response.data);
}

/** 게시글 작성 */
export async function createPost(
  payload: CreatePostPayload,
): Promise<CommunityPostDetail> {
  const response = await axios.post(url('/posts'), payload);
  return mapCreatedAt(response.data);
}

/** 게시글 수정 */
export async function updatePost(
  postId: number,
  payload: Partial<CreatePostPayload>,
): Promise<CommunityPostDetail> {
  const response = await axios.patch(url(`/posts/${postId}`), payload);
  return mapCreatedAt(response.data);
}

/** 게시글 삭제 */
export async function deletePost(postId: number): Promise<void> {
  await axios.delete(url(`/posts/${postId}`));
}

// ────────────────────────────────────────────────
// 반응
// ────────────────────────────────────────────────

/** 좋아요/싫어요. 같은 반응을 다시 보내면 서버가 취소로 처리한다. */
export async function reactToPost(
  postId: number,
  type: ReactionType,
): Promise<ReactionResult> {
  const response = await axios.put(url(`/posts/${postId}/reaction`), { type });
  return response.data;
}

// ────────────────────────────────────────────────
// 댓글
// ────────────────────────────────────────────────

/** 댓글 목록 (대댓글도 평면 목록으로 내려오며 parentId로 구분한다) */
export async function fetchComments(
  postId: number | string,
  page = 0,
  size = 50,
): Promise<PageData<CommunityComment>> {
  const response = await axios.get(url(`/posts/${postId}/comments`), {
    params: { page: String(page), size: String(size) },
  });
  return mapPage(response.data);
}

/**
 * 댓글 작성
 * @param parentId 지정하면 해당 댓글의 대댓글이 된다
 */
export async function createComment(
  postId: number,
  content: string,
  parentId?: number,
): Promise<CommunityComment> {
  const body = parentId != null ? { content, parentId } : { content };
  const response = await axios.post(url(`/posts/${postId}/comments`), body);
  return mapCreatedAt(response.data);
}

/** 댓글 수정 */
export async function updateComment(
  commentId: number,
  content: string,
): Promise<CommunityComment> {
  const response = await axios.patch(url(`/comments/${commentId}`), { content });
  return mapCreatedAt(response.data);
}

/** 댓글 삭제 (대댓글이 있으면 함께 삭제된다) */
export async function deleteComment(commentId: number): Promise<void> {
  await axios.delete(url(`/comments/${commentId}`));
}

// ────────────────────────────────────────────────
// 메이트 / QnA
// ────────────────────────────────────────────────

/** 메이트 모집 참여 */
export async function joinMate(postId: number): Promise<MateParticipation> {
  const response = await axios.post(url(`/posts/${postId}/participants`));
  return response.data;
}

/** 메이트 모집 참여 취소 */
export async function leaveMate(postId: number): Promise<MateParticipation> {
  const response = await axios.delete(url(`/posts/${postId}/participants`));
  return response.data;
}

/** 메이트 모집 상태 변경 (작성자만) */
export async function changeMateStatus(
  postId: number,
  status: MateStatus,
): Promise<MateParticipation> {
  const response = await axios.patch(url(`/posts/${postId}/status`), { status });
  return response.data;
}

/** QnA 답변완료 여부 변경 (작성자만) */
export async function updateAnswered(
  postId: number,
  isAnswered: boolean,
): Promise<CommunityPostDetail> {
  const response = await axios.patch(url(`/posts/${postId}/answered`), {
    isAnswered,
  });
  return mapCreatedAt(response.data);
}

// ────────────────────────────────────────────────
// 내 활동
// ────────────────────────────────────────────────

/** 내 활동 통계 (레벨 표시용) */
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
