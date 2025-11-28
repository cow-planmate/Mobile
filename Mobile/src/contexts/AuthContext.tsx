// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// 사용자 데이터 타입 정의 (필요에 따라 수정)
interface User {
  id: number;
  email: string;
  nickname: string;
  // ... 기타 필요한 필드
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 실행 시 로그인 상태 복구
  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      // 저장된 사용자 정보와 토큰 불러오기
      const userJson = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('accessToken');

      if (userJson && token) {
        setUser(JSON.parse(userJson));
        // axios 헤더에 토큰 설정
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, refreshToken: string, userData: User) => {
    try {
      // 1. 상태 업데이트
      setUser(userData);

      // 2. Axios 기본 헤더 설정
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      // 3. 로컬 스토리지에 저장
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['accessToken', token],
        ['refreshToken', refreshToken],
      ]);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 1. 서버에 로그아웃 요청 (리프레시 토큰 만료 처리)
      // 백엔드 로그아웃 API 호출
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (accessToken) {
        // 서버 로그아웃 API 주소: /api/auth/logout
        // (LoginController에 구현된 엔드포인트라고 가정)
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        console.log('서버 로그아웃 성공');
      }
    } catch (error) {
      // 서버 요청이 실패하더라도(네트워크 오류 등), 앱에서는 로그아웃 처리를 진행해야 함
      console.error(
        '서버 로그아웃 요청 실패 (무시하고 로컬 로그아웃 진행):',
        error,
      );
    } finally {
      // 2. 앱 내부 상태 및 저장소 초기화 (가장 중요)
      setUser(null);
      delete axios.defaults.headers.common.Authorization;

      // 저장된 모든 인증 정보 삭제
      await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
    }
  };

  const updateUser = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
