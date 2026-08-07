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

/**
 * 화면에 그대로 띄워도 되는 문구만 골라 돌려줍니다.
 *
 * 401이 오면 axios 인터셉터가 토큰 재발급을 먼저 시도하는데, 로그인 전에는
 * 재발급할 토큰이 없어 'No refresh token found or token creation failed' 같은
 * 내부 영문 오류가 원래 응답 대신 올라옵니다. parseBackendError는 Error의
 * message를 그대로 통과시키므로 이 문구가 사용자 화면까지 나갑니다.
 *
 * 서버가 실제로 응답 본문을 내려준 경우에만 그 문구를 쓰고, 그렇지 않으면
 * 화면이 정해 둔 문구를 씁니다.
 *
 * @param error 예외 발생 객체
 * @param fallback 서버 문구를 쓸 수 없을 때 보여줄 문구
 */
export function getDisplayErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as AxiosError<ApiErrorResponse>).response?.data;
    if (data && typeof data === 'object') {
      return parseBackendError(error).message || fallback;
    }
  }
  return fallback;
}
