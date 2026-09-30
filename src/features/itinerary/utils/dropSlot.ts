/** 이미 자리를 차지한 구간. 분 단위다. */
export type BusySlot = { start: number; end: number };

const overlaps = (start: number, end: number, busy: BusySlot[]) =>
  busy.some(b => start < b.end && b.start < end);

/**
 * 놓으려는 자리가 겹치면 가장 가까운 빈자리를 찾는다.
 *
 * 조용히 다른 데로 옮기면 겨냥한 곳과 달라 놀란다. 그래서 이 함수는 끄는
 * 동안에도 불려, 손을 떼기 전에 점선이 이미 비켜서 있게 만든다.
 * 위아래를 번갈아 보되 위쪽을 먼저 본다 — 앞당기는 쪽이 하루를 덜 늘린다.
 *
 * @param want     손가락이 가리키는 시작 분(15분 눈금에 이미 맞춰진 값)
 * @param duration 놓을 길이(분)
 * @param busy     이미 찬 구간들
 * @param bounds   하루의 시작과 끝(분)
 * @param maxShift 이만큼(분)을 넘겨 밀어야 하면 포기한다
 * @returns 놓을 자리와 비켜섰는지 여부. 자리가 없으면 null.
 */
export const findDropSlot = (
  want: number,
  duration: number,
  busy: BusySlot[],
  bounds: { min: number; max: number },
  maxShift = 120,
): { start: number; moved: boolean } | null => {
  const step = 15;
  const clamp = (value: number) =>
    Math.max(bounds.min, Math.min(value, bounds.max - duration));

  const base = clamp(Math.round(want / step) * step);
  if (!overlaps(base, base + duration, busy)) {
    return { start: base, moved: false };
  }

  for (let shift = step; shift <= maxShift; shift += step) {
    for (const candidate of [base - shift, base + shift]) {
      if (candidate < bounds.min || candidate + duration > bounds.max) continue;
      if (!overlaps(candidate, candidate + duration, busy)) {
        return { start: candidate, moved: true };
      }
    }
  }
  return null;
};
