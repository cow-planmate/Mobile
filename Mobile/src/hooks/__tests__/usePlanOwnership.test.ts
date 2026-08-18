import { selectPlanMembership, hasPlanRole } from '../usePlanOwnership';

describe('selectPlanMembership', () => {
  it('myPlans는 소유, editablePlans는 편집 목록으로 나눠 담는다', () => {
    expect(
      selectPlanMembership({
        myPlans: [{ planId: 'AAA-111' }],
        editablePlans: [{ planId: 'BBB-222' }, { planId: 'CCC-333' }],
      }),
    ).toEqual({
      owned: ['aaa-111'],
      editable: ['bbb-222', 'ccc-333'],
    });
  });

  it('목록이 없거나 planId가 비면 빈 배열로 흡수한다', () => {
    expect(selectPlanMembership(null)).toEqual({ owned: [], editable: [] });
    expect(
      selectPlanMembership({ myPlans: [{}, { planId: '' }], editablePlans: 'x' }),
    ).toEqual({ owned: [], editable: [] });
  });
});

describe('hasPlanRole', () => {
  it('대소문자가 달라도 같은 플랜으로 본다', () => {
    expect(hasPlanRole(['aaa-111'], 'AAA-111')).toBe(true);
  });

  it('planId나 목록이 없으면 권한 없음으로 본다', () => {
    expect(hasPlanRole(['aaa-111'], null)).toBe(false);
    expect(hasPlanRole(undefined, 'aaa-111')).toBe(false);
    expect(hasPlanRole(['bbb-222'], 'aaa-111')).toBe(false);
  });
});
