import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

export interface RoutePoint {
  lat: number;
  lng: number;
  placeId?: string;
}

export interface RouteResponse {

  path: RoutePoint[];

  distance: number;

  duration: number;
}

export type RouteProfile = 'driving' | 'foot';

export interface RouteTripLeg {

  distance: number;

  duration: number;
}

export interface RouteTripResponse {

  visitOrder: number[];

  totalDistance: number;

  totalDuration: number;
  legs: RouteTripLeg[];
}

export interface RouteTableResponse {

  durations: (number | null)[][];

  distances: (number | null)[][];
  profile: string;
}

export interface TransitStop {

  index: number | null;
  stationName: string | null;

  x: number | null;

  y: number | null;

  arsID: string | null;
}

export interface TransitStep {

  trafficType: number | null;

  sectionTime: number | null;

  distance: number | null;

  stationCount: number | null;

  laneName: string | null;

  busType: number | null;

  subwayCode: number | null;
  startName: string | null;
  endName: string | null;
  wayName: string | null;
  startExitNo: string | null;
  endExitNo: string | null;

  intervalTime: number | null;
  startArsID: string | null;
  endArsID: string | null;
  passStops: TransitStop[];
}

export interface TransitRouteOption {

  pathType: number | null;

  totalTime: number | null;

  payment: number | null;

  totalWalk: number | null;
  totalDistance: number | null;
  busTransitCount: number | null;
  subwayTransitCount: number | null;
  firstStartStation: string | null;
  lastEndStation: string | null;
  steps: TransitStep[];

  mapObj: string | null;
}

export interface TransitRouteResponse {
  available: boolean;

  message: string | null;

  routes: TransitRouteOption[];
  busCount: number | null;
  subwayCount: number | null;
  subwayBusCount: number | null;
}

export interface TransitLane {

  trafficClass: number | null;

  type: number | null;
  path: RoutePoint[];
}

export interface TransitLaneResponse {
  lanes: TransitLane[];
}

export async function fetchDirections(
  waypoints: RoutePoint[],
  signal?: AbortSignal,
): Promise<RouteResponse> {
  const response = await axios.post(
    resolveApiUrl('/api/route/directions'),
    { waypoints },
    { signal },
  );
  return response.data;
}

export function isRouteFallback(result: RouteResponse | undefined): boolean {
  if (!result || !result.path || result.path.length === 0) {
    return true;
  }
  return result.distance === 0 && result.duration === 0;
}

export async function fetchRouteTable(
  waypoints: RoutePoint[],
  profile: RouteProfile = 'driving',
  signal?: AbortSignal,
): Promise<RouteTableResponse> {
  const response = await axios.post(
    resolveApiUrl('/api/route/table'),
    { waypoints, profile },
    { signal },
  );
  return response.data;
}

export async function fetchRouteTrip(
  waypoints: RoutePoint[],
  profile: RouteProfile = 'driving',
  roundtrip: boolean = false,
  signal?: AbortSignal,
): Promise<RouteTripResponse> {
  const response = await axios.post(
    resolveApiUrl('/api/route/trip'),
    { waypoints, profile, roundtrip },
    { signal },
  );
  return response.data;
}

export async function fetchTransit(
  from: RoutePoint,
  to: RoutePoint,
  signal?: AbortSignal,
): Promise<TransitRouteResponse> {
  const response = await axios.post(
    resolveApiUrl('/api/route/transit'),
    { from, to },
    { signal },
  );
  return response.data;
}

export async function fetchTransitLane(
  mapObj: string,
  signal?: AbortSignal,
): Promise<TransitLaneResponse> {
  const response = await axios.post(
    resolveApiUrl('/api/route/transit/lane'),
    { mapObj },
    { signal },
  );
  return response.data;
}
