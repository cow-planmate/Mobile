import { deadlineFromNow, secondsUntil } from '../countdown';

describe('countdown', () => {
  it('만료까지 남은 초를 올림해서 돌려준다', () => {
    const now = 1_000_000;
    expect(secondsUntil(now + 3000, now)).toBe(3);
    expect(secondsUntil(now + 2500, now)).toBe(3);
    expect(secondsUntil(now + 1, now)).toBe(1);
  });

  it('이미 지난 시각은 0으로 고정한다', () => {
    const now = 1_000_000;
    expect(secondsUntil(now, now)).toBe(0);
    expect(secondsUntil(now - 60_000, now)).toBe(0);
  });

  it('백그라운드로 흐른 시간만큼 남은 시간이 줄어든다', () => {
    const start = 1_000_000;
    const deadline = deadlineFromNow(300, start);

    // 앱이 3분간 백그라운드에 있다가 돌아온 상황.
    expect(secondsUntil(deadline, start + 180_000)).toBe(120);

    // 만료 시각을 넘겨 복귀하면 남은 시간이 없다.
    expect(secondsUntil(deadline, start + 400_000)).toBe(0);
  });
});
