import { AxiosError } from 'axios';
import { ApiErrorResponse, BACKEND_ERROR_MESSAGES } from '../types/error';

/**
 * 백엔드 응답 객체에서 에러 코드 및 메시지를 구조화하여 파싱합니다.
 *
 * @param error 예외 발생 객체
 * @returns 백엔드 규격 에러 코드 및 한국어 메시지
 */
export function parseBackendError(error: unknown): ApiErrorResponse {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const responseData = axiosError.response?.data;

    if (responseData && typeof responseData === 'object') {
      const code = responseData.code || 'COMMON_005';
      const message =
        responseData.message ||
        BACKEND_ERROR_MESSAGES[code] ||
        '서버 오류가 발생했습니다.';

      return { code, message };
    }
  }

  if (error instanceof Error) {
    return {
      code: 'COMMON_005',
      message: error.message || '서버 오류가 발생했습니다.',
    };
  }

  return {
    code: 'COMMON_005',
    message: '서버 오류가 발생했습니다.',
  };
}

/**
 * 사용자에게 표시할 한국어 에러 메시지를 반환합니다.
 *
 * @param error 예외 발생 객체
 * @returns 사용자 친화적 에러 메시지
 */
export function getBackendErrorMessage(error: unknown): string {
  const parsed = parseBackendError(error);
  return parsed.message;
}
