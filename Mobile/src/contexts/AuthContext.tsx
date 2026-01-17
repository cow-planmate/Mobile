import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// axios 설정이 적용되도록 import (App.tsx에서 이미 import하지만 안전을 위해)
import '../api/axiosConfig';

interface User {
  userId: number;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
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

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('accessToken');

        if (userJson && token) {
          setUser(JSON.parse(userJson));

          axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      }
    };
    loadStorageData();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // 이전의 인증 헤더가 남아있다면 제거하여 403 에러 방지
    delete axios.defaults.headers.common.Authorization;

    try {
      // url에서 API_URL 제거하고 상대 경로만 사용 (axiosConfig에서 baseURL 설정됨)
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
        },
      );
      console.log('Login Response:', JSON.stringify(response.data, null, 2));

      const data = response.data;

      // 백엔드 응답 구조:
      // {
      //   loginSuccess: boolean,
      //   userId: number,
      //   nickname: string,
      //   email: string,
      //   accessToken: string,
      //   refreshToken: string,
      //   message: string
      // }

      // 먼저 loginSuccess 확인 (백엔드에서 HTTP 200으로 실패 응답을 보낼 수 있음)
      if (data.loginSuccess === false) {
        throw new Error(
          data.message || '이메일 또는 비밀번호가 올바르지 않습니다.',
        );
      }

      const { accessToken, refreshToken, userId, nickname } = data;

      if (accessToken && refreshToken && userId) {
        const userData: User = { userId, nickname: nickname || '사용자' };

        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
        ]);

        setUser(userData);
      } else {
        console.error('Invalid response structure:', response.data);
        throw new Error(
          data.message ||
            '서버 응답 형식이 올바르지 않습니다. 다시 시도해주세요.',
        );
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // axios 에러인 경우 서버 응답 메시지 추출
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const oauthLogin = async (code: string) => {
    setIsLoading(true);
    // OAuth 로그인 시에도 기존 헤더 제거
    delete axios.defaults.headers.common.Authorization;

    try {
      // Exchange code for tokens
      // POST /api/oauth/exchange?code=...
      const response = await axios.post(`${API_URL}/api/oauth/exchange`, null, {
        params: { code },
      });

      const { accessToken, refreshToken, nickname } = response.data;

      // Note: userId might be needed. If not provided, fetch profile.
      // For now, assume we can get profile or userId is not strictly required until needed.
      // Or better, fetch profile immediately.

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      let userId = 0;
      try {
        const profileRes = await axios.get(`${API_URL}/api/user/profile`);
        userId = profileRes.data.userId;
      } catch (err) {
        console.warn('Failed to fetch profile during OAuth login', err);
      }

      const userData: User = { userId, nickname };

      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]);

      setUser(userData);
    } catch (error: any) {
      console.error('OAuth Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const oauthComplete = async (data: {
    provider: string;
    providerId: string;
    email: string;
    age: number;
    gender: number;
  }) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/oauth/complete`, data);

      const { success, message, accessToken, refreshToken, userId, nickname } =
        response.data;

      if (success) {
        const userData: User = { userId, nickname };

        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
        ]);

        setUser(userData);
      } else {
        throw new Error(message || 'Social signup failed.');
      }
    } catch (error: any) {
      console.error('OAuth Complete error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (accessToken) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          { refreshToken: refreshToken || '' },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
      }
    } catch (error) {
      console.error('서버 로그아웃 요청 실패 (로컬 로그아웃은 진행됨):', error);
    } finally {
      setUser(null);
      delete axios.defaults.headers.common.Authorization;
      await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, oauthLogin, oauthComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
};
