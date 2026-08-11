/**
 * 방문 순서 최적화 결과를 그날 전체 블록 순서로 옮기는 계산.
 *
 * 서버는 좌표 목록만 받아 "입력 인덱스의 최적 순서"를 돌려준다. 그런데 좌표가
 * 없는 장소(직접 추가 등 latitude/longitude가 0)는 애초에 전송 대상에서 빠지므로,
 * 결과를 그대로 쓰면 그날 블록 수보다 짧은 목록이 된다. 재정렬 반영부는 개수가
 * 다르면 조용히 무시하기 때문에 "최적화했습니다"만 뜨고 아무 일도 일어나지 않는다.
 *
 * 그래서 최적화된 순서는 좌표가 있는 자리에만 채워 넣고, 좌표가 없는 장소는
 * 원래 위치에 그대로 남긴다.
 */

export interface OrderablePlace {
  id: string;
  latitude: number;
  longitude: number;
}

/** 지도에 표시할 수 있는 좌표를 가졌는지 (0,0은 좌표 미상으로 본다) */
export const hasMapPosition = (place: OrderablePlace): boolean =>
  place.latitude !== 0 && place.longitude !== 0;

/**
 * @param places 그날 전체 장소 (원래 순서)
 * @param visitOrder 좌표 있는 장소만 추린 목록 기준의 최적 방문 순서 인덱스
 * @returns 전체 장소 수와 같은 길이의 ID 순서. 결과를 신뢰할 수 없으면 null.
 */
export const buildOptimizedOrder = (
  places: OrderablePlace[],
  visitOrder: number[] | undefined | null,
): string[] | null => {
  const validPlaces = places.filter(hasMapPosition);
  const order = visitOrder ?? [];

  // 인덱스가 하나라도 범위를 벗어나거나 중복되면 재배치가 어긋난다.
  const isUsable =
    order.length === validPlaces.length &&
    order.every(i => Number.isInteger(i) && i >= 0 && i < validPlaces.length) &&
    new Set(order).size === order.length;

  if (!isUsable) {
    return null;
  }

  const optimizedIds = order.map(i => validPlaces[i].id);
  let cursor = 0;

  return places.map(place =>
    hasMapPosition(place) ? optimizedIds[cursor++] : place.id,
  );
};

/** 최적화 결과가 지금 순서와 같은지 */
export const isSameOrder = (
  places: OrderablePlace[],
  orderedIds: string[],
): boolean => orderedIds.every((id, i) => id === places[i]?.id);
