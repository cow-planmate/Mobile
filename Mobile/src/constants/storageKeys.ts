
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

export const LOGOUT_CLEARED_KEYS = [...AUTH_STORAGE_KEYS, ...FCM_STORAGE_KEYS];

// 탈퇴처럼 계정 흔적까지 지워야 하는 경우에만 추가로 비우는 키.
export const IDENTITY_CLEARED_KEYS = [
  LAST_LOGIN_METHOD_KEY,
  LAST_LOGIN_EMAIL_KEY,
];
