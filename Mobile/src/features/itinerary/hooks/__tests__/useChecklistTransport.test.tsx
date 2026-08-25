import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockWs = {
  isConnected: true,
  roomId: 'plan-1' as string | null,
  sent: [] as Array<{ action: string; eventId?: string; target: any }>,
  listeners: new Set<(msg: any) => void>(),
};

const mockCreateChecklistItem = jest.fn();
const mockGetChecklist = jest.fn();

jest.mock('../../../../contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    isConnected: mockWs.isConnected,
    getCurrentRoomId: () => mockWs.roomId,
    sendMessage: (
      action: string,
      _targetName: string,
      target: any,
      eventId?: string,
    ) => {
      mockWs.sent.push({ action, target, eventId });
    },
    subscribeToMessages: (cb: (msg: any) => void) => mockWs.listeners.add(cb),
    unsubscribeFromMessages: (cb: (msg: any) => void) =>
      mockWs.listeners.delete(cb),
  }),
}));

jest.mock('../../../../api/checklist', () => ({
  ...jest.requireActual('../../../../api/checklist'),
  createChecklistItem: (...args: any[]) => mockCreateChecklistItem(...args),
  getChecklist: (...args: any[]) => mockGetChecklist(...args),
}));

import {
  ChecklistAckTimeoutError,
  checklistKeys,
  useCreateChecklistItem,
  usePlanChecklists,
} from '../useChecklistQueries';

const emit = (message: any) => {
  [...mockWs.listeners].forEach(listener => listener(message));
};

const tick = async ({ fakeTimers = false } = {}) => {
  await act(async () => {
    for (let i = 0; i < 5; i += 1) {
      await Promise.resolve();
      if (fakeTimers) {
        await jest.advanceTimersByTimeAsync(1);
      } else {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  });
};

const mounted: Array<() => void> = [];

const cleanupMounted = () => {
  while (mounted.length > 0) {
    mounted.pop()?.();
  }
};

const renderHookValue = <T,>(useHook: () => T) => {
  const holder: { current: T | null } = { current: null };

  const Probe = () => {
    holder.current = useHook();
    return null;
  };

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <Probe />
      </QueryClientProvider>,
    );
  });

  mounted.push(() => {
    act(() => {
      tree.unmount();
    });
    client.clear();
  });

  return { holder, client };
};

describe('공동 체크리스트 실시간 전송', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWs.isConnected = true;
    mockWs.roomId = 'plan-1';
    mockWs.sent = [];
    mockWs.listeners.clear();
    mockCreateChecklistItem.mockReset().mockResolvedValue(10);
    mockGetChecklist.mockReset().mockResolvedValue([]);
  });

  afterEach(() => {
    cleanupMounted();
    jest.useRealTimers();
  });

  it('다른 일정에 연결돼 있으면 실시간으로 보내지 않고 REST로 추가한다', async () => {
    mockWs.roomId = 'plan-other';
    const { holder } = renderHookValue(() =>
      useCreateChecklistItem('plan-1', 'shared'),
    );

    await act(async () => {
      await holder.current!.mutateAsync('여권');
    });

    expect(mockWs.sent).toHaveLength(0);
    expect(mockCreateChecklistItem).toHaveBeenCalledWith(
      'plan-1',
      'shared',
      '여권',
    );
  });

  it('브로드캐스트가 돌아오면 REST로 다시 보내지 않는다', async () => {
    const { holder } = renderHookValue(() =>
      useCreateChecklistItem('plan-1', 'shared'),
    );

    let pending: Promise<unknown> | undefined;
    act(() => {
      pending = holder.current!.mutateAsync('여권');
    });
    await tick({ fakeTimers: true });

    expect(mockWs.sent).toHaveLength(1);

    await act(async () => {
      emit({ eventId: mockWs.sent[0].eventId });
      await pending;
    });

    expect(mockCreateChecklistItem).not.toHaveBeenCalled();
  });

  it('브로드캐스트가 없으면 REST로 재전송하지 않고 실패로 끊는다', async () => {
    const { holder } = renderHookValue(() =>
      useCreateChecklistItem('plan-1', 'shared'),
    );

    let caught: unknown;
    let pending: Promise<unknown> | undefined;
    act(() => {
      pending = holder.current!.mutateAsync('여권').catch(e => {
        caught = e;
      });
    });
    await tick({ fakeTimers: true });

    expect(mockWs.sent).toHaveLength(1);

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await pending;
    });

    expect(mockCreateChecklistItem).not.toHaveBeenCalled();
    expect(caught).toBeInstanceOf(ChecklistAckTimeoutError);
  });

  it('새 항목의 sortOrder는 개수가 아니라 최댓값 다음 번호를 쓴다', async () => {
    const { holder, client } = renderHookValue(() =>
      useCreateChecklistItem('plan-1', 'shared'),
    );

    client.setQueryData(checklistKeys.scope('plan-1', 'shared'), [
      { itemId: 2, content: '충전기', isChecked: false, sortOrder: 1 },
      { itemId: 3, content: '상비약', isChecked: false, sortOrder: 2 },
    ]);

    act(() => {
      void holder.current!.mutateAsync('여권').catch(() => undefined);
    });
    await tick({ fakeTimers: true });

    expect(mockWs.sent[0].target[0].sortOrder).toBe(3);
  });
});

describe('공동 체크리스트 이벤트 수신', () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockWs.isConnected = true;
    mockWs.roomId = 'plan-1';
    mockWs.listeners.clear();
    mockGetChecklist.mockReset().mockResolvedValue([
      { itemId: 1, content: '여권', isChecked: false, sortOrder: 0 },
    ]);
  });

  afterEach(() => {
    cleanupMounted();
  });

  it('수신한 변경을 반영하되 재조회하지 않는다', async () => {
    const { holder } = renderHookValue(() =>
      usePlanChecklists('plan-1', true),
    );

    await tick();

    const fetchesAfterLoad = mockGetChecklist.mock.calls.length;

    await act(async () => {
      emit({
        target: 'planchecklistitem',
        eventId: 'other-device',
        data: {
          action: 'update',
          planChecklistItemDtos: [
            {
              checklistItemId: 1,
              planId: 'plan-1',
              content: '여권',
              isChecked: true,
              sortOrder: 0,
            },
          ],
        },
      });
    });
    await tick();

    expect(holder.current!.sharedItems[0].isChecked).toBe(true);

    expect(mockGetChecklist.mock.calls.length).toBe(fetchesAfterLoad);
  });

  it('planId 대소문자가 달라도 같은 일정의 이벤트로 본다', async () => {
    const { holder } = renderHookValue(() =>
      usePlanChecklists('plan-1', true),
    );

    await tick();

    await act(async () => {
      emit({
        target: 'planchecklistitem',
        data: {
          action: 'delete',
          planChecklistItemDtos: [
            { checklistItemId: 1, planId: 'PLAN-1' },
          ],
        },
      });
    });
    await tick();

    expect(holder.current!.sharedItems).toHaveLength(0);
  });
});
