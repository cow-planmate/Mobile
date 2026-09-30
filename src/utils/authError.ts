import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/error';

const TOKEN_ERROR_CODES = ['AUTH_001', 'AUTH_002', 'COMMON_002'];

export const isTokenAuthFailure = (error: AxiosError): boolean => {
  const response = error.response;
  if (response?.status !== 401) return false;

  const code = (response.data as ApiErrorResponse | undefined)?.code;

  if (!code) return true;

  return TOKEN_ERROR_CODES.includes(code);
};
