import { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  FCM_TOKEN_REGISTER_URL as FCM_TOKEN_REGISTER_URL_ENV,
  INVITATION_PUSH_TYPES as INVITATION_PUSH_TYPES_ENV,
} from '@env';

interface UseFcmNotificationsParams {
  enabled: boolean;
  onInvitationPush?: () => void | Promise<void>;
}

const FCM_TOKEN_STORAGE_KEY = 'fcmToken';
const FCM_TOKEN_REGISTER_URL = FCM_TOKEN_REGISTER_URL_ENV;
const INVITATION_PUSH_TYPES =
  INVITATION_PUSH_TYPES_ENV || 'invite,invitation,collaboration,초대';

const getMessaging = () => {
  try {
    // Lazy require prevents startup crash before native module is linked.
    return require('@react-native-firebase/messaging').default;
  } catch (error) {
    console.log('[FCM] Messaging native module not available:', error);
    return null;
  }
};

const INVITATION_HINTS: string[] = INVITATION_PUSH_TYPES
  .split(',')
  .map((token: string) => token.trim().toLowerCase())
  .filter(Boolean);

const resolveFcmTokenRegisterUrl = (): string | null => {
  if (FCM_TOKEN_REGISTER_URL && FCM_TOKEN_REGISTER_URL.trim().length > 0) {
    return FCM_TOKEN_REGISTER_URL.trim();
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

const syncFcmToken = async (token: string) => {
  const endpoint = resolveFcmTokenRegisterUrl();
  if (!endpoint) {
    return;
  }

  try {
    await axios.post(endpoint, {
      token,
      platform: Platform.OS,
    });
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

      if (!onInvitationPush) {
        return;
      }

      if (isInvitationMessage(remoteMessage)) {
        await onInvitationPush();
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
          await syncFcmToken(newToken);
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
  }, [enabled, onInvitationPush]);
}
