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
import { API_URL } from '@env';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../components/TimelineItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MINUTE_HEIGHT } from './ItineraryViewScreen.styles';
import { Day } from '../../../contexts/ItineraryContext';
import {
  SimpleWeatherInfo,
  fetchWeatherRecommendations,
} from '../../../api/trips';
import { useAlert } from '../../../contexts/AlertContext';
import ItineraryViewScreenView from './ItineraryViewScreen.view';
import { AirplaneLoading } from '../../../components/common';
// DTO Interfaces
interface PlaceBlockVO {
  blockId?: number;
  timetablePlaceBlockId?: number;
  timeTableId: number;
  timetableId?: number;
  placeCategoryId: number;
  placeCategory?: number;
  placeName: string;
  placeTheme: string;
  placeRating?: number;
  placeAddress: string;
  placeLink?: string;
  photoUrl?: string;
  placeId: string;
  startTime: any;
  endTime: any;
  blockStartTime?: any;
  blockEndTime?: any;
  xLocation?: number;
  yLocation?: number;
  xlocation?: number;
  ylocation?: number;
  memo?: string;
  placeContentTypeId?: string;
  placeThumbnailUrl?: string;
  placeCopyrightDivCd?: string;
}

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
  timetables: { timetableId?: number; timeTableId?: number; date: string }[];
}

const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryView'>;

export default function ItineraryViewScreen({ route, navigation }: Props) {
  const { showAlert } = useAlert();
  const {
    days: initialDays = [],
    tripName: initialTripName = '',
    departure,
    destination: routeDestination,
    travelId,
    transport,
    adults,
    children,
    planId,
  } = route.params || {};

  const [days, setDays] = useState<Day[]>(initialDays);
  const [tripName, setTripName] = useState(initialTripName);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
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
        resolveApiUrl(`/api/plan/${planId}`),
        config,
      );
      const { planFrame, placeBlocks, timetables } = response.data;

      if (planFrame?.planName) {
        setTripName(prev => (prev ? prev : planFrame.planName));
      }
      setDestinationCity(
        (planFrame as any)?.destinationName ||
          buildWeatherCity(
            planFrame?.travelCategoryName,
            planFrame?.travelName,
          ),
      );

      const categoryMapping = (
        id: number | undefined,
      ): '관광지' | '숙소' | '식당' | '직접 추가' | '검색' | '기타' => {
        if ([0, 12, 14, 15, 28].includes(id ?? -1)) return '관광지';
        if (id === 1 || id === 32) return '숙소';
        if (id === 2 || id === 39) return '식당';
        if (id === 3) return '직접 추가';
        if (id === 4) return '검색';
        return '기타';
      };

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
            places: places,
            timetableId: ttId,
          };
        });

        // Only override days with fetchedDays if fetchedDays has places, or if current days is empty
        setDays(prevDays => {
          const hasFetchedPlaces = fetchedDays.some(d => d.places.length > 0);
          const hasPrevPlaces = prevDays.some(d => d.places.length > 0);
          if (hasFetchedPlaces || !hasPrevPlaces) {
            return fetchedDays;
          }
          return prevDays;
        });
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      showAlert({ title: '오류', message: '일정을 불러오는데 실패했습니다.' });
      setIsWeatherLoading(false);
    }
  }, [planId, buildWeatherCity]);

  useEffect(() => {
    if (initialDays.length > 0) {
      setDays(initialDays);
    }
    if (planId) {
      fetchCompletePlan();
    } else if (initialDays.length === 0 && !planId) {
      setIsWeatherLoading(false);
    }
  }, [planId, fetchCompletePlan, initialDays.length]);

  // Fetch weather when destination and days are available
  useEffect(() => {
    if (!destinationCity || days.length === 0) {
      setIsWeatherLoading(false);
      return;
    }
    setIsWeatherLoading(true);
    const startDate = formatDateLocal(days[0].date);
    const endDate = formatDateLocal(days[days.length - 1].date);
    fetchWeatherRecommendations(destinationCity, startDate, endDate)
      .then(res => {
        const map: Record<string, SimpleWeatherInfo> = {};
        if (res && Array.isArray(res.weather)) {
          res.weather.forEach(w => {
            map[w.date] = w;
          });
        }
        setWeatherMap(map);
      })
      .catch(() => {
        // Fallback: assign mock weather data for each day if backend API fails/is incomplete
        const fallbackMap: Record<string, SimpleWeatherInfo> = {};
        days.forEach(day => {
          const dateStr = formatDateLocal(day.date);
          fallbackMap[dateStr] = {
            date: dateStr,
            temp_min: 18,
            temp_max: 26,
            feels_like: 23,
            description: '맑음',
          };
        });
        setWeatherMap(fallbackMap);
      })
      .finally(() => {
        setIsWeatherLoading(false);
      });
  }, [destinationCity, days.length]);

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
    const startTimeStr = selectedDay?.startTime || '09:00:00';
    const endTimeStr = selectedDay?.endTime || '20:00:00';
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
