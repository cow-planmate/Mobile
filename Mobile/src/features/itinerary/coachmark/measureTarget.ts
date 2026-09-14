import type { MeasurableNode } from './CoachmarkContext';
import type { CoachmarkStep } from './coachmarkSteps';

export interface CoachmarkRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * measureInWindow는 대상이 화면에서 빠지면 콜백을 아예 부르지 않는다.
 * 그대로 두면 안내가 그 자리에서 멈추므로 기다리는 시간을 끊는다.
 */
const MEASURE_TIMEOUT_MS = 300;

/**
 * 짚을 자리를 잰다. 잴 수 없으면 null - 부르는 쪽은 그 스텝을 건너뛴다.
 *
 * 재지 못하는 경우가 실제로 있다. 시간표에 장소가 하나도 없으면 블록이 없고,
 * 되돌리기 버튼은 하단 패널을 70% 넘게 올리면 사라진다.
 */
export function measureTarget(
  node: MeasurableNode | null,
): Promise<CoachmarkRect | null> {
  if (!node || typeof node.measureInWindow !== 'function') {
    return Promise.resolve(null);
  }

  return new Promise(resolve => {
    let settled = false;
    const finish = (rect: CoachmarkRect | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(rect);
    };

    const timer = setTimeout(() => finish(null), MEASURE_TIMEOUT_MS);

    try {
      node.measureInWindow((x, y, width, height) => {
        // 아직 배치되지 않은 대상은 0으로 잡힌다. 0짜리 구멍은 뚫을 수 없다.
        if (!width || !height) {
          finish(null);
          return;
        }
        finish({ x, y, width, height });
      });
    } catch {
      finish(null);
    }
  });
}

/**
 * 구멍은 짚은 것보다 조금 넉넉하다. 안내가 뚫는 자리와 "여기를 눌렀는가"를
 * 가리는 자리가 같아야 하므로, 그 여백을 한곳에서 정해 둘이 같이 쓴다.
 */
export function holeRect(
  step: CoachmarkStep,
  rect: CoachmarkRect,
): CoachmarkRect {
  const padding = step.padding ?? (step.shape === 'circle' ? 6 : 5);
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

/** 손가락이 이 자리 안에서 떨어졌는지. */
export function isInside(rect: CoachmarkRect, x: number, y: number): boolean {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

/**
 * 잰 자리가 화면 안에 보이는지. 스크롤에 밀려 나간 블록을 짚으면 스포트라이트가
 * 화면 밖을 가리키고 말풍선만 덩그러니 남는다.
 */
export function isRectVisible(
  rect: CoachmarkRect,
  windowWidth: number,
  windowHeight: number,
): boolean {
  return (
    rect.x + rect.width > 0 &&
    rect.y + rect.height > 0 &&
    rect.x < windowWidth &&
    rect.y < windowHeight
  );
}
