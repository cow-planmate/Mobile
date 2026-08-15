import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../axiosConfig';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

const mockedStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// axiosConfig는 전역 axios 인스턴스에 인터셉터를 등록한다. 실제 요청을 보내지
// 않고 등록된 핸들러만 직접 호출해 경로 분기를 검증한다.
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

describe('OAuth 경로의 토큰 처리', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 서버 SecurityWhitelist에서 permitAll인 경로다. 지난 세션의 만료 토큰이
  // 붙으면 서버가 그 토큰을 먼저 걸러 401을 준다.
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

  it('인증이 필요한 경로에는 그대로 토큰을 붙인다', async () => {
    mockedStorage.getItem.mockResolvedValue('stored-access-token');

    const config = await requestHandler(makeConfig('/api/user/profile'));

    expect(config.headers.Authorization).toBe('Bearer stored-access-token');
  });

  // exchange의 AUTH_001은 일회용 code가 만료·소진됐다는 뜻이다. 내 토큰이
  // 만료된 것으로 오인하면 재발급과 재요청이 따라붙고 세션까지 정리된다.
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
});
