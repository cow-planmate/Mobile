import { DAY_UNDERLINE_SPRING, getDaySwitchDirection } from '../daySwitch';

describe('일차 전환 움직임', () => {
  it('뒤 일차로 가면 1, 앞 일차로 가면 -1이다', () => {
    expect(getDaySwitchDirection(1, 2)).toBe(1);
    expect(getDaySwitchDirection(1, 4)).toBe(1);
    expect(getDaySwitchDirection(3, 2)).toBe(-1);
  });

  it('같은 일차이거나 알 수 없으면 움직이지 않는다', () => {
    expect(getDaySwitchDirection(2, 2)).toBe(0);
    expect(getDaySwitchDirection(undefined, 2)).toBe(0);
    expect(getDaySwitchDirection(2, undefined)).toBe(0);
  });

  it('밑줄은 반동 없이 내려앉는다', () => {
    const critical = Math.sqrt(
      4 * DAY_UNDERLINE_SPRING.stiffness * DAY_UNDERLINE_SPRING.mass,
    );

    expect(DAY_UNDERLINE_SPRING.overshootClamping).toBe(true);
    expect(DAY_UNDERLINE_SPRING.damping / critical).toBeGreaterThan(0.7);
  });
});
