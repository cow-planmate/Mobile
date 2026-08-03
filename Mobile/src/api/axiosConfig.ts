import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { LOGOUT_CLEARED_KEYS } from '../constants/storageKeys';

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
];

const matchesPath = (url: string | undefined, paths: string[]) =>
  paths.some(path => url?.includes(path));

// axios 기본 설정
if (axios && axios.defaults) {
  axios.defaults.baseURL = normalizedApiUrl;
  axios.defaults.timeout = 30000; // 30초 타임아웃
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
      const token = await AsyncStorage.getItem('accessToken');
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

// 토큰 갱신을 위한 상태 변수 및 큐
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
      // 큐에 넣기 전에 재시도 표시를 해야 재발급 후 재요청이 또 401을 받았을 때
      // 무한 재발급 루프에 빠지지 않는다.
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/token', {
            refreshToken,
          });

          const newAccessToken = response.data.accessToken;
          if (newAccessToken) {
            await AsyncStorage.setItem('accessToken', newAccessToken);
            axios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);

            return axios(originalRequest);
          }
        }
        throw new Error('No refresh token found or token creation failed');
      } catch (refreshError) {
        if (__DEV__) {
          console.error('Token refresh failed:', refreshError);
        }
        
        // 저장된 토큰 및 유저 정보 제거
        await AsyncStorage.multiRemove(LOGOUT_CLEARED_KEYS);
        delete axios.defaults.headers.common.Authorization;
        
        // Zustand auth store 상태 업데이트 (동적 로드를 통해 순환 참조 방지)
        try {
          const { useAuthStore } = require('../store/useAuthStore');
          useAuthStore.getState().setUser(null);
        } catch (storeError) {
          console.error('Failed to update auth store on token refresh failure:', storeError);
        }
        
        processQueue(refreshError, null);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
}
}

export default axios;
