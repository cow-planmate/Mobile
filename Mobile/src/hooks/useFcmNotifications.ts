import { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import { FCM_STORAGE_KEYS } from '../constants/storageKeys';

interface UseFcmNotificationsParams {
  enabled: boolean;
  onInvitationPush?: () => void | Promise<void>;
}

const [FCM_TOKEN_STORAGE_KEY, FCM_TOKEN_LAST_SYNCED_KEY] = FCM_STORAGE_KEYS;
export const IS_FCM_RUNTIME_ENABLED = true;

const SEEN_MESSAGE_ID_LIMIT = 200;

const fcmLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

const getMessaging = () => {
  try {
    return require('@react-native-firebase/messaging').default;
  } catch (error) {
    fcmLog('[FCM] 메시징 네이티브 모듈을 사용할 수 없습니다:', error);
    return null;
  }
};

// 서버가 타입을 실어 보내면 그것을 우선 신뢰한다. 문구 매칭은 타입이 없는
// 메시지에 대한 폴백일 뿐이라, 범용 단어까지 넣으면 오탐이 늘어난다.
const INVITATION_DATA_KEYS = ['type', 'notificationType', 'eventType'];

const INVITATION_TYPES = new Set([
  'invite',
  'invitation',
  'request',
  'collaboration',
  'collaboration_request',
  'collaboration-request',
  'requestresult',
  'request_result',
]);

const INVITATION_HINTS = [
  'invite',
  'invitation',
  'collaboration',
  '초대',
  '편집 권한',
  '함께 편집',
];

const resolveDeclaredType = (data: Record<string, unknown>): string | null => {
  for (const key of INVITATION_DATA_KEYS) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().toLowerCase();
    }
  }
  return null;
};

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

export const isInvitationMessage = (remoteMessage: any): boolean => {
  const data = (remoteMessage?.data || {}) as Record<string, unknown>;

  const declaredType = resolveDeclaredType(data);
  if (declaredType) {
    return INVITATION_TYPES.has(declaredType);
  }

  const notificationText = [
    remoteMessage?.notification?.title,
    remoteMessage?.notification?.body,
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

const syncFcmToken = async (token: string, force: boolean = false) => {
  try {
    if (!force) {
      const lastSynced = await AsyncStorage.getItem(FCM_TOKEN_LAST_SYNCED_KEY);
      if (lastSynced === token) {
        return;
      }
    }

    await axios.post(resolveApiUrl('/api/user/fcm-token'), {
      fcmToken: token,
    });
    await AsyncStorage.setItem(FCM_TOKEN_LAST_SYNCED_KEY, token);
    fcmLog('[FCM] 백엔드로 토큰 동기화 완료');
  } catch (error) {
    fcmLog('[FCM] 토큰 동기화 실패 또는 건너뜀:', error);
  }
};

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
    // initialize가 await 중일 때 cleanup이 먼저 돌면 아직 등록되지 않은
    // 리스너를 해제할 수 없다. 취소 여부를 보고 등록 자체를 건너뛴다.
    let cancelled = false;

    const handleInvitationMessage = async (remoteMessage: any) => {
      const messageId = remoteMessage.messageId || undefined;
      if (messageId && seenMessageIdsRef.current.has(messageId)) {
        return;
      }

      if (messageId) {

        if (seenMessageIdsRef.current.size >= SEEN_MESSAGE_ID_LIMIT) {
          const oldest = seenMessageIdsRef.current.values().next().value;
          if (oldest !== undefined) {
            seenMessageIdsRef.current.delete(oldest);
          }
        }
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
        fcmLog('[FCM] 알림 권한이 거부되었습니다.');
        return;
      }
      if (cancelled) return;

      await messaging().registerDeviceForRemoteMessages();
      if (cancelled) return;

      const token = await messaging().getToken();
      if (cancelled) return;
      if (token) {
        await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        fcmLog('[FCM] 토큰 발급 완료');
        await syncFcmToken(token);
        if (cancelled) return;
      }

      unsubscribeOnTokenRefresh = messaging().onTokenRefresh(
        async (newToken: string) => {
          await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, newToken);
          fcmLog('[FCM] 토큰 갱신 완료');
          await syncFcmToken(newToken, true);
        },
      );

      unsubscribeOnMessage = messaging().onMessage(
        async (remoteMessage: any) => {
          fcmLog('[FCM] 포그라운드 메시지 수신:', remoteMessage.data);
          await handleInvitationMessage(remoteMessage);
        },
      );

      unsubscribeOnOpen = messaging().onNotificationOpenedApp(
        async (remoteMessage: any) => {
          await handleInvitationMessage(remoteMessage);
        },
      );

      // 리스너 등록 도중 취소되었으면 즉시 되돌린다.
      if (cancelled) {
        teardown();
        return;
      }

      const initialNotification = await messaging().getInitialNotification();
      if (cancelled) return;
      if (initialNotification) {
        await handleInvitationMessage(initialNotification);
      }
    };

    const teardown = () => {
      if (unsubscribeOnMessage) {
        unsubscribeOnMessage();
        unsubscribeOnMessage = undefined;
      }

      if (unsubscribeOnTokenRefresh) {
        unsubscribeOnTokenRefresh();
        unsubscribeOnTokenRefresh = undefined;
      }

      if (unsubscribeOnOpen) {
        unsubscribeOnOpen();
        unsubscribeOnOpen = undefined;
      }
    };

    initialize().catch(error => {
      fcmLog('[FCM] 초기화 실패:', error);
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, [enabled]);
}
