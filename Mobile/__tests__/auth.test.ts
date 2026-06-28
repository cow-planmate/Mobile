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
    await store.oauthLogin('mock-auth-code');

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
      age: 25,
      gender: 1,
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/oauth/complete'),
      {
        signupId: 'mock-signup-id',
        email: 'social@example.com',
        age: 25,
        gender: 1,
      }
    );

    expect(useAuthStore.getState().user).toEqual({
      userId: 456,
      nickname: '소셜가입완료',
      email: 'social@example.com',
    });
    expect(AsyncStorage.multiSet).toHaveBeenCalled();
  });
});
