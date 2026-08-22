
export const ACCESS_TOKEN_RECEIVED_AT_KEY = 'accessTokenReceivedAt';

export const AUTH_STORAGE_KEYS = [
  'user',
  'accessToken',
  'refreshToken',
  ACCESS_TOKEN_RECEIVED_AT_KEY,
];

export const LAST_LOGIN_METHOD_KEY = 'lastLoginMethod';
export const LAST_LOGIN_EMAIL_KEY = 'lastLoginEmail';

export const FCM_STORAGE_KEYS = ['fcmToken', 'lastSyncedFcmToken'];

// 알림 권한 거부 안내를 이미 보여줬는지. 기기 설정에 대한 안내라
// 계정과 무관하므로 로그아웃·탈퇴 시 정리 대상에 넣지 않는다.
export const FCM_PERMISSION_NOTICE_KEY = 'fcmPermissionNoticeShown';

export const LOGOUT_CLEARED_KEYS = [...AUTH_STORAGE_KEYS, ...FCM_STORAGE_KEYS];

// 탈퇴처럼 계정 흔적까지 지워야 하는 경우에만 추가로 비우는 키.
export const IDENTITY_CLEARED_KEYS = [
  LAST_LOGIN_METHOD_KEY,
  LAST_LOGIN_EMAIL_KEY,
];
