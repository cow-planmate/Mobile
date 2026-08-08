import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { ScrollView } from 'react-native';
import axios from 'axios';
import { resolveApiUrl } from '../../../utils/apiUrl';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../components/TimelineItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
  formatDateLocal,
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
import { usePlanOwnership } from '../../../hooks/usePlanOwnership';
import ItineraryViewScreenView from './ItineraryViewScreen.view';
// DTO Interfaces
interface PlanFrameVO {
  planId: number;
  planName: string;
  departure: string;
  travelCategoryName: string;
  travelId: number;
  travelName: string;
  adultCount: number;
  childCount: number;
  transportationCategoryId: number;
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

/** route.params.days 기본값. 인라인 []는 렌더마다 새 배열이라 이펙트가 매번 돈다. */
const EMPTY_DAYS: Day[] = [];

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryView'>;

/**
 * 완공된 여행 일정표 조회 및 날씨/경로 요약 확인 화면 컨테이너 컴포넌트
 *
 * @param props route 라우트 파라미터 및 navigation 프로퍼티
 */
export default function ItineraryViewScreen({ route, navigation }: Props) {
  const { showAlert } = useAlert();
  const {
    days: initialDays = EMPTY_DAYS,
    tripName: initialTripName = '',
    departure,
    destination: routeDestination,
    travelId,
    transport,
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
  const { isOwner: isPlanOwner } = usePlanOwnership(planId);
  const [isMapVisible, setMapVisible] = useState(false);
  const [isBacking, setIsBacking] = useState(false);
  const isBackingRef = useRef(false);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const scrollRef = useRef<ScrollView>(null);

  // Weather
  const [weatherMap, setWeatherMap] = useState<
    Record<string, SimpleWeatherInfo>
  >({});
  /** 날씨 조회 기준 여행지 ID. 서버는 도시명이 아니라 destinationId를 받는다. */
  const [weatherDestinationId, setWeatherDestinationId] = useState<number | null>(
    route.params?.travelId ?? null,
  );
  const [destinationCity, setDestinationCity] = useState(
    routeDestination || '',
  );
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);

  const buildWeatherCity = useCallback(
    (travelCategoryName?: string, travelName?: string) => {
      const category = travelCategoryName?.trim() || '';
      const name = travelName?.trim() || '';

      if (category && name) {
        return `${category} ${name}`;
      }

      return category || name || '';
    },
    [],
  );

  const fetchCompletePlan = useCallback(async () => {
    if (!planId) return;
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get<GetCompletePlanResponse>(
        resolveApiUrl(`/api/plan/${planId}/complete`),
        config,
      );
      const { planFrame, placeBlocks, timetables } = response.data;

      const planDestinationId =
        (planFrame as any)?.destinationId ?? planFrame?.travelId ?? null;
      if (planDestinationId != null) {
        setWeatherDestinationId(Number(planDestinationId));
      }

      if (planFrame?.planName) {
        setTripName(prev => (prev ? prev : planFrame.planName));
      }
      const fetchedDestination =
        (planFrame as any)?.destinationName ||
        buildWeatherCity(planFrame?.travelCategoryName, planFrame?.travelName);
      if (fetchedDestination) {
        setDestinationCity(fetchedDestination);
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

            // Resolve normalized categoryId (0:관광지, 1:숙소, 2:식당, 3:직접추가, 4:검색)
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
            date: new Date(tt.date),
            dayNumber: index + 1,
            startTime: tt.timeTableStartTime || DEFAULT_DAY_START,
            endTime: tt.timeTableEndTime || DEFAULT_DAY_END,
            places: places,
            timetableId: ttId,
          };
        });

        // 편집 직후 곧바로 조회하면 서버 DB가 아직 최신 편집을 반영하기 전(주기/지연 동기화 대기 중)일 수 있다.
        // 그 stale 응답이 방금 저장한 로컬 데이터보다 place가 적으면 무시하고 로컬을 유지한다.
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
  }, [planId, buildWeatherCity, showAlert]);

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

  // 날씨 조회 범위. 일수가 같아도 날짜가 바뀌면 다시 조회해야 한다.
  const weatherRangeStart = days.length > 0 ? formatDateLocal(days[0].date) : '';
  const weatherRangeEnd =
    days.length > 0 ? formatDateLocal(days[days.length - 1].date) : '';

  // Fetch weather when destination and days are available
  useEffect(() => {
    if (!weatherDestinationId || !weatherRangeStart || !weatherRangeEnd) {
      setWeatherMap({});
      setIsWeatherLoading(false);
      return;
    }
    setIsWeatherLoading(true);

    const startDate = weatherRangeStart;
    const endDate = weatherRangeEnd;
    // 기간이 연달아 바뀌면 먼저 보낸 응답이 나중에 도착해 최신 결과를 덮어쓸 수 있다.
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
        // 실패 시 고정값을 채우면 조회가 계속 실패해도 정상처럼 보인다. 비워 둔다.
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
        e.preventDefault();
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
    // Plan is already created/saved in ItineraryEditorScreen.
    // Navigate to My Page (Profile) to see the created plan.
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
          transport,
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
