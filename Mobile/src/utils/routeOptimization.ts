
export interface OrderablePlace {
  id: string;
  latitude: number;
  longitude: number;
}

export const hasMapPosition = (place: OrderablePlace): boolean =>
  place.latitude !== 0 && place.longitude !== 0;

export const buildOptimizedOrder = (
  places: OrderablePlace[],
  visitOrder: number[] | undefined | null,
): string[] | null => {
  const validPlaces = places.filter(hasMapPosition);
  const order = visitOrder ?? [];

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

export const isSameOrder = (
  places: OrderablePlace[],
  orderedIds: string[],
): boolean => orderedIds.every((id, i) => id === places[i]?.id);
