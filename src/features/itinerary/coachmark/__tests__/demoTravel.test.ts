import { resolveDemoTravel, type DemoGrid } from '../demoTravel';
import type { CoachmarkDemo } from '../coachmarkSteps';

const grid: DemoGrid = {
  minuteHeight: 2,
  hourHeight: 120,
  blockLeft: 60,
  blockRight: 15,
};

// 짚은 자리: 아래 시트. 밝힌 자리: 그 위의 시간표.
const sheet = { x: 0, y: 600, width: 400, height: 300 };
const timeline = { x: 0, y: 200, width: 400, height: 350 };

const carry: CoachmarkDemo = {
  kind: 'carry',
  fromX: 0.5,
  fromY: 0.5,
  dx: 0,
  dy: -330,
  landAt: 0.1,
};

describe('resolveDemoTravel', () => {
  describe('grow', () => {
    const grow: CoachmarkDemo = {
      kind: 'grow',
      fromX: 0.5,
      fromY: 1,
      dx: 0,
      dy: 110,
      growMinutes: 30,
    };

    it('늘어나는 분에 눈금 높이를 곱해 거리를 정한다', () => {
      const trip = resolveDemoTravel(grow, sheet, null, grid);

      expect(trip.dy).toBe(60);
      expect(trip.drop).toBeNull();
    });

    it('눈금이 달라지면 거리도 같이 달라진다', () => {
      const taller = { ...grid, minuteHeight: 3 };

      expect(resolveDemoTravel(grow, sheet, null, taller).dy).toBe(90);
    });

    it('분이 적혀 있지 않으면 적어 둔 픽셀을 쓴다', () => {
      const { growMinutes: _ignored, ...legacy } = grow;

      expect(resolveDemoTravel(legacy, sheet, null, grid).dy).toBe(110);
    });
  });

  describe('carry', () => {
    it('밝힌 시간표 안에 진짜 블록과 같은 크기로 놓는다', () => {
      const trip = resolveDemoTravel(carry, sheet, timeline, grid);

      expect(trip.drop).toEqual({
        x: 60,
        y: 235,
        // 400 - 60 - 15
        width: 325,
        height: 120,
      });
    });

    it('손가락은 놓이는 블록의 한가운데까지 간다', () => {
      const trip = resolveDemoTravel(carry, sheet, timeline, grid);
      const fromX = sheet.x + sheet.width * 0.5;
      const fromY = sheet.y + sheet.height * 0.5;

      expect(fromX + trip.dx).toBe(60 + 325 / 2);
      expect(fromY + trip.dy).toBe(235 + 120 / 2);
    });

    it('시간표가 낮아도 밝힌 자리 밖으로 삐져나가지 않는다', () => {
      const low = { ...timeline, y: 200, height: 150 };
      const bottom = resolveDemoTravel(
        { ...carry, landAt: 0.95 },
        sheet,
        low,
        grid,
      );

      expect(bottom.drop!.y + bottom.drop!.height).toBeLessThanOrEqual(
        low.y + low.height,
      );
      expect(bottom.drop!.y).toBeGreaterThanOrEqual(low.y);
    });

    it('밝힌 자리를 모르면 적어 둔 픽셀을 쓴다', () => {
      const trip = resolveDemoTravel(carry, sheet, null, grid);

      expect(trip).toEqual({ dx: 0, dy: -330, drop: null });
    });

    it('밝힌 자리의 높이가 0이면 적어 둔 픽셀을 쓴다', () => {
      const trip = resolveDemoTravel(
        carry,
        sheet,
        { ...timeline, height: 0 },
        grid,
      );

      expect(trip.drop).toBeNull();
    });
  });

  it('point는 적어 둔 거리를 그대로 쓴다', () => {
    const point: CoachmarkDemo = {
      kind: 'point',
      fromX: 0.5,
      fromY: 0.5,
      dx: 10,
      dy: 20,
    };

    expect(resolveDemoTravel(point, sheet, timeline, grid)).toEqual({
      dx: 10,
      dy: 20,
      drop: null,
    });
  });
});
