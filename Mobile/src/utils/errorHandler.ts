import { AxiosError } from 'axios';
import { ApiErrorResponse, BACKEND_ERROR_MESSAGES } from '../types/error';

/**
 * Extracts structured error information from backend response
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
 * Gets human-readable error message matching Backend-v2 specifications
 */
export function getBackendErrorMessage(error: unknown): string {
  const parsed = parseBackendError(error);
  return parsed.message;
}
