/**
 * 대중교통 표기 상수.
 *
 * 지도 폴리라인(KakaoMapView)과 구간 정보 시트(RouteSegmentSheet)가 같은 색을
 * 써야 하므로 한곳에 모아둔다. 값은 ODsay 응답 코드 체계를 따른다.
 */

/** 이동 수단 코드 (ODsay trafficType) */
export const TRAFFIC_TYPE = {
  SUBWAY: 1,
  BUS: 2,
  WALK: 3,
} as const;

/** 경로 유형 코드 (ODsay pathType) */
export const PATH_TYPE = {
  SUBWAY: 1,
  BUS: 2,
  SUBWAY_BUS: 3,
} as const;

/** 폴리라인 교통수단 코드 (ODsay lane class) */
export const LANE_CLASS = {
  BUS: 1,
  SUBWAY: 2,
} as const;

/** 버스 종류 코드 → 표기 라벨 (알 수 없으면 undefined) */
export const BUS_TYPE_LABELS: Record<number, string> = {
  1: '일반',
  2: '좌석',
  3: '마을',
  4: '직행',
  5: '공항',
  6: '간선',
};

/** 지하철 노선 코드 → 노선색 */
export const SUBWAY_COLORS: Record<number, string> = {
  1: '#0052A4',
  2: '#00A84D',
  3: '#EF7C1C',
  4: '#00A5DE',
  5: '#996CAC',
  6: '#CD7C2F',
  7: '#747F00',
  8: '#E6186C',
  9: '#BDB092',
};

/** 노선 코드를 모를 때 쓰는 지하철 기본색 */
export const DEFAULT_SUBWAY_COLOR = '#3B82F6';

/** 버스 노선색 */
export const BUS_COLOR = '#33B540';

/** 도보 구간색 */
export const WALK_COLOR = '#D1D5DB';

/** 구간(step)의 표시색. 도보는 null을 반환한다. */
export const stepColor = (trafficType: number | null, subwayCode: number | null): string | null => {
  if (trafficType === TRAFFIC_TYPE.BUS) return BUS_COLOR;
  if (trafficType === TRAFFIC_TYPE.SUBWAY) {
    return (subwayCode != null && SUBWAY_COLORS[subwayCode]) || DEFAULT_SUBWAY_COLOR;
  }
  return null;
};

/** 폴리라인 한 구간(lane)의 표시색 */
export const laneColor = (trafficClass: number | null, type: number | null): string => {
  if (trafficClass === LANE_CLASS.BUS) return BUS_COLOR;
  return (type != null && SUBWAY_COLORS[type]) || DEFAULT_SUBWAY_COLOR;
};
