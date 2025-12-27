import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';


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
    try {

      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });


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


        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;


        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
        ]);


        setUser(userData);
      } else {
        throw new Error(message || '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    setIsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');


      if (accessToken) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
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
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
