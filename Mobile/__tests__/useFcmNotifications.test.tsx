import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import axios from 'axios';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFcmNotifications,
  isInvitationMessage,
} from '../src/hooks/useFcmNotifications';

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

describe('isInvitationMessage', () => {
  it('서버가 보낸 타입을 우선 신뢰한다', () => {
    expect(isInvitationMessage({ data: { type: 'INVITE' } })).toBe(true);
    expect(isInvitationMessage({ data: { type: 'REQUEST' } })).toBe(true);
    expect(isInvitationMessage({ data: { notificationType: 'comment' } })).toBe(
      false,
    );
  });

  it('타입이 있으면 문구는 보지 않는다', () => {
    expect(
      isInvitationMessage({
        data: { type: 'comment' },
        notification: { title: '초대', body: '초대가 도착했습니다' },
      }),
    ).toBe(false);
  });

  it('타입이 없으면 문구로 판별한다', () => {
    expect(
      isInvitationMessage({
        data: {},
        notification: { title: '여행 초대', body: '함께 편집해요' },
      }),
    ).toBe(true);
  });

  it('범용 단어만 있는 알림은 초대로 보지 않는다', () => {
    expect(
      isInvitationMessage({
        data: {},
        notification: { title: '댓글', body: '답변 요청이 등록되었습니다' },
      }),
    ).toBe(false);
  });
});

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

    await act(async () => {
      renderer.update(
        <TestComponent enabled={true} onInvitationPush={() => {}} />,
      );
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(mockGetToken).toHaveBeenCalledTimes(1);
  });

  it('초기화 도중 해제되면 리스너를 남기지 않는다', async () => {
    const unsubscribeMessage = jest.fn();
    const unsubscribeTokenRefresh = jest.fn();
    const unsubscribeOpen = jest.fn();
    mockOnMessage.mockReturnValue(unsubscribeMessage);
    mockOnTokenRefresh.mockReturnValue(unsubscribeTokenRefresh);
    mockOnNotificationOpenedApp.mockReturnValue(unsubscribeOpen);

    // getToken이 늦게 끝나는 동안 cleanup이 먼저 실행되는 상황을 만든다.
    let releaseToken: (value: string) => void = () => {};
    mockGetToken.mockReturnValue(
      new Promise<string>(resolve => {
        releaseToken = resolve;
      }),
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <TestComponent enabled={true} onInvitationPush={jest.fn()} />,
      );
    });

    await act(async () => {
      renderer.unmount();
    });

    await act(async () => {
      releaseToken('late-token');
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // 취소된 초기화는 리스너를 등록하지 않거나, 등록했다면 즉시 해제해야 한다.
    expect(mockOnMessage.mock.calls.length).toBe(unsubscribeMessage.mock.calls.length);
    expect(mockOnTokenRefresh.mock.calls.length).toBe(
      unsubscribeTokenRefresh.mock.calls.length,
    );
    expect(mockOnNotificationOpenedApp.mock.calls.length).toBe(
      unsubscribeOpen.mock.calls.length,
    );
  });
});
