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
}

/** 게시글 상세 */
export interface CommunityPostDetail extends CommunityPostSummary {
  /** BlockNote 블록 JSON */
  content: unknown;
  /** 검색/미리보기용 평문 */
  contentText: string;
  updatedAt?: string;
  myReaction?: ReactionType | null;
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
  level: number;
  content: string;
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
