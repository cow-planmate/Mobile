/**
 * 커뮤니티 서비스 응답 타입.
 *
 * 커뮤니티는 Backend-v2와 별개인 마이크로서비스지만, 운영 환경에서는 nginx
 * 경로 라우팅으로 같은 도메인의 `/api/community/*`로 들어온다. 아래 타입은 그
 * 서비스의 DTO와 1:1로 대응한다.
 */

/** 게시판 종류 */
export type CommunityCategory = 'free' | 'qna' | 'mate' | 'recommend' | 'feed';

/** 게시글 반응 */
export type ReactionType = 'like' | 'dislike';

/** 메이트 모집 상태 */
export type MateStatus = 'recruiting' | 'closed';

/** 페이지네이션 응답 */
export interface PageData<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** 게시글 목록 항목 */
export interface CommunityPostSummary {
  id: number;
  userId: string;
  category: CommunityCategory;
  title: string;
  author: string;
  /** 작성자가 올린 프로필 사진 (없으면 생략) */
  authorImage?: string | null;
  /** 작성자 이메일 해시 — Gravatar 폴백용 */
  authorAvatarHash?: string | null;
  authorDeleted?: boolean;
  level: number;
  likes: number;
  dislikes: number;
  comments: number;
  views: number;
  /** 상대시간으로 변환된 값 ("3시간 전") */
  createdAt: string;
  /** 원본 ISO 시각 */
  createdAtIso: string;
  image?: string;
  isAnswered?: boolean;
  participants?: number;
  maxParticipants?: number;
  status?: MateStatus;
  region?: string;
  location?: string;
  rating?: string;
  coords?: { lat: number; lng: number };
  // FEED 전용
  durationDays?: number;
  forks?: number;
  tags?: string[];
  description?: string;
  actedAt?: string;
}

/** 게시글 상세 */
export interface CommunityPostDetail extends CommunityPostSummary {
  /** BlockNote 블록 JSON */
  content: unknown;
  /** 검색/미리보기용 평문 */
  contentText: string;
  updatedAt?: string;
  myReaction?: ReactionType | null;
  // FEED(여행기) 전용
  itinerary?: Itinerary | null;
  sourcePlanId?: string;
  myFork?: boolean;
}

// ────────────────────────────────────────────────
// 여행기(FEED) 일정 스냅샷
// ────────────────────────────────────────────────

/**
 * 여행기에 박아두는 플랜 스냅샷.
 * "가져가기"가 이 스냅샷만으로 새 플랜을 만들기 때문에, POST /api/plan/full이
 * 요구하는 정보를 빠짐없이 담아야 한다. 구 스키마 게시글에는 없으므로 전부
 * optional이며, plan이 없으면 가져가기가 불가능하다.
 */
export interface ItineraryPlanSnapshot {
  destinationId: number;
  destinationName?: string | null;
  transportationType: string;
  adultCount?: number | null;
  childCount?: number | null;
}

/** 일정 스냅샷의 장소 블록 하나 */
export interface ItineraryItem {
  /** 블록 시작 시각 HH:mm */
  time: string;
  place: string;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  /** BlockCategory (ATTRACTION/ACCOMMODATION/RESTAURANT/FREE/SEARCH) */
  category?: string | null;
  photoUrl?: string | null;
  /** 블록 종료 시각 HH:mm */
  endTime?: string | null;
  placeId?: string | null;
  placeContentTypeId?: string | null;
  placeAddress?: string | null;
  placeCopyrightDivCd?: string | null;
  /** 작성자가 "메모도 함께 공개"를 켠 경우에만 존재 */
  memo?: string | null;
}

/** 일정 스냅샷의 하루 */
export interface ItineraryDay {
  day: number;
  /** 원본 여행 날짜 (가져갈 때는 사용자가 고른 시작일로 시프트된다) */
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  items: ItineraryItem[];
}

/** 여행기에 담긴 일정 스냅샷 */
export interface Itinerary {
  plan?: ItineraryPlanSnapshot | null;
  days: ItineraryDay[];
}

/** 가져가기 집계 결과 */
export interface ForkResult {
  forks: number;
  myFork: boolean;
}

/** 여행기 목록 필터 */
export interface FeedFilterParams {
  region?: string;
  minDays?: number;
  maxDays?: number;
  tag?: string;
  /** latest | likes | views | forks */
  sort?: string;
  /** 정렬 방향. 생략하면 desc를 명시해 보낸다(서버 기본값에 기대지 않는다). */
  order?: 'asc' | 'desc';
  q?: string;
}

/** 지역별 여행기 수 */
export interface RegionCount {
  region: string;
  count: number;
}

/** 댓글 (대댓글이면 parentId가 채워진다) */
export interface CommunityComment {
  id: number;
  postId: number;
  parentId?: number | null;
  userId: string;
  author: string;
  authorImage?: string | null;
  authorAvatarHash?: string | null;
  authorDeleted?: boolean;
  level: number;
  content: string;
  postTitle?: string | null;
  postCategory?: CommunityCategory | null;
  createdAt: string;
  createdAtIso: string;
}

/** 좋아요/싫어요 결과 */
export interface ReactionResult {
  likes: number;
  dislikes: number;
  myReaction?: ReactionType | null;
}

/** 메이트 참여 결과 */
export interface MateParticipation {
  participants: number;
  maxParticipants?: number;
  status?: MateStatus;
}

/** 내 활동 통계 */
export interface MyStats {
  userId: string;
  postCount: number;
  commentCount: number;
  level: number;
}

/** 게시글 작성/수정 요청 */
export interface CreatePostPayload {
  category: CommunityCategory;
  title: string;
  /** BlockNote 블록 JSON */
  content: unknown;
  /** 블록에서 뽑아낸 평문 */
  contentText: string;
  thumbnailUrl?: string | null;
  location?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  region?: string;
  maxParticipants?: number | null;
  durationDays?: number;
  itinerary?: Itinerary | null;
  tags?: string[];
  sourcePlanId?: string;
}

// ────────────────────────────────────────────────
// BlockNote 블록
// ────────────────────────────────────────────────

/** 블록 안의 인라인 조각 (텍스트 또는 링크) */
export interface BlockInlineContent {
  type?: string;
  text?: string;
  href?: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    [key: string]: unknown;
  };
  /** 링크는 자식 인라인을 갖는다 */
  content?: BlockInlineContent[];
}

/** BlockNote 블록 하나 */
export interface ContentBlock {
  id?: string;
  type?: string;
  props?: {
    level?: number;
    checked?: boolean;
    url?: string;
    caption?: string;
    [key: string]: unknown;
  };
  content?: BlockInlineContent[] | string;
  children?: ContentBlock[];
}
