import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '@env';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../../../components/itinerary/TimelineItem';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useItineraryEditor } from '../../../hooks/useItineraryEditor';
import {
  timeToMinutes,
  dateToTime,
} from '../../../utils/timeUtils';
import ItineraryEditorScreenView from './ItineraryEditorScreen.view';
import { styles } from './ItineraryEditorScreen.styles';

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

interface PlaceVO {
  placeId: string;
  categoryId: number;
  url: string;
  name: string;
  formatted_address: string;
  rating: number;
  xlocation: number;
  ylocation: number;
  iconUrl: string;
}

const getCategoryType = (id: number): '관광지' | '숙소' | '식당' | '기타' => {
  if ([12, 14, 15, 28].includes(id)) return '관광지';
  if (id === 32) return '숙소';
  if (id === 39) return '식당';
  return '기타';
};

export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const {
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
  } = useItineraryEditor(route, navigation);

  const { connect, onlineUsers, sendMessage } = useWebSocket();
  const planId = route.params.planId;
  const destination = route.params.destination;

  const [isScheduleEditVisible, setScheduleEditVisible] = useState(false);

  // AddPlace logic state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'관광지' | '숙소' | '식당'>(
    '관광지',
  );
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (planId) {
      connect(planId);
    }
  }, [planId, connect]);

  const fetchPlaces = useCallback(
    async (
      queryTerm: string,
      categoryOverride?: '관광지' | '숙소' | '식당',
    ) => {
      setIsSearching(true);
      try {
        let query = queryTerm;
        if (!queryTerm && destination && categoryOverride) {
          const keyword =
            categoryOverride === '식당' ? '맛집' : categoryOverride;
          query = `${destination} ${keyword}`.trim();
        } else if (destination) {
          query = `${destination} ${queryTerm}`.trim();
        }

        if (!query) {
          setIsSearching(false);
          return;
        }

        const url = `${API_URL}/api/plan/place/${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        if (response.data && response.data.places) {
          const mappedPlaces: Place[] = response.data.places.map(
            (p: PlaceVO) => ({
              id: p.placeId,
              categoryId: p.categoryId,
              name: p.name,
              type: categoryOverride || getCategoryType(p.categoryId),
              address: p.formatted_address,
              rating: p.rating,
              imageUrl: p.iconUrl,
              latitude: p.ylocation,
              longitude: p.xlocation,
              time: '10:00',
              startTime: '10:00',
              endTime: '11:00',
            }),
          );
          setSearchResults(mappedPlaces);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search failed:', error);
        Alert.alert('오류', '장소 검색에 실패했습니다.');
      } finally {
        setIsSearching(false);
      }
    },
    [destination],
  );

  useEffect(() => {
    if (destination && !searchQuery) {
      fetchPlaces('', selectedTab);
    }
  }, [destination, selectedTab, searchQuery, fetchPlaces]);

  const handleSearch = () => {
    fetchPlaces(searchQuery);
  };

  const filteredPlaces = searchResults.filter(place => {
    if (selectedTab === '관광지') {
      return place.type === '관광지' || place.type === '기타';
    }
    return place.type === selectedTab;
  });

  useLayoutEffect(() => {
    const handleTitleSave = () => {
      setIsEditingTripName(false);
      if (tripName) {
        sendMessage('update', 'plan', { planId, title: tripName });
      }
    };

    navigation.setOptions({
      headerTitle: () =>
        isEditingTripName ? (
          <TextInput
            value={tripName}
            onChangeText={setTripName}
            autoFocus={true}
            onBlur={handleTitleSave}
            onSubmitEditing={handleTitleSave}
            style={styles.headerInput}
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingTripName(true)}>
            <Text style={styles.headerTitle}>{tripName}</Text>
          </TouchableOpacity>
        ),
      headerRight: () => (
        <View style={styles.onlineUsersContainer}>
          {onlineUsers.length > 0 && (
            <View style={styles.onlineUsersWrapper}>
              {onlineUsers.slice(0, 3).map((u, i) => (
                <View
                  key={u.uid}
                  style={[
                    styles.onlineUserAvatar,
                    { marginLeft: i > 0 ? -10 : 0 },
                  ]}
                >
                  <Text style={styles.onlineUserInitials}>
                    {u.userNickname?.charAt(0) || '?'}
                  </Text>
                </View>
              ))}
              {onlineUsers.length > 3 && (
                <View
                  style={[
                    styles.onlineUserAvatar,
                    styles.moreUsersAvatar,
                    { marginLeft: -10 },
                  ]}
                >
                  <Text style={styles.moreUsersText}>
                    +{onlineUsers.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      ),
    });
  }, [
    navigation,
    tripName,
    isEditingTripName,
    setIsEditingTripName,
    setTripName,
    onlineUsers,
    planId,
    sendMessage,
  ]);

  const onConfirmScheduleEdit = (updatedDays: any[]) => {
    if (updatedDays.length > 0) {
      const oldDates = new Set(
        days.map(d => d.date.toISOString().split('T')[0]),
      );
      const newDates = new Set(
        updatedDays.map(d => d.date.toISOString().split('T')[0]),
      );

      const addedDates = [...newDates].filter(d => !oldDates.has(d));
      const removedDates = [...oldDates].filter(d => !newDates.has(d));

      if (addedDates.length > 0) {
        const newTimetables = addedDates.map(dateStr => ({
          timetableId: 0,
          date: dateStr,
          startTime: '09:00:00',
          endTime: '20:00:00',
        }));
        sendMessage('create', 'timetable', newTimetables);
      }

      if (removedDates.length > 0) {
        const removedTimetables = days
          .filter(d =>
            removedDates.includes(d.date.toISOString().split('T')[0]),
          )
          .map(d => ({
            timetableId: d.timetableId,
            date: d.date.toISOString().split('T')[0],
            startTime: '09:00:00',
            endTime: '20:00:00',
          }));

        if (removedTimetables.length > 0) {
          sendMessage('delete', 'timetable', removedTimetables);
        }
      }

      const firstDay = updatedDays[0].date;
      const lastDay = updatedDays[updatedDays.length - 1].date;

      setScheduleEditVisible(false);

      setTimeout(() => {
        navigation.setParams({
          startDate: firstDay.toISOString(),
          endDate: lastDay.toISOString(),
        });
      }, 300);
    }
  };

  const onConfirmTimePicker = (date: Date) => {
    if (!editingTime || !selectedDay) return;
    const newTime = dateToTime(date);
    const place = selectedDay.places.find(p => p.id === editingTime.placeId);
    if (place) {
      const newStartTimeMinutes = timeToMinutes(newTime);
      if (editingTime.type === 'startTime') {
        const endTimeMinutes = timeToMinutes(place.endTime);
        const durationMinutes = endTimeMinutes - timeToMinutes(place.startTime);
        if (durationMinutes < 15) {
          handleUpdatePlaceTimes(
            place.id,
            newStartTimeMinutes,
            newStartTimeMinutes + 15,
          );
        } else {
          handleUpdatePlaceTimes(
            place.id,
            newStartTimeMinutes,
            newStartTimeMinutes + durationMinutes,
          );
        }
      } else {
        const newEndTimeMinutes = timeToMinutes(newTime);
        const startTimeMinutes = timeToMinutes(place.startTime);
        if (newEndTimeMinutes <= startTimeMinutes) {
          handleUpdatePlaceTimes(
            place.id,
            startTimeMinutes,
            startTimeMinutes + 15,
          );
        } else {
          handleUpdatePlaceTimes(place.id, startTimeMinutes, newEndTimeMinutes);
        }
      }
    }
    setTimePickerVisible(false);
    setEditingTime(null);
  };

  const onComplete = () => {
    navigation.navigate('ItineraryView', {
      days,
      tripName,
      planId: route.params.planId,
      departure: route.params.departure,
      travelId: route.params.travelId,
      transport: route.params.transport,
      adults: route.params.adults,
      children: route.params.children,
      startDate: route.params.startDate,
      endDate: route.params.endDate,
    });
  };

  return (
    <ItineraryEditorScreenView
      days={days}
      selectedDayIndex={selectedDayIndex}
      setSelectedDayIndex={setSelectedDayIndex}
      tripName={tripName}
      isTimePickerVisible={isTimePickerVisible}
      setTimePickerVisible={setTimePickerVisible}
      editingTime={editingTime}
      timelineScrollRef={timelineScrollRef}
      formatDate={formatDate}
      handleEditTime={handleEditTime}
      handleUpdatePlaceTimes={handleUpdatePlaceTimes}
      handleDeletePlace={handleDeletePlace}
      handleAddPlace={handleAddPlace}
      selectedDay={selectedDay}
      onlineUsers={onlineUsers}
      isScheduleEditVisible={isScheduleEditVisible}
      setScheduleEditVisible={setScheduleEditVisible}
      onConfirmScheduleEdit={onConfirmScheduleEdit}
      onConfirmTimePicker={onConfirmTimePicker}
      destination={destination}
      onComplete={onComplete}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      searchResults={searchResults}
      isSearching={isSearching}
      handleSearch={handleSearch}
      filteredPlaces={filteredPlaces}
    />
  );
}
