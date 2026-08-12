import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { LOGOUT_CLEARED_KEYS } from '../constants/storageKeys';
import { getJwtIssuedAtMs, isTokenExpiringSoon } from '../utils/jwt';

const normalizedApiUrl = (API_URL ?? '').trim().replace(/\/+$/, '');

if (!normalizedApiUrl && __DEV__) {
  console.warn('[axiosConfig] API_URL이 비어 있습니다. .env 설정을 확인하세요.');
}

/** 토큰을 자동으로 첨부하지 않는 경로 (인증 불필요 · 토큰 재발급 포함) */
const NO_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/token',
  '/api/auth/email/verification',
  '/api/auth/register/nickname/verify',
  '/api/beta/feedback',
];

/**
 * 만료 이 시간 전부터는 요청을 보내기 전에 미리 갱신한다.
 *
 * 서버 액세스 토큰 수명이 15분이라, 사전 갱신이 없으면 15분마다 첫 요청이
 * 요청 → 401 → 재발급 → 재요청으로 3번 왕복한다.
 */
const TOKEN_REFRESH_LEEWAY_MS = 60 * 1000;

const matchesPath = (url: string | undefined, paths: string[]) =>
  paths.some(path => url?.includes(path));

/**
 * 진행 중인 재발급 요청. 동시에 여러 요청이 갱신을 시도해도 실제 호출은 한 번만
 * 나가도록 공유한다(사전 갱신·401 재시도 양쪽이 같은 약속을 쓴다).
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * 기기 시계가 서버보다 앞선 정도(ms). 만료 판정은 이 값을 빼고 계산한다.
 *
 * 재발급 응답이 오는 순간은 서버의 발급 시각(iat)과 사실상 같으므로, 그 차이가
 * 곧 시계 오차다. 앱을 처음 켠 직후에는 0(=보정 없음)이라 시계가 크게 빠른
 * 기기에서 사전 갱신이 한 번 더 나갈 수 있지만, 그 응답에서 오차를 학습해
 * 이후 요청부터는 정상 주기로 돌아온다.
 */
let clockSkewMs = 0;

const performTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  // NO_AUTH_PATHS에 있어 요청 인터셉터가 토큰을 붙이지 않는다(재귀 차단).
  const response = await axios.post('/api/auth/token', { refreshToken });
  const newAccessToken = response.data?.accessToken;
  if (!newAccessToken) return null;

  const issuedAtMs = getJwtIssuedAtMs(newAccessToken);
  if (issuedAtMs !== null) {
    clockSkewMs = Date.now() - issuedAtMs;
  }

  await AsyncStorage.setItem('accessToken', newAccessToken);
  return newAccessToken;
};

/**
 * 액세스 토큰을 재발급한다. 실패하면 null을 돌려준다(예외를 던지지 않는다).
 * 동시 호출은 하나의 요청으로 합쳐진다.
 *
 * WebSocket·SSE처럼 axios를 거치지 않는 연결도 만료 시 이 함수를 쓴다.
 */
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

/**
 * 저장된 액세스 토큰을 돌려주되, 만료가 임박했으면 먼저 갱신한다.
 *
 * axios를 거치지 않는 연결(WebSocket 핸드셰이크, SSE 스트림)이 쓴다. 그쪽은
 * 요청 인터셉터를 타지 않아 스스로 갱신 시점을 챙겨야 한다.
 */
export const ensureFreshAccessToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!isTokenExpiringSoon(token, TOKEN_REFRESH_LEEWAY_MS, clockSkewMs)) {
    return token;
  }
  return (await refreshAccessToken()) ?? token;
};

/** 재발급까지 실패했을 때 세션을 정리한다. */
const clearSession = async () => {
  await AsyncStorage.multiRemove(LOGOUT_CLEARED_KEYS);

  // Zustand auth store 상태 업데이트 (동적 로드를 통해 순환 참조 방지)
  try {
    const { useAuthStore } = require('../store/useAuthStore');
    useAuthStore.getState().setUser(null);
  } catch (storeError) {
    console.error(
      'Failed to update auth store on token refresh failure:',
      storeError,
    );
  }
};

// axios 기본 설정
if (axios && axios.defaults) {
  axios.defaults.baseURL = normalizedApiUrl;
  axios.defaults.timeout = 15000; // 15초 타임아웃 (재시도 1회 포함 최대 30초)
  if (axios.defaults.headers && axios.defaults.headers.common) {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }
}

// 요청 인터셉터: 토큰 자동 추가 및 요청 로깅
if (axios && axios.interceptors && axios.interceptors.request) {
axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 로그인/회원가입 등 인증이 필요없는 요청은 토큰 추가하지 않음
    const isNoAuthPath = matchesPath(config.url, NO_AUTH_PATHS);

    if (isNoAuthPath) {
      delete config.headers.Authorization;
    } else if (!config.headers.Authorization) {
      // 저장소가 유일한 토큰 출처다. 예전에는 로그인·재발급 시점에
      // axios.defaults.headers.common에도 같은 값을 심어 두었는데, axios는
      // 인터셉터보다 먼저 common 헤더를 config에 병합하므로 이 분기가 실행되지
      // 않아 만료 토큰이 그대로 나갈 수 있었다.
      let token = await AsyncStorage.getItem('accessToken');

      // 만료가 임박했으면 보내기 전에 갱신한다(401 왕복 1회 제거).
      if (isTokenExpiringSoon(token, TOKEN_REFRESH_LEEWAY_MS, clockSkewMs)) {
        token = (await refreshAccessToken()) ?? token;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 개발 환경에서 요청 로깅
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

// 응답 인터셉터: 응답 로깅 및 토큰 갱신
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

    // 401 에러이고 재시도하지 않은 요청인 경우 토큰 갱신 시도
    // (절대 URL로 호출되는 경우가 있어 includes로 비교한다)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !matchesPath(originalRequest.url, ['/api/auth/login', '/api/auth/token'])
    ) {
      // 재시도 표시를 먼저 해야 재발급 후 재요청이 또 401을 받았을 때
      // 무한 재발급 루프에 빠지지 않는다.
      originalRequest._retry = true;

      // 동시에 401을 받은 요청들은 refreshAccessToken 내부에서 하나의 재발급
      // 요청으로 합쳐진다. 별도 큐가 필요하지 않다.
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
