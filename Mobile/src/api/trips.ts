import axios from 'axios';
import { API_URL } from '@env';

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
  planId: number;
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
    planId: number;
    planName?: string;
    departure: string;
    transportationCategoryId: number;
    travelId: number;
    adultCount: number;
    childCount: number;
  };
  timetables: {
    timetableId: number;
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
export async function fetchPlan(planId: number): Promise<PlanResponse> {
  const response = await axios.get(`${API_URL}/api/plan/${planId}`);
  return response.data;
}

/** Create a new plan and return planId */
export async function createPlan(
  payload: CreatePlanPayload,
): Promise<{ planId: number }> {
  const response = await axios.post(`${API_URL}/api/plan`, payload);
  return response.data;
}

/** Create full plan (non-login save) */
export async function createFullPlan(
  payload: FullPlanPayload,
): Promise<{ planId: number }> {
  const response = await axios.post(`${API_URL}/api/plan/create`, payload);
  return response.data;
}

/** Request edit access */
export async function requestEditAccess(planId: number): Promise<void> {
  await axios.post(`${API_URL}/api/plan/${planId}/request-access`);
}

// ────────────────────────────────────────────────
// Place Recommendation APIs
// ────────────────────────────────────────────────

/** Fetch recommended tour places for a plan */
export async function fetchTourPlaces(planId: number): Promise<PlacesResponse> {
  const response = await axios.get(`${API_URL}/api/plan/${planId}/tour`);
  return response.data;
}

/** Fetch recommended lodging places for a plan */
export async function fetchLodgingPlaces(
  planId: number,
): Promise<PlacesResponse> {
  const response = await axios.get(`${API_URL}/api/plan/${planId}/lodging`);
  return response.data;
}

/** Fetch recommended restaurant places for a plan */
export async function fetchRestaurantPlaces(
  planId: number,
): Promise<PlacesResponse> {
  const response = await axios.get(`${API_URL}/api/plan/${planId}/restaurant`);
  return response.data;
}

/** Fetch recommended tour places (no auth) */
export async function fetchTourPlacesNoAuth(
  category: string,
  name: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `${API_URL}/api/plan/tour/${encodeURIComponent(
      category,
    )}/${encodeURIComponent(name)}`,
  );
  return response.data;
}

/** Fetch recommended lodging places (no auth) */
export async function fetchLodgingPlacesNoAuth(
  category: string,
  name: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `${API_URL}/api/plan/lodging/${encodeURIComponent(
      category,
    )}/${encodeURIComponent(name)}`,
  );
  return response.data;
}

/** Fetch recommended restaurant places (no auth) */
export async function fetchRestaurantPlacesNoAuth(
  category: string,
  name: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `${API_URL}/api/plan/restaurant/${encodeURIComponent(
      category,
    )}/${encodeURIComponent(name)}`,
  );
  return response.data;
}

// ────────────────────────────────────────────────
// Place Search & Pagination APIs
// ────────────────────────────────────────────────

/** Search places for a plan */
export async function searchPlaces(
  planId: number,
  query: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `${API_URL}/api/plan/${planId}/place/${encodeURIComponent(query)}`,
  );
  return response.data;
}

/** Search places (no auth / no planId) */
export async function searchPlacesNoAuth(
  query: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `${API_URL}/api/plan/place/${encodeURIComponent(query)}`,
  );
  return response.data;
}

/** Load more places with pagination tokens */
export async function fetchNextPlaces(
  nextPageTokens: string[],
): Promise<PlacesResponse> {
  const response = await axios.post(`${API_URL}/api/plan/nextplace`, {
    nextPageTokens,
  });
  return response.data;
}

// ────────────────────────────────────────────────
// Weather API
// ────────────────────────────────────────────────

export interface WeatherData {
  temperature: number;
  description: string;
  iconUrl: string;
}

/** Fetch weather recommendations */
export async function fetchWeather(
  travelId: number,
  date: string,
): Promise<WeatherData[]> {
  const response = await axios.post(`${API_URL}/api/weather/recommendations`, {
    travelId,
    date,
  });
  return response.data;
}

// ────────────────────────────────────────────────
// Share & Collaboration APIs
// ────────────────────────────────────────────────

/** Get share URL */
export async function getShareUrl(
  planId: number,
): Promise<{ shareUrl: string }> {
  const response = await axios.get(`${API_URL}/api/plan/${planId}/share`);
  return response.data;
}

/** Get list of editors */
export async function getEditors(planId: number): Promise<any[]> {
  const response = await axios.get(`${API_URL}/api/plan/${planId}/editors`);
  return response.data;
}

/** Invite an editor by nickname */
export async function inviteEditor(
  planId: number,
  nickname: string,
): Promise<void> {
  await axios.post(`${API_URL}/api/plan/${planId}/invite`, { nickname });
}

/** Remove an editor */
export async function removeEditor(
  planId: number,
  userId: number,
): Promise<void> {
  await axios.delete(`${API_URL}/api/plan/${planId}/editors/${userId}`);
}

/** Leave as editor */
export async function leaveAsEditor(planId: number): Promise<void> {
  await axios.delete(`${API_URL}/api/plan/${planId}/editor/me`);
}

/** Get pending invitations */
export async function getPendingInvitations(): Promise<any[]> {
  const response = await axios.get(
    `${API_URL}/api/collaboration-requests/pending`,
  );
  return response.data.pendingRequests || [];
}

/** Accept invitation */
export async function acceptInvitation(requestId: number): Promise<void> {
  await axios.post(`${API_URL}/api/collaboration-requests/${requestId}/accept`);
}

/** Reject invitation */
export async function rejectInvitation(requestId: number): Promise<void> {
  await axios.post(`${API_URL}/api/collaboration-requests/${requestId}/reject`);
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
  const response = await axios.get(`${API_URL}/api/travel`);
  return response.data;
}

// ────────────────────────────────────────────────
// Departure Search API
// ────────────────────────────────────────────────

/** Search departure locations */
export async function searchDeparture(query: string): Promise<any[]> {
  const response = await axios.post(`${API_URL}/api/departure`, {
    departureQuery: query,
  });
  return response.data;
}
