import { useState, useEffect, useMemo, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { MINUTE_HEIGHT } from './ItineraryViewScreen.styles';

export const useItineraryViewScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<any>();
  const { days = [], tripName = '완성된 일정' } = route.params || {};

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    navigation.setOptions({
      title: tripName,
      headerBackVisible: false,
    });
  }, [navigation, tripName]);

  const selectedDay = days[selectedDayIndex];

  const timeToMinutes = (time: string) => {
    if (!time || typeof time !== 'string' || !time.includes(':')) {
      return 0;
    }
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

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

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}.${day}`;
  };

  return {
    days,
    tripName,
    selectedDayIndex,
    isShareModalVisible,
    scrollRef,
    selectedDay,
    gridHours,
    offsetMinutes,
    navigation,
    setSelectedDayIndex,
    setShareModalVisible,
    formatDate,
    timeToMinutes,
  };
};
