import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

/**
 * 갱신 토큰 보관함. iOS Keychain·Android Keystore로 암호화해 둔다.
 *
 * 갱신 토큰은 오래 살아서, 평문 저장소(AsyncStorage)에 두면 루팅된 기기나
 * 백업에서 읽혀 계정을 그대로 빼앗길 수 있다. 접근 토큰은 15분이면 만료되고
 * 모든 요청마다 읽으므로 그대로 AsyncStorage에 둔다.
 */
const SERVICE = 'planmate.refreshToken';
const ACCOUNT = 'planmate';

// 예전에 평문으로 두던 자리. 옮기고 나면 비운다.
const LEGACY_KEY = 'refreshToken';

const OPTIONS = {
  service: SERVICE,
  // 잠금을 한 번 푼 뒤에는 백그라운드에서도 갱신할 수 있어야 한다.
  // 백업으로 다른 기기에 옮겨 가지 않도록 이 기기에만 묶는다.
  accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export async function getRefreshToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error('갱신 토큰을 읽지 못했어요:', error);
    return null;
  }
}

/** 저장에 실패하면 던진다. 갱신 토큰 없이 로그인을 끝내면 15분 뒤 말없이 로그아웃된다. */
export async function setRefreshToken(token: string): Promise<void> {
  const result = await Keychain.setGenericPassword(ACCOUNT, token, OPTIONS);
  if (!result) {
    throw new Error('갱신 토큰을 안전한 저장소에 저장하지 못했어요.');
  }
}

export async function clearRefreshToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch (error) {
    console.error('갱신 토큰을 지우지 못했어요:', error);
  }
}

/**
 * 평문 저장소에 남은 갱신 토큰을 암호화 저장소로 옮긴다. 앱을 켤 때마다 불러도 된다.
 *
 * 옮기기에 실패하면 원래 자리를 지우지 않는다 - 지우면 업데이트하자마자
 * 로그인이 풀린다. 다음 실행 때 다시 시도한다.
 */
export async function migrateLegacyRefreshToken(): Promise<void> {
  try {
    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (!legacy) return;

    // 이미 새 자리에 있으면 그쪽이 최신이다. 덮어쓰지 않는다.
    if (!(await getRefreshToken())) {
      await setRefreshToken(legacy);
    }
    await AsyncStorage.removeItem(LEGACY_KEY);
  } catch (error) {
    console.error('갱신 토큰을 옮기지 못했어요:', error);
  }
}
