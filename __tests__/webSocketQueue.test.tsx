import React from 'react';
import renderer, { act } from 'react-test-renderer';

let mockClient: any = null;
let mockClients: any[] = [];

// 전송 계층이 SockJS+STOMP에서 protobuf 소켓으로 바뀌었다. 큐 동작을 검증하는 데
// 필요한 표면(publish/deactivate)과 서버 이벤트 흉내만 갖춘 가짜를 쓴다.
jest.mock('../src/contexts/protoSyncClient', () => ({
  createProtoSyncClient: jest.fn().mockImplementation((options: any) => {
    const instance: any = {
      options,
      active: true,
      connected: false,
      publish: jest.fn(),
      deactivate: jest.fn(() => {
        instance.active = false;
        instance.connected = false;
      }),

      simulateConnect() {
        instance.connected = true;
        options.onConnect();
      },

      simulateSocketClose() {
        instance.connected = false;
        options.onDisconnect();
      },

      simulatePresence(users: any[] = []) {
        options.onPresence({ users });
      },

      simulateSync(body: any) {
        options.onSync(body);
      },
    };
    mockClient = instance;
    mockClients.push(instance);
    return instance;
  }),
}));

jest.mock('text-encoding', () => ({
  TextEncoder: function () {},
  TextDecoder: function () {},
}));

jest.mock('@env', () => ({ API_URL: 'http://localhost:8080' }), {
  virtual: true,
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('fake-token')),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/utils/apiUrl', () => ({
  resolveApiUrl: (p: string) => `http://localhost:8080${p}`,
}));

import {
  WebSocketProvider,
  useWebSocket,
} from '../src/contexts/WebSocketContext';

let ws: ReturnType<typeof useWebSocket>;

const Probe = () => {
  ws = useWebSocket();
  return null;
};

const PLAN_A = 'plan-aaaa';
const PLAN_B = 'plan-bbbb';

const mount = () => {
  act(() => {
    renderer.create(
      <WebSocketProvider>
        <Probe />
      </WebSocketProvider>,
    );
  });
};

const connectTo = async (planId: string) => {
  await act(async () => {
    ws.connect(planId);
  });
};

const send = (target: any = { blockId: 1 }) => {
  act(() => {
    ws.sendMessage('update', 'timetableplaceblock', target);
  });
};

const publishedBodies = () =>
  mockClient.publish.mock.calls.map((c: any[]) => JSON.parse(c[0].body));

beforeEach(() => {
  jest.useFakeTimers();
  mockClient = null;
  mockClients = [];
});

afterEach(() => {
  jest.useRealTimers();
});

describe('세션 매핑 확립 전 전송 큐 (F-7)', () => {
  it('CONNECTED만으로는 전송하지 않고 큐에 쌓는다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
    });
    send();

    expect(mockClient.publish).not.toHaveBeenCalled();
  });

  it('presence 수신 시 큐를 비운다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
    });
    send({ blockId: 7 });
    expect(mockClient.publish).not.toHaveBeenCalled();

    act(() => {
      mockClient.simulatePresence([]);
    });

    expect(mockClient.publish).toHaveBeenCalledTimes(1);
    const body = publishedBodies()[0];
    expect(body.entity).toBe('timetableplaceblock');
    expect(body.timeTablePlaceBlockDtos[0].blockId).toBe(7);
    expect(mockClient.publish.mock.calls[0][0].destination).toBe(
      `/app/${PLAN_A}`,
    );
  });

  it('presence가 오지 않아도 폴백 타이머로 큐를 비운다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
    });
    send();
    expect(mockClient.publish).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockClient.publish).toHaveBeenCalledTimes(1);
  });

  it('room 준비 후에는 즉시 전송한다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });
    mockClient.publish.mockClear();

    send({ blockId: 11 });
    expect(mockClient.publish).toHaveBeenCalledTimes(1);
  });

  it('소켓 절단 후 자동 재연결 시 presence를 다시 기다린다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });

    act(() => {
      mockClient.simulateSocketClose();
    });

    act(() => {
      mockClient.simulateConnect();
    });
    mockClient.publish.mockClear();

    send({ blockId: 55 });
    expect(mockClient.publish).not.toHaveBeenCalled();

    act(() => {
      mockClient.simulatePresence([]);
    });
    expect(mockClient.publish).toHaveBeenCalledTimes(1);
  });

  it('접속 시 plan update 핑을 보내지 않는다 (F-12)', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
      jest.advanceTimersByTime(3000);
    });

    const planPings = publishedBodies().filter(
      (b: any) => b.entity === 'plan',
    );
    expect(planPings).toHaveLength(0);
  });
});

describe('undo 페이로드 (F-16)', () => {
  it('undo는 entity 없이 action만 보낸다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });
    mockClient.publish.mockClear();

    act(() => {
      ws.sendMessage('undo', 'history', null);
    });

    expect(mockClient.publish).toHaveBeenCalledTimes(1);
    const call = mockClient.publish.mock.calls[0][0];
    expect(call.destination).toBe(`/app/${PLAN_A}`);
    expect(JSON.parse(call.body)).toEqual({ action: 'undo' });
  });

  it('room 준비 전 undo는 큐에 쌓였다가 flush된다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
    });
    act(() => {
      ws.sendMessage('undo', 'history', null);
    });
    expect(mockClient.publish).not.toHaveBeenCalled();

    act(() => {
      mockClient.simulatePresence([]);
    });
    expect(JSON.parse(mockClient.publish.mock.calls[0][0].body)).toEqual({
      action: 'undo',
    });
  });
});

describe('disconnect 시 큐 보존 (F-8)', () => {
  it('미전송분은 disconnect 후에도 남아 재연결 시 전송된다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
    });
    send({ blockId: 42 });

    act(() => {
      ws.disconnect();
    });

    await connectTo(PLAN_A);
    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });

    const bodies = publishedBodies();
    expect(bodies).toHaveLength(1);
    expect(bodies[0].timeTablePlaceBlockDtos[0].blockId).toBe(42);
  });

  it('다른 plan으로 옮기면 이전 방의 큐는 버린다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
    });
    send({ blockId: 99 });

    act(() => {
      ws.disconnect();
    });

    await connectTo(PLAN_B);
    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });

    expect(mockClient.publish).not.toHaveBeenCalled();
  });

  it('disconnect 뒤 도착한 지연 전송도 다른 plan으로 새지 않는다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });

    // 편집 직후 화면을 빠져나가 disconnect가 먼저 실행된 상황.
    act(() => {
      ws.disconnect();
    });
    send({ blockId: 123 });

    await connectTo(PLAN_B);
    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });

    expect(
      publishedBodies().filter((b: any) => b.entity === 'timetableplaceblock'),
    ).toHaveLength(0);
  });

  it('disconnect 뒤 지연 전송은 같은 plan에 다시 들어가면 전송된다', async () => {
    mount();
    await connectTo(PLAN_A);

    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });

    act(() => {
      ws.disconnect();
    });
    send({ blockId: 321 });

    await connectTo(PLAN_A);
    act(() => {
      mockClient.simulateConnect();
      mockClient.simulatePresence([]);
    });

    const bodies = publishedBodies().filter(
      (b: any) => b.entity === 'timetableplaceblock',
    );
    expect(bodies).toHaveLength(1);
    expect(bodies[0].timeTablePlaceBlockDtos[0].blockId).toBe(321);
  });

  it('이전 plan의 지연 close가 새 plan의 준비 상태를 지우지 않는다', async () => {
    mount();
    await connectTo(PLAN_A);
    const oldClient = mockClients[0];
    act(() => {
      oldClient.simulateConnect();
      oldClient.simulatePresence([]);
    });

    await connectTo(PLAN_B);
    const newClient = mockClients[1];
    act(() => {
      newClient.simulateConnect();
      newClient.simulatePresence([]);
      oldClient.simulateSocketClose();
    });
    newClient.publish.mockClear();

    send({ blockId: 777 });

    expect(newClient.publish).toHaveBeenCalledTimes(1);
  });
});
