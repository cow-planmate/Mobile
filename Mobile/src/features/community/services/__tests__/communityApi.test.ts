import axios from 'axios';
import {
  fetchFeedRegionCounts,
  fetchHotPosts,
  fetchLikedPosts,
  fetchMyComments,
  fetchMyPosts,
  fetchMyStats,
  deleteCommunityImage,
  uploadCommunityImage,
} from '../communityApi';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
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

describe('communityApi 이미지', () => {
  it('선택한 이미지를 multipart로 업로드하고 URL을 반환한다', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { url: 'https://cdn.example.com/feed.jpg' },
    });

    const url = await uploadCommunityImage({
      uri: 'file:///feed.jpg',
      type: 'image/jpeg',
      name: 'feed.jpg',
    });

    expect(url).toBe('https://cdn.example.com/feed.jpg');
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/community/images'),
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });

  it('업로드된 이미지를 URL로 삭제한다', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});

    await deleteCommunityImage('https://cdn.example.com/feed.jpg');

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining(
        '/api/community/images?url=https%3A%2F%2Fcdn.example.com%2Ffeed.jpg',
      ),
    );
  });
});
