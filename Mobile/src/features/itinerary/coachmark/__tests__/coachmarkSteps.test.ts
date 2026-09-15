import { EDITOR_COACHMARK_STEPS } from '../coachmarkSteps';

describe('일정 편집 코치마크 스텝', () => {
  it('한 버튼을 두 번 짚지 않는다', () => {
    const targets = EDITOR_COACHMARK_STEPS.map(step => step.target);
    expect(new Set(targets).size).toBe(targets.length);
  });

  it('말풍선 문구가 두 줄을 넘기지 않는다', () => {
    // 길어지면 읽지 않고 닫는다. 폭 300에 13pt면 한 줄에 스물다섯 자쯤 들어간다.
    EDITOR_COACHMARK_STEPS.forEach(step => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.title.length).toBeLessThanOrEqual(12);
      expect(step.body.length).toBeGreaterThan(0);
      expect(step.body.length).toBeLessThanOrEqual(50);
    });
  });

  it('일정을 짜는 순서대로 놓여 있다', () => {
    // 화면 위에서 아래로가 아니라 정보 → 날짜 → 장소 → 시간 순이다.
    const order = EDITOR_COACHMARK_STEPS.map(step => step.target);
    expect(order.indexOf('planInfo')).toBeLessThan(order.indexOf('dayTabs'));
    expect(order.indexOf('dayTabs')).toBeLessThan(order.indexOf('placeSheet'));
    expect(order.indexOf('placeSheet')).toBeLessThan(
      order.indexOf('timelineBlock'),
    );
  });

  it('일정 완성은 맨 마지막에 짚는다', () => {
    // 누르면 화면을 떠난다. 중간에 두면 뒤에 남은 안내를 볼 길이 없다.
    const order = EDITOR_COACHMARK_STEPS.map(step => step.target);
    expect(order[order.length - 1]).toBe('complete');
  });

  it('이름 고치기는 일정 정보에 맡기고 따로 짚지 않는다', () => {
    const order = EDITOR_COACHMARK_STEPS.map(step => String(step.target));
    expect(order).not.toContain('planName');
  });

  it('나가도 저장된다는 것은 일정 완성에서만 일러둔다', () => {
    const noted = EDITOR_COACHMARK_STEPS.filter(step => step.note);
    expect(noted.map(step => step.target)).toEqual(['complete']);
    // 한마디도 두 줄을 넘기지 않는다.
    noted.forEach(step => {
      expect((step.note ?? '').length).toBeLessThanOrEqual(50);
    });
  });

  it('손짓은 끌어야 하는 두 곳에만 붙인다', () => {
    const demoed = EDITOR_COACHMARK_STEPS.filter(step => step.demo).map(
      step => step.target,
    );

    // 나머지는 한 번 누르면 되는 단추라 보여 줄 손짓이 없다.
    expect(demoed).toEqual(['placeSheet', 'timelineBlock']);
  });

  it('되돌릴 수 없는 셋만 눌러 보지 못하게 막는다', () => {
    const blocked = EDITOR_COACHMARK_STEPS.filter(
      step => step.interactive === false,
    ).map(step => step.target);

    // 완성은 화면을 떠나고, 수정·삭제는 구멍 하나에 연필과 X가 같이 들어가며,
    // 되돌리기는 진짜로 직전 작업을 무른다. 나머지는 직접 눌러 보게 둔다.
    expect(blocked).toEqual(['blockActions', 'undo', 'complete']);
  });

  it('동그란 버튼은 테두리가 원을 따라가도록 표시해 둔다', () => {
    const circles = EDITOR_COACHMARK_STEPS.filter(
      step => step.shape === 'circle',
    ).map(step => step.target);

    // 툴바 아이콘 여섯과 기간 편집·되돌리기가 동그란 버튼이다.
    expect(circles).toEqual(
      expect.arrayContaining([
        'planInfo',
        'dayPeriod',
        'complete',
        'undo',
        'checklist',
        'participants',
        'invite',
        'map',
      ]),
    );
  });
});
