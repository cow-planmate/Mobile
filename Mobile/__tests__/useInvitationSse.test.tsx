import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockEventSource = jest.fn();

jest.mock('react-native-sse', () => ({
  __esModule: true,
  default: class {
    constructor(url: string, options: unknown) {
      mockEventSource(url, options);
    }
    addEventListener() {}
    removeAllEventListeners() {}
    close() {}
  },
}));

jest.mock('../src/api/axiosConfig', () => ({
  ensureFreshAccessToken: jest.fn(async () => 'token'),
  refreshAccessToken: jest.fn(async () => 'token'),
}));

jest.mock('../src/utils/apiUrl', () => ({
  resolveApiUrl: (path: string) => `https://example.test${path}`,
}));

import { useInvitationSse } from '../src/hooks/useInvitationSse';

function TestComponent() {
  useInvitationSse({ enabled: true, onInvitationEvent: () => {} });
  return null;
}

describe('useInvitationSse', () => {
  beforeEach(() => jest.clearAllMocks());

  /**
   * react-native-sse의 timeout은 무응답 감지가 아니라 요청 시점부터 도는 일회성
   * 타이머다. 값을 주면 멀쩡한 스트림도 그 시간마다 끊겨 그 사이의 알림이 사라진다.
   * 되살아나면 조용히 1분마다 재연결하는 상태로 돌아간다.
   */
  it('연결 수명을 서버에 맡기도록 timeout을 걸지 않는다', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(<TestComponent />);
      await Promise.resolve();
    });

    expect(mockEventSource).toHaveBeenCalledTimes(1);
    const [url, options] = mockEventSource.mock.calls[0];
    expect(url).toBe('https://example.test/api/sse/subscribe');
    expect((options as { timeout: number }).timeout).toBe(0);

    act(() => tree!.unmount());
  });
});
