import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const normalizedApiUrl = API_URL.trim().replace(/\/+$/, '');

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
    const noAuthPaths = [
      '/api/auth/login',
      '/api/auth/email/verification',
      '/api/auth/register/nickname/verify',
    ];

    const isNoAuthPath = noAuthPaths.some(path => config.url?.includes(path));

    if (!isNoAuthPath && !config.headers.Authorization) {
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
        `🚀 API Request: ${config.method?.toUpperCase()} ${fullUrl}`,
        {
          headers: config.headers,
          data: JSON.stringify(config.data),
        },
      );
    }

    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('❌ Request Error:', error);
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
    // 개발 환경에서 응답 로깅
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고 재시도하지 않은 요청인 경우 토큰 갱신 시도
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/login' &&
      originalRequest.url !== '/api/auth/token'
    ) {
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

      originalRequest._retry = true;
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
            isRefreshing = false;
            
            return axios(originalRequest);
          }
        }
        throw new Error('No refresh token found or token creation failed');
      } catch (refreshError) {
        if (__DEV__) {
          console.error('Token refresh failed:', refreshError);
        }
        
        // 저장된 토큰 및 유저 정보 제거
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        delete axios.defaults.headers.common.Authorization;
        
        // Zustand auth store 상태 업데이트 (동적 로드를 통해 순환 참조 방지)
        try {
          const { useAuthStore } = require('../store/useAuthStore');
          useAuthStore.getState().setUser(null);
        } catch (storeError) {
          console.error('Failed to update auth store on token refresh failure:', storeError);
        }
        
        processQueue(refreshError, null);
        isRefreshing = false;
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
}
}

export default axios;
