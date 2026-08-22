import axios from 'axios';
import { requestEditAccess, searchPlacesByKeyword } from '../trips';

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
    mockedAxios.get.mockResolvedValue({ data: { places } });

    await expect(searchPlacesByKeyword('  델문도  ', 5)).resolves.toEqual(places);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/place/search', {
      params: { query: '델문도', size: 5 },
    });
  });
});
