import { useAuthStore } from '../src/store/useAuthStore';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@react-native-async-storage/async-storage', () => ({
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
        nickname: '소셜가입자',
      },
    };
    
    const mockProfileResponse = {
      data: {
        userId: 123,
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockExchangeResponse);
    mockedAxios.get.mockResolvedValueOnce(mockProfileResponse);

    const store = useAuthStore.getState();
    await store.oauthLogin('mock-auth-code', 'google');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/oauth/exchange'),
      null,
      expect.any(Object)
    );
    
    expect(useAuthStore.getState().user).toEqual({
      userId: 123,
      nickname: '소셜가입자',
      email: '',
    });
    expect(AsyncStorage.multiSet).toHaveBeenCalled();
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

  it('should throw error when login response fails', async () => {
    const mockFailedResponse = {
      data: {
        loginSuccess: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockFailedResponse);

    const store = useAuthStore.getState();
    await expect(store.login('user@example.com', 'wrongpassword')).rejects.toThrow(
      '이메일 또는 비밀번호가 올바르지 않습니다.'
    );
  });
});
