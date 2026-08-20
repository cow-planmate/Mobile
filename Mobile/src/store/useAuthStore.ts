import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import {
  ACCESS_TOKEN_RECEIVED_AT_KEY,
  LOGOUT_CLEARED_KEYS,
  IDENTITY_CLEARED_KEYS,
  LAST_LOGIN_METHOD_KEY,
  LAST_LOGIN_EMAIL_KEY,
} from '../constants/storageKeys';
import { observeAccessToken } from '../api/axiosConfig';
import { queryClient } from '../api/queryClient';
import { clearWebViewCookies } from '../features/auth/webViewCookies';

export interface User {
  userId: string;
  nickname: string;
  email: string;
}

export type LoginMethod = 'email' | 'google' | 'naver';

interface AuthState {
  user: User | null;
  isLoading: boolean;

  isInitializing: boolean;
  needsThemeSelection: boolean;

  lastLoginMethod: LoginMethod | null;
  lastLoginEmail: string | null;
  setNeedsThemeSelection: (val: boolean) => void;
  setUser: (user: User | null) => void;

  initialize: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  clearSession: (options?: { forgetLoginMethod?: boolean }) => Promise<void>;

  revokeRefreshToken: () => Promise<void>;

  oauthLogin: (
    code: string,
    provider: 'google' | 'naver' | null,
  ) => Promise<void>;

  oauthComplete: (
    data: {
      signupId: string;
      email: string | null;
      birthdate: string;
      gender: string;
    },
    provider?: 'google' | 'naver' | null,
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitializing: true,
  needsThemeSelection: false,
  lastLoginMethod: null,
  lastLoginEmail: null,
  setNeedsThemeSelection: (val) => set({ needsThemeSelection: val }),
  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      const [[, userJson], [, token], [, lastMethod], [, lastEmail], [, tokenReceivedAt]] =
        await AsyncStorage.multiGet([
          'user',
          'accessToken',
          LAST_LOGIN_METHOD_KEY,
          LAST_LOGIN_EMAIL_KEY,
          ACCESS_TOKEN_RECEIVED_AT_KEY,
        ]);

      if (userJson && token) {
        const receivedAtMs = tokenReceivedAt ? Number(tokenReceivedAt) : NaN;
        if (Number.isFinite(receivedAtMs)) {
          observeAccessToken(token, receivedAtMs);
        }
        set({ user: JSON.parse(userJson) });
      }
      if (lastMethod === 'email' || lastMethod === 'google' || lastMethod === 'naver') {
        set({ lastLoginMethod: lastMethod });
      }
      if (lastEmail) {
        set({ lastLoginEmail: lastEmail });
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
    } finally {
      set({ isInitializing: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

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

      const {
        accessToken,
        refreshToken,
        userId,
        nickname,
        email: userEmail,
      } = data;

      if (accessToken && refreshToken && userId) {
        const receivedAtMs = Date.now();
        const userData: User = {
          userId,
          nickname: nickname || '사용자',
          email: userEmail || email,
        };


        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
          [ACCESS_TOKEN_RECEIVED_AT_KEY, String(receivedAtMs)],
          [LAST_LOGIN_METHOD_KEY, 'email'],
          [LAST_LOGIN_EMAIL_KEY, email],
        ]);
        observeAccessToken(accessToken, receivedAtMs);

        set({ user: userData, lastLoginMethod: 'email', lastLoginEmail: email });
      } else {
        throw new Error(data.message || '서버 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  oauthLogin: async (code, provider) => {
    set({ isLoading: true });

    try {

      const response = await axios.post(resolveApiUrl('/api/oauth/exchange'), {
        code,
      });

      const { accessToken, refreshToken, userId, nickname, email } =
        response.data;

      if (!accessToken || !refreshToken || !userId) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      const userData: User = {
        userId,
        nickname: nickname || '사용자',
        email: email || '',
      };

      const receivedAtMs = Date.now();
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        [ACCESS_TOKEN_RECEIVED_AT_KEY, String(receivedAtMs)],
        ...(provider ? [[LAST_LOGIN_METHOD_KEY, provider] as [string, string]] : []),
      ]);
      observeAccessToken(accessToken, receivedAtMs);

      set({ user: userData, ...(provider ? { lastLoginMethod: provider } : {}) });
    } catch (error) {
      console.error('OAuth Login error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  oauthComplete: async (data, provider) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(
        resolveApiUrl('/api/oauth/complete'),
        data
      );

      const { accessToken, refreshToken, userId, nickname, email } =
        response.data;

      if (accessToken && refreshToken && userId) {
        const receivedAtMs = Date.now();
        const userData: User = {
          userId,
          nickname: nickname || '사용자',
          email: email || data.email || '',
        };

        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
          [ACCESS_TOKEN_RECEIVED_AT_KEY, String(receivedAtMs)],
          ...(provider ? [[LAST_LOGIN_METHOD_KEY, provider] as [string, string]] : []),
        ]);
        observeAccessToken(accessToken, receivedAtMs);

        set({
          user: userData,
          ...(provider ? { lastLoginMethod: provider } : {}),
        });
      } else {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('OAuth Complete error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearSession: async (options) => {
    const forgetLoginMethod = options?.forgetLoginMethod ?? false;

    set({ user: null, ...(forgetLoginMethod ? { lastLoginMethod: null, lastLoginEmail: null } : {}) });
    await AsyncStorage.multiRemove(
      forgetLoginMethod
        ? [...LOGOUT_CLEARED_KEYS, ...IDENTITY_CLEARED_KEYS]
        : LOGOUT_CLEARED_KEYS,
    );

    queryClient.clear();

    await clearWebViewCookies();
  },

  revokeRefreshToken: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!accessToken || !refreshToken) return;

      await axios.post(
        resolveApiUrl('/api/auth/logout'),
        { refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch (error) {

      console.error('리프레시 토큰 폐기 실패:', error);
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
      await get().clearSession();
      set({ isLoading: false });
    }
  },
}));
