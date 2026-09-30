
export const TRAFFIC_TYPE = {
  SUBWAY: 1,
  BUS: 2,
  WALK: 3,
} as const;

export const PATH_TYPE = {
  SUBWAY: 1,
  BUS: 2,
  SUBWAY_BUS: 3,
} as const;

export const LANE_CLASS = {
  BUS: 1,
  SUBWAY: 2,
} as const;

export const BUS_TYPE_LABELS: Record<number, string> = {
  1: '일반',
  2: '좌석',
  3: '마을',
  4: '직행',
  5: '공항',
  6: '간선',
};

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

export const DEFAULT_SUBWAY_COLOR = '#3B82F6';

export const BUS_COLOR = '#33B540';

export const WALK_COLOR = '#D1D5DB';

export const stepColor = (trafficType: number | null, subwayCode: number | null): string | null => {
  if (trafficType === TRAFFIC_TYPE.BUS) return BUS_COLOR;
  if (trafficType === TRAFFIC_TYPE.SUBWAY) {
    return (subwayCode != null && SUBWAY_COLORS[subwayCode]) || DEFAULT_SUBWAY_COLOR;
  }
  return null;
};

export const laneColor = (trafficClass: number | null, type: number | null): string => {
  if (trafficClass === LANE_CLASS.BUS) return BUS_COLOR;
  return (type != null && SUBWAY_COLORS[type]) || DEFAULT_SUBWAY_COLOR;
};

// ODsay 일일 호출 한도를 넘기면 apiKeyAuthFailed가 돌아온다. 경로가 실제로 없는
// 경우와 구분해서 안내하기 위해 웹(planmate2.0)과 같은 문구·판정 기준을 쓴다.
export const TRANSIT_API_LIMIT_MESSAGE =
  '현재 대중교통 경로 조회 한도가 제한되어 있어요.\n이용 한도는 추후 확대될 예정입니다.';

export const TRANSIT_API_LIMIT_SUMMARY = '대중교통 조회 한도 초과';

export const isTransitApiLimitError = (value: unknown): boolean => {
  const target = value as Record<string, any> | null | undefined;
  const data = (target?.response?.data ?? target) as
    | Record<string, any>
    | null
    | undefined;
  return [
    target?.code,
    target?.message,
    data?.code,
    data?.message,
    data?.error,
    data?.error?.code,
    data?.error?.message,
  ].some(candidate =>
    String(candidate ?? '')
      .toLowerCase()
      .includes('apikeyauthfailed'),
  );
};
