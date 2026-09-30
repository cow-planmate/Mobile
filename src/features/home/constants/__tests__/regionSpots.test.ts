import {
  getRegionSpots,
  getShowcaseSpots,
  MAX_REGION_SPOTS,
  REGION_SPOTS,
} from '../regionSpots';

describe('getRegionSpots', () => {
  it('그 지역의 명소를 돌려준다', () => {
    const spots = getRegionSpots('속초');
    expect(spots.length).toBeGreaterThan(0);
    expect(spots.map(s => s.place)).toContain('울산바위');
  });

  it('사진이 없는 지역은 빈 목록이다', () => {
    expect(getRegionSpots('없는도시')).toEqual([]);
    expect(getRegionSpots('')).toEqual([]);
  });

  it('한 지역당 최대 장수를 넘기지 않는다', () => {
    Object.keys(REGION_SPOTS).forEach(region => {
      expect(getRegionSpots(region).length).toBeLessThanOrEqual(
        MAX_REGION_SPOTS,
      );
    });
  });
});

describe('getShowcaseSpots', () => {
  it('요청한 장수만큼 돌려준다', () => {
    expect(getShowcaseSpots(3)).toHaveLength(3);
    expect(getShowcaseSpots()).toHaveLength(MAX_REGION_SPOTS);
  });

  it('지역이 겹치지 않는다', () => {
    for (let i = 0; i < 30; i += 1) {
      const regions = getShowcaseSpots().map(s => s.region);
      expect(new Set(regions).size).toBe(regions.length);
    }
  });

  it('어느 지역의 명소인지 함께 담는다', () => {
    getShowcaseSpots().forEach(spot => {
      expect(spot.region).toBeTruthy();
      expect(REGION_SPOTS[spot.region as string]).toBeDefined();
      expect(
        REGION_SPOTS[spot.region as string].map(s => s.place),
      ).toContain(spot.place);
    });
  });

  it('여러 번 부르면 같은 목록만 나오지는 않는다', () => {
    const runs = new Set(
      Array.from({ length: 20 }, () =>
        getShowcaseSpots()
          .map(s => s.place)
          .join('|'),
      ),
    );
    expect(runs.size).toBeGreaterThan(1);
  });
});
