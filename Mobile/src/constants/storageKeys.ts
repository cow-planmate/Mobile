/**
 * AsyncStorage 키 모음.
 *
 * 로그아웃 시 무엇을 지워야 하는지가 한곳에 모여 있어야, 새 키를 추가했을 때
 * 정리 대상에서 빠지는 실수를 막을 수 있다.
 */

export const ACCESS_TOKEN_RECEIVED_AT_KEY = 'accessTokenReceivedAt';

export const AUTH_STORAGE_KEYS = [
  'user',
  'accessToken',
  'refreshToken',
  ACCESS_TOKEN_RECEIVED_AT_KEY,
];

/**
 * 마지막으로 로그인에 성공한 수단. 로그인 화면에 '마지막 사용' 표시를 하는
 * 데 쓴다. 로그아웃해도 다음에 같은 수단을 더 쉽게 찾도록 지우지 않는다.
 */
export const LAST_LOGIN_METHOD_KEY = 'lastLoginMethod';

/** FCM 기기 토큰과 중복 전송 방지 표시 */
export const FCM_STORAGE_KEYS = ['fcmToken', 'lastSyncedFcmToken'];

/**
 * 로그아웃 시 제거 대상.
 *
 * 서버는 FCM 토큰을 User 엔티티에 저장한다(토큰↔사용자 1:1). 동기화 표시가
 * 기기에 남아 있으면 같은 기기에서 계정을 바꿔 로그인할 때 "이미 동기화됨"으로
 * 판정돼 새 사용자에게 토큰이 등록되지 않는다.
 */
export const LOGOUT_CLEARED_KEYS = [...AUTH_STORAGE_KEYS, ...FCM_STORAGE_KEYS];
