import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import {
  ACCESS_TOKEN_RECEIVED_AT_KEY,
  LOGOUT_CLEARED_KEYS,
  LAST_LOGIN_METHOD_KEY,
} from '../constants/storageKeys';
import { observeAccessToken } from '../api/axiosConfig';
import { queryClient } from '../api/queryClient';
import { clearWebViewCookies } from '../features/auth/webViewCookies';

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
  /**
   * 로컬 세션 정리. 사용자·토큰·FCM 표시와 서버 상태 캐시를 함께 비운다.
   * 로그아웃과 회원 탈퇴가 같은 정리를 거치도록 한곳에 둔다.
   *
   * @param options.forgetLoginMethod '마지막 사용' 기록까지 지운다. 탈퇴에서 쓴다 —
   * 소셜 계정은 같은 수단으로 다시 로그인하면 서버가 계정을 복구하므로, 그 버튼을
   * 앞에 놓고 배지까지 달아 두면 탈퇴 직후 실수로 되살리기 쉽다.
   */
  clearSession: (options?: { forgetLoginMethod?: boolean }) => Promise<void>;
  /**
   * 서버에 남은 리프레시 토큰을 폐기한다.
   * 탈퇴는 계정만 소프트 삭제하고 토큰은 그대로 두므로(UserService.resignAccount)
   * 앱이 직접 정리한다. 실패해도 예외를 올리지 않는다.
   */
  revokeRefreshToken: () => Promise<void>;
  /**
   * OAuth 인가 코드로 토큰 교환 로그인.
   * provider를 모르면(null) '마지막 사용' 기록만 건너뛰고 로그인은 그대로 진행한다.
   */
  oauthLogin: (
    code: string,
    provider: 'google' | 'naver' | null,
  ) => Promise<void>;
  /** OAuth 신규 회원 추가 정보 등록 및 로그인 완료 */
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
  setNeedsThemeSelection: (val) => set({ needsThemeSelection: val }),
  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      const [[, userJson], [, token], [, lastMethod], [, tokenReceivedAt]] =
        await AsyncStorage.multiGet([
          'user',
          'accessToken',
          LAST_LOGIN_METHOD_KEY,
          ACCESS_TOKEN_RECEIVED_AT_KEY,
        ]);

      // 토큰은 저장소에만 둔다. axios.defaults.headers.common에도 심어 두면
      // 요청 인터셉터의 최신 토큰 조회가 건너뛰어져 만료분이 그대로 나간다
      // (axios는 인터셉터보다 먼저 common 헤더를 config에 병합한다).
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
        ]);
        observeAccessToken(accessToken, receivedAtMs);

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
        // 소셜 가입도 로그인 수단이 확정된 순간이다. 기록하지 않으면 신규 가입자만
        // 다음 방문에 '마지막 사용' 표시를 받지 못한다.
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

  clearSession: async (options) => {
    const forgetLoginMethod = options?.forgetLoginMethod ?? false;

    set({ user: null, ...(forgetLoginMethod ? { lastLoginMethod: null } : {}) });
    await AsyncStorage.multiRemove(
      forgetLoginMethod
        ? [...LOGOUT_CLEARED_KEYS, LAST_LOGIN_METHOD_KEY]
        : LOGOUT_CLEARED_KEYS,
    );
    // 서버 상태 캐시는 계정에 묶여 있다. 남겨 두면 같은 기기에서 다른 계정으로
    // 로그인했을 때 이전 사용자의 프로필·일정이 잠시 그대로 그려진다.
    queryClient.clear();
    // 소셜 제공자 세션도 함께 끊는다. 남겨 두면 다음 로그인에서 계정을 바꿀 수 없다.
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
      // 서버 정리에 실패해도 로컬 세션은 반드시 끊는다. 리프레시 토큰은 TTL로 만료된다.
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
