import { findDropSlot } from '../dropSlot';

const DAY = { min: 540, max: 1200 }; // 09:00 ~ 20:00
const HOUR = 60;

describe('findDropSlot', () => {
  it('빈 곳이면 그 자리를 그대로 준다', () => {
    expect(findDropSlot(600, HOUR, [], DAY)).toEqual({
      start: 600,
      moved: false,
    });
  });

  it('15분 눈금에 맞춘다', () => {
    expect(findDropSlot(607, HOUR, [], DAY)).toEqual({
      start: 600,
      moved: false,
    });
  });

  it('겹치면 가장 가까운 빈자리로 비켜선다', () => {
    // 10:00~11:00이 차 있고 10:00에 놓으려 하면 09:00으로 앞당긴다
    const busy = [{ start: 600, end: 660 }];
    expect(findDropSlot(600, HOUR, busy, DAY)).toEqual({
      start: 540,
      moved: true,
    });
  });

  it('앞이 막혀 있으면 뒤로 비켜선다', () => {
    // 09:00~11:00이 통째로 차 있으면 11:00으로 민다
    const busy = [{ start: 540, end: 660 }];
    expect(findDropSlot(600, HOUR, busy, DAY)).toEqual({
      start: 660,
      moved: true,
    });
  });

  it('같은 거리면 앞쪽을 고른다', () => {
    // 10:00~11:00이 찼고 09:00과 11:00이 모두 60분 거리다
    const busy = [{ start: 600, end: 660 }];
    const result = findDropSlot(600, HOUR, busy, DAY);
    expect(result?.start).toBe(540);
  });

  it('밀어야 할 거리가 한계를 넘으면 포기한다', () => {
    const busy = [{ start: 540, end: 1200 }];
    expect(findDropSlot(600, HOUR, busy, DAY)).toBeNull();
  });

  it('하루의 끝을 넘겨 놓지 않는다', () => {
    expect(findDropSlot(1190, HOUR, [], DAY)).toEqual({
      start: 1140,
      moved: false,
    });
  });

  it('하루의 시작보다 앞에 놓지 않는다', () => {
    expect(findDropSlot(400, HOUR, [], DAY)).toEqual({
      start: 540,
      moved: false,
    });
  });

  it('여러 구간 사이의 틈을 찾아낸다', () => {
    const busy = [
      { start: 540, end: 660 },
      { start: 720, end: 840 },
    ];
    // 11:00~12:00(660~720)이 유일한 틈이다
    expect(findDropSlot(700, HOUR, busy, DAY)).toEqual({
      start: 660,
      moved: true,
    });
  });
});
