import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import { useAuthStore } from '../useAuthStore';
import { queryClient } from '../../api/queryClient';
import {
  LAST_LOGIN_METHOD_KEY,
  LOGOUT_CLEARED_KEYS,
} from '../../constants/storageKeys';

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiRemove: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('../../api/axiosConfig', () => ({
  observeAccessToken: jest.fn(),
}));

describe('clearSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: { userId: 'u1', nickname: '민영', email: 'a@b.c' },
      lastLoginMethod: 'google',
    });
  });

  it('로그아웃은 토큰만 지우고 마지막 로그인 수단은 남긴다', async () => {
    await useAuthStore.getState().clearSession();

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(LOGOUT_CLEARED_KEYS);
    expect(useAuthStore.getState().user).toBeNull();

    expect(useAuthStore.getState().lastLoginMethod).toBe('google');
  });

  it('탈퇴는 마지막 로그인 수단까지 지운다', async () => {
    await useAuthStore.getState().clearSession({ forgetLoginMethod: true });

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      ...LOGOUT_CLEARED_KEYS,
      LAST_LOGIN_METHOD_KEY,
    ]);
    expect(useAuthStore.getState().lastLoginMethod).toBeNull();
  });

  it('제공자 세션이 남지 않도록 웹뷰 쿠키를 지운다', async () => {
    await useAuthStore.getState().clearSession();

    expect(CookieManager.clearAll).toHaveBeenCalled();
  });

  it('서버 상태 캐시를 비워 다음 계정에 이전 사용자 데이터가 남지 않게 한다', async () => {
    queryClient.setQueryData(['userProfile'], { name: '민영' });

    await useAuthStore.getState().clearSession();

    expect(queryClient.getQueryData(['userProfile'])).toBeUndefined();
  });
});
