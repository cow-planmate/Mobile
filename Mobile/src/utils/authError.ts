import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/error';

/**
 * 401 응답이 '토큰 문제'인지 판별한다.
 *
 * 서버는 토큰과 무관한 인증 실패에도 401을 쓴다 — 자격 증명(AUTH_003),
 * 인증번호(AUTH_006·AUTH_007), 현재 비밀번호(AUTH_008)가 그렇다. 이들까지
 * 만료로 보고 재발급하면 요청이 배로 늘고, 재발급마저 실패하는 상황에서는
 * 비밀번호 오타 하나로 세션이 끊긴다.
 */
const TOKEN_ERROR_CODES = ['AUTH_001', 'AUTH_002', 'COMMON_002'];

export const isTokenAuthFailure = (error: AxiosError): boolean => {
  const response = error.response;
  if (response?.status !== 401) return false;

  const code = (response.data as ApiErrorResponse | undefined)?.code;
  // 본문이 없거나 코드가 없는 401(프록시·게이트웨이 등)은 토큰 문제로 본다.
  if (!code) return true;

  return TOKEN_ERROR_CODES.includes(code);
};
