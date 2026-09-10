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
    // 화면 위에서 아래로가 아니라 이름 짓기 → 날짜 → 장소 → 시간 순이다.
    const order = EDITOR_COACHMARK_STEPS.map(step => step.target);
    expect(order.indexOf('planName')).toBeLessThan(order.indexOf('dayTabs'));
    expect(order.indexOf('dayTabs')).toBeLessThan(order.indexOf('placeSheet'));
    expect(order.indexOf('placeSheet')).toBeLessThan(
      order.indexOf('timelineBlock'),
    );
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
