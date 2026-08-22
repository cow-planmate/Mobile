jest.mock('../../../../contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    isConnected: false,
    sendMessage: jest.fn(),
    subscribeToMessages: jest.fn(),
    unsubscribeFromMessages: jest.fn(),
  }),
}));

import { applyChecklistSync } from '../useChecklistQueries';

describe('applyChecklistSync', () => {
  const items = [
    { itemId: 1, content: '여권', isChecked: false, sortOrder: 0 },
    { itemId: 2, content: '충전기', isChecked: false, sortOrder: 1 },
  ];

  it('수정 이벤트는 누락된 필드를 유지하고 정렬한다', () => {
    expect(
      applyChecklistSync(items, {
        action: 'update',
        planChecklistItemDtos: [
          { checklistItemId: 1, isChecked: true, sortOrder: 2, planId: 'plan-id' },
        ],
      }),
    ).toEqual([
      { itemId: 2, content: '충전기', isChecked: false, sortOrder: 1 },
      { itemId: 1, content: '여권', isChecked: true, sortOrder: 2 },
    ]);
  });

  it('삭제 이벤트는 해당 항목만 제거한다', () => {
    expect(
      applyChecklistSync(items, {
        action: 'delete',
        planChecklistItemDtos: [{ checklistItemId: 1, planId: 'plan-id' }],
      }),
    ).toEqual([{ itemId: 2, content: '충전기', isChecked: false, sortOrder: 1 }]);
  });

  it('최초 조회가 끝나기 전에 온 이벤트도 캐시에 반영한다', () => {
    expect(
      applyChecklistSync(undefined, {
        action: 'create',
        planChecklistItemDtos: [
          { checklistItemId: 3, content: '여행자보험', isChecked: false, sortOrder: 0, planId: 'plan-id' },
        ],
      }),
    ).toEqual([{ itemId: 3, content: '여행자보험', isChecked: false, sortOrder: 0 }]);
  });
});
