import { AxiosError } from 'axios';
import { ApiErrorResponse, BACKEND_ERROR_MESSAGES } from '../types/error';

// 프록시·게이트웨이가 JSON 대신 HTML이나 빈 본문을 내려주는 경우가 있어,
// 그때 axios의 영문 메시지가 그대로 노출되지 않도록 상태 코드로 대응한다.
const STATUS_FALLBACK_CODE: Record<number, string> = {
  400: 'COMMON_001',
  401: 'COMMON_002',
  403: 'COMMON_003',
  404: 'COMMON_004',
};

const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해주세요.';

export function parseBackendError(error: unknown): ApiErrorResponse {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const responseData = axiosError.response?.data;

    if (responseData && typeof responseData === 'object') {
      const code = responseData.code || 'COMMON_005';
      const message =
        responseData.message ||
        BACKEND_ERROR_MESSAGES[code] ||
        '서버에 문제가 생겼어요.';

      return { code, message };
    }

    const status = axiosError.response?.status;
    if (status !== undefined) {
      const code = STATUS_FALLBACK_CODE[status] || 'COMMON_005';
      return { code, message: BACKEND_ERROR_MESSAGES[code] };
    }

    // 응답 자체가 없으면 서버 오류가 아니라 연결 실패다.
    return { code: 'COMMON_005', message: NETWORK_ERROR_MESSAGE };
  }

  return {
    code: 'COMMON_005',
    message: '서버에 문제가 생겼어요.',
  };
}

export function getBackendErrorMessage(error: unknown): string {
  const parsed = parseBackendError(error);
  return parsed.message;
}

export function getResourceLoadError(error: unknown, resource: string) {
  const { code } = parseBackendError(error);
  const status = (error as AxiosError | undefined)?.response?.status;
  if (status === 404 || code === 'COMMON_004' || code === 'USER_001') {
    return { message: `${resource} 정보를 찾을 수 없어요.`, canRetry: false };
  }
  if (status === 401 || code === 'COMMON_002') {
    return { message: '로그인 후 다시 이용해 주세요.', canRetry: false };
  }
  if (status === 403 || code === 'COMMON_003' || code === 'USER_002') {
    return { message: `${resource}에 접근할 수 없어요.`, canRetry: false };
  }
  return {
    message: `${resource} 정보를 불러오지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.`,
    canRetry: true,
  };
}

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
