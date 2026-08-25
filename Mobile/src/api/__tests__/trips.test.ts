import axios from 'axios';
import {
  fetchWeather,
  getEditors,
  getShareUrl,
  requestEditAccess,
  searchPlacesByKeyword,
} from '../trips';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('requestEditAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('플랜별 request-access 경로로 본문 없이 POST 한다', async () => {
    mockedAxios.post.mockResolvedValue({ data: { collaborationRequestId: 7 } });

    await expect(requestEditAccess('plan-1')).resolves.toBe(7);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post.mock.calls[0]).toHaveLength(1);
    expect(mockedAxios.post.mock.calls[0][0]).toMatch(
      /\/api\/plan\/plan-1\/request-access$/,
    );
  });
});

describe('searchPlacesByKeyword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('공백만 있는 검색어는 요청 없이 빈 배열을 반환한다', async () => {
    await expect(searchPlacesByKeyword('   ')).resolves.toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('검색어를 다듬어 키워드 검색 API를 호출하고 결과를 반환한다', async () => {
    const places = [{ id: '1', name: '카페 델문도', address: '', jibunAddress: '', phone: '', category: '', url: '', lat: 0, lng: 0 }];
    const controller = new AbortController();
    mockedAxios.get.mockResolvedValue({ data: { places } });

    await expect(
      searchPlacesByKeyword('  델문도  ', 5, controller.signal),
    ).resolves.toEqual(places);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/place/search', {
      params: { query: '델문도', size: 5 },
      signal: controller.signal,
    });
  });
});

describe('fetchWeather', () => {
  it('화면 수명주기의 취소 시그널을 전달한다', async () => {
    const controller = new AbortController();
    mockedAxios.get.mockResolvedValue({ data: { weather: [], recommendation: '' } });

    await fetchWeather(1, '2026-08-01', '2026-08-03', controller.signal);

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/weather', {
      params: {
        destinationId: 1,
        startDate: '2026-08-01',
        endDate: '2026-08-03',
      },
      signal: controller.signal,
    });
  });
});

describe('공유 정보 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('공유 상태와 편집자 조회에 취소 시그널을 전달한다', async () => {
    const controller = new AbortController();
    mockedAxios.get
      .mockResolvedValueOnce({ data: { isShared: true } })
      .mockResolvedValueOnce({ data: { editors: [] } });

    await getShareUrl('plan-1', controller.signal);
    await getEditors('plan-1', controller.signal);

    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/api\/plan\/plan-1\/share$/),
      { signal: controller.signal },
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/api\/plan\/plan-1\/editors$/),
      { signal: controller.signal },
    );
  });
});
