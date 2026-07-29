import { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL as API_URL_ENV } from '@env';

/** FCM 푸시 알림 훅 파라미터 인터페이스 */
interface UseFcmNotificationsParams {
  enabled: boolean;
  onInvitationPush?: () => void | Promise<void>;
}

const FCM_TOKEN_STORAGE_KEY = 'fcmToken';
const FCM_TOKEN_LAST_SYNCED_KEY = 'lastSyncedFcmToken';
export const IS_FCM_RUNTIME_ENABLED = true;

/**
 * FCM 모듈 지연 로드 (앱 기동 시 네이티브 모듈 미연결로 인한 크래시 방지)
 */
const getMessaging = () => {
  try {
    return require('@react-native-firebase/messaging').default;
  } catch (error) {
    console.log('[FCM] 메시징 네이티브 모듈을 사용할 수 없습니다:', error);
    return null;
  }
};

const INVITATION_HINTS = [
  'invite',
  'invitation',
  'collaboration',
  '초대',
  '요청',
  '수락',
  '거절',
];

/** FCM 토큰 등록 엔드포인트 URL 생성 */
const resolveFcmTokenRegisterUrl = (): string | null => {
  if (API_URL_ENV && API_URL_ENV.trim().length > 0) {
    const baseUrl = API_URL_ENV.trim().replace(/\/+$/, '');
    return `${baseUrl}/api/user/fcm-token`;
  }
  return null;
};

/** Android 13(API 33) 이상 알림 권한 요청 */
const requestAndroidNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version < 33) {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

/** 초대 관련 푸시 메시지 여부 판단 */
const isInvitationMessage = (remoteMessage: any): boolean => {
  const data = remoteMessage.data || {};
  const notificationText = [
    remoteMessage.notification?.title,
    remoteMessage.notification?.body,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const joined = Object.values(data)
    .join(' ')
    .toLowerCase()
    .concat(' ', notificationText);

  return INVITATION_HINTS.some((hint: string) => joined.includes(hint));
};

/** FCM 토큰 백엔드 동기화 */
const syncFcmToken = async (token: string, force: boolean = false) => {
  const endpoint = resolveFcmTokenRegisterUrl();
  if (!endpoint) {
    return;
  }

  try {
    if (!force) {
      const lastSynced = await AsyncStorage.getItem(FCM_TOKEN_LAST_SYNCED_KEY);
      if (lastSynced === token) {
        return;
      }
    }

    await axios.post(endpoint, {
      fcmToken: token,
    });
    await AsyncStorage.setItem(FCM_TOKEN_LAST_SYNCED_KEY, token);
    console.log('[FCM] 백엔드로 토큰 동기화 완료');
  } catch (error) {
    console.log('[FCM] 토큰 동기화 실패 또는 건너뜀:', error);
  }
};

/**
 * FCM 푸시 알림 수신 및 초대 수신 이벤트를 처리하는 커스텀 훅
 */
export function useFcmNotifications({
  enabled,
  onInvitationPush,
}: UseFcmNotificationsParams) {
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const onInvitationPushRef = useRef(onInvitationPush);

  useEffect(() => {
    onInvitationPushRef.current = onInvitationPush;
  }, [onInvitationPush]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeOnTokenRefresh: (() => void) | undefined;
    let unsubscribeOnOpen: (() => void) | undefined;

    const handleInvitationMessage = async (remoteMessage: any) => {
      const messageId = remoteMessage.messageId || undefined;
      if (messageId && seenMessageIdsRef.current.has(messageId)) {
        return;
      }

      if (messageId) {
        seenMessageIdsRef.current.add(messageId);
      }

      const callback = onInvitationPushRef.current;
      if (!callback) {
        return;
      }

      if (isInvitationMessage(remoteMessage)) {
        await callback();
      }
    };

    const initialize = async () => {
      const messaging = getMessaging();
      if (!messaging) {
        return;
      }

      const permissionGranted = await requestAndroidNotificationPermission();
      if (!permissionGranted) {
        console.log('[FCM] 알림 권한이 거부되었습니다.');
        return;
      }

      await messaging().registerDeviceForRemoteMessages();

      const token = await messaging().getToken();
      if (token) {
        await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        console.log('[FCM] 토큰 발급 완료');
        await syncFcmToken(token);
      }

      unsubscribeOnTokenRefresh = messaging().onTokenRefresh(
        async (newToken: string) => {
          await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, newToken);
          console.log('[FCM] 토큰 갱신 완료');
          await syncFcmToken(newToken, true);
        },
      );

      unsubscribeOnMessage = messaging().onMessage(
        async (remoteMessage: any) => {
          console.log('[FCM] 포그라운드 메시지 수신:', remoteMessage.data);
          await handleInvitationMessage(remoteMessage);
        },
      );

      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        await handleInvitationMessage(initialNotification);
      }

      unsubscribeOnOpen = messaging().onNotificationOpenedApp(
        async (remoteMessage: any) => {
          await handleInvitationMessage(remoteMessage);
        },
      );
    };

    initialize().catch(error => {
      console.log('[FCM] 초기화 실패:', error);
    });

    return () => {
      if (unsubscribeOnMessage) {
        unsubscribeOnMessage();
      }

      if (unsubscribeOnTokenRefresh) {
        unsubscribeOnTokenRefresh();
      }

      if (unsubscribeOnOpen) {
        unsubscribeOnOpen();
      }
    };
  }, [enabled]);
}


