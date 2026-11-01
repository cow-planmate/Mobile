import { Platform, StatusBar } from 'react-native';

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

/**
 * 시간표 맨 위에 고정되는 날씨 띠의 높이(px).
 * 시간표는 이만큼 아래에서 시작하고, 끌어놓기 눈금 계산도 같은 값을 쓴다.
 */
export const WEATHER_BAND_HEIGHT = 64;

/**
 * 손끝(제스처의 absoluteY)은 화면 맨 위가 0인데, 시간표를 재는 measureInWindow는
 * 안드로이드에서 상태바 높이를 뺀 값을 준다. 둘을 그대로 견주면 상태바만큼
 * 놓일 자리가 아래로 밀리므로, 손끝 자리를 잰 자리와 같은 기준으로 옮겨 쓴다.
 */
export const toWindowY = (screenY: number) =>
  screenY - (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0);
