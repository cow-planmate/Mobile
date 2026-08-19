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

    expect(parsed.message).toBe('서버 오류가 발생했습니다.');
  });

  it('본문이 JSON이 아니면 상태 코드로 한국어 메시지를 고른다', () => {
    const htmlErrorPage = {
      response: { status: 404, data: '<html>Not Found</html>' },
    };

    const parsed = parseBackendError(htmlErrorPage);
    expect(parsed.code).toBe('COMMON_004');
    expect(parsed.message).toBe(BACKEND_ERROR_MESSAGES.COMMON_004);
  });

  it('알 수 없는 상태 코드는 일반 서버 오류로 처리한다', () => {
    const badGateway = { response: { status: 502, data: '<html>502</html>' } };

    const parsed = parseBackendError(badGateway);
    expect(parsed.code).toBe('COMMON_005');
    expect(parsed.message).toBe(BACKEND_ERROR_MESSAGES.COMMON_005);
  });

  it('응답 자체가 없으면 연결 실패로 안내한다', () => {
    const parsed = parseBackendError({ response: undefined });
    expect(parsed.message).toBe('네트워크 연결을 확인해주세요.');
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
