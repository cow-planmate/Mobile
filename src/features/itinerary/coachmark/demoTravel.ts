import type { CoachmarkDemo } from './coachmarkSteps';
import type { CoachmarkRect } from './measureTarget';

/** 손짓이 맞춰야 하는 시간표의 치수. 눈금이 바뀌면 손짓도 같이 바뀐다. */
export interface DemoGrid {
  /** 1분이 화면에서 차지하는 높이. */
  minuteHeight: number;
  /** 한 시간짜리 블록의 높이. */
  hourHeight: number;
  /** 블록이 시간표 왼쪽·오른쪽에서 떨어진 거리. */
  blockLeft: number;
  blockRight: number;
}

export interface DemoTravel {
  /** 손가락이 처음 자리에서 끌려가는 거리(px). */
  dx: number;
  dy: number;
  /** 카드가 놓이는 자리. 놓을 곳을 알 수 없으면 null. */
  drop: CoachmarkRect | null;
}

/**
 * 손짓이 얼마나 끌려가는지 정한다.
 *
 * 거리를 픽셀로 못 박아 두면 눈금 높이나 위쪽 영역이 바뀔 때마다 손짓이
 * 엉뚱한 곳에 닿는다. 그래서 잰 자리와 눈금에서 거리를 계산한다.
 *
 * - grow: 몇 분 늘어나는지(growMinutes)에 눈금 높이를 곱한다.
 * - carry: 밝혀 둔 시간표(landing) 안에서 놓일 자리를 고르고, 거기까지 간다.
 *   놓이는 블록은 진짜 한 시간짜리 블록과 같은 폭·높이로 그린다.
 *
 * 필요한 값이 없으면 단계에 적어 둔 dx·dy를 그대로 쓴다.
 */
export function resolveDemoTravel(
  demo: CoachmarkDemo,
  rect: CoachmarkRect,
  landing: CoachmarkRect | null,
  grid: DemoGrid,
): DemoTravel {
  if (demo.kind === 'grow' && demo.growMinutes !== undefined) {
    return {
      dx: demo.dx,
      dy: demo.growMinutes * grid.minuteHeight,
      drop: null,
    };
  }

  if (
    demo.kind === 'carry' &&
    demo.landAt !== undefined &&
    landing &&
    landing.height > 0
  ) {
    const height = grid.hourHeight;
    const width = Math.max(0, landing.width - grid.blockLeft - grid.blockRight);
    const wantedTop = landing.y + landing.height * demo.landAt;
    // 밝힌 자리 밖으로 삐져나가지 않게 가둔다. 시간표가 낮으면 맨 위에 붙는다.
    const top = Math.max(
      landing.y,
      Math.min(wantedTop, landing.y + landing.height - height),
    );
    const drop = { x: landing.x + grid.blockLeft, y: top, width, height };

    const fromX = rect.x + rect.width * demo.fromX;
    const fromY = rect.y + rect.height * demo.fromY;
    return {
      dx: drop.x + drop.width / 2 - fromX,
      dy: drop.y + drop.height / 2 - fromY,
      drop,
    };
  }

  return { dx: demo.dx, dy: demo.dy, drop: null };
}
