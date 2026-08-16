
export const ACCESS_TOKEN_RECEIVED_AT_KEY = 'accessTokenReceivedAt';

export const AUTH_STORAGE_KEYS = [
  'user',
  'accessToken',
  'refreshToken',
  ACCESS_TOKEN_RECEIVED_AT_KEY,
];

export const LAST_LOGIN_METHOD_KEY = 'lastLoginMethod';

export const FCM_STORAGE_KEYS = ['fcmToken', 'lastSyncedFcmToken'];

export const LOGOUT_CLEARED_KEYS = [...AUTH_STORAGE_KEYS, ...FCM_STORAGE_KEYS];
