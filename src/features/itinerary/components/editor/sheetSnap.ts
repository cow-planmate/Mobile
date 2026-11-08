/**
 * 두 번째 붙는 자리의 높이(dp). 안내 문구와 장소 행 둘이 잘리지 않고 들어가는 만큼이다.
 * 비율로 두면 화면 크기에 따라 보이는 장소 수가 달라져 목록이라는 것이 안 드러난다.
 */
export const SHEET_PEEK_HEIGHT = 216;

/**
 * 시트 최대 높이에서 붙는 자리를 뽑는다 - 접힘 / 장소 둘이 보이는 높이 / 2·3 / 최대 확장.
 * 작은 화면에서도 두 번째 자리가 세 번째보다 낮도록 최대 높이의 절반을 넘지 않게 한다.
 */
export const getSheetSnaps = (max: number) => {
  const top = Math.round(max);
  return [
    0,
    Math.min(SHEET_PEEK_HEIGHT, Math.round(top / 2)),
    Math.round((top * 2) / 3),
    top,
  ];
};

/**
 * 시트가 자리에 붙을 때의 스프링. 반동 없이 부드럽게 내려앉는다.
 * 감쇠를 거의 임계(2·√stiffness ≈ 33)로 맞추고, 넘치는 것은 막아
 * 최대 높이를 넘거나 0 밑으로 가지 않게 한다.
 */
export const SHEET_SPRING = {
  mass: 1,
  damping: 30,
  stiffness: 280,
  overshootClamping: true,
};

/** 손을 뗄 때 속도를 이어받되, 너무 빠른 플릭에 튀지 않도록 상한을 둔다. */
export const SHEET_MAX_RELEASE_VELOCITY = 3000;

export const clampReleaseVelocity = (velocity: number) =>
  Math.max(
    -SHEET_MAX_RELEASE_VELOCITY,
    Math.min(SHEET_MAX_RELEASE_VELOCITY, velocity),
  );

export const nearestSnap = (value: number, points: number[]) =>
  points.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));
