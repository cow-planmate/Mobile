import {
  parseBackendError,
  getBackendErrorMessage,
  getDisplayErrorMessage,
} from '../src/utils/errorHandler';
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

  describe('getDisplayErrorMessage', () => {
    it('should use the server message when the response body exists', () => {
      const mockAxiosError = {
        response: {
          data: { code: 'AUTH_004', message: '이미 가입된 이메일입니다.' },
        },
      };

      expect(getDisplayErrorMessage(mockAxiosError, '대체 문구')).toBe(
        '이미 가입된 이메일입니다.',
      );
    });

    it('should not leak an internal Error message to the screen', () => {
      // 401을 만나면 인터셉터가 토큰 재발급을 시도하다 이 오류를 대신 던진다.
      const interceptorError = new Error(
        'No refresh token found or token creation failed',
      );

      expect(
        getDisplayErrorMessage(interceptorError, '인증번호가 올바르지 않아요.'),
      ).toBe('인증번호가 올바르지 않아요.');
    });

    it('should fall back when the response has no parseable body', () => {
      const networkError = { response: undefined };

      expect(getDisplayErrorMessage(networkError, '대체 문구')).toBe('대체 문구');
    });
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
