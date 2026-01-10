import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { useItinerary, Day, Place } from '../contexts/ItineraryContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { timeToMinutes, minutesToTime } from '../utils/timeUtils';
import { MINUTE_HEIGHT } from '../screens/app/itinerary/ItineraryEditorScreen.styles';

export const useItineraryEditor = (route: any, _navigation: any) => {
  const { sendMessage, isConnected } = useWebSocket();
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
  const [tripName, setTripName] = useState('나의 일정1');
  const [isEditingTripName, setIsEditingTripName] = useState(false);

  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [editingTime, setEditingTime] = useState<{
    placeId: string;
    type: 'startTime' | 'endTime';
    time: string;
  } | null>(null);

  const timelineScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isConnected) {
      sendMessage('update', 'presence', { dayIndex: selectedDayIndex });
    }
  }, [selectedDayIndex, isConnected, sendMessage]);

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}.${day}`;
  };

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!route.params?.planId) {
        // Fallback for new plan creation flow (client-side only init)
        initDaysFromDates();
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/plan/${route.params.planId}`,
        );
        const { planFrame, placeBlocks, timetables } = response.data;

        setTripName(planFrame.planName || '나의 일정');

        if (timetables && timetables.length > 0) {
          const newDays: Day[] = timetables.map((tt: any, index: number) => {
            const date = new Date(tt.date);

            const dayPlaces = placeBlocks
              .filter((pb: any) => pb.timeTableId === tt.timetableId)
              .map((pb: any) => ({
                id: pb.blockId?.toString() || pb.placeId, // Prefer blockId as internal ID
                placeRefId: pb.placeId,
                name: pb.placeName,
                type: pb.placeTheme || '기타', // Mapping might need adjustment based on category ID
                startTime:
                  typeof pb.startTime === 'string'
                    ? pb.startTime.substring(0, 5)
                    : pb.startTime && pb.startTime.hour !== undefined
                    ? `${String(pb.startTime.hour).padStart(2, '0')}:${String(
                        pb.startTime.minute,
                      ).padStart(2, '0')}`
                    : '12:00',
                endTime:
                  typeof pb.endTime === 'string'
                    ? pb.endTime.substring(0, 5)
                    : pb.endTime && pb.endTime.hour !== undefined
                    ? `${String(pb.endTime.hour).padStart(2, '0')}:${String(
                        pb.endTime.minute,
                      ).padStart(2, '0')}`
                    : '13:00',
                address: pb.placeAddress,
                rating: pb.placeRating,
                latitude: pb.ylocation,
                longitude: pb.xlocation,
                imageUrl: pb.placeLink, // Check if image url is here or separate
                categoryId: pb.placeCategory,
              }));

            return {
              timetableId: tt.timetableId,
              date: date,
              dayNumber: index + 1,
              places: dayPlaces,
            };
          });
          setDays(newDays);
        } else {
          initDaysFromDates();
        }
      } catch (error) {
        console.error('Failed to fetch plan:', error);
        Alert.alert('오류', '일정 정보를 불러오는데 실패했습니다.');
        initDaysFromDates();
      }
    };

    const initDaysFromDates = () => {
      if (!route.params.startDate || !route.params.endDate) return;
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
    };

    fetchPlanDetails();
  }, [
    route.params.planId,
    route.params.startDate,
    route.params.endDate,
    setDays,
  ]);

  // Note: We can't easily move the render functions for header options here because they return JSX.
  // But we can move the logic that sets the options.
  // However, the header options depend on state and setters which are inside the hook.
  // So we can keep the useLayoutEffect here, but we need to return the render functions or just set options here.
  // Setting options here is fine. But we need to import React to return JSX if we want to define the components here.
  // Or we can just pass the state to the component and let the component handle the header.
  // But the original code had useLayoutEffect inside the component.
  // Let's keep useLayoutEffect here but we need to handle the JSX.
  // Since this is a hook, returning JSX is not standard but we can set navigation options.
  // But we need React.createElement or similar if we are in a .ts file, or make it .tsx.
  // I'll make this file .tsx to support JSX in navigation options.

  const selectedDay = days[selectedDayIndex];

  useEffect(() => {
    if (lastAddedPlaceId && selectedDay && timelineScrollRef.current) {
      const newPlace = selectedDay.places.find(p => p.id === lastAddedPlaceId);
      if (newPlace) {
        const yOffset = timeToMinutes(newPlace.startTime) * MINUTE_HEIGHT;
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
    },
    [selectedDayIndex, updatePlaceTimes],
  );

  const handleDeletePlace = useCallback(
    (placeId: string) => {
      deletePlaceFromDay(selectedDayIndex, placeId);
    },
    [selectedDayIndex, deletePlaceFromDay],
  );

  const handleAddPlace = useCallback(
    (place: Omit<Place, 'startTime' | 'endTime'>) => {
      addPlaceToDay(selectedDayIndex, place);
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
  };
};
