import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
  useEffect,
  useCallback,
  useMemo,
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

import { timeToMinutes, minutesToTime, resolveConflictsAndSort } from '../utils/timeUtils';


interface ItineraryContextType {
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
  lastAddedPlaceId: string | null;
  setLastAddedPlaceId: React.Dispatch<React.SetStateAction<string | null>>;
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
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined,
);

const categoryMapping = (
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

const mapToTimetablePlaceBlockDto = (
  place: Place,
  timetableId?: number,
  date?: string,
) => {
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

  return {
    blockId: !isNaN(Number(place.id)) ? Number(place.id) : null,
    timetablePlaceBlockId: !isNaN(Number(place.id)) ? Number(place.id) : null,
    timeTableId: timetableId,
    timetableId: timetableId,
    date: date,
    placeId: place.placeRefId,
    placeCategoryId: categoryId,
    placeCategory: categoryId,
    blockCategory: categoryToBlockCategory(categoryId),
    placeName: place.name,
    placeAddress: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    xLocation: place.longitude,
    yLocation: place.latitude,
    xlocation: place.longitude,
    ylocation: place.latitude,
    photoUrl: place.imageUrl,
    memo: place.memo || '',
    startTime: startTime,
    endTime: endTime,
    blockStartTime: startTime,
    blockEndTime: endTime,
    placeContentTypeId: place.contentTypeId || null,
    placeThumbnailUrl: place.imageUrl || null,
    placeCopyrightDivCd: place.copyrightDivCd || null,
  };
};

export function ItineraryProvider({ children }: PropsWithChildren) {
  const [days, setDays] = useState<Day[]>([]);
  const [lastAddedPlaceId, setLastAddedPlaceId] = useState<string | null>(null);
  const { sendMessage, subscribeToMessages, unsubscribeFromMessages } =
    useWebSocket();

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

          setDays(prevDays => {
            let dayIndex = -1;

            if (timetableId !== undefined && timetableId !== null) {
              dayIndex = prevDays.findIndex(
                d => String(d.timetableId) === String(timetableId),
              );
            }

            if (dayIndex === -1 && respVO.date) {
              const targetDateStr = String(respVO.date).split('T')[0];
              dayIndex = prevDays.findIndex(d => {
                const year = d.date.getFullYear();
                const month = String(d.date.getMonth() + 1).padStart(2, '0');
                const date = String(d.date.getDate()).padStart(2, '0');
                const localDateStr = `${year}-${month}-${date}`;
                return localDateStr === targetDateStr;
              });
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
      }
    },
    [setDays],
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
    const newId = `place_${Date.now()}_${Math.random()}`;

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
        startTime: placeData.startTime || '12:00',
        endTime: placeData.endTime || '13:00',
        latitude: placeData.latitude ?? 0,
        longitude: placeData.longitude ?? 0,
      };

      const updatedDays = [...prevDays];
      const dayToUpdate = { ...updatedDays[dayIndex] };
      const newPlacesList = [
        ...dayToUpdate.places.map(p => ({ ...p })),
        placeToAdd,
      ];

      dayToUpdate.places = resolveConflictsAndSort(
        newPlacesList,
        placeToAdd.id,
        dayToUpdate.endTime ? timeToMinutes(dayToUpdate.endTime) : undefined,
      );
      updatedDays[dayIndex] = dayToUpdate;

      finalPlace = dayToUpdate.places.find(p => p.id === newId);
      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = dayToUpdate.date.toISOString().split('T')[0];
      otherPlacesToSync = dayToUpdate.places.filter(p => p.id !== newId);

      return updatedDays;
    });

    setLastAddedPlaceId(newId);

    setTimeout(() => {
      if (finalPlace && dayTimetableId && dayDateString) {
        sendMessage(
          'create',
          'timetableplaceblock',
          mapToTimetablePlaceBlockDto(
            finalPlace,
            dayTimetableId,
            dayDateString,
          ),
          newId,
        );

        if (otherPlacesToSync.length > 0) {
          otherPlacesToSync.forEach(p => {
            sendMessage(
              'update',
              'timetableplaceblock',
              mapToTimetablePlaceBlockDto(
                p,
                dayTimetableId!,
                dayDateString!,
              ),
            );
          });
        }
      }
    }, 0);
  }, [sendMessage]);

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
      dayDateString = dayToUpdate.date.toISOString().split('T')[0];

      return updatedDays;
    });

    setLastAddedPlaceId(null);

    setTimeout(() => {
      if (placeToDelete && dayTimetableId && dayDateString) {
        sendMessage(
          'delete',
          'timetableplaceblock',
          mapToTimetablePlaceBlockDto(
            placeToDelete,
            dayTimetableId,
            dayDateString,
          ),
        );
      }
    }, 0);
  }, [sendMessage]);

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

      const newPlacesList = dayToUpdate.places.map(p =>
        p.id === placeId
          ? { ...p, startTime: newStartTime, endTime: newEndTime }
          : { ...p },
      );

      dayToUpdate.places = resolveConflictsAndSort(
        newPlacesList,
        placeId,
        dayToUpdate.endTime ? timeToMinutes(dayToUpdate.endTime) : undefined,
      );
      updatedDays[dayIndex] = dayToUpdate;

      placesToSync = dayToUpdate.places;
      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = dayToUpdate.date.toISOString().split('T')[0];

      return updatedDays;
    });

    setLastAddedPlaceId(null);

    setTimeout(() => {
      if (dayTimetableId && dayDateString && placesToSync.length > 0) {
        placesToSync.forEach(p => {
          sendMessage(
            'update',
            'timetableplaceblock',
            mapToTimetablePlaceBlockDto(
              p,
              dayTimetableId!,
              dayDateString!,
            ),
          );
        });
      }
    }, 0);
  }, [sendMessage]);

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
        p.id === placeId ? { ...p, memo } : { ...p },
      );
      updatedDays[dayIndex] = dayToUpdate;

      finalPlace = dayToUpdate.places.find(p => p.id === placeId);
      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = dayToUpdate.date.toISOString().split('T')[0];

      return updatedDays;
    });

    setTimeout(() => {
      if (finalPlace && dayTimetableId && dayDateString) {
        sendMessage(
          'update',
          'timetableplaceblock',
          mapToTimetablePlaceBlockDto(
            finalPlace,
            dayTimetableId,
            dayDateString,
          ),
        );
      }
    }, 0);
  }, [sendMessage]);

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

      const newPlacesList = dayToUpdate.places.map(p =>
        p.id === placeId ? { ...p, ...updates } : { ...p },
      );

      if (isTimeChanged) {
        dayToUpdate.places = resolveConflictsAndSort(newPlacesList, placeId);
      } else {
        dayToUpdate.places = newPlacesList;
      }

      updatedDays[dayIndex] = dayToUpdate;

      placesToSync = dayToUpdate.places;
      singlePlaceToSync = dayToUpdate.places.find(p => p.id === placeId);
      dayTimetableId = dayToUpdate.timetableId;
      dayDateString = dayToUpdate.date.toISOString().split('T')[0];

      return updatedDays;
    });

    setLastAddedPlaceId(null);

    setTimeout(() => {
      if (dayTimetableId && dayDateString) {
        if (isTimeChanged) {
          placesToSync.forEach(p => {
            sendMessage(
              'update',
              'timetableplaceblock',
              mapToTimetablePlaceBlockDto(
                p,
                dayTimetableId!,
                dayDateString!,
              ),
            );
          });
        } else if (singlePlaceToSync) {
          sendMessage(
            'update',
            'timetableplaceblock',
            mapToTimetablePlaceBlockDto(
              singlePlaceToSync,
              dayTimetableId,
              dayDateString,
            ),
          );
        }
      }
    }, 0);
  }, [sendMessage]);

  const contextValue = useMemo(() => ({
    days,
    setDays,
    lastAddedPlaceId,
    setLastAddedPlaceId,
    addPlaceToDay,
    deletePlaceFromDay,
    updatePlaceTimes,
    updatePlaceMemo,
    updatePlaceDetails,
  }), [
    days,
    lastAddedPlaceId,
    addPlaceToDay,
    deletePlaceFromDay,
    updatePlaceTimes,
    updatePlaceMemo,
    updatePlaceDetails,
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
