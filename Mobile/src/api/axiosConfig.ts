import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// axios 기본 설정
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 30000; // 30초 타임아웃
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 요청 인터셉터: 토큰 자동 추가 및 요청 로깅
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

// 응답 인터셉터: 응답 로깅 및 토큰 갱신
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
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.get('/api/auth/token', {
            params: { refreshToken },
          });

          const newAccessToken = response.data.accessToken;
          if (newAccessToken) {
            await AsyncStorage.setItem('accessToken', newAccessToken);
            axios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리가 필요할 수 있음
        if (__DEV__) {
          console.error('Token refresh failed:', refreshError);
        }
        // 저장된 토큰 제거
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        delete axios.defaults.headers.common.Authorization;
      }
    }

    return Promise.reject(error);
  },
);

export default axios;
