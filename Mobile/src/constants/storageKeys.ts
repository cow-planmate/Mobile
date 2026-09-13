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

// 일정 편집 화면에서 사용법을 권하는 말풍선을 치웠는지. 안내 자체는 물음표
// 단추로 언제든 다시 볼 수 있으므로 "봤는지"가 아니라 "권유를 치웠는지"만 남긴다.
// 계정이 아니라 기기에 남는다 - 로그아웃했다고 다시 권할 이유가 없다.
export const EDITOR_TUTORIAL_NUDGE_KEY = 'editorTutorialNudgeDismissed';

// 안내를 자동으로 띄우던 시절의 키. 그때 이미 다 본 사람에게 말풍선을 새로
// 들이밀지 않으려고 읽기만 하고, 새로 쓰지는 않는다.
export const EDITOR_COACHMARK_KEY = 'editorCoachmarkSeen';

export const LOGOUT_CLEARED_KEYS = [...AUTH_STORAGE_KEYS, ...FCM_STORAGE_KEYS];

// 탈퇴처럼 계정 흔적까지 지워야 하는 경우에만 추가로 비우는 키.
export const IDENTITY_CLEARED_KEYS = [
  LAST_LOGIN_METHOD_KEY,
  LAST_LOGIN_EMAIL_KEY,
];
