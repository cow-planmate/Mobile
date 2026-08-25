import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ensureFreshAccessToken,
  observeAccessToken,
} from '../axiosConfig';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

const mockedStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const interceptors = axios.interceptors as any;
const requestHandler = interceptors.request.handlers[0].fulfilled;
const responseHandler = interceptors.response.handlers[0].rejected;

const makeConfig = (url: string) =>
  ({ url, headers: {} } as unknown as InternalAxiosRequestConfig);

const make401 = (url: string, code: string) =>
  ({
    config: { url, headers: {} },
    response: { status: 401, data: { code, message: '' } },
  } as unknown as AxiosError);

const makeToken = (payload: object) => {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value), 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/[=]+$/, '');

  return `${encode({ alg: 'RS256' })}.${encode(payload)}.signature`;
};

describe('인증 없이 호출하는 경로의 토큰 처리', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    observeAccessToken('invalid-token');
  });

  it.each(['/api/oauth/exchange', '/api/oauth/complete'])(
    '%s 요청에는 저장된 토큰을 붙이지 않는다',
    async path => {
      mockedStorage.getItem.mockResolvedValue('stored-access-token');

      const config = await requestHandler(
        makeConfig(`https://planmate.example/${path}`),
      );

      expect(config.headers.Authorization).toBeUndefined();
    },
  );

  it.each(['/api/auth/register', '/api/auth/password/email'])(
    '로그아웃 상태 전용 경로 %s 에도 토큰을 붙이지 않는다',
    async path => {
      mockedStorage.getItem.mockResolvedValue('stored-access-token');

      const config = await requestHandler(
        makeConfig(`https://planmate.example${path}`),
      );

      expect(config.headers.Authorization).toBeUndefined();
    },
  );

  it.each([
    '/api/user/profile?next=/api/auth/login',
    '/api/auth/login-history',
  ])('공개 경로 문자열이 포함된 보호 경로 %s에는 토큰을 붙인다', async path => {
    mockedStorage.getItem.mockResolvedValue('stored-access-token');

    const config = await requestHandler(makeConfig(path));

    expect(config.headers.Authorization).toBe('Bearer stored-access-token');
  });

  it('인증이 필요한 경로에는 그대로 토큰을 붙인다', async () => {
    mockedStorage.getItem.mockResolvedValue('stored-access-token');

    const config = await requestHandler(makeConfig('/api/user/profile'));

    expect(config.headers.Authorization).toBe('Bearer stored-access-token');
  });

  it('OAuth 교환의 401 AUTH_001은 토큰 재발급을 유발하지 않는다', async () => {
    const error = make401(
      'https://planmate.example/api/oauth/exchange',
      'AUTH_001',
    );

    await expect(responseHandler(error)).rejects.toBe(error);
    expect(mockedStorage.getItem).not.toHaveBeenCalledWith('refreshToken');
  });

  it('일반 API의 401 AUTH_001은 여전히 재발급을 시도한다', async () => {
    mockedStorage.getItem.mockResolvedValue(null);

    const error = make401('/api/user/profile', 'AUTH_001');

    await expect(responseHandler(error)).rejects.toBe(error);
    expect(mockedStorage.getItem).toHaveBeenCalledWith('refreshToken');
  });

  it('iat가 없는 새 토큰은 이전 토큰의 시계 보정값을 사용하지 않는다', async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    observeAccessToken(makeToken({ iat: nowSeconds + 3600 }));
    observeAccessToken('opaque-token');

    const accessToken = makeToken({ exp: nowSeconds + 600 });
    mockedStorage.getItem.mockImplementation(key =>
      Promise.resolve(key === 'accessToken' ? accessToken : null),
    );

    await expect(ensureFreshAccessToken()).resolves.toBe(accessToken);
    expect(mockedStorage.getItem).not.toHaveBeenCalledWith('refreshToken');
  });
});
