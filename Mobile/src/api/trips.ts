import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { resolveApiUrl } from '../utils/apiUrl';

async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (_error) {
    return null;
  }
}

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
    destinationId?: number;
    travelId?: number;
    transportationType?: 'PUBLIC' | 'PRIVATE';
    transportationCategoryId?: number;
    adultCount: number;
    childCount: number;
    planId?: string;
    planName?: string;
    departure?: string;
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
  const response = await axios.get(resolveApiUrl(`/api/plan/${planId}`));
  return response.data;
}

/** Create a new plan and return planId */
export async function createPlan(
  payload: CreatePlanPayload,
): Promise<{ planId: string }> {
  const response = await axios.post(resolveApiUrl(`/api/plan`), payload);
  return response.data;
}

/** Create full plan (non-login save) */
export async function createFullPlan(
  payload: FullPlanPayload,
): Promise<{ planId: string }> {
  const destinationId =
    payload.planFrame.destinationId ?? payload.planFrame.travelId ?? 1;
  const transportationType =
    payload.planFrame.transportationType ??
    (payload.planFrame.transportationCategoryId === 1 ? 'PRIVATE' : 'PUBLIC');

  const categoryMap: Record<number | string, string> = {
    0: 'ATTRACTION',
    1: 'ACCOMMODATION',
    2: 'RESTAURANT',
    3: 'FREE',
    4: 'SEARCH',
    ATTRACTION: 'ATTRACTION',
    ACCOMMODATION: 'ACCOMMODATION',
    RESTAURANT: 'RESTAURANT',
    FREE: 'FREE',
    SEARCH: 'SEARCH',
  };

  const formattedPayload = {
    planFrame: {
      destinationId,
      travelId: destinationId,
      transportationType,
      transportationCategoryId:
        payload.planFrame.transportationCategoryId ??
        (transportationType === 'PRIVATE' ? 1 : 0),
      adultCount: payload.planFrame.adultCount ?? 1,
      childCount: payload.planFrame.childCount ?? 0,
      departure: payload.planFrame.departure || 'SEOUL',
      planName: payload.planFrame.planName || '나의 일정',
    },
    timetables: payload.timetables || [],
    timetablePlaceBlocks: (payload.timetablePlaceBlocks || []).map(
      (block: any) => {
        const blockCategory =
          block.blockCategory ||
          categoryMap[block.placeCategoryId] ||
          'ATTRACTION';
        return {
          ...block,
          blockCategory,
          latitude: block.latitude ?? block.yLocation ?? block.ylocation ?? 0,
          longitude: block.longitude ?? block.xLocation ?? block.xlocation ?? 0,
        };
      },
    ),
  };

  const response = await axios.post(
    resolveApiUrl('/api/plan/full'),
    formattedPayload,
  );
  return response.data;
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

/** Get plan share status (isShared: boolean) */
export async function getShareStatus(planId: string): Promise<{ isShared: boolean }> {
  const token = await getAuthToken();
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await axios.get(resolveApiUrl(`/api/plan/${planId}/share`), config);
  return { isShared: !!response.data?.isShared };
}

/** Update plan share status (isShared: boolean) */
export async function updateShareStatus(planId: string, isShared: boolean): Promise<void> {
  const token = await getAuthToken();
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  await axios.patch(resolveApiUrl(`/api/plan/${planId}/share`), { isShared }, config);
}

/** Request edit access for plan */
export async function requestEditAccess(planId: string): Promise<{ collaborationRequestId: number }> {
  const token = await getAuthToken();
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await axios.post(resolveApiUrl(`/api/plan/${planId}/request-access`), {}, config);
  return { collaborationRequestId: response.data?.collaborationRequestId };
}

/** Get share URL */
export async function getShareUrl(
  planId: string,
): Promise<{ shareUrl: string; isShared?: boolean }> {
  let isShared = true;
  try {
    const status = await getShareStatus(planId);
    isShared = status.isShared;
  } catch (e) {
    console.log('Failed to fetch share status:', e);
  }
  return {
    shareUrl: `https://planmate.bapdodi.cloud/share/${planId}`,
    isShared,
  };
}

/** Get list of editors */
export async function getEditors(planId: string): Promise<{ userId: string; nickname: string }[]> {
  const token = await getAuthToken();
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await axios.get(resolveApiUrl(`/api/plan/${planId}/editors`), config);
  const data = response?.data;
  const rawEditors = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && 'editors' in data && Array.isArray(data.editors)
    ? data.editors
    : [];
  return rawEditors.map((e: any) => ({
    userId: String(e?.userId ?? ''),
    nickname: String(e?.nickname ?? ''),
  }));
}

/** Invite an editor by nickname */
export async function inviteEditor(
  planId: string,
  nickname: string,
): Promise<void> {
  const token = await getAuthToken();
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  await axios.post(
    resolveApiUrl(`/api/plan/${planId}/invite`),
    { receiverNickname: nickname },
    config,
  );
}

/** Remove an editor */
export async function removeEditor(
  planId: string,
  userId: string | number,
): Promise<void> {
  const token = await getAuthToken();
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  await axios.delete(resolveApiUrl(`/api/plan/${planId}/editors/${userId}`), config);
}

/** Leave as editor */
export async function leaveAsEditor(planId: string): Promise<void> {
  const token = await getAuthToken();
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  await axios.delete(resolveApiUrl(`/api/plan/${planId}/editor/me`), config);
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
  const rawList = response.data.requests || response.data.pendingRequests || [];
  return rawList.map((item: any) => ({
    requestId: item.collaborationRequestId ?? item.requestId,
    senderId: item.senderId,
    senderNickname: item.senderNickname,
    planId: item.planId,
    planName: item.planName,
    type: item.type,
  })) as PendingInvitation[];
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
