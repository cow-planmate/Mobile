import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import '../api/axiosConfig';

export interface User {
  userId: number;
  nickname: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  needsThemeSelection: boolean;
  setNeedsThemeSelection: (val: boolean) => void;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  oauthLogin: (code: string) => Promise<void>;
  oauthComplete: (data: {
    provider: string;
    providerId: string;
    email: string;
    age: number;
    gender: number;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  needsThemeSelection: false,
  setNeedsThemeSelection: (val) => set({ needsThemeSelection: val }),
  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('accessToken');

      if (userJson && token) {
        set({ user: JSON.parse(userJson) });
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    delete axios.defaults.headers.common.Authorization;

    try {
      const response = await axios.post(
        '/api/auth/login',
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      if (data.loginSuccess === false) {
        throw new Error(
          data.message || '이메일 또는 비밀번호가 올바르지 않습니다.'
        );
      }

      const {
        accessToken,
        refreshToken,
        userId,
        nickname,
        email: userEmail,
      } = data;

      if (accessToken && refreshToken && userId) {
        const userData: User = {
          userId,
          nickname: nickname || '사용자',
          email: userEmail || email,
        };

        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
        ]);

        set({ user: userData });
      } else {
        throw new Error(data.message || '서버 응답 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  oauthLogin: async (code) => {
    set({ isLoading: true });
    delete axios.defaults.headers.common.Authorization;

    try {
      const response = await axios.post(
        resolveApiUrl('/api/oauth/exchange'),
        null,
        {
          params: { code },
        }
      );

      const { accessToken, refreshToken, nickname } = response.data;
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      let userId = 0;
      try {
        const profileRes = await axios.get(resolveApiUrl('/api/user/profile'));
        userId = profileRes.data.userId;
      } catch (err) {
        console.warn('Failed to fetch profile during OAuth login', err);
      }

      const userData: User = { userId, nickname, email: '' };

      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]);

      set({ user: userData });
    } catch (error) {
      console.error('OAuth Login error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  oauthComplete: async (data) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(
        resolveApiUrl('/api/oauth/complete'),
        data
      );

      const { success, message, accessToken, refreshToken, userId, nickname } =
        response.data;

      if (success) {
        const userData: User = { userId, nickname, email: data.email || '' };
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
        ]);

        set({ user: userData });
      } else {
        throw new Error(message || 'Social signup failed.');
      }
    } catch (error) {
      console.error('OAuth Complete error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (accessToken) {
        await axios.post(
          resolveApiUrl('/api/auth/logout'),
          { refreshToken: refreshToken || '' },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }
    } catch (error) {
      console.error('서버 로그아웃 요청 실패:', error);
    } finally {
      set({ user: null });
      delete axios.defaults.headers.common.Authorization;
      await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
      set({ isLoading: false });
    }
  },
}));
