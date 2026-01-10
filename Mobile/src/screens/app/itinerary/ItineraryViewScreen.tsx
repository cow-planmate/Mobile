import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import TimelineItem, {
  Place,
} from '../../../components/itinerary/TimelineItem';
import MapView, { Marker } from 'react-native-maps';
import ShareModal from '../../../components/common/ShareModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  styles,
  COLORS,
  HOUR_HEIGHT,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_TOP_OFFSET,
} from './ItineraryViewScreen.styles';
import { Day } from '../../../contexts/ItineraryContext';

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

const formatDate = (date: Date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}.${day}`;
};

const TimeGridBackground = React.memo(({ hours }: { hours: number[] }) => {
  const hourStr = (h: number) => h.toString().padStart(2, '0');

  return (
    <View style={styles.gridContainer}>
      {hours.map(hour => (
        <View key={hour} style={[styles.hourBlock, { height: HOUR_HEIGHT }]}>
          <View style={styles.hourLabelContainer}>
            <Text style={[styles.timeLabelText, styles.timeLabelTop]}>
              {`${hourStr(hour)}:00`}
            </Text>
            <Text
              style={[
                styles.timeLabelText,
                styles.minuteLabel,
                { top: HOUR_HEIGHT / 4 },
              ]}
            >
              {`${hourStr(hour)}:15`}
            </Text>
            <Text
              style={[
                styles.timeLabelText,
                styles.minuteLabel,
                { top: HOUR_HEIGHT / 2 },
              ]}
            >
              {`${hourStr(hour)}:30`}
            </Text>
            <Text
              style={[
                styles.timeLabelText,
                styles.minuteLabel,
                { top: (HOUR_HEIGHT * 3) / 4 },
              ]}
            >
              {`${hourStr(hour)}:45`}
            </Text>
          </View>

          <View style={styles.hourContent}>
            <View style={[styles.quarterBlock, styles.firstQuarterBlock]} />
            <View style={styles.quarterBlock} />
            <View style={styles.quarterBlock} />
            <View style={styles.quarterBlock} />
          </View>
        </View>
      ))}
    </View>
  );
});

const StaticTimelineItem = React.memo(
  ({ place, offsetMinutes }: { place: Place; offsetMinutes: number }) => {
    const startMinutes = timeToMinutes(place.startTime);
    const endMinutes = timeToMinutes(place.endTime);
    const durationMinutes = endMinutes - startMinutes;

    const top =
      (startMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
    const height = durationMinutes * MINUTE_HEIGHT;

    const itemStyle = {
      position: 'absolute',
      top: top,
      height: Math.max(height, MIN_ITEM_HEIGHT),
      left: 60,
      right: 15,
    };

    return (
      <View style={itemStyle}>
        <TimelineItem
          item={place}
          onDelete={() => {}}
          onEditTime={() => {}}
          style={styles.flex1}
        />
      </View>
    );
  },
);

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
  // const [isLoading, setIsLoading] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isMapVisible, setMapVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const fetchCompletePlan = useCallback(async () => {
    if (!planId) return;
    // setIsLoading(true);
    try {
      // Assuming GET /api/plan/{planId} returns GetCompletePlanResponse structure
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
            id: String(pb.blockId), // Use blockId as internal ID
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
            imageUrl: '', // Optional in PlaceBlockVO
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
    } finally {
      // setIsLoading(false);
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
          case '관광지':
            return 12; // Fallback for tourist spots
          case '숙소':
            return 32; // Fallback for accommodation
          case '식당':
            return 39; // Fallback for restaurants
          default:
            return 12; // Default fallback
        }
      };

      const timetablePlaceBlocks = days.map(day =>
        day.places.map(place => ({
          timetableId: 0,
          timetablePlaceBlockId: !isNaN(Number(place.id))
            ? Number(place.id)
            : 0,
          placeCategoryId:
            place.categoryId && ![12, 14].includes(place.categoryId)
              ? place.categoryId
              : (placeMapping(place.type) === 12 ? 4 : placeMapping(place.type) === 32 ? 1 : 39), // Remap invalid/missing IDs to known safe ones (4=Park?, 1=Hotel?)
          placeName: place.name,
          placeRating: place.rating || 0,
          placeAddress: place.address || '',
          placeLink: '',
          placeId: place.placeRefId || String(Math.random()),
          date: day.date.toISOString().split('T')[0],
          startTime:
            place.startTime.length === 5
              ? place.startTime + ':00'
              : place.startTime,
          endTime:
            place.endTime.length === 5 ? place.endTime + ':00' : place.endTime,
          xLocation: place.longitude || 0,
          yLocation: place.latitude || 0,
        })),
      );

      // Flatten the list of lists for logging, but backend expects List<List<...>>?
      // Wait, java: List<List<TimetablePlaceBlockVO>> timetablePlaceBlockVOLists
      // Yes, parallel to timetables list.

      const payload = {
        departure: departure || 'SEOUL',
        transportationCategoryId: transport === '자동차' ? 2 : 1,
        travelId: travelId || 1,
        adultCount: adults || 1,
        childCount: children || 0,
        timetables: timetableVOs,
        timetablePlaceBlocks: timetablePlaceBlocks,
      };

      console.log('Using API URL:', API_URL);
      console.log('Sending Save Payload:', JSON.stringify(payload, null, 2));

      // Explicitly attach token if available, to ensure auth
      const token = await AsyncStorage.getItem('accessToken');
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      await axios.patch(`${API_URL}/api/plan/save`, payload, config);

      Alert.alert('성공', '일정이 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.popToTop() },
      ]);
    } catch (error: any) {
      console.error('Failed to save plan:', error);

      if (error.response) {
        console.error('Error Status:', error.response.status);
        console.error('Error Data:', error.response.data);
      }
      Alert.alert('오류', '일정 저장에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isMapVisible && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={
              selectedDay && selectedDay.places.length > 0
                ? {
                    latitude: selectedDay.places[0].latitude,
                    longitude: selectedDay.places[0].longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }
                : undefined
            }
          >
            {selectedDay?.places.map(place => (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name}
                description={place.address}
              />
            ))}
          </MapView>
        </View>
      )}

      <View style={styles.flex1}>
        <View style={styles.dayTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayTabsContainer}
          >
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayTab,
                  selectedDayIndex === index && styles.dayTabSelected,
                ]}
                onPress={() => setSelectedDayIndex(index)}
              >
                <Text
                  style={[
                    styles.dayTabText,
                    selectedDayIndex === index && styles.dayTabTextSelected,
                  ]}
                >
                  {day.dayNumber}일차
                </Text>
                <Text
                  style={[
                    styles.dayTabDateText,
                    selectedDayIndex === index && styles.dayTabDateTextSelected,
                  ]}
                >
                  {formatDate(day.date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.mapToggleButton}
            onPress={() => setMapVisible(!isMapVisible)}
          >
            <Text style={styles.mapToggleButtonText}>
              {isMapVisible ? '지도 숨기기' : '지도 보기'}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedDay && (
          <View style={styles.flex1}>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.timelineContentContainer}
            >
              <View style={styles.timelineWrapper}>
                <TimeGridBackground hours={gridHours} />
                {selectedDay.places.map(place => (
                  <StaticTimelineItem
                    key={place.id}
                    place={place}
                    offsetMinutes={offsetMinutes}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.footerButton}
          onPress={() => setShareModalVisible(true)}
        >
          <Text style={styles.footerButtonText}>공유</Text>
        </Pressable>
        <Pressable
          style={styles.footerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.footerButtonText}>수정</Text>
        </Pressable>
        <Pressable
          style={[styles.footerButton, styles.confirmButton]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>확인</Text>
        </Pressable>
      </View>

      <ShareModal
        visible={isShareModalVisible}
        onClose={() => setShareModalVisible(false)}
        planId={planId}
      />
    </SafeAreaView>
  );
}
