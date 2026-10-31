import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {
  clearRefreshToken,
  getRefreshToken,
  migrateLegacyRefreshToken,
  setRefreshToken,
} from '../refreshTokenStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const mockedStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('갱신 토큰 보관함', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearRefreshToken();
    mockedStorage.getItem.mockResolvedValue(null);
  });

  it('저장한 토큰을 그대로 돌려주고, 지우면 비운다', async () => {
    await setRefreshToken('token-1');
    await expect(getRefreshToken()).resolves.toBe('token-1');

    await clearRefreshToken();
    await expect(getRefreshToken()).resolves.toBeNull();
  });

  it('이 기기에서만 열리는 접근 권한으로 저장한다', async () => {
    await setRefreshToken('token-1');
    expect(mockedKeychain.setGenericPassword).toHaveBeenCalledWith(
      expect.any(String),
      'token-1',
      expect.objectContaining({
        accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      }),
    );
  });

  it('저장에 실패하면 던진다', async () => {
    mockedKeychain.setGenericPassword.mockResolvedValueOnce(false);
    await expect(setRefreshToken('token-1')).rejects.toThrow();
  });

  it('읽다가 오류가 나면 없는 것으로 본다', async () => {
    mockedKeychain.getGenericPassword.mockRejectedValueOnce(new Error('boom'));
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(getRefreshToken()).resolves.toBeNull();
  });

  describe('업데이트 전 평문 토큰 옮기기', () => {
    it('평문 토큰을 암호화 저장소로 옮기고 원래 자리를 지운다', async () => {
      mockedStorage.getItem.mockResolvedValue('legacy-token');

      await migrateLegacyRefreshToken();

      await expect(getRefreshToken()).resolves.toBe('legacy-token');
      expect(mockedStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('평문 토큰이 없으면 아무것도 하지 않는다', async () => {
      await migrateLegacyRefreshToken();

      expect(mockedKeychain.setGenericPassword).not.toHaveBeenCalled();
      expect(mockedStorage.removeItem).not.toHaveBeenCalled();
    });

    it('이미 새 자리에 토큰이 있으면 덮어쓰지 않고 평문만 지운다', async () => {
      await setRefreshToken('current-token');
      mockedKeychain.setGenericPassword.mockClear();
      mockedStorage.getItem.mockResolvedValue('legacy-token');

      await migrateLegacyRefreshToken();

      await expect(getRefreshToken()).resolves.toBe('current-token');
      expect(mockedKeychain.setGenericPassword).not.toHaveBeenCalled();
      expect(mockedStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('옮기기에 실패하면 평문 토큰을 남겨 로그인이 풀리지 않게 한다', async () => {
      mockedStorage.getItem.mockResolvedValue('legacy-token');
      mockedKeychain.setGenericPassword.mockResolvedValueOnce(false);
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      await migrateLegacyRefreshToken();

      expect(mockedStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});
