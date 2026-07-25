import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import axios from 'axios';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFcmNotifications } from '../src/hooks/useFcmNotifications';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockGetToken = jest.fn();
const mockOnTokenRefresh = jest.fn();
const mockOnMessage = jest.fn();
const mockGetInitialNotification = jest.fn();
const mockOnNotificationOpenedApp = jest.fn();
const mockRegisterDeviceForRemoteMessages = jest.fn();

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    getToken: mockGetToken,
    onTokenRefresh: mockOnTokenRefresh,
    onMessage: mockOnMessage,
    getInitialNotification: mockGetInitialNotification,
    onNotificationOpenedApp: mockOnNotificationOpenedApp,
    registerDeviceForRemoteMessages: mockRegisterDeviceForRemoteMessages,
  }),
}));

function TestComponent({
  enabled,
  onInvitationPush,
}: {
  enabled: boolean;
  onInvitationPush?: () => void;
}) {
  useFcmNotifications({ enabled, onInvitationPush });
  return null;
}

describe('useFcmNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    mockGetToken.mockResolvedValue('test-fcm-token');
    mockGetInitialNotification.mockResolvedValue(null);
    mockRegisterDeviceForRemoteMessages.mockResolvedValue(undefined);
    mockOnTokenRefresh.mockReturnValue(jest.fn());
    mockOnMessage.mockReturnValue(jest.fn());
    mockOnNotificationOpenedApp.mockReturnValue(jest.fn());
    mockedAxios.post.mockResolvedValue({ status: 204, data: '' });
  });

  it('should sync token on initial render when enabled', async () => {
    await act(async () => {
      ReactTestRenderer.create(
        <TestComponent enabled={true} onInvitationPush={jest.fn()} />,
      );
      // Wait for async promises inside initialize
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(mockGetToken).toHaveBeenCalled();
  });

  it('should deduplicate sync calls when component re-renders with new callback prop', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <TestComponent enabled={true} onInvitationPush={() => {}} />,
      );
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(mockGetToken).toHaveBeenCalledTimes(1);

    // Re-render with a new inline function instance
    await act(async () => {
      renderer.update(
        <TestComponent enabled={true} onInvitationPush={() => {}} />,
      );
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // getToken is only called during initialize on mount
    expect(mockGetToken).toHaveBeenCalledTimes(1);
  });
});
