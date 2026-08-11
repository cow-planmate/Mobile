import {
  buildOptimizedOrder,
  hasMapPosition,
  isSameOrder,
  OrderablePlace,
} from '../routeOptimization';

const place = (id: string, lat = 37.5, lng = 127.0): OrderablePlace => ({
  id,
  latitude: lat,
  longitude: lng,
});

/** 직접 추가 장소는 좌표가 0,0으로 저장된다. */
const noCoordPlace = (id: string): OrderablePlace => place(id, 0, 0);

describe('hasMapPosition', () => {
  it('0,0은 좌표 미상으로 본다', () => {
    expect(hasMapPosition(place('1'))).toBe(true);
    expect(hasMapPosition(noCoordPlace('2'))).toBe(false);
  });
});

describe('buildOptimizedOrder', () => {
  it('모든 장소에 좌표가 있으면 최적 순서를 그대로 옮긴다', () => {
    const places = [place('a'), place('b'), place('c')];

    expect(buildOptimizedOrder(places, [0, 2, 1])).toEqual(['a', 'c', 'b']);
  });

  it('좌표 없는 장소는 원래 자리에 남기고 나머지만 재배치한다', () => {
    // b는 직접 추가 장소라 서버 전송 대상에서 빠진다.
    // 좌표 있는 [a, c, d]의 최적 순서가 [d, a, c]여도 결과 길이는 4여야 한다.
    const places = [place('a'), noCoordPlace('b'), place('c'), place('d')];

    const result = buildOptimizedOrder(places, [2, 0, 1]);

    expect(result).toEqual(['d', 'b', 'a', 'c']);
    expect(result).toHaveLength(places.length);
  });

  it('좌표 없는 장소만 있으면 빈 순서를 그대로 통과시킨다', () => {
    const places = [noCoordPlace('a'), noCoordPlace('b')];

    expect(buildOptimizedOrder(places, [])).toEqual(['a', 'b']);
  });

  it('인덱스 개수가 맞지 않으면 null', () => {
    const places = [place('a'), place('b'), place('c')];

    expect(buildOptimizedOrder(places, [0, 1])).toBeNull();
  });

  it('범위를 벗어난 인덱스가 있으면 null', () => {
    const places = [place('a'), place('b')];

    expect(buildOptimizedOrder(places, [0, 5])).toBeNull();
  });

  it('중복 인덱스가 있으면 null', () => {
    const places = [place('a'), place('b')];

    expect(buildOptimizedOrder(places, [1, 1])).toBeNull();
  });

  it('visitOrder가 없으면 null', () => {
    expect(buildOptimizedOrder([place('a')], undefined)).toBeNull();
  });
});

describe('isSameOrder', () => {
  it('순서가 그대로면 true', () => {
    const places = [place('a'), place('b')];
    expect(isSameOrder(places, ['a', 'b'])).toBe(true);
  });

  it('순서가 바뀌었으면 false', () => {
    const places = [place('a'), place('b')];
    expect(isSameOrder(places, ['b', 'a'])).toBe(false);
  });
});
