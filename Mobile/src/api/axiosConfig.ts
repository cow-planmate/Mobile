import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import {
  ACCESS_TOKEN_RECEIVED_AT_KEY,
  LOGOUT_CLEARED_KEYS,
} from '../constants/storageKeys';
import { getJwtIssuedAtMs, isTokenExpiringSoon } from '../utils/jwt';
import { isTokenAuthFailure } from '../utils/authError';

const normalizedApiUrl = (API_URL ?? '').trim().replace(/\/+$/, '');

if (!normalizedApiUrl && __DEV__) {
  console.warn('[axiosConfig] API_URL이 비어 있습니다. .env 설정을 확인하세요.');
}

// 로그아웃 상태에서만 호출되는 경로. 만료된 토큰이 남아 있으면 요청 직전에
// 불필요한 /api/auth/token 갱신 왕복이 끼어들기 때문에 인증 헤더 자체를 뗀다.
// '/api/auth/register'는 '/api/auth/register/nickname/verify'까지 함께 덮는다.
const NO_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/token',
  '/api/auth/email/verification',
  '/api/auth/register',
  '/api/auth/password/email',
  '/api/oauth/exchange',
  '/api/oauth/complete',
  '/api/beta/feedback',
];

const TOKEN_REFRESH_LEEWAY_MS = 60 * 1000;

const matchesPath = (url: string | undefined, paths: string[]) =>
  paths.some(path => url?.includes(path));

let refreshPromise: Promise<string | null> | null = null;

let clockSkewMs = 0;

export const observeAccessToken = (
  token: string,
  receivedAtMs = Date.now(),
): void => {
  const issuedAtMs = getJwtIssuedAtMs(token);
  if (issuedAtMs !== null && Number.isFinite(issuedAtMs)) {
    clockSkewMs = receivedAtMs - issuedAtMs;
  }
};

const performTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const response = await axios.post('/api/auth/token', { refreshToken });
  const newAccessToken = response.data?.accessToken;
  if (!newAccessToken) return null;

  const receivedAtMs = Date.now();
  observeAccessToken(newAccessToken, receivedAtMs);

  await AsyncStorage.multiSet([
    ['accessToken', newAccessToken],
    [ACCESS_TOKEN_RECEIVED_AT_KEY, String(receivedAtMs)],
  ]);
  return newAccessToken;
};

export const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh()
      .catch(error => {
        if (__DEV__) {
          console.error('Token refresh failed:', error);
        }
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const ensureFreshAccessToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!isTokenExpiringSoon(token, TOKEN_REFRESH_LEEWAY_MS, clockSkewMs)) {
    return token;
  }
  return (await refreshAccessToken()) ?? token;
};

// 토큰 갱신 실패로 인한 강제 로그아웃도 수동 로그아웃과 같은 범위를 비워야
// 다음 계정에 이전 사용자의 캐시·쿠키가 남지 않는다.
const clearSession = async () => {
  try {
    const { useAuthStore } = require('../store/useAuthStore');
    await useAuthStore.getState().clearSession();
    return;
  } catch (storeError) {
    console.error(
      'Failed to clear session through auth store on token refresh failure:',
      storeError,
    );
  }

  await AsyncStorage.multiRemove(LOGOUT_CLEARED_KEYS);
};

if (axios && axios.defaults) {
  axios.defaults.baseURL = normalizedApiUrl;
  axios.defaults.timeout = 15000; 
  if (axios.defaults.headers && axios.defaults.headers.common) {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }
}

if (axios && axios.interceptors && axios.interceptors.request) {
axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {

    const isNoAuthPath = matchesPath(config.url, NO_AUTH_PATHS);

    if (isNoAuthPath) {
      delete config.headers.Authorization;
    } else if (!config.headers.Authorization) {

      let token = await AsyncStorage.getItem('accessToken');

      if (isTokenExpiringSoon(token, TOKEN_REFRESH_LEEWAY_MS, clockSkewMs)) {
        token = (await refreshAccessToken()) ?? token;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (__DEV__) {
      const fullUrl =
        config.baseURL && !config.url?.startsWith('http')
          ? `${config.baseURL}${config.url}`
          : config.url;

      console.log(
        `\x1b[36m[API REQ]\x1b[0m ${config.method?.toUpperCase()} ${fullUrl}`,
        config.data ? { data: config.data } : '',
      );
    }

    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('\x1b[31m[API REQ ERR]\x1b[0m', error);
    }
    return Promise.reject(error);
  },
);

if (axios && axios.interceptors && axios.interceptors.response) {
axios.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(`\x1b[32m[API RES]\x1b[0m ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      const resData = error.response?.data as any;
      const statusCode = error.response?.status || 'FAIL';
      const errCode = resData?.code || 'UNKNOWN';
      const errMsg = resData?.message || error.message;

      console.error(
        `\x1b[31m[API ERR]\x1b[0m ${statusCode} [${errCode}] ${errMsg} (${error.config?.url})`,
      );
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      isTokenAuthFailure(error) &&
      originalRequest &&
      !originalRequest._retry &&
      !matchesPath(originalRequest.url, NO_AUTH_PATHS)
    ) {

      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      }

      await clearSession();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
}
}

export default axios;
