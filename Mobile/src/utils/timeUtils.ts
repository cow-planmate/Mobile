export const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const timeToDate = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const dateToTime = (date: Date) => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const minutesToTime = (totalMinutes: number) => {
  const snappedMinutes = Math.round(totalMinutes / 15) * 15;
  const hours = Math.floor(snappedMinutes / 60) % 24;
  const minutes = snappedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

export interface ConflictableItem {
  id: string;
  startTime: string;
  endTime: string;
  [key: string]: any;
}

export const resolveConflictsAndSort = <T extends ConflictableItem>(
  places: T[],
  anchorItemId: string | null = null,
  maxEndMinutesOverride?: number,
): T[] => {
  const MAX_END_MINUTES = maxEndMinutesOverride ?? 23 * 60 + 45; // respect day endTime or 23:45 hard cap

  // Deep copy elements to avoid mutating original state objects directly
  const sortedPlaces = places.map(p => ({ ...p })).sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  const anchorIndex = anchorItemId
    ? sortedPlaces.findIndex(p => p.id === anchorItemId)
    : -1;

  if (anchorIndex === -1) {
    for (let i = 1; i < sortedPlaces.length; i++) {
      const prev = sortedPlaces[i - 1];
      const curr = sortedPlaces[i];
      const prevEndTime = timeToMinutes(prev.endTime);
      const currStartTime = timeToMinutes(curr.startTime);

      if (currStartTime < prevEndTime) {
        const currDuration =
          timeToMinutes(curr.endTime) - timeToMinutes(curr.startTime);
        const newStart = Math.min(prevEndTime, MAX_END_MINUTES - 15);
        const newEnd = Math.min(newStart + currDuration, MAX_END_MINUTES);
        curr.startTime = minutesToTime(newStart);
        curr.endTime = minutesToTime(Math.max(newEnd, newStart + 15));
      }
    }
    return sortedPlaces;
  }

  const anchor = sortedPlaces[anchorIndex];
  const anchorStart = timeToMinutes(anchor.startTime);
  const anchorEnd = timeToMinutes(anchor.endTime);

  let lastEndTime = anchorEnd;
  for (let i = anchorIndex + 1; i < sortedPlaces.length; i++) {
    const curr = sortedPlaces[i];
    const currStart = timeToMinutes(curr.startTime);

    if (currStart < lastEndTime) {
      const currDuration = timeToMinutes(curr.endTime) - currStart;
      const newStart = Math.min(lastEndTime, MAX_END_MINUTES - 15);
      const newEnd = Math.min(newStart + currDuration, MAX_END_MINUTES);
      curr.startTime = minutesToTime(newStart);
      curr.endTime = minutesToTime(Math.max(newEnd, newStart + 15));
      lastEndTime = Math.max(newEnd, newStart + 15);
    } else {
      lastEndTime = timeToMinutes(curr.endTime);
    }
  }

  let lastStartTime = anchorStart;
  for (let i = anchorIndex - 1; i >= 0; i--) {
    const curr = sortedPlaces[i];
    const currEnd = timeToMinutes(curr.endTime);

    if (currEnd > lastStartTime) {
      const currDuration = currEnd - timeToMinutes(curr.startTime);
      curr.endTime = minutesToTime(lastStartTime);
      curr.startTime = minutesToTime(lastStartTime - currDuration);
      lastStartTime = timeToMinutes(curr.startTime);
    } else {
      lastStartTime = timeToMinutes(curr.startTime);
    }
  }

  return sortedPlaces;
};

