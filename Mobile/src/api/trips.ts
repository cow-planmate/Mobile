import axios from 'axios';
import { WEB_URL } from '@env';
import { resolveApiUrl } from '../utils/apiUrl';

// ────────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────────

/** 장소 정보 VO */
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

/** 장소 목록 조회 응답 */
export interface PlacesResponse {
  places: PlaceVO[];
  nextPageTokens?: string[];
  totalCount?: number;
  page?: number;
  size?: number;
  hasNext?: boolean;
}

/** 일정 타임테이블 VO */
export interface TimetableVO {
  timetableId: number;
  timeTableId?: number;
  date: string;
  timeTableStartTime: string;
  timeTableEndTime: string;
}

/** 타임테이블 장소 블록 VO */
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
  /**
   * 서버(TimetablePlaceBlockDetailDto)가 내려주는 좌표.
   * 아래 x/yLocation 계열은 WebSocket 페이로드 등 다른 경로의 표기라 함께 둔다.
   */
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

/** 일정 기본 프레임 정보 VO */
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

/** 일정 조회 전체 응답 */
export interface PlanResponse {
  message: string;
  planFrame: PlanFrameVO;
  placeBlocks: PlaceBlockVO[];
  timetables: TimetableVO[];
}

/** 일정 생성 요청 페이로드 */
export interface CreatePlanPayload {
  departure: string;
  travelId: number;
  dates: string[];
  adultCount: number;
  childCount: number;
  transportation: number;
}

/** 전체 일정 저장 페이로드 */
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
// 일정 관리 API
// ────────────────────────────────────────────────

/**
 * 일정 상세 데이터 조회 (기본 프레임 + 타임테이블 + 장소 블록)
 * @param planId 일정 ID
 */
export async function fetchPlan(planId: string): Promise<PlanResponse> {
  const response = await axios.get(resolveApiUrl(`/api/plan/${planId}`));
  return response.data;
}

/**
 * 신규 일정 생성
 * @param payload 일정 생성 데이터
 */
export async function createPlan(
  payload: CreatePlanPayload,
): Promise<{ planId: string }> {
  const response = await axios.post(resolveApiUrl(`/api/plan`), payload);
  return response.data;
}

/**
 * 전체 일정 생성 및 저장 (비로그인 저장 포함)
 * @param payload 전체 일정 데이터
 */
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
// 장소 추천 API
// ────────────────────────────────────────────────

/** PlaceSummaryDto 응답 객체를 PlaceVO 타입으로 변환하는 매핑 헬퍼 함수 */
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

/**
 * 카테고리별 추천 장소 목록 조회
 * @param destinationId 여행지 ID
 * @param category 장소 카테고리
 * @param page 페이지 번호
 * @param size 요청 개수
 */
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

/** 관광지 추천 목록 조회 */
export const fetchTourPlaces = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlaces(destinationId, 'tour', page, size);

/** 숙소 추천 목록 조회 */
export const fetchLodgingPlaces = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlaces(destinationId, 'lodging', page, size);

/** 음식점 추천 목록 조회 */
export const fetchRestaurantPlaces = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlaces(destinationId, 'restaurant', page, size);

/** 카테고리별 추천 장소 목록 조회 (비인증) */
export async function fetchCategoryPlacesNoAuth(
  categoryType: 'tour' | 'lodging' | 'restaurant',
  destinationId: number,
  page: number = 1,
  size: number = 20,
): Promise<PlacesResponse> {
  return fetchCategoryPlaces(destinationId, categoryType, page, size);
}

/** 관광지 추천 목록 조회 (비인증) */
export const fetchTourPlacesNoAuth = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlacesNoAuth('tour', destinationId, page, size);

/** 숙소 추천 목록 조회 (비인증) */
export const fetchLodgingPlacesNoAuth = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlacesNoAuth('lodging', destinationId, page, size);

/** 음식점 추천 목록 조회 (비인증) */
export const fetchRestaurantPlacesNoAuth = (destinationId: number, page: number = 1, size: number = 20) => fetchCategoryPlacesNoAuth('restaurant', destinationId, page, size);

// ────────────────────────────────────────────────
// 장소 검색 및 페이징 API
// ────────────────────────────────────────────────

/**
 * 일정 내 장소 검색
 * @param planId 일정 ID
 * @param query 검색어
 */
export async function searchPlaces(
  planId: string,
  query: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `/api/plan/${planId}/place/${encodeURIComponent(query)}`,
  );
  return response.data;
}

/**
 * 장소 검색 (비인증 / 일정 ID 미선택)
 * @param query 검색어
 */
export async function searchPlacesNoAuth(
  query: string,
): Promise<PlacesResponse> {
  const response = await axios.get(
    `/api/plan/place/${encodeURIComponent(query)}`,
  );
  return response.data;
}

/**
 * 다음 페이지 장소 목록 추가 조회
 * @param nextPageTokens 페이징 토큰 배열
 */
export async function fetchNextPlaces(
  nextPageTokens: string[],
): Promise<PlacesResponse> {
  const response = await axios.post(`/api/plan/nextplace`, {
    nextPageTokens,
  });
  return response.data;
}

// ────────────────────────────────────────────────
// 날씨 정보 API
// ────────────────────────────────────────────────

/** 일자별 날씨 요약 정보 */
export interface SimpleWeatherInfo {
  date: string;
  description: string;
  temp_min: number;
  temp_max: number;
  feels_like: number;
}

/** 날씨 정보 응답 객체 */
export interface WeatherResponse {
  weather: SimpleWeatherInfo[];
  recommendation: string;
}

/**
 * 도시 및 일자 범위 기반 날씨 추천 정보 조회
 * @param city 도시명
 * @param startDate 시작일
 * @param endDate 종료일
 */
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
// 공유 및 협업 API
// ────────────────────────────────────────────────

/** 일정 공유 상태 조회 */
export async function getShareStatus(planId: string): Promise<{ isShared: boolean }> {
  const response = await axios.get(resolveApiUrl(`/api/plan/${planId}/share`));
  return { isShared: !!response.data?.isShared };
}

/** 일정 공유 상태 변경 */
export async function updateShareStatus(planId: string, isShared: boolean): Promise<void> {
  await axios.patch(resolveApiUrl(`/api/plan/${planId}/share`), { isShared });
}

/** 일정 편집 권한 요청 */
export async function requestEditAccess(planId: string): Promise<{ collaborationRequestId: number }> {
  const response = await axios.post(resolveApiUrl(`/api/plan/${planId}/request-access`), {});
  return { collaborationRequestId: response.data?.collaborationRequestId };
}

/** 일정 공유 URL 조회 */
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
    shareUrl: `${WEB_URL}/create?id=${planId}`,
    isShared,
  };
}

/** 편집자 목록 조회 */
export async function getEditors(planId: string): Promise<{ userId: string; nickname: string }[]> {
  const response = await axios.get(resolveApiUrl(`/api/plan/${planId}/editors`));
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

/** 닉네임으로 편집자 초청 */
export async function inviteEditor(
  planId: string,
  nickname: string,
): Promise<void> {
  await axios.post(resolveApiUrl(`/api/plan/${planId}/invite`), {
    receiverNickname: nickname,
  });
}

/** 편집자 권한 해제 */
export async function removeEditor(
  planId: string,
  userId: string | number,
): Promise<void> {
  await axios.delete(resolveApiUrl(`/api/plan/${planId}/editors/${userId}`));
}

/** 편집자 나가기 */
export async function leaveAsEditor(planId: string): Promise<void> {
  await axios.delete(resolveApiUrl(`/api/plan/${planId}/editor/me`));
}

/** 대기 중인 초대 요청 인터페이스 */
export interface PendingInvitation {
  requestId: number;
  senderId: number;
  senderNickname: string;
  planId: string;
  planName: string;
  type: string;
}

/** 대기 중인 초대 목록 조회 */
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

/** 초대 승인 */
export async function acceptInvitation(requestId: number): Promise<void> {
  await axios.post(
    resolveApiUrl(`/api/collaboration-requests/${requestId}/accept`),
  );
}

/** 초대 거절 */
export async function rejectInvitation(requestId: number): Promise<void> {
  await axios.post(
    resolveApiUrl(`/api/collaboration-requests/${requestId}/reject`),
  );
}

// ────────────────────────────────────────────────
// 여행지 정보 API
// ────────────────────────────────────────────────

/** 여행지 정보 인터페이스 */
export interface TravelDestination {
  travelId: number;
  travelName: string;
  travelCategoryName: string;
}

/** 선택 가능한 여행지 목록 조회 */
export async function fetchTravelDestinations(): Promise<TravelDestination[]> {
  const response = await axios.get('/api/destination');
  return response.data;
}

// ────────────────────────────────────────────────
// 출발지 검색 API
// ────────────────────────────────────────────────

/** 출발지 검색 */
export async function searchDeparture(query: string): Promise<any[]> {
  const response = await axios.post(`/api/departure`, {
    departureQuery: query,
  });
  return response.data;
}

