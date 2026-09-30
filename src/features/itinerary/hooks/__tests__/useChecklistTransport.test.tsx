import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockWs = {
  isConnected: true,
  roomId: 'plan-1' as string | null,
  sendMessage: jest.fn(),
  listeners: new Set<(msg: any) => void>(),
};

const mockCreateChecklistItem = jest.fn();
const mockDeleteChecklistItem = jest.fn();
const mockEditChecklistItemChecked = jest.fn();
const mockEditChecklistItemContent = jest.fn();
const mockGetChecklist = jest.fn();
const mockReorderChecklistItems = jest.fn();

jest.mock('../../../../contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    isConnected: mockWs.isConnected,
    getCurrentRoomId: () => mockWs.roomId,
    sendMessage: mockWs.sendMessage,
    subscribeToMessages: (cb: (msg: any) => void) => mockWs.listeners.add(cb),
    unsubscribeFromMessages: (cb: (msg: any) => void) =>
      mockWs.listeners.delete(cb),
  }),
}));

jest.mock('../../../../api/checklist', () => ({
  ...jest.requireActual('../../../../api/checklist'),
  createChecklistItem: (...args: any[]) => mockCreateChecklistItem(...args),
  deleteChecklistItem: (...args: any[]) => mockDeleteChecklistItem(...args),
  editChecklistItemChecked: (...args: any[]) =>
    mockEditChecklistItemChecked(...args),
  editChecklistItemContent: (...args: any[]) =>
    mockEditChecklistItemContent(...args),
  getChecklist: (...args: any[]) => mockGetChecklist(...args),
  reorderChecklistItems: (...args: any[]) =>
    mockReorderChecklistItems(...args),
}));

import {
  checklistKeys,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useEditChecklistItemContent,
  usePlanChecklists,
  useReorderChecklistItems,
  useToggleChecklistItem,
} from '../useChecklistQueries';

const emit = (message: any) => {
  [...mockWs.listeners].forEach(listener => listener(message));
};

const tick = async () => {
  await act(async () => {
    for (let i = 0; i < 5; i += 1) {
      await Promise.resolve();
      await jest.advanceTimersByTimeAsync(1);
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

describe('공유 체크리스트 저장 경로', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWs.isConnected = true;
    mockWs.roomId = 'plan-1';
    mockWs.sendMessage.mockReset();
    mockWs.listeners.clear();
    mockCreateChecklistItem.mockReset().mockResolvedValue(10);
    mockDeleteChecklistItem.mockReset().mockResolvedValue(undefined);
    mockEditChecklistItemChecked.mockReset().mockResolvedValue(undefined);
    mockEditChecklistItemContent.mockReset().mockResolvedValue(undefined);
    mockGetChecklist.mockReset().mockResolvedValue([]);
    mockReorderChecklistItems.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanupMounted();
    jest.useRealTimers();
  });

  it('실시간 연결 중에도 모든 변경을 필드별 REST API로 저장한다', async () => {
    const { holder, client } = renderHookValue(() => ({
      create: useCreateChecklistItem('plan-1', 'shared'),
      edit: useEditChecklistItemContent('plan-1', 'shared'),
      toggle: useToggleChecklistItem('plan-1', 'shared'),
      remove: useDeleteChecklistItem('plan-1', 'shared'),
      reorder: useReorderChecklistItems('plan-1', 'shared'),
    }));
    client.setQueryData(checklistKeys.scope('plan-1', 'shared'), [
      { itemId: 1, content: '여권', isChecked: false, sortOrder: 0 },
      { itemId: 2, content: '충전기', isChecked: false, sortOrder: 1 },
    ]);

    await act(async () => {
      await holder.current!.create.mutateAsync('보험');
      await holder.current!.edit.mutateAsync({ itemId: 1, content: '새 여권' });
      await holder.current!.toggle.mutateAsync({ itemId: 1, isChecked: true });
      await holder.current!.remove.mutateAsync(2);
      await holder.current!.reorder.mutateAsync([2, 1]);
    });

    expect(mockCreateChecklistItem).toHaveBeenCalledWith(
      'plan-1',
      'shared',
      '보험',
    );
    expect(mockEditChecklistItemContent).toHaveBeenCalledWith(
      'plan-1',
      'shared',
      1,
      '새 여권',
    );
    expect(mockEditChecklistItemChecked).toHaveBeenCalledWith(
      'plan-1',
      'shared',
      1,
      true,
    );
    expect(mockDeleteChecklistItem).toHaveBeenCalledWith(
      'plan-1',
      'shared',
      2,
    );
    expect(mockReorderChecklistItems).toHaveBeenCalledWith(
      'plan-1',
      'shared',
      [2, 1],
    );
    expect(mockWs.sendMessage).not.toHaveBeenCalled();
  });
});

describe('공유 체크리스트 이벤트 수신', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWs.isConnected = true;
    mockWs.roomId = 'plan-1';
    mockWs.listeners.clear();
    mockGetChecklist.mockReset().mockResolvedValue([
      { itemId: 1, content: '여권', isChecked: false, sortOrder: 0 },
    ]);
  });

  afterEach(() => {
    cleanupMounted();
    jest.useRealTimers();
  });

  it('수신한 변경을 즉시 반영한다', async () => {
    const { holder } = renderHookValue(() =>
      usePlanChecklists('plan-1', true),
    );
    await tick();

    await act(async () => {
      emit({
        target: 'planchecklistitem',
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
  });

  it('수신 이벤트 뒤 늦게 끝난 조회가 최신 캐시를 덮지 않는다', async () => {
    let resolveShared: ((items: unknown[]) => void) | undefined;
    mockGetChecklist.mockImplementation((_planId, scope) =>
      scope === 'shared'
        ? new Promise(resolve => {
            resolveShared = resolve;
          })
        : Promise.resolve([]),
    );
    const { holder } = renderHookValue(() =>
      usePlanChecklists('plan-1', true),
    );

    await act(async () => {
      emit({
        target: 'planchecklistitem',
        data: {
          action: 'update',
          planChecklistItemDtos: [
            {
              checklistItemId: 1,
              planId: 'plan-1',
              content: '최신 여권',
              isChecked: true,
              sortOrder: 0,
            },
          ],
        },
      });
      resolveShared?.([
        { itemId: 1, content: '이전 여권', isChecked: false, sortOrder: 0 },
      ]);
    });
    await tick();

    expect(holder.current!.sharedItems).toEqual([
      { itemId: 1, content: '최신 여권', isChecked: true, sortOrder: 0 },
    ]);
  });

  it('planId 대소문자가 달라도 같은 일정의 삭제를 반영한다', async () => {
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
