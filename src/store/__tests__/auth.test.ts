import { useAuthStore } from '../useAuthStore';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {
  getRefreshToken,
  setRefreshToken,
} from '../../utils/refreshTokenStorage';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

describe('Auth Store - Social Login & Complete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isLoading: false });
  });

  it('should successfully login via oauth exchange', async () => {
    const mockExchangeResponse = {
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: '3f6c1b7e-0000-4000-8000-000000000001',
        nickname: '소셜가입자',
        email: 'social@example.com',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockExchangeResponse);

    const store = useAuthStore.getState();
    await store.oauthLogin('mock-auth-code', 'google');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/oauth/exchange'),
      { code: 'mock-auth-code' }
    );
    expect(mockedAxios.get).not.toHaveBeenCalled();

    expect(useAuthStore.getState().user).toEqual({
      userId: '3f6c1b7e-0000-4000-8000-000000000001',
      nickname: '소셜가입자',
      email: 'social@example.com',
    });
    expect(AsyncStorage.multiSet).toHaveBeenCalled();
  });

  it('should reject oauth exchange response without userId', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        nickname: '소셜가입자',
      },
    });

    const store = useAuthStore.getState();

    await expect(store.oauthLogin('mock-auth-code', 'google')).rejects.toThrow(
      '서버 응답 형식이 올바르지 않아요.',
    );
    expect(useAuthStore.getState().user).toBeNull();
    expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
  });

  it('should successfully complete oauth registration', async () => {
    const mockCompleteResponse = {
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 456,
        nickname: '소셜가입완료',
        email: 'social@example.com',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockCompleteResponse);

    const store = useAuthStore.getState();
    await store.oauthComplete({
      signupId: 'mock-signup-id',
      email: 'social@example.com',
      birthdate: '1999-01-01',
      gender: 'MALE',
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/oauth/complete'),
      {
        signupId: 'mock-signup-id',
        email: 'social@example.com',
        birthdate: '1999-01-01',
        gender: 'MALE',
      }
    );

    expect(useAuthStore.getState().user).toEqual({
      userId: 456,
      nickname: '소셜가입완료',
      email: 'social@example.com',
    });
    expect(AsyncStorage.multiSet).toHaveBeenCalled();
  });

  it('should successfully login with email and password', async () => {
    const mockLoginResponse = {
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 789,
        nickname: '일반가입자',
        email: 'user@example.com',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockLoginResponse);

    const store = useAuthStore.getState();
    await store.login('user@example.com', 'password123');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/auth/login',
      {
        email: 'user@example.com',
        password: 'password123',
      },
      expect.any(Object)
    );

    expect(useAuthStore.getState().user).toEqual({
      userId: 789,
      nickname: '일반가입자',
      email: 'user@example.com',
    });
    expect(AsyncStorage.multiSet).toHaveBeenCalled();
  });

  it('should persist the access token receipt time', async () => {
    const receivedAtMs = 1_700_000_000_000;
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(receivedAtMs);
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 789,
        nickname: '일반가입자',
        email: 'user@example.com',
      },
    });

    try {
      await useAuthStore.getState().login('user@example.com', 'password123');

      expect(mockedAsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          ['accessTokenReceivedAt', String(receivedAtMs)],
        ]),
      );
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('갱신 토큰은 평문 저장소가 아니라 암호화 저장소에 둔다', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 789,
        nickname: '일반가입자',
        email: 'user@example.com',
      },
    });

    await useAuthStore.getState().login('user@example.com', 'password123');

    await expect(getRefreshToken()).resolves.toBe('mock-refresh-token');
    const savedKeys = mockedAsyncStorage.multiSet.mock.calls[0][0].map(
      ([key]) => key,
    );
    expect(savedKeys).not.toContain('refreshToken');
  });

  it('갱신 토큰을 저장하지 못하면 로그인을 끝내지 않는다', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 789,
        nickname: '일반가입자',
        email: 'user@example.com',
      },
    });
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(false);

    await expect(
      useAuthStore.getState().login('user@example.com', 'password123'),
    ).rejects.toThrow();
    expect(useAuthStore.getState().user).toBeNull();
    expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
  });

  it('세션을 비우면 암호화 저장소의 갱신 토큰도 지운다', async () => {
    await setRefreshToken('mock-refresh-token');

    await useAuthStore.getState().clearSession();

    await expect(getRefreshToken()).resolves.toBeNull();
  });

  it('로그아웃할 때 암호화 저장소의 갱신 토큰으로 서버 폐기를 요청한다', async () => {
    await setRefreshToken('mock-refresh-token');
    mockedAsyncStorage.getItem.mockImplementation(key =>
      Promise.resolve(key === 'accessToken' ? 'mock-access-token' : null),
    );
    mockedAxios.post.mockResolvedValueOnce({ status: 204 });

    await useAuthStore.getState().logout();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      { refreshToken: 'mock-refresh-token' },
      expect.any(Object),
    );
    await expect(getRefreshToken()).resolves.toBeNull();
    mockedAsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));
  });

  it('should throw error when login response fails', async () => {
    const mockFailedResponse = {
      data: {
        loginSuccess: false,
        message: '이메일 또는 비밀번호가 올바르지 않아요.',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockFailedResponse);

    const store = useAuthStore.getState();
    await expect(store.login('user@example.com', 'wrongpassword')).rejects.toThrow(
      '이메일 또는 비밀번호가 올바르지 않아요.'
    );
  });
});
