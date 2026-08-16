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
import { allSettledWithConcurrency } from '../../../utils/concurrency';

const SEGMENT_REQUEST_CONCURRENCY = 4;

export const pointsKey = (points: RoutePoint[]): string =>
  points.map(p => `${p.lat},${p.lng}`).join('|');

export interface SegmentInfo {
  driving: RouteTableResponse | null;
  foot: RouteTableResponse | null;

  transit: (TransitRouteResponse | null)[];
}

export function useDirections(points: RoutePoint[]) {
  const key = pointsKey(points);

  return useQuery<RouteResponse>({
    queryKey: ['route', 'directions', key],
    queryFn: ({ signal }) => fetchDirections(points, signal),
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
