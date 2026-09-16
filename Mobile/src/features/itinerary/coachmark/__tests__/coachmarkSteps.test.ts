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

  it('해보기를 권하는 단계는 담기와 시간 조절 둘뿐이다', () => {
    const asked = EDITOR_COACHMARK_STEPS.filter(step => step.practice);

    // 손으로 익히는 동작은 이 둘이다 - 나머지는 눌러 보면 끝나는 단추라
    // 권할 것이 없다.
    expect(asked.map(step => step.target)).toEqual([
      'placeSheet',
      'timelineBlock',
    ]);
    expect(asked.map(step => step.practice)).toEqual([
      'placeAdded',
      'timeChanged',
    ]);
    // 권해 놓고 눌러 보지도 못하게 해두면 권유가 아니다.
    asked.forEach(step => expect(step.interactive).not.toBe(false));
  });

  it('장소를 놓을 시간표도 함께 밝힌다', () => {
    const lit = EDITOR_COACHMARK_STEPS.filter(step => step.lightAlso);

    // 끌어다 놓는 단계뿐이다. 놓을 곳이 어두우면 어디에 놓으라는 것인지
    // 알 수 없다.
    expect(lit.map(step => step.target)).toEqual(['placeSheet']);
    expect(lit[0].lightAlso).toBe('timeline');
  });

  it('시간 늘리는 예시는 아래로 보여 준다', () => {
    const step = EDITOR_COACHMARK_STEPS.find(
      one => one.target === 'timelineBlock',
    );

    // 하루가 9시에서 시작해 첫 블록이 맨 위에 놓인다. 위로 늘리면 늘어나는
    // 자리가 날씨 카드 뒤로 숨는다.
    expect(step?.demo?.kind).toBe('grow');
    expect(step?.demo?.dy).toBeGreaterThan(0);
    expect(step?.demo?.fromY).toBe(1);
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
