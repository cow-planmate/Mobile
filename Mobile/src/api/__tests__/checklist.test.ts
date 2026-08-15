import { createPlanChecklistSyncMessage } from '../checklist';

describe('createPlanChecklistSyncMessage', () => {
  it('SharedSync가 요구하는 체크리스트 DTO 필드로 직렬화한다', () => {
    expect(
      createPlanChecklistSyncMessage('update', {
        checklistItemId: 7,
        content: '여권',
        isChecked: true,
        sortOrder: 2,
        planId: 'plan-id',
      }),
    ).toEqual({
      entity: 'planchecklistitem',
      action: 'update',
      planChecklistItemDtos: [
        {
          checklistItemId: 7,
          content: '여권',
          isChecked: true,
          sortOrder: 2,
          planId: 'plan-id',
        },
      ],
    });
  });
});
