import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../../../components/itinerary/TimelineItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MINUTE_HEIGHT } from './ItineraryViewScreen.styles';
import { Day } from '../../../contexts/ItineraryContext';
import ItineraryViewScreenView from './ItineraryViewScreen.view';

// DTO Interfaces
interface PlaceBlockVO {
  blockId?: number;
  timeTableId: number;
  placeCategory: number;
  placeName: string;
  placeTheme: string;
  placeRating: number;
  placeAddress: string;
  placeLink?: string;
  placeId: string;
  startTime: string; // ISO Time 'HH:mm:ss'
  endTime: string;
  xlocation: number;
  ylocation: number;
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
  timetables: { timetableId: number; date: string }[];
}

const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryView'>;

export default function ItineraryViewScreen({ route, navigation }: Props) {
  const {
    days: initialDays = [],
    tripName: initialTripName = '완성된 일정',
    departure,
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
  const scrollRef = useRef<ScrollView>(null);

  const fetchCompletePlan = useCallback(async () => {
    if (!planId) return;
    try {
      const response = await axios.get<GetCompletePlanResponse>(
        `${API_URL}/api/plan/${planId}`,
      );
      const { planFrame, placeBlocks, timetables } = response.data;

      setTripName(planFrame.planName || '나의 일정');

      const categoryMapping = (
        id: number,
      ): '관광지' | '숙소' | '식당' | '기타' => {
        if ([12, 14, 15, 28].includes(id)) return '관광지';
        if (id === 32) return '숙소';
        if (id === 39) return '식당';
        return '기타';
      };

      if (timetables && timetables.length > 0) {
        const fetchedDays: Day[] = timetables.map((tt, index) => {
          const blocks = placeBlocks.filter(
            pb => pb.timeTableId === tt.timetableId,
          );
          const places: Place[] = blocks.map(pb => ({
            id: String(pb.blockId),
            categoryId: pb.placeCategory,
            placeRefId: pb.placeId,
            name: pb.placeName,
            address: pb.placeAddress,
            type: categoryMapping(pb.placeCategory),
            rating: pb.placeRating,
            startTime: pb.startTime.substring(0, 5),
            endTime: pb.endTime.substring(0, 5),
            latitude: pb.ylocation,
            longitude: pb.xlocation,
            imageUrl: '',
            place_url: pb.placeLink,
          }));

          return {
            date: new Date(tt.date),
            dayNumber: index + 1,
            places: places,
          };
        });
        setDays(fetchedDays);
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      Alert.alert('오류', '일정을 불러오는데 실패했습니다.');
    }
  }, [planId]);

  useEffect(() => {
    if (initialDays.length === 0 && planId) {
      fetchCompletePlan();
    }
  }, [planId, fetchCompletePlan, initialDays.length]);

  useEffect(() => {
    navigation.setOptions({
      title: tripName,
      headerBackVisible: false,
    });
  }, [navigation, tripName]);

  const selectedDay = days[selectedDayIndex];

  useEffect(() => {
    if (selectedDay && selectedDay.places.length > 0 && scrollRef.current) {
      const firstPlace = selectedDay.places[0];
      const startMinutes = timeToMinutes(firstPlace.startTime);
      const yOffset = startMinutes * MINUTE_HEIGHT;
      scrollRef.current.scrollTo({ y: yOffset, animated: true });
    }
  }, [selectedDay]);

  const { gridHours, offsetMinutes } = useMemo(() => {
    const minHour = 0;
    const maxHour = 23;
    const hours = Array.from(
      { length: maxHour - minHour + 1 },
      (_, i) => i + minHour,
    );
    const offset = minHour * 60;
    return { gridHours: hours, offsetMinutes: offset };
  }, []);

  const handleConfirm = async () => {
    if (planId) {
      Alert.alert('완료', '일정이 확인되었습니다.', [
        { text: '확인', onPress: () => navigation.popToTop() },
      ]);
      return;
    }

    try {
      const timetableVOs = days.map(day => ({
        timetableId: 0,
        date: day.date.toISOString().split('T')[0],
        startTime: '09:00:00',
        endTime: '20:00:00',
      }));

      const placeMapping = (type: string) => {
        switch (type) {
          case '관광지': return 12;
          case '숙소': return 32;
          case '식당': return 39;
          default: return 12;
        }
      };

      const timetablePlaceBlocks = days.map(day =>
        day.places.map(place => ({
          timetableId: 0,
          timetablePlaceBlockId: !isNaN(Number(place.id)) ? Number(place.id) : 0,
          placeCategoryId:
            place.categoryId && ![12, 14].includes(place.categoryId)
              ? place.categoryId
              : placeMapping(place.type) === 12 ? 4 : placeMapping(place.type) === 32 ? 1 : 39,
          placeName: place.name,
          placeRating: place.rating || 0,
          placeAddress: place.address || '',
          placeLink: '',
          placeId: place.placeRefId || String(Math.random()),
          date: day.date.toISOString().split('T')[0],
          startTime: place.startTime.length === 5 ? place.startTime + ':00' : place.startTime,
          endTime: place.endTime.length === 5 ? place.endTime + ':00' : place.endTime,
          xLocation: place.longitude || 0,
          yLocation: place.latitude || 0,
        })),
      );

      const payload = {
        departure: departure || 'SEOUL',
        transportationCategoryId: transport === '자동차' ? 2 : 1,
        travelId: travelId || 1,
        adultCount: adults || 1,
        childCount: children || 0,
        timetables: timetableVOs,
        timetablePlaceBlocks: timetablePlaceBlocks,
      };

      const token = await AsyncStorage.getItem('accessToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      await axios.patch(`${API_URL}/api/plan/save`, payload, config);

      Alert.alert('성공', '일정이 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.popToTop() },
      ]);
    } catch (error: any) {
      console.error('Failed to save plan:', error);
      Alert.alert('오류', '일정 저장에 실패했습니다.');
    }
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
      handleConfirm={handleConfirm}
      goBack={() => navigation.goBack()}
      planId={planId}
    />
  );
}
