import axios from 'axios';
import {
  fetchFeedRegionCounts,
  fetchHotPosts,
  fetchLikedPosts,
  fetchMyComments,
  fetchMyPosts,
  fetchMyStats,
} from '../communityApi';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('communityApi 조회 취소', () => {
  it('지역·인기글·내 활동 조회에 취소 신호를 전달한다', async () => {
    const controller = new AbortController();
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: { items: [] } })
      .mockResolvedValueOnce({ data: { items: [] } })
      .mockResolvedValueOnce({ data: { items: [] } });

    await fetchFeedRegionCounts(controller.signal);
    await fetchHotPosts('free', controller.signal);
    await fetchMyStats(controller.signal);
    await fetchMyPosts(0, 20, 'free', controller.signal);
    await fetchLikedPosts(0, 20, 'free', controller.signal);
    await fetchMyComments(0, 20, controller.signal);

    expect(mockedAxios.get).toHaveBeenCalledTimes(6);
    mockedAxios.get.mock.calls.forEach(([, config]) => {
      expect(config).toEqual(expect.objectContaining({ signal: controller.signal }));
    });
  });
});
