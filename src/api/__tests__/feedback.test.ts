import axios from 'axios';
import { submitFeedback } from '../feedback';

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

describe('submitFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('앞뒤 공백을 뗀 내용을 beta/feedback 경로로 POST 한다', async () => {
    mockedAxios.post.mockResolvedValue({ status: 201 });

    await submitFeedback('  앱이 느려요  ');

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/beta/feedback', {
      content: '앱이 느려요',
    });
  });

  it('서버가 거절하면 그대로 던진다', async () => {
    mockedAxios.post.mockRejectedValue(new Error('400'));

    await expect(submitFeedback('내용')).rejects.toThrow('400');
  });
});
