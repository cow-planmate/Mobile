import axios from 'axios';
import { WEB_URL } from '@env';
import { resolveApiUrl } from '../utils/apiUrl';
import {
  CollaborationRequestType,
  normalizeCollaborationRequestType,
} from '../utils/collaborationRequest';

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
  totalCount?: number;
  page?: number;
  size?: number;
  hasNext?: boolean;
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

  latitude?: number;
  longitude?: number;
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
  destinationId: number;
  destinationName: string;
  adultCount: number;
  childCount: number;
}

export interface FullPlanPayload {
  planFrame: {
    destinationId: number;
    adultCount: number;
    childCount: number;
  };
  timetables: {
    date: string;
    timeTableStartTime: string;
    timeTableEndTime: string;
  }[];
  timetablePlaceBlocks: any[];
}

export async function createFullPlan(
  payload: FullPlanPayload,
): Promise<{ planId: string }> {
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
      destinationId: payload.planFrame.destinationId,
      adultCount: payload.planFrame.adultCount ?? 1,
      childCount: payload.planFrame.childCount ?? 0,
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

export const fetchTourPlaces = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlaces(destinationId, 'tour', page, size);

export const fetchLodgingPlaces = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlaces(destinationId, 'lodging', page, size);

export const fetchRestaurantPlaces = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlaces(destinationId, 'restaurant', page, size);

export interface KeywordPlace {
  id: string;
  name: string;
  address: string;
  jibunAddress: string;
  phone: string;
  category: string;
  url: string;
  lat: number;
  lng: number;
}

export async function searchPlacesByKeyword(query: string, size: number = 8): Promise<KeywordPlace[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const response = await axios.get('/api/place/search', {
    params: { query: trimmed, size },
  });
  return response.data?.places || [];
}

export type WeatherDataSource =
  | 'FORECAST'
  | 'LAST_YEAR_ACTUAL'
  | 'SEASONAL_AVERAGE';

export interface SimpleWeatherInfo {

  date: string;
  description: string;
  tempMin: number;
  tempMax: number;
  feelsLike: number;

  dataSource?: WeatherDataSource;
}

export interface WeatherResponse {
  weather: SimpleWeatherInfo[];
  recommendation: string;
}

export async function fetchWeather(
  destinationId: number,
  startDate: string,
  endDate: string,
): Promise<WeatherResponse> {
  const response = await axios.get<WeatherResponse>('/api/weather', {
    params: { destinationId, startDate, endDate },
  });
  return response.data;
}

export const PLAN_NAME_MAX_LENGTH = 100;

export async function getShareStatus(planId: string): Promise<{ isShared: boolean }> {
  const response = await axios.get(resolveApiUrl(`/api/plan/${planId}/share`));
  return { isShared: !!response.data?.isShared };
}

export async function updateShareStatus(planId: string, isShared: boolean): Promise<void> {
  await axios.patch(resolveApiUrl(`/api/plan/${planId}/share`), { isShared });
}

export async function getShareUrl(
  planId: string,
): Promise<{ shareUrl: string; isShared?: boolean }> {
  let isShared = true;
  try {
    const status = await getShareStatus(planId);
    isShared = status.isShared;
  } catch (e) {
    if (__DEV__) console.log('Failed to fetch share status:', e);
  }
  return {
    shareUrl: `${WEB_URL}/create?id=${planId}`,
    isShared,
  };
}

interface EditorDto {
  userId: string;
  nickname: string;
}

export async function getEditors(planId: string): Promise<EditorDto[]> {
  const response = await axios.get<{ editors?: EditorDto[] }>(
    resolveApiUrl(`/api/plan/${planId}/editors`),
  );
  return (response.data?.editors ?? []).map(editor => ({
    userId: String(editor?.userId ?? ''),
    nickname: String(editor?.nickname ?? ''),
  }));
}

export async function inviteEditor(
  planId: string,
  nickname: string,
): Promise<void> {
  await axios.post(resolveApiUrl(`/api/plan/${planId}/invite`), {
    receiverNickname: nickname,
  });
}

/**
 * 편집 권한이 없는 사용자가 플랜 소유자에게 권한을 요청한다.
 * 이미 멤버면 COLLAB_002, 대기 중인 요청이 있으면 COLLAB_003으로 409가 돌아온다.
 */
export async function requestEditAccess(planId: string): Promise<number> {
  const response = await axios.post<{ collaborationRequestId: number }>(
    resolveApiUrl(`/api/plan/${planId}/request-access`),
  );
  return Number(response.data?.collaborationRequestId);
}

export async function removeEditor(
  planId: string,
  userId: string | number,
): Promise<void> {
  await axios.delete(resolveApiUrl(`/api/plan/${planId}/editors/${userId}`));
}

export async function deletePlans(planIds: string[]): Promise<string[]> {
  const response = await axios.delete<{ deletedPlanIds: string[] }>(
    resolveApiUrl('/api/plan'),
    { data: { planIds } },
  );
  return response.data?.deletedPlanIds ?? [];
}

export async function leaveAsEditor(planId: string): Promise<void> {
  await axios.delete(resolveApiUrl(`/api/plan/${planId}/editor/me`));
}

export interface PendingInvitation {
  requestId: number;

  senderId: string;
  senderNickname: string;
  planId: string;
  planName: string;
  type: CollaborationRequestType;
}

export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  const response = await axios.get(
    resolveApiUrl('/api/collaboration-requests/pending'),
  );
  const rawList = response.data?.requests ?? [];
  return rawList.map((item: any) => ({
    requestId: item.collaborationRequestId,
    senderId: item.senderId,
    senderNickname: item.senderNickname,
    planId: item.planId,
    planName: item.planName,
    type: normalizeCollaborationRequestType(item.type),
  })) as PendingInvitation[];
}

export async function acceptInvitation(requestId: number): Promise<void> {
  await axios.post(
    resolveApiUrl(`/api/collaboration-requests/${requestId}/accept`),
  );
}

export async function rejectInvitation(requestId: number): Promise<void> {
  await axios.post(
    resolveApiUrl(`/api/collaboration-requests/${requestId}/reject`),
  );
}
