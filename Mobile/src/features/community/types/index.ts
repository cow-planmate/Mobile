
export type CommunityCategory = 'free' | 'qna' | 'mate' | 'recommend' | 'feed';

export type ReactionType = 'like' | 'dislike';

export type MateStatus = 'recruiting' | 'closed';

export interface PageData<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CommunityPostSummary {
  id: number;
  userId: string;
  category: CommunityCategory;
  title: string;
  author: string;

  authorImage?: string | null;

  authorAvatarHash?: string | null;
  authorDeleted?: boolean;
  level: number;
  likes: number;
  dislikes: number;
  comments: number;
  views: number;

  createdAt: string;

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

  durationDays?: number;
  forks?: number;
  tags?: string[];
  description?: string;
  actedAt?: string;
}

export interface CommunityPostDetail extends CommunityPostSummary {

  content: unknown;

  contentText: string;
  updatedAt?: string;
  myReaction?: ReactionType | null;

  itinerary?: Itinerary | null;
  sourcePlanId?: string;
  myFork?: boolean;
}

export interface ItineraryPlanSnapshot {
  destinationId: number;
  destinationName?: string | null;
  adultCount?: number | null;
  childCount?: number | null;
}

export interface ItineraryItem {

  time: string;
  place: string;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;

  category?: string | null;
  photoUrl?: string | null;

  endTime?: string | null;
  placeId?: string | null;
  placeContentTypeId?: string | null;
  placeAddress?: string | null;
  placeCopyrightDivCd?: string | null;

  memo?: string | null;
}

export interface ItineraryDay {
  day: number;

  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  items: ItineraryItem[];
}

export interface Itinerary {
  plan?: ItineraryPlanSnapshot | null;
  days: ItineraryDay[];
}

export interface ForkResult {
  forks: number;
  myFork: boolean;
}

export interface FeedFilterParams {
  region?: string;
  minDays?: number;
  maxDays?: number;
  tag?: string;

  sort?: string;

  order?: 'asc' | 'desc';
  q?: string;
}

export interface RegionCount {
  region: string;
  count: number;
}

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

export interface ReactionResult {
  likes: number;
  dislikes: number;
  myReaction?: ReactionType | null;
}

export interface MateParticipation {
  participants: number;
  maxParticipants?: number;
  status?: MateStatus;
}

export interface MyStats {
  userId: string;
  postCount: number;
  commentCount: number;
  level: number;
}

export interface CreatePostPayload {
  category: CommunityCategory;
  title: string;

  content: unknown;

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

  content?: BlockInlineContent[];
}

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
