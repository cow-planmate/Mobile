import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

/**
 * 길찾기(경로) API 클라이언트.
 *
 * Backend-v2 `RouteController`(`/api/route/*`)와 1:1로 대응한다.
 * 도로 경로/매트릭스는 OSRM, 대중교통은 ODsay를 백엔드가 대신 호출한다.
 *
 * 전 엔드포인트가 인증을 요구한다(비로그인 401). 토큰 주입과 만료 시 갱신은
 * `api/axiosConfig`의 인터셉터가 처리하므로 여기서는 신경 쓰지 않는다.
 */

// ────────────────────────────────────────────────
// 타입 정의 (백엔드 DTO와 1:1)
// ────────────────────────────────────────────────

/** 위경도 좌표 한 점 */
export interface RoutePoint {
  lat: number;
  lng: number;
}

/** 경유지 기반 도로 경로 응답 */
export interface RouteResponse {
  /** 경로 좌표 목록 (탐색 실패 시 입력 경유지가 그대로 온다) */
  path: RoutePoint[];
  /** 총 이동 거리(m) */
  distance: number;
  /** 총 소요 시간(초) */
  duration: number;
}

/** 이동 수단 프로필 */
export type RouteProfile = 'driving' | 'foot';

/** 방문 순서 최적화의 구간별 이동 정보 */
export interface RouteTripLeg {
  /** 구간 이동 거리(m) */
  distance: number;
  /** 구간 소요 시간(초) */
  duration: number;
}

/** 방문 순서 최적화 응답 */
export interface RouteTripResponse {
  /** 방문 순서대로 나열한 **입력 좌표의 인덱스** 목록 (예: [0, 2, 1, 3]) */
  visitOrder: number[];
  /** 총 이동 거리(m) */
  totalDistance: number;
  /** 총 소요 시간(초) */
  totalDuration: number;
  legs: RouteTripLeg[];
}

/** 좌표 쌍별 소요시간/거리 매트릭스 응답 */
export interface RouteTableResponse {
  /** NxN 소요 시간(초). 도달 불가 구간은 null */
  durations: (number | null)[][];
  /** NxN 이동 거리(m). 도달 불가 구간은 null */
  distances: (number | null)[][];
  profile: string;
}

/** 대중교통 구간의 경유 정류장 */
export interface TransitStop {
  stationName?: string | null;
  [key: string]: unknown;
}

/** 대중교통 경로의 구간별 상세 (노선/승하차 정류장 수준) */
export interface TransitStep {
  /** 이동 수단 (1=지하철, 2=버스, 3=도보) */
  trafficType: number | null;
  /** 구간 소요 시간(분) */
  sectionTime: number | null;
  /** 구간 이동 거리(m) */
  distance: number | null;
  /** 정거장/역 수 (도보는 null) */
  stationCount: number | null;
  /** 노선명 (버스=노선번호, 지하철=노선명, 도보=null) */
  laneName: string | null;
  /** 버스 종류 코드 (버스만) */
  busType: number | null;
  /** 지하철 노선 코드 (지하철만) */
  subwayCode: number | null;
  startName: string | null;
  endName: string | null;
  wayName: string | null;
  startExitNo: string | null;
  endExitNo: string | null;
  /** 배차 간격(분) */
  intervalTime: number | null;
  startArsID: string | null;
  endArsID: string | null;
  passStops: TransitStop[];
}

/** 대중교통 경로 옵션 하나 */
export interface TransitRouteOption {
  /** 경로 유형 (1=지하철, 2=버스, 3=버스+지하철) */
  pathType: number | null;
  /** 총 소요 시간(분) */
  totalTime: number | null;
  /** 요금(원) */
  payment: number | null;
  /** 도보 총거리(m) */
  totalWalk: number | null;
  totalDistance: number | null;
  busTransitCount: number | null;
  subwayTransitCount: number | null;
  firstStartStation: string | null;
  lastEndStation: string | null;
  steps: TransitStep[];
  /** 이 경로의 지도 폴리라인 조회용 키 */
  mapObj: string | null;
}

/** 두 지점 간 대중교통 경로 응답 */
export interface TransitRouteResponse {
  available: boolean;
  /** 조회 불가 사유 (성공 시 null) */
  message: string | null;
  /** 최적경로순 경로 목록 (최대 10건) */
  routes: TransitRouteOption[];
  busCount: number | null;
  subwayCount: number | null;
  subwayBusCount: number | null;
}

/** 대중교통 경로의 지도 폴리라인 한 구간(노선) */
export interface TransitLane {
  /** 교통수단 종류 (1=버스, 2=지하철) */
  trafficClass: number | null;
  /** 노선 종류 코드 (버스=busType, 지하철=subwayCode) */
  type: number | null;
  path: RoutePoint[];
}

/** 대중교통 폴리라인 응답 */
export interface TransitLaneResponse {
  lanes: TransitLane[];
}

// ────────────────────────────────────────────────
// API 호출
// ────────────────────────────────────────────────

/**
 * 경유지 목록을 순서대로 잇는 실제 도로 경로를 조회합니다.
 *
 * 백엔드는 경로 탐색에 실패해도 200과 함께 입력 좌표를 그대로 돌려주므로,
 * 호출부는 `isRouteFallback`으로 실패 여부를 판별해야 합니다.
 */
export async function fetchDirections(
  waypoints: RoutePoint[],
): Promise<RouteResponse> {
  const response = await axios.post(resolveApiUrl('/api/route/directions'), {
    waypoints,
  });
  return response.data;
}

/**
 * 경로 탐색 실패로 인한 폴백 응답인지 판별합니다.
 *
 * 백엔드가 OSRM 실패 시 입력 경유지를 거리/시간 0으로 되돌려주는 규약에 기댑니다.
 * 폴백이면 지도에 직선으로 그려야 합니다.
 */
export function isRouteFallback(result: RouteResponse | undefined): boolean {
  if (!result || !result.path || result.path.length === 0) {
    return true;
  }
  return result.distance === 0 && result.duration === 0;
}

/**
 * 좌표 목록의 모든 쌍에 대한 소요시간/거리 매트릭스를 조회합니다.
 * @param profile 이동 수단 (기본 driving)
 */
export async function fetchRouteTable(
  waypoints: RoutePoint[],
  profile: RouteProfile = 'driving',
): Promise<RouteTableResponse> {
  const response = await axios.post(resolveApiUrl('/api/route/table'), {
    waypoints,
    profile,
  });
  return response.data;
}

/**
 * 방문 순서를 최적화합니다.
 *
 * 서버는 첫 좌표를 출발지로 고정하고 나머지의 최적 순서를 계산해
 * **입력 배열 기준 인덱스 목록**(visitOrder)을 돌려준다. 좌표 자체를 재정렬해
 * 주는 것이 아니므로 호출부가 인덱스로 원본을 재배치해야 한다.
 *
 * @param waypoints 방문할 좌표 목록 (첫 좌표 = 출발지)
 * @param profile 이동 수단 (기본 driving)
 * @param roundtrip 출발지로 되돌아오는 왕복 여부
 */
export async function fetchRouteTrip(
  waypoints: RoutePoint[],
  profile: RouteProfile = 'driving',
  roundtrip: boolean = false,
): Promise<RouteTripResponse> {
  const response = await axios.post(resolveApiUrl('/api/route/trip'), {
    waypoints,
    profile,
    roundtrip,
  });
  return response.data;
}

/**
 * 두 지점 간 대중교통 경로를 조회합니다.
 *
 * ODsay 호출량 제한이 있으므로 사용자가 실제로 요청한 시점에만 호출해야 합니다.
 */
export async function fetchTransit(
  from: RoutePoint,
  to: RoutePoint,
): Promise<TransitRouteResponse> {
  const response = await axios.post(resolveApiUrl('/api/route/transit'), {
    from,
    to,
  });
  return response.data;
}

/**
 * 선택한 대중교통 경로(mapObj)의 지도 폴리라인을 조회합니다.
 */
export async function fetchTransitLane(
  mapObj: string,
): Promise<TransitLaneResponse> {
  const response = await axios.post(resolveApiUrl('/api/route/transit/lane'), {
    mapObj,
  });
  return response.data;
}
