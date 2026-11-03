import { formatUseTime } from '../formatUseTime';

describe('formatUseTime', () => {
  it('계절 이름마다 줄을 나누고 하이픈을 정리한다', () => {
    const raw =
      '[하절기(4월~9월)]- 10:00~19:00- 입장 마감 18:00[동절기(10월~3월)]- 10:00~18:00- 입장 마감 17:00';

    expect(formatUseTime(raw)).toBe(
      '[하절기(4월~9월)] 10:00~19:00 · 입장 마감 18:00\n[동절기(10월~3월)] 10:00~18:00 · 입장 마감 17:00',
    );
  });

  it('대괄호가 없는 시간은 그대로 둔다', () => {
    expect(formatUseTime('09:00 - 18:00')).toBe('09:00 - 18:00');
    expect(formatUseTime('매일 24시간')).toBe('매일 24시간');
  });

  it('범위의 하이픈은 건드리지 않는다', () => {
    expect(formatUseTime('[평일] 09:00 - 18:00')).toBe('[평일] 09:00 - 18:00');
  });
});
