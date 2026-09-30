
/** 놓일 자리를 블록보다 사방으로 얼마나 넓게 그릴지(px). */
export const PREVIEW_OUTSET = 6;

export const PREVIEW_SPRING_CONFIG = {
  damping: 22,
  stiffness: 220,
  mass: 0.6,
};

/** 손끝이 시간표 위아래 이 안쪽에 들어오면 그쪽으로 굴린다(px). */
export const AUTO_SCROLL_EDGE = 90;
/** 한 번에 굴리는 최대 거리(px). 가장자리에 붙을수록 이 값에 가까워진다. */
export const AUTO_SCROLL_MAX_STEP = 12;
/**
 * 구간에 들어오면 적어도 이만큼은 움직인다.
 *
 * 거리에만 비례시키면 경계 바로 안쪽에서 한 번에 1px씩 움직여, 굴러가는
 * 중인지 멈춘 것인지 알 수 없다.
 */
export const AUTO_SCROLL_MIN_STEP = 4;
export const AUTO_SCROLL_TICK_MS = 16;
