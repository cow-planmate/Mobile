import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// 사용자 정보 타입 (백엔드 응답에 맞춰 수정)
interface User {
  userId: number;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 앱 시작 시 저장된 로그인 정보 복구
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('accessToken');

        if (userJson && token) {
          setUser(JSON.parse(userJson));
          // 앱 재시작 시에도 axios 헤더에 토큰 설정
          axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      }
    };
    loadStorageData();
  }, []);

  // 로그인 함수 (이메일, 비밀번호 받아서 처리)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. 백엔드 로그인 API 호출
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      // 백엔드 응답 구조 분해 할당
      const {
        loginSuccess,
        userId,
        nickname,
        accessToken,
        refreshToken,
        message,
      } = response.data;

      if (loginSuccess) {
        const userData: User = { userId, nickname };

        // 2. Axios 기본 헤더에 액세스 토큰 설정
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        // 3. 로컬 스토리지에 토큰 및 유저 정보 저장
        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
        ]);

        // 4. 상태 업데이트 (로그인 완료)
        setUser(userData);
      } else {
        throw new Error(message || '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // LoginScreen에서 에러를 잡아서 Alert를 띄울 수 있도록 에러 전파
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수 (서버 연동 포함)
  const logout = async () => {
    setIsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 1. 서버에 로그아웃 요청 (토큰 만료 처리)
      if (accessToken) {
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
      console.error('서버 로그아웃 요청 실패 (로컬 로그아웃은 진행됨):', error);
    } finally {
      // 2. 클라이언트 데이터 초기화 (항상 실행)
      setUser(null);
      delete axios.defaults.headers.common.Authorization;
      await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
