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
  timetablePlaceBlockId?: number;
  timeTableId: number;
  timetableId?: number;
  placeCategoryId: number;
  placeCategory?: number;
  placeName: string;
  placeTheme: string;
  placeRating: number;
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

      // Update trip name from API if available
      if (planFrame?.planName) {
        setTripName(planFrame.planName);
      }

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
            const categoryId = (pb.placeCategoryId ??
              pb.placeCategory ??
              4) as number;

            // Normalize categoryId to 0-4 range
            const normalizedCategoryId = (() => {
              if ([0, 1, 2, 3, 4].includes(categoryId)) return categoryId;
              if ([12, 14, 15, 28].includes(categoryId)) return 0;
              if (categoryId === 32) return 1;
              if (categoryId === 39) return 2;
              return 4;
            })();

            return {
              id: String(pb.blockId ?? pb.timetablePlaceBlockId),
              categoryId: normalizedCategoryId,
              placeRefId: pb.placeId,
              name: pb.placeName,
              address: pb.placeAddress,
              type: categoryMapping(categoryId) as any,
              rating: pb.placeRating || 0,
              startTime: parseTime(pb.startTime ?? pb.blockStartTime),
              endTime: parseTime(pb.endTime ?? pb.blockEndTime),
              latitude: pb.yLocation ?? pb.ylocation ?? 0,
              longitude: pb.xLocation ?? pb.xlocation ?? 0,
              imageUrl: pb.photoUrl || pb.placeLink || '',
              memo: pb.memo || '',
              place_url: pb.placeLink || '',
            };
          });

          return {
            date: new Date(tt.date),
            dayNumber: index + 1,
            places: places,
            timetableId: ttId,
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
    const minHour = 9;
    const maxHour = 20;
    const hours = Array.from(
      { length: maxHour - minHour + 1 },
      (_, i) => i + minHour,
    );
    const offset = minHour * 60;
    return { gridHours: hours, offsetMinutes: offset };
  }, []);

  const handleConfirm = async () => {
    // Plan is already created/saved in ItineraryEditorScreen.
    // Just navigate back to home.
    Alert.alert('성공', '일정이 저장되었습니다.', [
      { text: '확인', onPress: () => navigation.popToTop() },
    ]);
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
      handleEdit={() => navigation.navigate('ItineraryEditor', { planId })}
      planId={planId}
    />
  );
}
