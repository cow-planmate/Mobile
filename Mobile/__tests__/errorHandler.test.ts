import { parseBackendError, getBackendErrorMessage } from '../src/utils/errorHandler';
import { BACKEND_ERROR_MESSAGES } from '../src/types/error';

describe('errorHandler Utility', () => {
  it('should parse structured Backend-v2 error response correctly', () => {
    const mockAxiosError = {
      response: {
        data: {
          code: 'AUTH_003',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
      },
    };

    const parsed = parseBackendError(mockAxiosError);
    expect(parsed.code).toBe('AUTH_003');
    expect(parsed.message).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
  });

  it('should fallback to BACKEND_ERROR_MESSAGES when message is missing in error data', () => {
    const mockAxiosError = {
      response: {
        data: {
          code: 'PLAN_001',
        },
      },
    };

    const parsed = parseBackendError(mockAxiosError);
    expect(parsed.code).toBe('PLAN_001');
    expect(parsed.message).toBe(BACKEND_ERROR_MESSAGES.PLAN_001);
  });

  it('should return default COMMON_005 error for unexpected error format', () => {
    const mockError = new Error('Network Error');

    const parsed = parseBackendError(mockError);
    expect(parsed.code).toBe('COMMON_005');
    expect(parsed.message).toBe('Network Error');
  });

  it('should extract error message via getBackendErrorMessage helper', () => {
    const mockAxiosError = {
      response: {
        data: {
          code: 'COLLAB_002',
          message: '이미 플랜에 대한 접근 권한이 있는 사용자입니다.',
        },
      },
    };

    const message = getBackendErrorMessage(mockAxiosError);
    expect(message).toBe('이미 플랜에 대한 접근 권한이 있는 사용자입니다.');
  });
});
