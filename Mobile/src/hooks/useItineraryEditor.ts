import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveApiUrl } from '../utils/apiUrl';
import { API_URL } from '@env';
import { useItinerary, Day, Place } from '../contexts/ItineraryContext';
import { timeToMinutes, minutesToTime, resolveConflictsAndSort } from '../utils/timeUtils';
import { createTempPlaceId } from '../utils/planSyncPayload';
import { MINUTE_HEIGHT } from '../features/itinerary/screens/ItineraryEditorScreen.styles';
import { useAlert } from '../contexts/AlertContext';
import Toast from 'react-native-toast-message';

/**
 * 여행지 명칭에서 시/도 단위 접두사를 제거하고 도시명을 추출합니다.
 */
const parseDestinationName = (destination?: string) => {
  const normalized = destination?.trim() || '';
  if (!normalized) return '';
  const parts = normalized.split(/\s+/).filter(Boolean);
  return parts.length <= 1 ? normalized : parts.slice(1).join(' ');
};

/**
 * 일정 편집 화면의 상태 관리, 실시간 WebSocket동기화 및 장소 편집 로직을 제공하는 커스텀 훅
 *
 * @param route 네비게이션 라우트 파라미터
 * @param _navigation 네비게이션 객체
 */
export const useItineraryEditor = (route: any, _navigation: any) => {
  const { showAlert } = useAlert();
  const {
    days,
    setDays,
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

  const daysRef = useRef(days);
  daysRef.current = days;

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}.${day}.`;
  };

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
        places: [],
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayCounter++;
    }
    setDays(tripDays);
  }, [route.params?.startDate, route.params?.endDate, setDays]);

  const fetchPlanDetails = useCallback(async () => {
    if (!route.params?.planId) {
      initDaysFromDates();
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(
        resolveApiUrl(`/api/plan/${route.params.planId}`),
        config,
      );
      const { planFrame, placeBlocks, timetables } = response.data;

      if (planFrame?.planName) {
        setTripName(planFrame.planName);
      }
      setPlanMetadata(planFrame);

      if (timetables && timetables.length > 0) {
        const newDays: Day[] = timetables.map((tt: any, index: number) => {
          const date = new Date(tt.date);

          const ttId = tt.timetableId ?? tt.timeTableId;
          const ttDateStr = tt.date ? String(tt.date).substring(0, 10) : '';

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
                if (typeof time === 'string') return time.substring(0, 5);
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

              // 정규화된 카테고리 ID 분류 (0:관광지, 1:숙소, 2:식당, 3:직접추가, 4:검색)
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
                // blockId가 없으면 서버에 존재하지 않는 블록이므로 임시 ID를 부여한다.
                // 외부 placeId(숫자 문자열)를 blockId로 쓰면 남의 블록을 덮어쓴다.
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
            places: resolveConflictsAndSort(dayPlaces),
          };
        });
        setDays(newDays);
      } else {
        initDaysFromDates();
      }
    } catch (error) {
      console.error('일정 정보 조회 실패:', error);
      initDaysFromDates();
    }
  }, [route.params?.planId, initDaysFromDates, setDays]);

  // 마운트 시 초기 일정 조회
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    fetchPlanDetails();
  }, [fetchPlanDetails]);


  const selectedDay = days[selectedDayIndex];

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
        
        // 타임라인 시작 위치 오프셋을 차감하여 적절한 상대 Y 위치로 스크롤
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
        text1: '일정 시간이 수정되었습니다.',
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
        text1: '일정이 삭제되었습니다.',
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
        text1: '일정이 추가되었습니다.',
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
  };
};
