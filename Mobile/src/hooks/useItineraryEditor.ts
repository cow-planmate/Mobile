import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import { ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import {
  useItinerary,
  Day,
  Place,
  isFetchAtLeastAsComplete,
} from '../contexts/ItineraryContext';
import {
  timeToMinutes,
  minutesToTime,
  parseLocalDate,
  resolveConflictsAndSort,
  formatMonthDayDot,
  normalizeTime,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from '../utils/timeUtils';
import { createTempPlaceId } from '../utils/planSyncPayload';
import { dropPlanComplete } from './planCompleteCache';
import { MINUTE_HEIGHT } from '../features/itinerary/screens/ItineraryEditorScreen.styles';
import Toast from 'react-native-toast-message';

const parseDestinationName = (destination?: string) => {
  const normalized = destination?.trim() || '';
  if (!normalized) return '';
  const parts = normalized.split(/\s+/).filter(Boolean);
  return parts.length <= 1 ? normalized : parts.slice(1).join(' ');
};

const formatDate = formatMonthDayDot;

export const useItineraryEditor = (route: any, _navigation: any) => {
  const queryClient = useQueryClient();
  const {
    days,
    setDays,
    resetItinerary,
    deletePlaceFromDay,
    addPlaceToDay,
    updatePlaceTimes,
    lastAddedPlaceId,
    setLastAddedPlaceId,
  } = useItinerary();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tripName, setTripName] = useState(
    route.params?.tripName || parseDestinationName(route.params?.destination) || '',
  );
  const [isEditingTripName, setIsEditingTripName] = useState(false);
  const [planMetadata, setPlanMetadata] = useState<any>(null);

  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [editingTime, setEditingTime] = useState<{
    placeId: string;
    type: 'startTime' | 'endTime';
    time: string;
  } | null>(null);

  const isInitialized = useRef(false);
  const timelineScrollRef = useRef<ScrollView>(null);

  const loadedPlanIdRef = useRef<string | null>(null);

  const [isInitialPlanLoading, setIsInitialPlanLoading] = useState(true);

  const initDaysFromDates = useCallback(() => {
    if (!route.params?.startDate || !route.params?.endDate) return;
    const start = new Date(route.params.startDate);
    const end = new Date(route.params.endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const tripDays: Day[] = [];
    let currentDate = new Date(start);
    let dayCounter = 1;

    while (currentDate.getTime() <= end.getTime()) {
      tripDays.push({
        date: new Date(currentDate),
        dayNumber: dayCounter,
        startTime: DEFAULT_DAY_START,
        endTime: DEFAULT_DAY_END,
        places: [],
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayCounter++;
    }
    setDays(tripDays);
  }, [route.params?.startDate, route.params?.endDate, setDays]);

  const fetchPlanDetails = useCallback(async (signal?: AbortSignal) => {
    if (!route.params?.planId) {
      initDaysFromDates();
      return;
    }

    const targetPlanId = String(route.params.planId);

    const isSamePlan = loadedPlanIdRef.current === targetPlanId;

    try {

      const response = await axios.get(
        resolveApiUrl(`/api/plan/${route.params.planId}/complete`),
        { signal },
      );
      if (signal?.aborted) return;
      const { planFrame, placeBlocks, timetables } = response.data;

      if (planFrame?.planName) {
        setTripName(planFrame.planName);
      }
      setPlanMetadata(planFrame);

      if (timetables && timetables.length > 0) {
        const newDays: Day[] = timetables.map((tt: any, index: number) => {
          const ttId = tt.timetableId ?? tt.timeTableId;
          const ttDateStr = tt.date ? String(tt.date).substring(0, 10) : '';
          const date = parseLocalDate(ttDateStr);

          const dayPlaces = (placeBlocks || [])
            .filter((pb: any) => {
              const pbTtId = pb.timeTableId ?? pb.timetableId ?? pb.time_table_id;
              if (pbTtId !== undefined && pbTtId !== null && ttId !== undefined && ttId !== null) {
                if (String(pbTtId) === String(ttId)) return true;
              }
              const pbDateStr = pb.date ? String(pb.date).substring(0, 10) : '';
              if (pbDateStr && ttDateStr && pbDateStr === ttDateStr) return true;
              return false;
            })
            .map((pb: any) => {
              const parseTime = (time: any) => {
                if (typeof time === 'string') return normalizeTime(time);
                if (time && typeof time.hour === 'number') {
                  return `${String(time.hour).padStart(2, '0')}:${String(
                    time.minute,
                  ).padStart(2, '0')}`;
                }
                return '12:00';
              };

              const blockCat = (pb as any).blockCategory;
              const contentTypeIdStr = String(pb.placeContentTypeId || '');
              const rawCategoryId = (pb.placeCategoryId ?? pb.placeCategory) as number;

              const normalizedCategoryId = (() => {
                if (blockCat === 'ATTRACTION' || contentTypeIdStr === '12' || [0, 12, 14, 15, 28].includes(rawCategoryId)) return 0;
                if (blockCat === 'ACCOMMODATION' || contentTypeIdStr === '32' || rawCategoryId === 1 || rawCategoryId === 32) return 1;
                if (blockCat === 'RESTAURANT' || contentTypeIdStr === '39' || rawCategoryId === 2 || rawCategoryId === 39) return 2;
                if (blockCat === 'FREE' || rawCategoryId === 3) return 3;
                if (blockCat === 'SEARCH' || rawCategoryId === 4) return 4;
                return [0, 1, 2, 3, 4].includes(rawCategoryId) ? rawCategoryId : 4;
              })();

              const categoryMapping = (
                id: number,
              ):
                | '관광지'
                | '숙소'
                | '식당'
                | '직접 추가'
                | '검색'
                | '기타' => {
                if (id === 0) return '관광지';
                if (id === 1) return '숙소';
                if (id === 2) return '식당';
                if (id === 3) return '직접 추가';
                if (id === 4) return '검색';
                return '기타';
              };

              const realBlockId = pb.blockId ?? pb.timetablePlaceBlockId ?? pb.id;

              return {

                id:
                  realBlockId !== undefined && realBlockId !== null
                    ? String(realBlockId)
                    : createTempPlaceId(),
                placeRefId: pb.placeId || '',
                name: pb.placeName || '장소',
                type: categoryMapping(normalizedCategoryId),
                startTime: parseTime(pb.startTime ?? pb.blockStartTime),
                endTime: parseTime(pb.endTime ?? pb.blockEndTime),
                address: pb.placeAddress || '',
                latitude: pb.latitude ?? pb.yLocation ?? pb.ylocation ?? 0,
                longitude: pb.longitude ?? pb.xLocation ?? pb.xlocation ?? 0,
                imageUrl: pb.photoUrl || pb.placeThumbnailUrl || pb.placeLink || '',
                categoryId: normalizedCategoryId,
                contentTypeId: pb.placeContentTypeId || '',
                copyrightDivCd: pb.placeCopyrightDivCd || '',
              };
            });

          return {
            timetableId: ttId,
            date: date,
            dayNumber: index + 1,

            startTime: tt.timeTableStartTime || DEFAULT_DAY_START,
            endTime: tt.timeTableEndTime || DEFAULT_DAY_END,
            places: resolveConflictsAndSort(dayPlaces),
          };
        });

        setDays(prevDays =>
          !isSamePlan || isFetchAtLeastAsComplete(newDays, prevDays)
            ? newDays
            : prevDays,
        );
        loadedPlanIdRef.current = targetPlanId;
      } else {
        initDaysFromDates();
        loadedPlanIdRef.current = targetPlanId;
      }
    } catch (error) {
      if (signal?.aborted || axios.isCancel(error)) return;
      console.error('일정 정보 조회 실패:', error);
      initDaysFromDates();
      loadedPlanIdRef.current = targetPlanId;
    }
  }, [route.params?.planId, initDaysFromDates, setDays]);

  useEffect(() => {
    const editingPlanId = route.params?.planId;
    return () => {
      if (editingPlanId) {
        dropPlanComplete(queryClient, String(editingPlanId));
      }
    };
  }, [route.params?.planId, queryClient]);

  const scopedPlanIdRef = useRef<string | null | undefined>(undefined);
  useLayoutEffect(() => {
    const nextPlanId =
      route.params?.planId != null ? String(route.params.planId) : null;
    if (scopedPlanIdRef.current === nextPlanId) return;
    scopedPlanIdRef.current = nextPlanId;
    isInitialized.current = false;
    setIsInitialPlanLoading(true);
    resetItinerary();
  }, [route.params?.planId, resetItinerary]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    const controller = new AbortController();
    fetchPlanDetails(controller.signal).finally(() => {
      if (!controller.signal.aborted) {
        setIsInitialPlanLoading(false);
      }
    });
    return () => controller.abort();
  }, [fetchPlanDetails]);

  const selectedDay = days[selectedDayIndex];

  useEffect(() => {
    if (days.length === 0) return;
    if (selectedDayIndex > days.length - 1) {
      setSelectedDayIndex(days.length - 1);
    }
  }, [days.length, selectedDayIndex, setSelectedDayIndex]);

  useEffect(() => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [selectedDayIndex]);

  useEffect(() => {
    if (lastAddedPlaceId && selectedDay && timelineScrollRef.current) {
      const newPlace = selectedDay.places.find(p => p.id === lastAddedPlaceId);
      if (newPlace) {
        const dayStartTimeStr = selectedDay.startTime || '09:00:00';
        const minHour = Math.floor(timeToMinutes(dayStartTimeStr) / 60);
        const offsetMinutes = minHour * 60;

        const yOffset = Math.max(0, (timeToMinutes(newPlace.startTime) - offsetMinutes) * MINUTE_HEIGHT);
        timelineScrollRef.current.scrollTo({ y: yOffset, animated: true });
        setLastAddedPlaceId(null);
      }
    }
  }, [lastAddedPlaceId, selectedDay, setLastAddedPlaceId]);

  const handleEditTime = useCallback(
    (placeId: string, type: 'startTime' | 'endTime', time: string) => {
      setEditingTime({ placeId, type, time });
      setTimePickerVisible(true);
    },
    [],
  );

  const handleUpdatePlaceTimes = useCallback(
    (placeId: string, newStartMinutes: number, newEndMinutes: number) => {
      const newStartTime = minutesToTime(newStartMinutes);
      const newEndTime = minutesToTime(newEndMinutes);
      updatePlaceTimes(selectedDayIndex, placeId, newStartTime, newEndTime);
      Toast.show({
        type: 'success',
        text1: '일정 시간을 수정했어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    },
    [selectedDayIndex, updatePlaceTimes],
  );

  const handleDeletePlace = useCallback(
    (placeId: string) => {
      deletePlaceFromDay(selectedDayIndex, placeId);
      Toast.show({
        type: 'success',
        text1: '일정을 삭제했어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    },
    [selectedDayIndex, deletePlaceFromDay],
  );

  const handleAddPlace = useCallback(
    (place: Omit<Place, 'startTime' | 'endTime'>) => {
      addPlaceToDay(selectedDayIndex, place);
      Toast.show({
        type: 'success',
        text1: '일정을 추가했어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    },
    [selectedDayIndex, addPlaceToDay],
  );

  return {
    days,
    selectedDayIndex,
    setSelectedDayIndex,
    tripName,
    setTripName,
    isEditingTripName,
    setIsEditingTripName,
    isTimePickerVisible,
    setTimePickerVisible,
    editingTime,
    setEditingTime,
    timelineScrollRef,
    formatDate,
    handleEditTime,
    handleUpdatePlaceTimes,
    handleDeletePlace,
    handleAddPlace,
    selectedDay,
    planMetadata,
    fetchPlanDetails,
    isInitialPlanLoading,
  };
};
