import {
  SHEET_MAX_RELEASE_VELOCITY,
  SHEET_PEEK_HEIGHT,
  SHEET_SPRING,
  clampReleaseVelocity,
  getSheetSnaps,
} from '../sheetSnap';

describe('장소 추가 시트 붙는 자리', () => {
  it('두 번째 자리는 화면 크기와 상관없이 같은 높이다', () => {
    expect(getSheetSnaps(600)[1]).toBe(SHEET_PEEK_HEIGHT);
    expect(getSheetSnaps(900)[1]).toBe(SHEET_PEEK_HEIGHT);
  });

  it('접힘 - 두 번째 - 2/3 - 최대 순서로 올라간다', () => {
    expect(getSheetSnaps(600)).toEqual([0, SHEET_PEEK_HEIGHT, 400, 600]);
  });

  it('작은 화면에서도 두 번째 자리가 세 번째보다 낮다', () => {
    const [, peek, twoThirds, max] = getSheetSnaps(300);

    expect(peek).toBe(150);
    expect(peek).toBeLessThan(twoThirds);
    expect(twoThirds).toBeLessThan(max);
  });
});

describe('장소 추가 시트 붙는 움직임', () => {
  it('반동 없이 내려앉는다', () => {
    // 임계 감쇠(2·√(stiffness·mass))에 가깝되 넘치는 값은 막는다.
    const critical = 2 * Math.sqrt(SHEET_SPRING.stiffness * SHEET_SPRING.mass);

    expect(SHEET_SPRING.overshootClamping).toBe(true);
    expect(SHEET_SPRING.damping / critical).toBeGreaterThan(0.85);
  });

  it('손을 뗄 때의 속도는 상한 안으로 줄인다', () => {
    expect(clampReleaseVelocity(800)).toBe(800);
    expect(clampReleaseVelocity(-800)).toBe(-800);
    expect(clampReleaseVelocity(9000)).toBe(SHEET_MAX_RELEASE_VELOCITY);
    expect(clampReleaseVelocity(-9000)).toBe(-SHEET_MAX_RELEASE_VELOCITY);
  });
});
