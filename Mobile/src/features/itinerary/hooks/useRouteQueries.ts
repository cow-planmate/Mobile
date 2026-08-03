import { useQuery } from '@tanstack/react-query';
import {
  fetchDirections,
  fetchRouteTable,
  fetchTransit,
  fetchTransitLane,
  RoutePoint,
  RouteResponse,
  RouteTableResponse,
  TransitLaneResponse,
  TransitRouteResponse,
} from '../../../api/route';

/**
 * 길찾기 관련 React Query 훅.
 *
 * 좌표 배열은 렌더마다 새 배열로 만들어지므로 queryKey에 그대로 넣으면 매번
 * 다른 키가 된다. 좌표를 문자열로 직렬화한 `pointsKey`를 키로 쓴다.
 */

/** 좌표 목록을 캐시 키로 쓸 수 있는 문자열로 직렬화한다. */
export const pointsKey = (points: RoutePoint[]): string =>
  points.map(p => `${p.lat},${p.lng}`).join('|');

/** 구간 정보 조회 결과 (차량/도보 매트릭스 + 구간별 대중교통) */
export interface SegmentInfo {
  driving: RouteTableResponse | null;
  foot: RouteTableResponse | null;
  /** 연속한 두 장소 사이 구간별 대중교통 경로. 인덱스 i = i번째 → i+1번째 */
  transit: (TransitRouteResponse | null)[];
}

/**
 * 지도에 그릴 도로 경로를 조회합니다.
 *
 * 좌표가 2개 미만이면 호출하지 않습니다. 경로 탐색 실패 시 백엔드가 입력 좌표를
 * 그대로 돌려주므로, 호출부는 `isRouteFallback`으로 판별해 직선으로 대체합니다.
 */
export function useDirections(points: RoutePoint[]) {
  const key = pointsKey(points);

  return useQuery<RouteResponse>({
    queryKey: ['route', 'directions', key],
    queryFn: () => fetchDirections(points),
    enabled: points.length >= 2,
    // 좌표가 같으면 경로도 같다. 재조회할 이유가 없어 길게 잡는다.
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

/**
 * 구간 정보(차량/도보/대중교통)를 한 번에 조회합니다.
 *
 * ODsay는 호출량 제한이 빡빡하므로 사용자가 구간 정보를 실제로 열었을 때만
 * (`enabled`) 호출하고, 같은 좌표 조합은 오래 캐시해 재조회하지 않습니다.
 * 실패해도 재시도하지 않습니다 — 재시도는 쿼터만 갉아먹습니다.
 *
 * 일부 요청이 실패해도 나머지 결과는 살려야 하므로 `allSettled`로 모읍니다.
 */
export function useSegmentInfo(points: RoutePoint[], enabled: boolean) {
  const key = pointsKey(points);

  return useQuery<SegmentInfo>({
    queryKey: ['route', 'segmentInfo', key],
    queryFn: async () => {
      const pairs = points.slice(0, -1).map((from, i) => ({
        from,
        to: points[i + 1],
      }));

      const results = await Promise.allSettled([
        fetchRouteTable(points, 'driving'),
        fetchRouteTable(points, 'foot'),
        ...pairs.map(({ from, to }) => fetchTransit(from, to)),
      ]);

      const [drivingResult, footResult, ...transitResults] = results;

      return {
        driving:
          drivingResult.status === 'fulfilled'
            ? (drivingResult.value as RouteTableResponse)
            : null,
        foot:
          footResult.status === 'fulfilled'
            ? (footResult.value as RouteTableResponse)
            : null,
        transit: transitResults.map(result =>
          result.status === 'fulfilled'
            ? (result.value as TransitRouteResponse)
            : null,
        ),
      };
    },
    enabled: enabled && points.length >= 2,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}

/**
 * 선택한 대중교통 경로의 지도 폴리라인을 조회합니다.
 * `mapObj`가 null이면 호출하지 않습니다(= 지도에서 숨긴 상태).
 */
export function useTransitLane(mapObj: string | null) {
  return useQuery<TransitLaneResponse>({
    queryKey: ['route', 'transitLane', mapObj],
    queryFn: () => fetchTransitLane(mapObj as string),
    enabled: !!mapObj,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}
