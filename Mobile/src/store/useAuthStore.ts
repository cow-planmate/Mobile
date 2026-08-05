import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import {
  LOGOUT_CLEARED_KEYS,
  LAST_LOGIN_METHOD_KEY,
} from '../constants/storageKeys';
import '../api/axiosConfig';

/**
 * 로그인한 사용자 세션 정보
 */
export interface User {
  userId: string;
  nickname: string;
  email: string;
}

/** 로그인 화면의 '마지막 사용' 표시에 쓰는 수단 구분 */
export type LoginMethod = 'email' | 'google' | 'naver';

/**
 * 인증 및 사용자 세션 상태 관리 인터페이스
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  /** 앱 시작 시 저장소 복원이 끝나기 전까지 true (로그인 화면 깜빡임 방지) */
  isInitializing: boolean;
  needsThemeSelection: boolean;
  /** 가장 최근에 로그인을 성공시킨 수단. 로그아웃해도 유지된다 */
  lastLoginMethod: LoginMethod | null;
  setNeedsThemeSelection: (val: boolean) => void;
  setUser: (user: User | null) => void;
  /** 앱 시작 시 로컬 저장소 토큰 및 사용자 정보 복원 */
  initialize: () => Promise<void>;
  /** 이메일/비밀번호 로그인 처리 */
  login: (email: string, password: string) => Promise<void>;
  /** 사용자 로그아웃 처리 */
  logout: () => Promise<void>;
  /** OAuth 인가 코드로 토큰 교환 로그인 */
  oauthLogin: (code: string, provider: 'google' | 'naver') => Promise<void>;
  /** OAuth 신규 회원 추가 정보 등록 및 로그인 완료 */
  oauthComplete: (data: {
    signupId: string;
    email: string | null;
    birthdate: string;
    gender: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitializing: true,
  needsThemeSelection: false,
  lastLoginMethod: null,
  setNeedsThemeSelection: (val) => set({ needsThemeSelection: val }),
  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      const [[, userJson], [, token], [, lastMethod]] =
        await AsyncStorage.multiGet([
          'user',
          'accessToken',
          LAST_LOGIN_METHOD_KEY,
        ]);

      if (userJson && token) {
        set({ user: JSON.parse(userJson) });
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      if (lastMethod === 'email' || lastMethod === 'google' || lastMethod === 'naver') {
        set({ lastLoginMethod: lastMethod });
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
    } finally {
      set({ isInitializing: false });
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

      // LoginResponse에는 성공 플래그가 없다. 인증 실패는 4xx로 오므로
      // 여기까지 왔다면 이미 성공이다.
      const data = response.data;

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
          [LAST_LOGIN_METHOD_KEY, 'email'],
        ]);

        set({ user: userData, lastLoginMethod: 'email' });
      } else {
        throw new Error(data.message || '서버 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      // 원본 에러를 그대로 올린다. Error로 감싸면 응답의 code가 사라져
      // 호출부가 문구를 문자열로 비교할 수밖에 없다(utils/errorHandler 참고).
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  oauthLogin: async (code, provider) => {
    set({ isLoading: true });
    delete axios.defaults.headers.common.Authorization;

    try {
      // 서버 OAuthExchangeRequest는 code를 본문으로 받는다(@RequestBody).
      // 쿼리 파라미터로 보내면 본문이 비어 400이 난다.
      const response = await axios.post(resolveApiUrl('/api/oauth/exchange'), {
        code,
      });

      // 응답은 일반 로그인과 같은 LoginResponse라 userId·email이 이미 들어 있다.
      // 따로 프로필을 조회할 필요가 없다.
      const { accessToken, refreshToken, userId, nickname, email } =
        response.data;

      // userId는 일정 소유자 판정에 쓰인다. 비어 있는 채로 세션을 만들면
      // 자기 일정에서도 소유자로 인식되지 않으므로 여기서 끊는다.
      if (!accessToken || !refreshToken || !userId) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const userData: User = {
        userId,
        nickname: nickname || '사용자',
        email: email || '',
      };

      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        [LAST_LOGIN_METHOD_KEY, provider],
      ]);

      set({ user: userData, lastLoginMethod: provider });
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

      const { accessToken, refreshToken, userId, nickname, email } =
        response.data;

      if (accessToken && refreshToken && userId) {
        const userData: User = {
          userId,
          nickname: nickname || '사용자',
          email: email || data.email || '',
        };
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        await AsyncStorage.multiSet([
          ['user', JSON.stringify(userData)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
        ]);

        set({ user: userData });
      } else {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('OAuth Complete error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
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
      await AsyncStorage.multiRemove(LOGOUT_CLEARED_KEYS);
      set({ isLoading: false });
    }
  },
}));
