import axios from 'axios';
import { API_URL } from '@env';
import { resolveApiUrl } from '../utils/apiUrl';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface PlaceVO {
  placeId: string;
  categoryId: number;
  url: string;
  name: string;
  formatted_address: string;
  rating: number;
  xLocation: number;
  yLocation: number;
  xlocation?: number;
  ylocation?: number;
  photoUrl: string;
  iconUrl: string;
  contentTypeId?: string;
  copyrightDivCd?: string;
}

export interface PlacesResponse {
  places: PlaceVO[];
  nextPageTokens?: string[];
}

export interface TimetableVO {
  timetableId: number;
  timeTableId?: number;
  date: string;
  timeTableStartTime: string;
  timeTableEndTime: string;
}

export interface PlaceBlockVO {
  blockId?: number;
  timetablePlaceBlockId?: number;
  timeTableId: number;
  timetableId?: number;
  placeCategoryId: number;
  placeCategory?: number;
  placeName: string;
  placeRating?: number;
  placeAddress: string;
  placeLink?: string;
  placeId: string;
  photoUrl?: string;
  startTime: any;
  endTime: any;
  blockStartTime?: any;
  blockEndTime?: any;
  xLocation?: number;
  yLocation?: number;
  xlocation?: number;
  ylocation?: number;
  memo?: string;
  placeContentTypeId?: string;
  placeThumbnailUrl?: string;
  placeCopyrightDivCd?: string;
}

export interface PlanFrameVO {
  planId: string;
  planName: string;
  departure: string;
  travelCategoryName: string;
  travelId: number;
  travelName: string;
  adultCount: number;
  childCount: number;
  transportationCategoryId: number;
}

export interface PlanResponse {
  message: string;
  planFrame: PlanFrameVO;
  placeBlocks: PlaceBlockVO[];
  timetables: TimetableVO[];
}

export interface CreatePlanPayload {
  departure: string;
  travelId: number;
  dates: string[];
  adultCount: number;
  childCount: number;
  transportation: number;
}

export interface FullPlanPayload {
  planFrame: {
    planId?: string;
    planName?: string;
    departure: string;
    transportationCategoryId: number;
    travelId: number;
    adultCount: number;
    childCount: number;
  };
  timetables: {
    timetableId?: number;
    date: string;
    timeTableStartTime: string;
    timeTableEndTime: string;
  }[];
  timetablePlaceBlocks: any[];
}

// ────────────────────────────────────────────────
// Plan APIs
// ────────────────────────────────────────────────

/** Fetch full plan data (plan frame + timetables + place blocks) */
export async function fetchPlan(planId: string): Promise<PlanResponse> {
  const response = await axios.get(`/api/plan/${planId}`);
  return response.data;
}

/** Create a new plan and return planId */
export async function createPlan(
  payload: CreatePlanPayload,
): Promise<{ planId: string }> {
  const response = await axios.post(`/api/plan`, payload);
  return response.data;
}

/** Create full plan (non-login save) */
export async function createFullPlan(
  payload: FullPlanPayload,
): Promise<{ planId: string }> {
  const response = await axios.post(`/api/plan/full`, payload);
  return response.data;
}

/** Request edit access */
export async function requestEditAccess(planId: string): Promise<void> {
  await axios.post(`/api/plan/${planId}/request-access`);
}

// ────────────────────────────────────────────────
// Place Recommendation APIs
// ────────────────────────────────────────────────

// PlaceSummaryDto -> PlaceVO adapter helper
function mapSummaryToVO(summary: any): PlaceVO {
  const categoryEnumMap: Record<string, number> = {
    ATTRACTION: 0,
    ACCOMMODATION: 1,
    RESTAURANT: 2,
  };
  return {
    placeId: summary.contentId || '',
    categoryId: categoryEnumMap[summary.category] ?? 4,
    url: '',
    name: summary.title || '',
    formatted_address: summary.addr1 || '',
    rating: 0,
    xLocation: summary.longitude ?? 0,
    yLocation: summary.latitude ?? 0,
    photoUrl: summary.thumbnailUrl || '',
    iconUrl: '',
    contentTypeId: summary.contentTypeId || '',
    copyrightDivCd: summary.copyrightDivCd || '',
  };
}

/** Fetch recommended places for a plan by category */
export async function fetchCategoryPlaces(
  destinationId: number,
  category: 'tour' | 'lodging' | 'restaurant',
  page: number = 1,
  size: number = 20,
): Promise<PlacesResponse> {
  const categoryEnumMap = {
    tour: 'ATTRACTION',
    lodging: 'ACCOMMODATION',
    restaurant: 'RESTAURANT',
  };
  const response = await axios.get('/api/place', {
    params: {
      destinationId,
      category: categoryEnumMap[category],
      page,
      size,
    },
  });
  const data = response.data;
  const placesVO = (data.places || []).map((p: any) => mapSummaryToVO(p));
  return {
    places: placesVO,
    totalCount: data.totalCount,
    page: data.page,
    size: data.size,
    hasNext: data.hasNext,
  };
}

/** Fetch recommended tour places for a plan */
export const fetchTourPlaces = (destinationId: number) => fetchCategoryPlaces(destinationId, 'tour');

/** Fetch recommended lodging places for a plan */
export const fetchLodgingPlaces = (destinationId: number) => fetchCategoryPlaces(destinationId, 'lodging');

/** Fetch recommended restaurant places for a plan */
export const fetchRestaurantPlaces = (destinationId: number) => fetchCategoryPlaces(destinationId, 'restaurant');

/** Fetch recommended places by category (no auth) */
export async function fetchCategoryPlacesNoAuth(
  categoryType: 'tour' | 'lodging' | 'restaurant',
  destinationId: number,
): Promise<PlacesResponse> {
  return fetchCategoryPlaces(destinationId, categoryType);
}

/** Fetch recommended tour places (no auth) */
export const fetchTourPlacesNoAuth = (destinationId: number) => fetchCategoryPlacesNoAuth('tour', destinationId);

/** Fetch recommended lodging places (no auth) */
export const fetchLodgingPlacesNoAuth = (destinationId: number) => fetchCategoryPlacesNoAuth('lodging', destinationId);

/** Fetch recommended restaurant places (no auth) */
export const fetchRestaurantPlacesNoAuth = (destinationId: number) => fetchCategoryPlacesNoAuth('restaurant', destinationId);

// ────────────────────────────────────────────────
// Place Search & Pagination APIs
// ────────────────────────────────────────────────

/** Search places for a plan */
export async function searchPlaces(
  planId: string,
  query: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `/api/plan/${planId}/place/${encodeURIComponent(query)}`,
  );
  return response.data;
}

/** Search places (no auth / no planId) */
export async function searchPlacesNoAuth(
  query: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `/api/plan/place/${encodeURIComponent(query)}`,
  );
  return response.data;
}

/** Load more places with pagination tokens */
export async function fetchNextPlaces(
  nextPageTokens: string[],
): Promise<PlacesResponse> {
  const response = await axios.post(`/api/plan/nextplace`, {
    nextPageTokens,
  });
  return response.data;
}

// ────────────────────────────────────────────────
// Weather API
// ────────────────────────────────────────────────

export interface SimpleWeatherInfo {
  date: string;
  description: string;
  temp_min: number;
  temp_max: number;
  feels_like: number;
}

export interface WeatherResponse {
  weather: SimpleWeatherInfo[];
  recommendation: string;
}

/** Fetch weather recommendations for a city and date range */
export async function fetchWeatherRecommendations(
  city: string,
  startDate: string,
  endDate: string,
): Promise<WeatherResponse> {
  const response = await axios.post(`/api/weather/recommendations`, {
    city,
    start_date: startDate,
    end_date: endDate,
  });
  return response.data;
}

// ────────────────────────────────────────────────
// Share & Collaboration APIs
// ────────────────────────────────────────────────

/** Get share URL */
export async function getShareUrl(
  planId: string,
): Promise<{ shareUrl: string }> {
  const response = await axios.get(`/api/plan/${planId}/share`);
  return {
    shareUrl: response.data.sharedPlanUrl || response.data.shareUrl || '',
  };
}

/** Get list of editors */
export async function getEditors(planId: string): Promise<any[]> {
  const response = await axios.get(`/api/plan/${planId}/editors`);
  return response.data;
}

/** Invite an editor by nickname */
export async function inviteEditor(
  planId: string,
  nickname: string,
): Promise<void> {
  await axios.post(resolveApiUrl(`/api/plan/${planId}/invite`), {
    receiverNickname: nickname,
  });
}

/** Remove an editor */
export async function removeEditor(
  planId: string,
  userId: string,
): Promise<void> {
  await axios.delete(`/api/plan/${planId}/editors/${userId}`);
}

/** Leave as editor */
export async function leaveAsEditor(planId: string): Promise<void> {
  await axios.delete(`/api/plan/${planId}/editor/me`);
}

/** Get pending invitations */
export interface PendingInvitation {
  requestId: number;
  senderId: number;
  senderNickname: string;
  planId: string;
  planName: string;
  type: string;
}

export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  const response = await axios.get(
    resolveApiUrl('/api/collaboration-requests/pending'),
  );
  return (response.data.pendingRequests || []) as PendingInvitation[];
}

/** Accept invitation */
export async function acceptInvitation(requestId: number): Promise<void> {
  await axios.post(
    resolveApiUrl(`/api/collaboration-requests/${requestId}/accept`),
  );
}

/** Reject invitation */
export async function rejectInvitation(requestId: number): Promise<void> {
  await axios.post(
    resolveApiUrl(`/api/collaboration-requests/${requestId}/reject`),
  );
}

// ────────────────────────────────────────────────
// Travel Destinations API
// ────────────────────────────────────────────────

export interface TravelDestination {
  travelId: number;
  travelName: string;
  travelCategoryName: string;
}

/** Get available travel destinations */
export async function fetchTravelDestinations(): Promise<TravelDestination[]> {
  const response = await axios.get('/api/destination');
  return response.data;
}

// ────────────────────────────────────────────────
// Departure Search API
// ────────────────────────────────────────────────

/** Search departure locations */
export async function searchDeparture(query: string): Promise<any[]> {
  const response = await axios.post(`/api/departure`, {
    departureQuery: query,
  });
  return response.data;
}
