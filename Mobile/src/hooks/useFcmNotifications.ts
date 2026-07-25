import { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL as API_URL_ENV } from '@env';

interface UseFcmNotificationsParams {
  enabled: boolean;
  onInvitationPush?: () => void | Promise<void>;
}

const FCM_TOKEN_STORAGE_KEY = 'fcmToken';
const FCM_TOKEN_LAST_SYNCED_KEY = 'lastSyncedFcmToken';
export const IS_FCM_RUNTIME_ENABLED = true;

const getMessaging = () => {
  try {
    // Lazy require prevents startup crash before native module is linked.
    return require('@react-native-firebase/messaging').default;
  } catch (error) {
    console.log('[FCM] Messaging native module not available:', error);
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

const resolveFcmTokenRegisterUrl = (): string | null => {
  if (API_URL_ENV && API_URL_ENV.trim().length > 0) {
    const baseUrl = API_URL_ENV.trim().replace(/\/+$/, '');
    return `${baseUrl}/api/user/fcm-token`;
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
    console.log('[FCM] Token synced to backend');
  } catch (error) {
    console.log('[FCM] Token sync skipped/failed:', error);
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
        console.log('[FCM] Notification permission denied');
        return;
      }

      await messaging().registerDeviceForRemoteMessages();

      const token = await messaging().getToken();
      if (token) {
        await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        console.log('[FCM] Token acquired');
        await syncFcmToken(token);
      }

      unsubscribeOnTokenRefresh = messaging().onTokenRefresh(
        async (newToken: string) => {
          await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, newToken);
          console.log('[FCM] Token refreshed');
          await syncFcmToken(newToken, true);
        },
      );

      unsubscribeOnMessage = messaging().onMessage(
        async (remoteMessage: any) => {
          console.log('[FCM] Foreground message received', remoteMessage.data);
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
      console.log('[FCM] Initialization failed:', error);
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

