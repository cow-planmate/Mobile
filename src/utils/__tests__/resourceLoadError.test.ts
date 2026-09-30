import { getResourceLoadError } from '../errorHandler';

describe('resource load errors', () => {
  it.each([undefined, new Error('Network Error'), { response: { status: 503 } }])(
    'offers recovery for connection and server failures',
    error => {
      const failure = getResourceLoadError(error, '여행기');
      expect(failure.canRetry).toBe(true);
      expect(failure.message).not.toContain('찾을 수 없');
    },
  );

  it.each([
    [404, '찾을 수 없'],
    [403, '접근할 수 없'],
    [401, '로그인'],
  ])('does not offer a retry for HTTP %s', (status, message) => {
    const failure = getResourceLoadError({ response: { status } }, '게시글');
    expect(failure.canRetry).toBe(false);
    expect(failure.message).toContain(message);
  });

  it.each(['USER_001', 'USER_002', 'COMMON_004', 'COMMON_003'])('%s is terminal', code => {
    expect(getResourceLoadError({ response: { data: { code } } }, '프로필').canRetry).toBe(false);
  });
});
