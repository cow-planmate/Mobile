import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../axiosConfig';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

const mockClearSession = jest.fn(() => Promise.resolve());

jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: { getState: () => ({ clearSession: mockClearSession }) },
}));

const mockedStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const responseHandler = (axios.interceptors as any).response.handlers[0]
  .rejected;

const make401 = () =>
  ({
    config: { url: '/api/user/profile', headers: {} },
    response: { status: 401, data: { code: 'AUTH_002', message: '' } },
  } as unknown as AxiosError);

describe('토큰 갱신 실패 처리', () => {
  let postSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedStorage.getItem.mockImplementation(key =>
      Promise.resolve(key === 'refreshToken' ? 'stored-refresh-token' : null),
    );
    postSpy = jest.spyOn(axios, 'post');
  });

  afterEach(() => {
    postSpy.mockRestore();
  });

  it('네트워크가 끊겨 갱신하지 못하면 로그인을 유지한다', async () => {
    postSpy.mockRejectedValueOnce(
      Object.assign(new Error('Network Error'), { isAxiosError: true }),
    );

    const error = make401();
    await expect(responseHandler(error)).rejects.toBe(error);
    expect(mockClearSession).not.toHaveBeenCalled();
  });

  it('서버 오류(5xx)로 갱신하지 못해도 로그인을 유지한다', async () => {
    postSpy.mockRejectedValueOnce({ response: { status: 503 } });

    const error = make401();
    await expect(responseHandler(error)).rejects.toBe(error);
    expect(mockClearSession).not.toHaveBeenCalled();
  });

  it.each([401, 403, 404])(
    '서버가 갱신 토큰을 %s로 거절하면 로그아웃한다',
    async status => {
      postSpy.mockRejectedValueOnce({ response: { status } });

      const error = make401();
      await expect(responseHandler(error)).rejects.toBe(error);
      expect(mockClearSession).toHaveBeenCalledTimes(1);
    },
  );

  it('저장된 갱신 토큰이 없으면 로그아웃한다', async () => {
    mockedStorage.getItem.mockResolvedValue(null);

    const error = make401();
    await expect(responseHandler(error)).rejects.toBe(error);
    expect(postSpy).not.toHaveBeenCalled();
    expect(mockClearSession).toHaveBeenCalledTimes(1);
  });
});
