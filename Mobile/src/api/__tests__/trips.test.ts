import axios from 'axios';
import { requestEditAccess } from '../trips';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
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
