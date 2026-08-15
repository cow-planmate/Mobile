import CookieManager from '@react-native-cookies/cookies';

/**
 * 웹뷰가 보관 중인 쿠키를 모두 지운다.
 *
 * SNS 로그인은 앱 웹뷰에서 제공자 로그인 페이지를 띄운다. 제공자 세션 쿠키가 남아
 * 있으면 계정 선택 화면 없이 직전 계정으로만 다시 들어가진다. 백엔드는 구글 인가
 * 요청에 prompt=consent만 붙이고 select_account는 붙이지 않아, 앱이 쿠키를 지우지
 * 않으면 계정을 바꿀 방법이 없다. 탈퇴 계정은 같은 제공자로 다시 로그인하면 서버가
 * 복구하므로(OAuthLoginService.callback) 탈퇴 직후 한 번의 터치로 되살아난다.
 *
 * 로그인을 시작할 때가 아니라 세션을 끝낼 때 지운다. 매번 지우면 백엔드가 CSRF
 * 방어로 심는 oauth_state 쿠키와 경합할 뿐 아니라, 같은 계정을 계속 쓰는 사용자가
 * 로그인할 때마다 제공자 비밀번호를 다시 입력해야 한다.
 *
 * 삭제 실패는 로그아웃·탈퇴를 막지 않는다. 다음 정리 시점에 다시 시도된다.
 */
export async function clearWebViewCookies(): Promise<void> {
  try {
    await CookieManager.clearAll();
  } catch (error) {
    console.warn('웹뷰 쿠키 정리 실패:', error);
  }
}
