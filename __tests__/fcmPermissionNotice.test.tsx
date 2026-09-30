import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockToastShow = jest.fn();
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: (...args: any[]) => mockToastShow(...args) },
}));

// actual을 펼치면 네이티브 모듈까지 평가돼 터진다. 훅이 쓰는 것만 둔다.
jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 33 },
  PermissionsAndroid: {
    PERMISSIONS: { POST_NOTIFICATIONS: 'POST_NOTIFICATIONS' },
    RESULTS: { GRANTED: 'granted', DENIED: 'denied' },
    request: jest.fn(() => Promise.resolve('denied')),
  },
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    getToken: jest.fn(),
    onTokenRefresh: jest.fn(() => jest.fn()),
    onMessage: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    registerDeviceForRemoteMessages: jest.fn(),
  }),
}));

jest.mock('axios');

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFcmNotifications } from '../src/hooks/useFcmNotifications';
import { FCM_PERMISSION_NOTICE_KEY } from '../src/constants/storageKeys';

const Probe = () => {
  useFcmNotifications({ enabled: true });
  return null;
};

const mount = async () => {
  await act(async () => {
    ReactTestRenderer.create(<Probe />);
    await new Promise(resolve => setTimeout(resolve, 50));
  });
};

describe('알림 권한 거부 안내', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('권한을 거부하면 이유를 알려준다', async () => {
    await mount();

    expect(mockToastShow).toHaveBeenCalledTimes(1);
    expect(mockToastShow.mock.calls[0][0]).toMatchObject({
      text1: '알림이 꺼져 있어요',
    });
  });

  it('이미 안내한 기기에서는 다시 띄우지 않는다', async () => {
    await AsyncStorage.setItem(FCM_PERMISSION_NOTICE_KEY, '1');

    await mount();

    expect(mockToastShow).not.toHaveBeenCalled();
  });
});
