import type { Day } from '../contexts/ItineraryContext';
import { isTempPlaceId } from './planSyncPayload';
import { formatDateLocal, timeToMinutes } from './timeUtils';

const dayId = (day: Day) => day.timetableId != null
  ? String(day.timetableId) : `temp-${formatDateLocal(day.date)}`;

const changedFields = <T extends object>(current: T, original?: T): Partial<T> =>
  Object.fromEntries(Object.entries(current).filter(([key, value]) => {
    const before = original?.[key as keyof T];
    return value instanceof Date && before instanceof Date
      ? value.getTime() !== before.getTime() : value !== before;
  })) as Partial<T>;

function mergeList<T>(
  fetched: T[], current: T[], original: T[], key: (item: T) => string,
  merge: (server: T, local: T, before?: T) => T,
  pending: (item: T) => boolean,
): T[] {
  const beforeById = new Map(original.map(item => [key(item), item]));
  const currentById = new Map(current.map(item => [key(item), item]));
  const fetchedIds = new Set(fetched.map(key));
  const result = fetched
    .filter(item => !beforeById.has(key(item)) || currentById.has(key(item)))
    .map(item => {
      const local = currentById.get(key(item));
      return local ? merge(item, local, beforeById.get(key(item))) : item;
    });
  return result.concat(current.filter(item => !fetchedIds.has(key(item)) &&
    (!beforeById.has(key(item)) || pending(item))));
}

export function mergeItinerarySnapshot(fetched: Day[], current: Day[], original: Day[]): Day[] {
  return mergeList(fetched, current, original, dayId, (server, local, before) => ({
    ...server,
    ...changedFields(local, before),
    places: mergeList(server.places, local.places, before?.places ?? [], place => place.id,
      (remotePlace, localPlace, oldPlace) => ({ ...remotePlace, ...changedFields(localPlace, oldPlace) }),
      place => isTempPlaceId(place.id))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
  }), day => day.timetableId == null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((day, index) => ({ ...day, dayNumber: index + 1 }));
}
