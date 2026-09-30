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
  classifyInvitationPush,
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
  onInvitationPush?: (
    origin: 'arrived' | 'opened',
    kind: 'request' | 'result',
  ) => void;
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

  // 알림을 눌러 들어온 것과 앱을 보는 중에 온 것은 화면이 해야 할 일이 다르다.
  // 구분이 사라지면 눌러도 아무 일이 없던 예전 동작으로 조용히 되돌아간다.
  it('알림을 눌러 들어오면 opened로 알린다', async () => {
    const onInvitationPush = jest.fn();
    mockGetInitialNotification.mockResolvedValue({
      messageId: 'opened-1',
      notification: { title: '일정 초대', body: '민영님이 초대했습니다.' },
    });

    await act(async () => {
      ReactTestRenderer.create(
        <TestComponent enabled={true} onInvitationPush={onInvitationPush} />,
      );
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(onInvitationPush).toHaveBeenCalledWith('opened', 'request');
  });

  it('앱을 보는 중에 온 알림은 arrived로 알린다', async () => {
    const onInvitationPush = jest.fn();
    let foregroundHandler: ((message: unknown) => Promise<void>) | undefined;
    mockOnMessage.mockImplementation((handler: any) => {
      foregroundHandler = handler;
      return jest.fn();
    });

    await act(async () => {
      ReactTestRenderer.create(
        <TestComponent enabled={true} onInvitationPush={onInvitationPush} />,
      );
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    await act(async () => {
      await foregroundHandler?.({
        messageId: 'arrived-1',
        data: { type: 'INVITE' },
      });
    });

    expect(onInvitationPush).toHaveBeenCalledWith('arrived', 'request');
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

// Backend-v2가 FCM에 제목·본문만 실어 보내 data가 없다. 그래서 결과 알림은
// 서버가 고정 형식으로 만드는 문구로 잡는다 — 되살아나면 눌러도 무반응이 된다.
describe('classifyInvitationPush', () => {
  it('수락·거절 결과를 문구로 가려낸다', () => {
    expect(
      classifyInvitationPush({
        notification: {
          title: '요청 수락',
          body: "민영님이 '제주 여행' 관련 요청을 수락했습니다.",
        },
      }),
    ).toBe('result');
    expect(
      classifyInvitationPush({
        notification: {
          title: '요청 거절',
          body: "민영님이 '제주 여행' 관련 요청을 거절했습니다.",
        },
      }),
    ).toBe('result');
  });

  it('아직 답해야 하는 알림은 request로 남는다', () => {
    expect(
      classifyInvitationPush({
        notification: {
          title: '일정 초대',
          body: "민영님이 '제주 여행' 일정에 초대했습니다.",
        },
      }),
    ).toBe('request');
    expect(
      classifyInvitationPush({
        notification: {
          title: '편집 권한 요청',
          body: "민영님이 '제주 여행' 일정의 편집 권한을 요청했습니다.",
        },
      }),
    ).toBe('request');
  });

  it('서버가 타입을 실어 보내면 문구보다 그것을 믿는다', () => {
    expect(classifyInvitationPush({ data: { type: 'REQUEST_RESULT' } })).toBe(
      'result',
    );
    expect(classifyInvitationPush({ data: { type: 'INVITE' } })).toBe('request');
    expect(classifyInvitationPush({ data: { type: 'comment' } })).toBeNull();
  });
});
