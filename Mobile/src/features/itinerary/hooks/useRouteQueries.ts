import { useQuery } from '@tanstack/react-query';
import {
  fetchDirections,
  fetchRouteTable,
  fetchTransit,
  fetchTransitLane,
  RoutePoint,
  RouteProfile,
  RouteResponse,
  RouteTableResponse,
  TransitLaneResponse,
  TransitRouteResponse,
} from '../../../api/route';
import { allSettledWithConcurrency } from '../../../utils/concurrency';
import {
  isTransitApiLimitError,
  TRANSIT_API_LIMIT_MESSAGE,
} from '../constants/transit';

const SEGMENT_REQUEST_CONCURRENCY = 4;

export const pointsKey = (points: RoutePoint[]): string =>
  points.map(p => `${p.lat},${p.lng}`).join('|');

export interface SegmentInfo {
  driving: RouteTableResponse | null;
  foot: RouteTableResponse | null;

  transit: (TransitRouteResponse | null)[];
  failures?: { driving: boolean; foot: boolean; transit: boolean[] };
}

export function useDirections(
  points: RoutePoint[],
  profile: RouteProfile = 'driving',
) {
  const key = pointsKey(points);

  return useQuery<RouteResponse>({
    queryKey: ['route', 'directions', key, profile],
    queryFn: ({ signal }) => fetchDirections(points, profile, signal),
    enabled: points.length >= 2,

    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

export function useSegmentInfo(points: RoutePoint[], enabled: boolean) {
  const key = pointsKey(points);

  return useQuery<SegmentInfo>({
    queryKey: ['route', 'segmentInfo', key],
    queryFn: async ({ signal }) => {
      const pairs = points.slice(0, -1).map((from, i) => ({
        from,
        to: points[i + 1],
      }));

      const tasks: Array<() => Promise<unknown>> = [
        () => fetchRouteTable(points, 'driving', signal),
        () => fetchRouteTable(points, 'foot', signal),
        ...pairs.map(
          ({ from, to }) =>
            () =>
              fetchTransit(from, to, signal),
        ),
      ];

      const results = await allSettledWithConcurrency(
        tasks,
        SEGMENT_REQUEST_CONCURRENCY,
      );

      const [drivingResult, footResult, ...transitResults] = results;
      if (results.every(result => result.status === 'rejected')) {
        throw (results[0] as PromiseRejectedResult).reason;
      }
      // 호출 한도 초과는 조회 실패가 아니라 안내 문구로 보여주므로 실패에서 제외한다.
      const transitLimited = transitResults.map(
        result =>
          result.status === 'rejected' &&
          isTransitApiLimitError((result as PromiseRejectedResult).reason),
      );
      const transitFailures = transitResults.map(
        (result, i) => result.status === 'rejected' && !transitLimited[i],
      );
      const hasFailure =
        drivingResult.status === 'rejected' ||
        footResult.status === 'rejected' ||
        transitFailures.some(Boolean);

      return {
        failures: hasFailure ? {
          driving: drivingResult.status === 'rejected',
          foot: footResult.status === 'rejected',
          transit: transitFailures,
        } : undefined,
        driving:
          drivingResult.status === 'fulfilled'
            ? (drivingResult.value as RouteTableResponse)
            : null,
        foot:
          footResult.status === 'fulfilled'
            ? (footResult.value as RouteTableResponse)
            : null,
        transit: transitResults.map((result, i) => {
          if (result.status === 'fulfilled') {
            return result.value as TransitRouteResponse;
          }
          return transitLimited[i]
            ? {
                available: false,
                message: TRANSIT_API_LIMIT_MESSAGE,
                routes: [],
                busCount: null,
                subwayCount: null,
                subwayBusCount: null,
              }
            : null;
        }),
      };
    },
    enabled: enabled && points.length >= 2,
    staleTime: query => query.state.data?.failures || query.state.data?.transit.some(route => route && !route.available)
      ? 0 : 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}

export function useTransitLane(mapObj: string | null) {
  return useQuery<TransitLaneResponse>({
    queryKey: ['route', 'transitLane', mapObj],
    queryFn: ({ signal }) => fetchTransitLane(mapObj as string, signal),
    enabled: !!mapObj,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}
