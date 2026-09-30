import CookieManager from '@react-native-cookies/cookies';

export async function clearWebViewCookies(): Promise<void> {
  try {
    await CookieManager.clearAll();
  } catch (error) {
    console.warn('웹뷰 쿠키 정리 실패:', error);
  }
}
