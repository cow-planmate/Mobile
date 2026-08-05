import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Place } from '../features/itinerary/components/TimelineItem';
export type { Place };
import { useWebSocket } from './WebSocketContext';

export interface Day {
  timetableId?: number;
  date: Date;
  dayNumber: number;
  startTime?: string;
  endTime?: string;
  places: Place[];
}

interface PendingBlockSync {
  action: 'update' | 'delete';
  place: Place;
  timetableId: number;
}

/** 모든 날짜에 걸친 장소 총개수. */
export const countPlaces = (days: Day[]): number =>
  days.reduce((sum, d) => sum + d.places.length, 0);

/**
 * 서버 조회 결과로 로컬 상태를 덮어써도 되는지 판단합니다.
 *
 * 서버는 편집을 Redis 캐시에만 반영하고 DB에는 주기 동기화(수십 초) 또는
 * 마지막 세션 종료 후 지연 동기화 시점에만 반영합니다. 방금 편집을 마치고
 * 화면을 이동해 조회하면, 이 지연 구간에 걸려 REST 응답이 로컬보다 적은
 * place 개수를 가진 stale 스냅샷일 수 있습니다. 그런 응답으로 전체를
 * 덮어쓰면 방금 저장한 내용이 화면에서 사라집니다.
 *
 * 그래서 "이미 알고 있는 것보다 적지 않을 때만" 서버 응답을 신뢰합니다.
 * 로컬이 비어 있으면(최초 진입) 항상 서버 응답을 받아들입니다.
 */
export const isFetchAtLeastAsComplete = (
  fetched: Day[],
  current: Day[],
): boolean => countPlaces(fetched) >= countPlaces(current);

/** 블록 최소 길이(분). resolveConflictsAndSort의 스냅 단위와 동일하게 둔다. */
const MIN_BLOCK_MINUTES = 15;

/**
 * 종료가 시작보다 이르거나 같으면 최소 길이로 보정합니다.
 * duration이 음수가 되면 시간 충돌 해결의 밀어내기 계산이 역방향으로 붕괴합니다.
 */
const ensureValidRange = (
  startTime: string,
  endTime: string,
): { startTime: string; endTime: string } => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end > start) return { startTime, endTime };
  return { startTime, endTime: minutesToTime(start + MIN_BLOCK_MINUTES) };
};

/**
 * 시간이 실제로 바뀐 블록만 골라냅니다.
 * 그날 전체를 전송하면 동시 편집 중인 다른 사용자의 변경까지 옛 값으로 덮어씁니다.
 */
const pickTimeChanged = (before: Place[], after: Place[]): Place[] => {
  const prevById = new Map(before.map(p => [p.id, p]));
  return after.filter(p => {
    const prev = prevById.get(p.id);
    return (
      !prev || prev.startTime !== p.startTime || prev.endTime !== p.endTime
    );
  });
};

import {
  timeToMinutes,
  minutesToTime,
  resolveConflictsAndSort,
  formatDateLocal,
  DEFAULT_DAY_END,
} from '../utils/timeUtils';
import {
  createTempPlaceId,
  isTempPlaceId,
  resolveBlockId,
} from '../utils/planSyncPayload';


interface ItineraryContextType {
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
  lastAddedPlaceId: string | null;
  setLastAddedPlaceId: React.Dispatch<React.SetStateAction<string | null>>;
  resetItinerary: () => void;
  addPlaceToDay: (
    dayIndex: number,
    place: Omit<Place, 'startTime' | 'endTime'> & { startTime?: string; endTime?: string },
  ) => void;
  deletePlaceFromDay: (dayIndex: number, placeId: string) => void;
  updatePlaceTimes: (
    dayIndex: number,
    placeId: string,
    newStartTime: string,
    newEndTime: string,
  ) => void;
  updatePlaceMemo: (dayIndex: number, placeId: string, memo: string) => void;
  updatePlaceDetails: (
    dayIndex: number,
    placeId: string,
    updates: Partial<
      Pick<Place, 'startTime' | 'endTime' | 'memo' | 'name' | 'address'>
    >,
  ) => void;
  /** 하루의 방문 순서를 주어진 ID 순서로 재배치 */
  reorderPlacesInDay: (dayIndex: number, orderedPlaceIds: string[]) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined,
);

/**
 * categoryId를 표시용 라벨로 변환합니다.
 * 0=관광지 기준이며, `api/trips.ts`의 `categoryEnumMap`(ATTRACTION→0)과 같은 규칙입니다.
 */
export const categoryMapping = (
  id: number,
): '관광지' | '숙소' | '식당' | '직접 추가' | '검색' | '기타' => {
  if ([0, 12, 14, 15, 28].includes(id)) return '관광지';
  if (id === 1 || id === 32) return '숙소';
  if (id === 2 || id === 39) return '식당';
  if (id === 3) return '직접 추가';
  if (id === 4) return '검색';
  return '기타';
};

/**
 * Normalize raw categoryId (e.g. Google API IDs) to 0-4 range used by the app.
 */
const normalizeCategoryId = (
  rawId: number | undefined,
  type?: string,
): number => {
  const id = rawId ?? 4;
  if ([0, 1, 2, 3, 4].includes(id)) return id;
  if ([12, 14, 15, 28].includes(id)) return 0; // 관광지
  if (id === 32) return 1; // 숙소
  if (id === 39) return 2; // 식당
  switch (type) {
    case '관광지':
      return 0;
    case '숙소':
      return 1;
    case '식당':
      return 2;
    case '직접 추가':
      return 3;
    default:
      return 4;
  }
};

const categoryToBlockCategory = (categoryId: number): string => {
  switch (categoryId) {
    case 0: return 'ATTRACTION';
    case 1: return 'ACCOMMODATION';
    case 2: return 'RESTAURANT';
    case 3: return 'FREE';
    case 4: return 'SEARCH';
    default: return 'SEARCH';
  }
};

const blockCategoryToCategoryId = (blockCategory?: string, rawCategoryId?: any): number => {
  if (typeof rawCategoryId === 'number' && [0, 1, 2, 3, 4].includes(rawCategoryId)) {
    return rawCategoryId;
  }
  if (blockCategory) {
    switch (blockCategory.toUpperCase()) {
      case 'ATTRACTION': return 0;
      case 'ACCOMMODATION': return 1;
      case 'RESTAURANT': return 2;
      case 'FREE': return 3;
      case 'SEARCH': return 4;
    }
  }
  return 4;
};

/**
 * 서버 TimeTablePlaceBlockDto와 키가 정확히 일치하는 페이로드를 만듭니다.
 *
 * DTO는 @JsonIgnoreProperties(ignoreUnknown = true)라 없는 키는 조용히 버려진다.
 * 예전 백엔드 스키마의 키(xLocation/yLocation, photoUrl, placeCategoryId,
 * startTime/endTime, date 등)를 함께 실어 보내고 있었는데, 받는 쪽에서 쓰이지 않으면서
 * 어떤 키가 실제로 반영되는지 읽기 어렵게 만들 뿐이라 걷어냈다.
 */
const mapToTimetablePlaceBlockDto = (place: Place, timetableId?: number) => {
  // Remap category IDs to backend table IDs (0:관광지, 1:숙소, 2:식당, 3:직접추가, 4:검색)
  let categoryId = place.categoryId ?? 4;

  if (![0, 1, 2, 3, 4].includes(categoryId)) {
    if ([12, 14, 15, 28].includes(categoryId)) {
      categoryId = 0; // 관광지
    } else if (categoryId === 32) {
      categoryId = 1; // 숙소
    } else if (categoryId === 39) {
      categoryId = 2; // 식당
    } else {
      switch (place.type) {
        case '관광지':
          categoryId = 0;
          break;
        case '숙소':
          categoryId = 1;
          break;
        case '식당':
          categoryId = 2;
          break;
        default:
          categoryId = 4; // 검색
      }
    }
  }

  // Formatting time to "HH:mm:00" for LocalTime compatibility
  const startTime =
    place.startTime.length === 5 ? place.startTime + ':00' : place.startTime;
  const endTime =
    place.endTime.length === 5 ? place.endTime + ':00' : place.endTime;

  const blockId = resolveBlockId(place.id);

  return {
    blockId,
    timeTableId: timetableId,
    placeId: place.placeRefId,
    placeName: place.name,
    placeContentTypeId: place.contentTypeId || null,
    placeAddress: place.address,
    placeThumbnailUrl: place.imageUrl || null,
    placeCopyrightDivCd: place.copyrightDivCd || null,
    latitude: place.latitude,
    longitude: place.longitude,
    blockStartTime: startTime,
    blockEndTime: endTime,
    blockCategory: categoryToBlockCategory(categoryId),
    memo: place.memo || '',
  };
};

export function ItineraryProvider({ children }: PropsWithChildren) {
  const [days, setDays] = useState<Day[]>([]);
  const [lastAddedPlaceId, setLastAddedPlaceId] = useState<string | null>(null);
  const { sendMessage, subscribeToMessages, unsubscribeFromMessages } =
    useWebSocket();

  // 서버가 blockId를 확정하기 전인 블록의 update/delete 보류분. key는 임시 ID.
  const pendingBlockSyncRef = useRef<Map<string, PendingBlockSync>>(new Map());

  /**
   * 다른 plan으로 진입할 때 이전 일정 상태를 비웁니다.
   *
   * Provider가 앱 루트에 상주해 days가 앱 수명 내내 유지되므로, 초기화하지 않으면
   * 새로 만든 일정 화면에 직전 일정의 날짜·장소가 그대로 남는다. 남은 days의
   * timetableId는 이전 plan 소속이라 편집 시 남의 일정을 덮어쓸 수도 있다.
   *
   * days만 비우면 임시 ID로 보류 중인 전송분이 새 방으로 flush되므로 함께 정리한다.
   */
  const resetItinerary = useCallback(() => {
    setDays([]);
    setLastAddedPlaceId(null);
    pendingBlockSyncRef.current.clear();
  }, []);

  /**
   * 블록 변경을 전송합니다. blockId가 아직 없으면 서버가 create 응답으로
   * 실제 ID를 돌려줄 때까지 보류합니다. ID 없이 보낸 update는 서버에서
   * 예외로 통째 폐기되고, delete는 조용히 무시됩니다.
   */
  const sendBlockSync = useCallback(
    (action: 'update' | 'delete', place: Place, timetableId: number) => {
      if (isTempPlaceId(place.id)) {
        const prev = pendingBlockSyncRef.current.get(place.id);
        if (prev?.action === 'delete') return; // 삭제가 이미 예약된 블록
        pendingBlockSyncRef.current.set(place.id, {
          action,
          place,
          timetableId,
        });
        return;
      }

      sendMessage(
        action,
        'timetableplaceblock',
        mapToTimetablePlaceBlockDto(place, timetableId),
      );
    },
    [sendMessage],
  );

  /** 임시 ID가 실제 blockId로 확정된 시점에 보류분을 재작성해 전송합니다. */
  const flushPendingBlockSync = useCallback(
    (tempId: string, realId: string) => {
      const pending = pendingBlockSyncRef.current.get(tempId);
      if (!pending) return;
      pendingBlockSyncRef.current.delete(tempId);

      sendMessage(
        pending.action,
        'timetableplaceblock',
        mapToTimetablePlaceBlockDto(
          { ...pending.place, id: realId },
          pending.timetableId,
        ),
      );
    },
    [sendMessage],
  );

  const handleWebSocketMessage = useCallback(
    (msg: any) => {
      if (!msg) return;

      // Extract properties supporting both legacy (type, target, data) and backend-v2 (action, entity, timeTablePlaceBlockDtos) STOMP formats
      const action = msg.action || msg.type;
      const entity = msg.entity || msg.target;
      const eventId = msg.eventId;

      if (entity === 'timetableplaceblock') {
        const rawDataList =
          msg.timeTablePlaceBlockDtos ||
          msg.timetableplaceblocks ||
          (msg.data ? (msg.data.timeTablePlaceBlockDtos || msg.data.timetableplaceblocks || msg.data) : null);

        const dataList = Array.isArray(rawDataList)
          ? rawDataList
          : rawDataList
          ? [rawDataList]
          : [];
        if (dataList.length === 0) return;

        dataList.forEach((respVO: any) => {
          const timetableId = respVO.timeTableId || respVO.timetableId;
          const realId =
            respVO.blockId || respVO.timetablePlaceBlockId
              ? String(respVO.blockId || respVO.timetablePlaceBlockId)
              : null;

          // 임시 ID로 보류해 둔 update/delete를 확정된 blockId로 재전송
          if (action === 'create' && realId && isTempPlaceId(eventId)) {
            flushPendingBlockSync(eventId, realId);
          }

          setDays(prevDays => {
            let dayIndex = -1;

            if (timetableId !== undefined && timetableId !== null) {
              dayIndex = prevDays.findIndex(
                d => String(d.timetableId) === String(timetableId),
              );
            }

            if (dayIndex === -1 && respVO.date) {
              const targetDateStr = String(respVO.date).split('T')[0];
              dayIndex = prevDays.findIndex(
                d => formatDateLocal(d.date) === targetDateStr,
              );
            }

            if (dayIndex === -1) return prevDays;

            const updatedDays = [...prevDays];
            const dayToUpdate = { ...updatedDays[dayIndex] };

            if (!dayToUpdate.timetableId && timetableId) {
              dayToUpdate.timetableId = timetableId;
            }

            const targetId = realId || eventId;

            if (action === 'create') {
              const tempIndex = eventId
                ? dayToUpdate.places.findIndex(p => p.id === eventId)
                : -1;

              if (tempIndex !== -1) {
                const existingPlaces = [...dayToUpdate.places];
                if (realId) {
                  existingPlaces[tempIndex] = {
                    ...existingPlaces[tempIndex],
                    id: realId,
                  };
                  setLastAddedPlaceId(prev => (prev === eventId ? realId : prev));
                }
                dayToUpdate.places = existingPlaces;
              } else {
                const parseTime = (time: any) => {
                  if (typeof time === 'string') return time.substring(0, 5);
                  if (time && typeof time.hour === 'number') {
                    return `${String(time.hour).padStart(2, '0')}:${String(
                      time.minute,
                    ).padStart(2, '0')}`;
                  }
                  return '12:00';
                };

                const placeIdToUse = targetId || `place_${Date.now()}_${Math.random()}`;

                if (!dayToUpdate.places.some(p => p.id === placeIdToUse || (realId && p.id === realId))) {
                  const rawCategoryId = blockCategoryToCategoryId(
                    respVO.blockCategory,
                    respVO.placeCategoryId ?? respVO.placeCategory,
                  );
                  const newPlace: Place = {
                    id: placeIdToUse,
                    placeRefId: respVO.placeId || '',
                    name: respVO.placeName || '장소',
                    type: categoryMapping(rawCategoryId),
                    startTime: parseTime(
                      respVO.startTime ?? respVO.blockStartTime,
                    ),
                    endTime: parseTime(respVO.endTime ?? respVO.blockEndTime),
                    address: respVO.placeAddress || '',
                    latitude: respVO.latitude ?? respVO.yLocation ?? respVO.ylocation ?? 0,
                    longitude: respVO.longitude ?? respVO.xLocation ?? respVO.xlocation ?? 0,
                    imageUrl: respVO.photoUrl || respVO.placeThumbnailUrl || respVO.placeLink || '',
                    categoryId: normalizeCategoryId(rawCategoryId),
                    contentTypeId: respVO.placeContentTypeId || '',
                    copyrightDivCd: respVO.placeCopyrightDivCd || '',
                  };
                  dayToUpdate.places = resolveConflictsAndSort([
                    ...dayToUpdate.places,
                    newPlace,
                  ]);
                }
              }
            } else if (action === 'update') {
              const lookupId = realId || eventId;
              if (lookupId) {
                const placeIndex = dayToUpdate.places.findIndex(
                  p => p.id === lookupId,
                );
                if (placeIndex !== -1) {
                  const parseTime = (time: any) => {
                    if (typeof time === 'string') return time.substring(0, 5);
                    if (time && typeof time.hour === 'number') {
                      return `${String(time.hour).padStart(2, '0')}:${String(
                        time.minute,
                      ).padStart(2, '0')}`;
                    }
                    return '12:00';
                  };

                  const existingPlaces = [...dayToUpdate.places];
                  const newStartTime =
                    respVO.startTime ?? respVO.blockStartTime;
                  const newEndTime = respVO.endTime ?? respVO.blockEndTime;

                  existingPlaces[placeIndex] = {
                    ...existingPlaces[placeIndex],
                    startTime: newStartTime
                      ? parseTime(newStartTime)
                      : existingPlaces[placeIndex].startTime,
                    endTime: newEndTime
                      ? parseTime(newEndTime)
                      : existingPlaces[placeIndex].endTime,
                    memo:
                      respVO.memo !== undefined
                        ? respVO.memo
                        : existingPlaces[placeIndex].memo,
                  };
                  dayToUpdate.places = resolveConflictsAndSort(
                    existingPlaces,
                    lookupId,
                  );
                }
              }
            } else if (action === 'delete') {
              const lookupId = realId || eventId;
              if (lookupId) {
                dayToUpdate.places = dayToUpdate.places.filter(
                  p => p.id !== lookupId,
                );
              }
            }

            updatedDays[dayIndex] = dayToUpdate;
            return updatedDays;
          });
        });
      } else if (entity === 'timetable') {
        // undo/redo 브로드캐스트는 payload 키가 '{entity}s'(=timetables)다.
        const rawDataList =
          msg.timeTableDtos ||
          (msg.data
            ? msg.data.timeTableDtos || msg.data.timetables || msg.data
            : null);

        const dataList = Array.isArray(rawDataList)
          ? rawDataList
          : rawDataList
          ? [rawDataList]
          : [];
        if (dataList.length === 0) return;

        setDays(prevDays => {
          let nextDays = [...prevDays];
          let changed = false;

          dataList.forEach((respVO: any) => {
            const timetableId = respVO.timeTableId ?? respVO.timetableId;
            const dateStr = respVO.date
              ? String(respVO.date).split('T')[0]
              : null;

            if (action === 'delete') {
              if (timetableId === undefined || timetableId === null) return;
              const idx = nextDays.findIndex(
                d => String(d.timetableId) === String(timetableId),
              );
              if (idx !== -1) {
                nextDays.splice(idx, 1);
                changed = true;
              }
              return;
            }

            if (!dateStr) return;

            const idx = nextDays.findIndex(
              d => formatDateLocal(d.date) === dateStr,
            );

            if (idx !== -1) {
              // 서버가 확정한 timetableId를 주입해야 이후 블록 편집이 전송된다.
              if (String(nextDays[idx].timetableId) !== String(timetableId)) {
                nextDays[idx] = { ...nextDays[idx], timetableId };
                changed = true;
              }
            } else {
              const [y, m, d] = dateStr.split('-').map(Number);
              nextDays.push({
                timetableId,
                date: new Date(y, m - 1, d),
                dayNumber: 0,
                startTime: respVO.timeTableStartTime || '09:00:00',
                endTime: respVO.timeTableEndTime || '20:00:00',
                places: [],
              });
              changed = true;
            }
          });

          if (!changed) return prevDays;

          nextDays.sort((a, b) => a.date.getTime() - b.date.getTime());
          return nextDays.map((d, i) => ({ ...d, dayNumber: i + 1 }));
        });
      }
    },
    [setDays, flushPendingBlockSync],
  );

  useEffect(() => {
    if (subscribeToMessages) {
      subscribeToMessages(handleWebSocketMessage);
    }
    return () => {
      if (unsubscribeFromMessages) {
        unsubscribeFromMessages(handleWebSocketMessage);
      }
    };
  }, [subscribeToMessages, unsubscribeFromMessages, handleWebSocketMessage]);

  const addPlaceToDay = useCallback((
    dayIndex: number,
    placeData: Omit<Place, 'startTime' | 'endTime'> & { startTime?: string; endTime?: string },
  ) => {
    const newId = createTempPlaceId();

    let finalPlace: Place | undefined;
    let dayTimetableId: number | undefined;
    let dayDateString: string | undefined;
    let otherPlacesToSync: Place[] = [];

    setDays(prevDays => {
      if (prevDays.length === 0 || !prevDays[dayIndex]) {
        return prevDays;
      }

      const placeToAdd: Place = {
        ...placeData,
        id: newId,
        placeRefId: placeData.id,
        categoryId: normalizeCategoryId(placeData.categoryId, placeData.type),
        latitude: placeData.latitude ?? 0,
        longitude: placeData.longitude ?? 0,
        ...ensureValidRange(
          placeData.startTime || '12:00',
          placeData.endTime || '13:00',
        ),
      };

      const updatedDays = [...prevDays];
      const dayToUpdate = { ...updatedDays[dayIndex] };
      // resolveConflictsAndSort가 내부에서 복사하므로 여기서 또 복사하지 않는다.
      const newPlacesList = [...dayToUpdate.places, placeToAdd];

      dayToUpdate.places = resolveConflictsAndSort(
        newPlacesList,
        placeToAdd.id,
        timeToMinutes(dayToUpdate.endTime || DEFAULT_DAY_END),
      );
      updatedDays[dayIndex] = dayToUpdate;

      finalPlace = dayToUpdate.places.find(p => p.id === newId);
      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = formatDateLocal(dayToUpdate.date);
      // 신규 블록에 밀려 시간이 바뀐 기존 블록만 동기화한다.
      otherPlacesToSync = pickTimeChanged(
        prevDays[dayIndex].places,
        dayToUpdate.places,
      ).filter(p => p.id !== newId);

      return updatedDays;
    });

    setLastAddedPlaceId(newId);

    setTimeout(() => {
      if (finalPlace && dayTimetableId && dayDateString) {
        sendMessage(
          'create',
          'timetableplaceblock',
          mapToTimetablePlaceBlockDto(finalPlace, dayTimetableId),
          newId,
        );

        otherPlacesToSync.forEach(p => {
          sendBlockSync('update', p, dayTimetableId!);
        });
      }
    }, 0);
  }, [sendMessage, sendBlockSync]);

  const deletePlaceFromDay = useCallback((dayIndex: number, placeId: string) => {
    let placeToDelete: Place | undefined;
    let dayTimetableId: number | undefined;
    let dayDateString: string | undefined;

    setDays(prevDays => {
      if (prevDays.length === 0 || !prevDays[dayIndex]) {
        return prevDays;
      }
      const updatedDays = [...prevDays];
      const dayToUpdate = { ...updatedDays[dayIndex] };

      placeToDelete = dayToUpdate.places.find(p => p.id === placeId);
      dayToUpdate.places = dayToUpdate.places.filter(
        place => place.id !== placeId,
      );
      updatedDays[dayIndex] = dayToUpdate;

      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = formatDateLocal(dayToUpdate.date);

      return updatedDays;
    });

    setLastAddedPlaceId(null);

    setTimeout(() => {
      if (placeToDelete && dayTimetableId && dayDateString) {
        sendBlockSync('delete', placeToDelete, dayTimetableId);
      }
    }, 0);
  }, [sendBlockSync]);

  const updatePlaceTimes = useCallback((
    dayIndex: number,
    placeId: string,
    newStartTime: string,
    newEndTime: string,
  ) => {
    let placesToSync: Place[] = [];
    let dayTimetableId: number | undefined;
    let dayDateString: string | undefined;

    setDays(prevDays => {
      if (prevDays.length === 0 || !prevDays[dayIndex]) {
        return prevDays;
      }
      const updatedDays = [...prevDays];
      const dayToUpdate = { ...updatedDays[dayIndex] };

      const safeRange = ensureValidRange(newStartTime, newEndTime);
      // 바뀐 블록만 새 객체로 만든다. 나머지는 참조를 유지해야
      // resolveConflictsAndSort가 변경 없는 블록의 참조를 그대로 되돌려 줄 수 있다.
      const newPlacesList = dayToUpdate.places.map(p =>
        p.id === placeId ? { ...p, ...safeRange } : p,
      );

      dayToUpdate.places = resolveConflictsAndSort(
        newPlacesList,
        placeId,
        timeToMinutes(dayToUpdate.endTime || DEFAULT_DAY_END),
      );
      updatedDays[dayIndex] = dayToUpdate;

      placesToSync = pickTimeChanged(
        prevDays[dayIndex].places,
        dayToUpdate.places,
      );
      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = formatDateLocal(dayToUpdate.date);

      return updatedDays;
    });

    setLastAddedPlaceId(null);

    setTimeout(() => {
      if (dayTimetableId && dayDateString) {
        placesToSync.forEach(p => {
          sendBlockSync('update', p, dayTimetableId!);
        });
      }
    }, 0);
  }, [sendBlockSync]);

  const updatePlaceMemo = useCallback((dayIndex: number, placeId: string, memo: string) => {
    let finalPlace: Place | undefined;
    let dayTimetableId: number | undefined;
    let dayDateString: string | undefined;

    setDays(prevDays => {
      if (prevDays.length === 0 || !prevDays[dayIndex]) {
        return prevDays;
      }
      const updatedDays = [...prevDays];
      const dayToUpdate = { ...updatedDays[dayIndex] };

      dayToUpdate.places = dayToUpdate.places.map(p =>
        p.id === placeId ? { ...p, memo } : p,
      );
      updatedDays[dayIndex] = dayToUpdate;

      finalPlace = dayToUpdate.places.find(p => p.id === placeId);
      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = formatDateLocal(dayToUpdate.date);

      return updatedDays;
    });

    setTimeout(() => {
      if (finalPlace && dayTimetableId && dayDateString) {
        sendBlockSync('update', finalPlace, dayTimetableId);
      }
    }, 0);
  }, [sendBlockSync]);

  const updatePlaceDetails = useCallback((
    dayIndex: number,
    placeId: string,
    updates: Partial<
      Pick<Place, 'startTime' | 'endTime' | 'memo' | 'name' | 'address'>
    >,
  ) => {
    let placesToSync: Place[] = [];
    let singlePlaceToSync: Place | undefined;
    let dayTimetableId: number | undefined;
    let dayDateString: string | undefined;
    let isTimeChanged = updates.startTime !== undefined || updates.endTime !== undefined;

    setDays(prevDays => {
      if (prevDays.length === 0 || !prevDays[dayIndex]) {
        return prevDays;
      }
      const updatedDays = [...prevDays];
      const dayToUpdate = { ...updatedDays[dayIndex] };

      const newPlacesList = dayToUpdate.places.map(p => {
        if (p.id !== placeId) return p;
        const merged = { ...p, ...updates };
        return {
          ...merged,
          ...ensureValidRange(merged.startTime, merged.endTime),
        };
      });

      if (isTimeChanged) {
        dayToUpdate.places = resolveConflictsAndSort(
          newPlacesList,
          placeId,
          timeToMinutes(dayToUpdate.endTime || DEFAULT_DAY_END),
        );
      } else {
        dayToUpdate.places = newPlacesList;
      }

      updatedDays[dayIndex] = dayToUpdate;

      singlePlaceToSync = dayToUpdate.places.find(p => p.id === placeId);

      if (isTimeChanged) {
        // 시간이 밀린 블록 + 편집 대상 블록(메모/이름 등도 함께 바뀔 수 있음)
        const shifted = pickTimeChanged(
          prevDays[dayIndex].places,
          dayToUpdate.places,
        );
        placesToSync = shifted.some(p => p.id === placeId)
          ? shifted
          : [...shifted, ...(singlePlaceToSync ? [singlePlaceToSync] : [])];
      } else {
        placesToSync = singlePlaceToSync ? [singlePlaceToSync] : [];
      }

      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = formatDateLocal(dayToUpdate.date);

      return updatedDays;
    });

    setLastAddedPlaceId(null);

    setTimeout(() => {
      if (dayTimetableId && dayDateString) {
        placesToSync.forEach(p => {
          sendBlockSync('update', p, dayTimetableId!);
        });
      }
    }, 0);
  }, [sendBlockSync]);

  /**
   * 하루의 방문 순서를 재배치한다.
   *
   * 기존 시간대(시작·종료 쌍)를 시간순 그대로 두고, 그 슬롯에 새 순서의 장소를
   * 채워 넣는다. 시간대 자체는 바뀌지 않으므로 겹침이 새로 생기지 않는다.
   * 시간이 실제로 달라진 블록만 서버에 전송한다.
   */
  const reorderPlacesInDay = useCallback(
    (dayIndex: number, orderedPlaceIds: string[]) => {
      let placesToSync: Place[] = [];
      let dayTimetableId: number | undefined;
      let dayDateString: string | undefined;

      setDays(prevDays => {
        const day = prevDays[dayIndex];
        if (!day || orderedPlaceIds.length === 0) {
          return prevDays;
        }

        const byId = new Map(day.places.map(p => [p.id, p]));
        const reordered = orderedPlaceIds
          .map(id => byId.get(id))
          .filter((p): p is Place => !!p);

        // 요청한 ID 집합이 그날 블록과 정확히 일치할 때만 적용한다.
        if (reordered.length !== day.places.length) {
          return prevDays;
        }

        // 원래 시간대를 시간순으로 모아 새 순서에 그대로 씌운다.
        const slots = day.places
          .map(p => ({ startTime: p.startTime, endTime: p.endTime }))
          .sort(
            (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
          );

        const nextPlaces = reordered.map((place, i) => {
          const slot = slots[i];
          if (place.startTime === slot.startTime && place.endTime === slot.endTime) {
            return place;
          }
          return { ...place, ...slot };
        });

        const updatedDays = [...prevDays];
        const dayToUpdate = { ...day, places: nextPlaces };
        updatedDays[dayIndex] = dayToUpdate;

        placesToSync = pickTimeChanged(day.places, nextPlaces);
        dayTimetableId = dayToUpdate.timetableId;
        dayDateString = formatDateLocal(dayToUpdate.date);

        return updatedDays;
      });

      setLastAddedPlaceId(null);

      setTimeout(() => {
        if (dayTimetableId && dayDateString) {
          placesToSync.forEach(p => {
            sendBlockSync('update', p, dayTimetableId!);
          });
        }
      }, 0);
    },
    [sendBlockSync],
  );

  const contextValue = useMemo(() => ({
    days,
    setDays,
    lastAddedPlaceId,
    setLastAddedPlaceId,
    resetItinerary,
    addPlaceToDay,
    deletePlaceFromDay,
    updatePlaceTimes,
    updatePlaceMemo,
    updatePlaceDetails,
    reorderPlacesInDay,
  }), [
    days,
    lastAddedPlaceId,
    resetItinerary,
    addPlaceToDay,
    deletePlaceFromDay,
    updatePlaceTimes,
    updatePlaceMemo,
    updatePlaceDetails,
    reorderPlacesInDay,
  ]);

  return (
    <ItineraryContext.Provider value={contextValue}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}
