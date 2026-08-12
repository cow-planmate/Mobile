import axios from 'axios';
import { WEB_URL } from '@env';
import { resolveApiUrl } from '../utils/apiUrl';
import {
  CollaborationRequestType,
  normalizeCollaborationRequestType,
} from '../utils/collaborationRequest';

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

/** 장소 목록 조회 응답 (GET /api/place는 page/size 기반 페이징만 지원한다) */
export interface PlacesResponse {
  places: PlaceVO[];
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

/** 일정 기본 프레임 정보 VO. 서버 PlanFrameDetailDto와 1:1로 맞춘다. */
export interface PlanFrameVO {
  planId: string;
  planName: string;
  destinationId: number;
  destinationName: string;
  adultCount: number;
  childCount: number;
}

/**
 * 전체 일정 저장 페이로드.
 *
 * planFrame은 서버 PlanFrameDto와 같은 네 필드뿐이다. 일정 이름은 생성 시
 * 목적지명으로 정해지므로 여기서 보낼 수 없고, 필요하면 PATCH /name으로 바꾼다.
 */
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

// ────────────────────────────────────────────────
// 일정 관리 API
// ────────────────────────────────────────────────

/**
 * 전체 일정 생성 및 저장
 * @param payload 전체 일정 데이터
 */
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

/**
 * 비인증용 별칭.
 *
 * GET /api/place는 인증을 선택으로 받으므로(@AuthenticationPrincipal
 * errorOnInvalidType = false) 요청이 인증 여부와 상관없이 같다. 호출부 이름만
 * 남겨 두고 실제 동작은 위 함수들과 동일하다.
 */
export const fetchTourPlacesNoAuth = fetchTourPlaces;
export const fetchLodgingPlacesNoAuth = fetchLodgingPlaces;
export const fetchRestaurantPlacesNoAuth = fetchRestaurantPlaces;

// ────────────────────────────────────────────────
// 날씨 정보 API
// ────────────────────────────────────────────────

/**
 * 날씨 데이터의 출처.
 *
 * 여행일이 예보 범위(오늘+15일)를 넘으면 서버가 작년 같은 기간의 실측치로,
 * 외부 API 호출 자체가 실패하면 계절 평균으로 대체한다. 둘 다 예보가 아니므로
 * 예보처럼 보여주면 안 된다.
 */
export type WeatherDataSource =
  | 'FORECAST'
  | 'LAST_YEAR_ACTUAL'
  | 'SEASONAL_AVERAGE';

/**
 * 일자별 날씨 요약 정보.
 * 서버 WeatherDayDto와 필드명을 맞춘다(camelCase).
 */
export interface SimpleWeatherInfo {
  /** 'YYYY-MM-DD' */
  date: string;
  description: string;
  tempMin: number;
  tempMax: number;
  feelsLike: number;
  /** 서버는 항상 채워 보낸다. 구버전 응답 대비로만 optional. */
  dataSource?: WeatherDataSource;
}

/** 날씨 정보 응답 객체 */
export interface WeatherResponse {
  weather: SimpleWeatherInfo[];
  recommendation: string;
}

/**
 * 여행지·기간 기반 날씨 조회.
 *
 * 서버는 GET /api/weather에 destinationId·startDate·endDate를 쿼리로 받는다.
 * (예전에는 도시명을 POST로 보냈는데 그 경로는 존재하지 않아 항상 실패했다)
 *
 * @param destinationId 여행지 ID (planFrame.destinationId)
 * @param startDate 'YYYY-MM-DD'
 * @param endDate 'YYYY-MM-DD'
 */
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

// ────────────────────────────────────────────────
// 공유 및 협업 API
// ────────────────────────────────────────────────

/** 서버 EditPlanNameRequest의 @Size(max = 100) */
export const PLAN_NAME_MAX_LENGTH = 100;

/** 일정 공유 상태 조회 */
export async function getShareStatus(planId: string): Promise<{ isShared: boolean }> {
  const response = await axios.get(resolveApiUrl(`/api/plan/${planId}/share`));
  return { isShared: !!response.data?.isShared };
}

/** 일정 공유 상태 변경 */
export async function updateShareStatus(planId: string, isShared: boolean): Promise<void> {
  await axios.patch(resolveApiUrl(`/api/plan/${planId}/share`), { isShared });
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

/** 편집자 목록 항목 (서버 EditorDto) */
interface EditorDto {
  userId: string;
  nickname: string;
}

/** 편집자 목록 조회 */
export async function getEditors(planId: string): Promise<EditorDto[]> {
  const response = await axios.get<{ editors?: EditorDto[] }>(
    resolveApiUrl(`/api/plan/${planId}/editors`),
  );
  return (response.data?.editors ?? []).map(editor => ({
    userId: String(editor?.userId ?? ''),
    nickname: String(editor?.nickname ?? ''),
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

/**
 * 여러 일정을 한 번에 삭제한다.
 *
 * 서버는 요청한 ID 중 **내가 소유한** 일정만 삭제하고 실제 삭제된 ID를 돌려준다.
 * 소유한 일정이 하나도 없으면 403을 던지므로, 소유 일정이 없을 때는 호출하지 않는다.
 * 편집 권한만 있는 일정은 이 API 대상이 아니라 leaveAsEditor를 써야 한다.
 *
 * @returns 실제로 삭제된 일정 ID 목록
 */
export async function deletePlans(planIds: string[]): Promise<string[]> {
  const response = await axios.delete<{ deletedPlanIds: string[] }>(
    resolveApiUrl('/api/plan'),
    { data: { planIds } },
  );
  return response.data?.deletedPlanIds ?? [];
}

/** 편집자 나가기 */
export async function leaveAsEditor(planId: string): Promise<void> {
  await axios.delete(resolveApiUrl(`/api/plan/${planId}/editor/me`));
}

/**
 * 대기 중인 협업 요청.
 *
 * type이 INVITE면 내가 남의 일정에 초대받은 것이고, REQUEST면 내 일정의
 * 편집 권한을 요청받은 것이라 수락/거절의 의미가 반대다.
 */
export interface PendingInvitation {
  requestId: number;
  /** 서버 senderId는 UUID 문자열이다(PendingRequestDto). */
  senderId: string;
  senderNickname: string;
  planId: string;
  planName: string;
  type: CollaborationRequestType;
}

/** 대기 중인 초대 목록 조회 */
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



