import { useSegmentInfo } from '../useRouteQueries';
import { fetchRouteTable, fetchTransit } from '../../../../api/route';

jest.mock('@tanstack/react-query', () => ({ useQuery: (options: unknown) => options }));
jest.mock('../../../../api/route', () => ({ fetchRouteTable: jest.fn(), fetchTransit: jest.fn() }));

const points = [{ lat: 37, lng: 127 }, { lat: 38, lng: 128 }];
const options = () => useSegmentInfo(points, true) as unknown as {
  queryFn: (context: { signal: AbortSignal }) => Promise<any>;
  staleTime: (query: any) => number;
};
const load = () => options().queryFn({ signal: new AbortController().signal });

beforeEach(() => jest.resetAllMocks());

it('전체 통신 실패를 정상적인 정보 없음으로 반환하지 않는다', async () => {
  const error = new Error('offline');
  (fetchRouteTable as jest.Mock).mockRejectedValue(error);
  (fetchTransit as jest.Mock).mockRejectedValue(error);
  await expect(load()).rejects.toBe(error);
});

it('일부 실패 시 정상 경로를 유지하고 실패한 수단만 표시한다', async () => {
  const driving = { profile: 'driving', durations: [[0, 60]], distances: [[0, 100]] };
  (fetchRouteTable as jest.Mock).mockResolvedValueOnce(driving).mockRejectedValueOnce(new Error('offline'));
  (fetchTransit as jest.Mock).mockResolvedValue({ available: true, routes: [] });
  const data = await load();
  expect(data.driving).toEqual(driving);
  expect(data.failures).toEqual({ driving: false, foot: true, transit: [false] });
  expect(options().staleTime({ state: { data } })).toBe(0);
});

it('서버가 응답한 경로 없음 메시지는 보존하고 재조회 가능하게 한다', async () => {
  (fetchRouteTable as jest.Mock).mockResolvedValue({ durations: [], distances: [] });
  (fetchTransit as jest.Mock).mockResolvedValue({ available: false, message: '경로가 없습니다', routes: [] });
  const data = await load();
  expect(data.failures).toBeUndefined();
  expect(data.transit[0].message).toBe('경로가 없습니다');
  expect(options().staleTime({ state: { data } })).toBe(0);
});
