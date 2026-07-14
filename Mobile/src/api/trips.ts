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
  placeRating: number;
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
  const response = await axios.post(`/api/plan/create`, payload);
  return response.data;
}

/** Request edit access */
export async function requestEditAccess(planId: string): Promise<void> {
  await axios.post(`/api/plan/${planId}/request-access`);
}

// ────────────────────────────────────────────────
// Place Recommendation APIs
// ────────────────────────────────────────────────

/** Fetch recommended places for a plan by category */
export async function fetchCategoryPlaces(
  planId: string,
  category: 'tour' | 'lodging' | 'restaurant',
): Promise<PlacesResponse> {
  const response = await axios.get(`/api/plan/${planId}/${category}`);
  return response.data;
}

/** Fetch recommended tour places for a plan */
export const fetchTourPlaces = (planId: string) => fetchCategoryPlaces(planId, 'tour');

/** Fetch recommended lodging places for a plan */
export const fetchLodgingPlaces = (planId: string) => fetchCategoryPlaces(planId, 'lodging');

/** Fetch recommended restaurant places for a plan */
export const fetchRestaurantPlaces = (planId: string) => fetchCategoryPlaces(planId, 'restaurant');

/** Fetch recommended places by category (no auth) */
export async function fetchCategoryPlacesNoAuth(
  categoryType: 'tour' | 'lodging' | 'restaurant',
  category: string,
  name: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `/api/plan/${categoryType}/${encodeURIComponent(
      category,
    )}/${encodeURIComponent(name)}`,
  );
  return response.data;
}

/** Fetch recommended tour places (no auth) */
export const fetchTourPlacesNoAuth = (category: string, name: string) => fetchCategoryPlacesNoAuth('tour', category, name);

/** Fetch recommended lodging places (no auth) */
export const fetchLodgingPlacesNoAuth = (category: string, name: string) => fetchCategoryPlacesNoAuth('lodging', category, name);

/** Fetch recommended restaurant places (no auth) */
export const fetchRestaurantPlacesNoAuth = (category: string, name: string) => fetchCategoryPlacesNoAuth('restaurant', category, name);

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
  const response = await axios.get('/api/travel');
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
