
/** 붙는 자리 — 접힘 / 1·3 / 2·3 / 최대 확장 */
export const SHEET_SNAPS = [0, 1 / 3, 2 / 3, 1];
/** 화면에 처음 들어왔을 때 열어 둘 높이. 스냅 자리와 같아야 첫 드래그가 안 튄다. */
export const SHEET_INITIAL_RATIO = SHEET_SNAPS[1];

export const nearestSnap = (value: number, points: number[]) =>
  points.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));
