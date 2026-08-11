import axios from 'axios';
import {
  FEEDBACK_EMPTY_MESSAGE,
  submitFeedback,
} from '../src/api/feedback';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('feedback API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends trimmed content to the beta feedback endpoint', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: undefined });

    await submitFeedback('  앱이 좋아요.  ');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/beta/feedback'),
      { content: '앱이 좋아요.' },
    );
  });

  it('does not send a blank feedback request', async () => {
    await expect(submitFeedback(' \n\t ')).rejects.toThrow(
      FEEDBACK_EMPTY_MESSAGE,
    );

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});
