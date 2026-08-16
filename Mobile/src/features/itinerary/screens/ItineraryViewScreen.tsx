import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { ScrollView } from 'react-native';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { cachePlanComplete } from '../../../hooks/planCompleteCache';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../components/TimelineItem';
import {
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
  formatDateLocal,
  parseLocalDate,
  timeToMinutes,
} from '../../../utils/timeUtils';
import {
  Day,
  isFetchAtLeastAsComplete,
} from '../../../contexts/ItineraryContext';
import {
  PlaceBlockVO,
  SimpleWeatherInfo,
  fetchWeather,
} from '../../../api/trips';
import { useAlert } from '../../../contexts/AlertContext';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { usePlanOwnership } from '../../../hooks/usePlanOwnership';
import ItineraryViewScreenView from './ItineraryViewScreen.view';

interface PlanFrameVO {
  planId: string;
  planName: string;
  destinationId: number;
  destinationName: string;
  adultCount: number;
  childCount: number;
}

interface GetCompletePlanResponse {
  message: string;
  planFrame: PlanFrameVO;
  placeBlocks: PlaceBlockVO[];
  timetables: {
    timetableId?: number;
    timeTableId?: number;
    date: string;
    timeTableStartTime?: string;
    timeTableEndTime?: string;
  }[];
}

const EMPTY_DAYS: Day[] = [];

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryView'>;

export default function ItineraryViewScreen({ route, navigation }: Props) {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const {
    days: initialDays = EMPTY_DAYS,
    tripName: initialTripName = '',
    departure,
    destination: routeDestination,
    travelId,
    adults,
    children,
    planId,
    startDate: routeStartDate,
    endDate: routeEndDate,
  } = route.params || {};

  const [days, setDays] = useState<Day[]>(initialDays);
  const [tripName, setTripName] = useState(initialTripName);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isChecklistVisible, setChecklistVisible] = useState(false);
  const { connect, disconnect } = useWebSocket();
  const { isOwner: isPlanOwner } = usePlanOwnership(planId);
  const [isMapVisible, setMapVisible] = useState(false);
  const [isBacking, setIsBacking] = useState(false);
  const isBackingRef = useRef(false);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const scrollRef = useRef<ScrollView>(null);

  const [weatherMap, setWeatherMap] = useState<
    Record<string, SimpleWeatherInfo>
  >({});

  const [weatherDestinationId, setWeatherDestinationId] = useState<number | null>(
    route.params?.travelId ?? null,
  );
  const [destinationCity, setDestinationCity] = useState(
    routeDestination || '',
  );
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);

  const fetchCompletePlan = useCallback(async () => {
    if (!planId) return;
    try {

      const response = await axios.get<GetCompletePlanResponse>(
        resolveApiUrl(`/api/plan/${planId}/complete`),
      );

      cachePlanComplete(queryClient, String(planId), response.data);
      const { planFrame, placeBlocks, timetables } = response.data;

      const planDestinationId = planFrame?.destinationId ?? null;
      if (planDestinationId != null) {
        setWeatherDestinationId(Number(planDestinationId));
      }

      if (planFrame?.planName) {
        setTripName(prev => (prev ? prev : planFrame.planName));
      }
      if (planFrame?.destinationName) {
        setDestinationCity(planFrame.destinationName);
      }

      if (timetables && timetables.length > 0) {
        const fetchedDays: Day[] = timetables.map((tt, index) => {
          const ttId = tt.timetableId ?? tt.timeTableId;
          const blocks = placeBlocks.filter(
            pb => (pb.timeTableId ?? pb.timetableId) === ttId,
          );

          const parseTime = (time: any) => {
            if (typeof time === 'string') return time.substring(0, 5);
            if (time && typeof time.hour === 'number') {
              return `${String(time.hour).padStart(2, '0')}:${String(
                time.minute,
              ).padStart(2, '0')}`;
            }
            return '12:00';
          };

          const places: Place[] = blocks.map(pb => {
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

            const typeName = (() => {
              switch (normalizedCategoryId) {
                case 0: return '관광지';
                case 1: return '숙소';
                case 2: return '식당';
                case 3: return '직접 추가';
                default: return '검색';
              }
            })();

            return {
              id: String(pb.blockId ?? pb.timetablePlaceBlockId),
              categoryId: normalizedCategoryId,
              placeRefId: pb.placeId,
              name: pb.placeName,
              address: pb.placeAddress,
              type: typeName as any,
              startTime: parseTime(pb.startTime ?? pb.blockStartTime),
              endTime: parseTime(pb.endTime ?? pb.blockEndTime),
              latitude: pb.latitude ?? pb.yLocation ?? pb.ylocation ?? 0,
              longitude: pb.longitude ?? pb.xLocation ?? pb.xlocation ?? 0,
              imageUrl: pb.photoUrl || pb.placeLink || pb.placeThumbnailUrl || '',
              memo: pb.memo || '',
              place_url: pb.placeLink || '',
              contentTypeId: pb.placeContentTypeId || '',
              copyrightDivCd: pb.placeCopyrightDivCd || '',
            };
          });

          return {
            date: parseLocalDate(String(tt.date).substring(0, 10)),
            dayNumber: index + 1,
            startTime: tt.timeTableStartTime || DEFAULT_DAY_START,
            endTime: tt.timeTableEndTime || DEFAULT_DAY_END,
            places: places,
            timetableId: ttId,
          };
        });

        setDays(prevDays =>
          isFetchAtLeastAsComplete(fetchedDays, prevDays)
            ? fetchedDays
            : prevDays,
        );
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      showAlert({ title: '오류', message: '일정을 불러오는데 실패했습니다.' });
      setIsWeatherLoading(false);
    }
  }, [planId, showAlert, queryClient]);

  useEffect(() => {
    if (initialDays.length > 0) {
      setDays(initialDays);
    }
    if (planId) {
      fetchCompletePlan();
    } else if (initialDays.length === 0 && !planId) {
      setIsWeatherLoading(false);
    }
  }, [planId, fetchCompletePlan, initialDays]);

  useEffect(() => {
    if (!planId) return;

    connect(planId);
    const unsubscribeFocus = navigation.addListener('focus', () => connect(planId));
    const unsubscribeBlur = navigation.addListener('blur', disconnect);

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      disconnect();
    };
  }, [connect, disconnect, navigation, planId]);

  const weatherRangeStart = days.length > 0 ? formatDateLocal(days[0].date) : '';
  const weatherRangeEnd =
    days.length > 0 ? formatDateLocal(days[days.length - 1].date) : '';

  useEffect(() => {
    if (!weatherDestinationId || !weatherRangeStart || !weatherRangeEnd) {
      setWeatherMap({});
      setIsWeatherLoading(false);
      return;
    }
    setIsWeatherLoading(true);

    const startDate = weatherRangeStart;
    const endDate = weatherRangeEnd;

    let cancelled = false;

    fetchWeather(weatherDestinationId, startDate, endDate)
      .then(res => {
        if (cancelled) return;
        const map: Record<string, SimpleWeatherInfo> = {};
        if (res && Array.isArray(res.weather)) {
          res.weather.forEach(w => {
            map[w.date] = w;
          });
        }
        setWeatherMap(map);
      })
      .catch(error => {
        if (cancelled) return;

        console.warn('날씨 조회 실패:', error);
        setWeatherMap({});
      })
      .finally(() => {
        if (cancelled) return;
        setIsWeatherLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weatherDestinationId, weatherRangeStart, weatherRangeEnd]);

  useEffect(() => {
    navigation.setOptions({
      title: tripName,
      headerBackVisible: false,
    });
  }, [navigation, tripName]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isBackingRef.current) {
        return;
      }

      if (days.length === 0) {
        return;
      }

      e.preventDefault();
      isBackingRef.current = true;
      setIsBacking(true);

      const timer = setTimeout(() => {
        setIsBacking(false);
        navigation.dispatch(e.data.action);
        isBackingRef.current = false;
      }, 1200);

      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, [navigation, days.length]);

  const selectedDay = days[selectedDayIndex];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [selectedDayIndex]);

  const { gridHours, offsetMinutes, endHour } = useMemo(() => {
    const startTimeStr = selectedDay?.startTime || DEFAULT_DAY_START;
    const endTimeStr = selectedDay?.endTime || DEFAULT_DAY_END;
    const minHour = Math.floor(timeToMinutes(startTimeStr) / 60);
    const endMin = timeToMinutes(endTimeStr);
    const maxHour = Math.ceil(endMin / 60);

    const hours = Array.from(
      { length: maxHour - minHour + 1 },
      (_, i) => i + minHour,
    );
    const offset = minHour * 60;
    return { gridHours: hours, offsetMinutes: offset, endHour: maxHour };
  }, [selectedDay]);

  const handleConfirm = async () => {

    showAlert({
      title: '성공',
      message: '일정이 저장되었습니다.',
      type: 'success',
      buttons: [
        {
          text: '확인',
          onPress: () => {
            navigation.reset({
              index: 1,
              routes: [
                { name: 'MainTabs' },
                {
                  name: 'Profile',
                  params: { scrollToItinerary: true },
                },
              ],
            });
          },
        },
      ],
    });
  };

  return (
    <ItineraryViewScreenView
      days={days}
      selectedDayIndex={selectedDayIndex}
      setSelectedDayIndex={setSelectedDayIndex}
      isMapVisible={isMapVisible}
      setMapVisible={setMapVisible}
      isShareModalVisible={isShareModalVisible}
      setShareModalVisible={setShareModalVisible}
      isChecklistVisible={isChecklistVisible}
      setChecklistVisible={setChecklistVisible}
      isPlanOwner={isPlanOwner}
      scrollRef={scrollRef}
      gridHours={gridHours}
      offsetMinutes={offsetMinutes}
      endHour={endHour}
      handleConfirm={handleConfirm}
      goBack={handleGoBack}
      handleEdit={() =>
        navigation.navigate('ItineraryEditor', {
          planId,
          tripName,
          destination: destinationCity || routeDestination,
          departure,
          travelId,
          adults,
          children,
          startDate: routeStartDate || days[0]?.date.toISOString(),
          endDate: routeEndDate || days[days.length - 1]?.date.toISOString(),
        })
      }
      planId={planId}
      weatherMap={weatherMap}
      tripName={tripName}
      isBacking={isBacking}
      isWeatherLoading={isWeatherLoading}
    />
  );
}
