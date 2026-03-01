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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStackParamList } from '../../../navigation/types';
import { Place } from '../../../components/itinerary/TimelineItem';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useItinerary } from '../../../contexts/ItineraryContext';
import { usePlaces } from '../../../contexts/PlacesContext';
import { useItineraryEditor } from '../../../hooks/useItineraryEditor';
import { timeToMinutes, dateToTime } from '../../../utils/timeUtils';
import ItineraryEditorScreenView from './ItineraryEditorScreen.view';
import { styles } from './ItineraryEditorScreen.styles';
import ShareModal from '../../../components/itinerary/ShareModal';
import PlaceEditModal from '../../../components/itinerary/PlaceEditModal';
import { Calendar, Share as ShareIcon } from 'lucide-react-native';

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

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

  const { updatePlaceMemo, updatePlaceDetails } = useItinerary();
  const { connect, onlineUsers, sendMessage } = useWebSocket();
  const {
    fetchAllRecommendations,
    fetchAllRecommendationsNoAuth,
    resetPlaces,
  } = usePlaces();
  const planId = route.params.planId;
  const destination = route.params.destination;

  const [isScheduleEditVisible, setScheduleEditVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isPlaceEditModalVisible, setPlaceEditModalVisible] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);

  // Detail popup state
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [isDetailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    if (planId) {
      connect(planId);
    }
  }, [planId, connect]);

  // Fetch place recommendations via PlacesContext
  useEffect(() => {
    if (planId) {
      fetchAllRecommendations(planId);
    } else if (destination) {
      // No planId yet — use NoAuth API with destination name
      fetchAllRecommendationsNoAuth(destination, destination);
    }
    return () => {
      resetPlaces();
    };
  }, [planId, destination]);

  // Detail popup handlers
  const handleOpenDetail = useCallback((place: Place) => {
    setDetailPlace(place);
    setEditingPlace(place);
    setPlaceEditModalVisible(true);
  }, []);

  const handlePlaceSave = useCallback(
    (updatedPlace: any) => {
      // Normalize time to "HH:mm" format for local state
      const normalizeTime = (t: string) =>
        t && t.length >= 5 ? t.substring(0, 5) : t;

      // Update local state + send WebSocket via context (matches Frontend flow)
      updatePlaceDetails(selectedDayIndex, updatedPlace.id, {
        startTime: normalizeTime(updatedPlace.startTime),
        endTime: normalizeTime(updatedPlace.endTime),
        memo: updatedPlace.memo,
        name: updatedPlace.name,
        address: updatedPlace.address,
      });

      setPlaceEditModalVisible(false);
      setEditingPlace(null);
      setDetailPlace(null);
    },
    [updatePlaceDetails, selectedDayIndex],
  );

  const handleDeleteFromDetail = useCallback(() => {
    if (detailPlace) {
      handleDeletePlace(detailPlace.id);
      setDetailVisible(false);
      setDetailPlace(null);
      setPlaceEditModalVisible(false); // Also close our new modal if open
      setEditingPlace(null);
    }
  }, [detailPlace, handleDeletePlace]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setShareModalVisible(true)}
            style={{ marginRight: 10 }}
          >
            <ShareIcon size={24} color="#333" />
          </TouchableOpacity>
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

  const [isSaving, setIsSaving] = useState(false);

  /**
   * Normalize raw categoryId to 0-4 range used by backend.
   */
  const normalizeCategoryId = (
    rawId: number | undefined,
    type?: string,
  ): number => {
    const id = rawId ?? 4;
    if ([0, 1, 2, 3, 4].includes(id)) return id;
    if ([12, 14, 15, 28].includes(id)) return 0;
    if (id === 32) return 1;
    if (id === 39) return 2;
    switch (type) {
      case '관광지':
        return 0;
      case '숙소':
        return 1;
      case '식당':
        return 2;
      default:
        return 4;
    }
  };

  const onComplete = async () => {
    // If plan already exists (editing from MyPage), just navigate to view
    if (route.params.planId) {
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
      return;
    }

    // New plan: create on server, then navigate to view with planId
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const timetableVOs = days.map(day => ({
        date: day.date.toISOString().split('T')[0],
        timeTableStartTime: '09:00:00',
        timeTableEndTime: '20:00:00',
      }));

      const allBlocks = days.flatMap(day => {
        const dateStr = day.date.toISOString().split('T')[0];
        return day.places.map(place => {
          const categoryId = normalizeCategoryId(place.categoryId, place.type);
          const startTime =
            place.startTime.length === 5
              ? place.startTime + ':00'
              : place.startTime;
          const endTime =
            place.endTime.length === 5 ? place.endTime + ':00' : place.endTime;
          return {
            blockId: null,
            timeTableId: 0,
            date: dateStr,
            placeCategoryId: categoryId,
            placeName: place.name || '',
            placeRating: place.rating || 0,
            placeAddress: place.address || '',
            placeLink: place.place_url || '',
            placeId: place.placeRefId || '',
            photoUrl: place.imageUrl || null,
            memo: place.memo || '',
            startTime,
            endTime,
            blockStartTime: startTime,
            blockEndTime: endTime,
            xLocation: place.longitude || 0,
            yLocation: place.latitude || 0,
          };
        });
      });

      const response = await axios.post(
        `${API_URL}/api/plan/create`,
        {
          planFrame: {
            planName: tripName || '나의 일정',
            departure: route.params.departure || 'SEOUL',
            transportationCategoryId:
              route.params.transport === '자동차' ? 1 : 0,
            travelId: route.params.travelId || 1,
            adultCount: route.params.adults || 1,
            childCount: route.params.children || 0,
          },
          timetables: timetableVOs,
          timetablePlaceBlocks: allBlocks,
        },
        config,
      );

      const newPlanId = response.data?.planId;

      navigation.navigate('ItineraryView', {
        days,
        tripName,
        planId: newPlanId,
        departure: route.params.departure,
        travelId: route.params.travelId,
        transport: route.params.transport,
        adults: route.params.adults,
        children: route.params.children,
        startDate: route.params.startDate,
        endDate: route.params.endDate,
      });
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      Alert.alert('오류', '일정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
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
        destination={destination || ''}
        onComplete={onComplete}
        planId={planId ?? null}
        detailPlace={detailPlace}
        isDetailVisible={isDetailVisible}
        onOpenDetail={handleOpenDetail}
        onCloseDetail={() => {
          setDetailVisible(false);
          setDetailPlace(null);
        }}
      />
      <ShareModal
        visible={isShareModalVisible}
        onClose={() => setShareModalVisible(false)}
        planId={planId as number}
      />
      {editingPlace && (
        <PlaceEditModal
          visible={isPlaceEditModalVisible}
          place={editingPlace}
          onClose={() => {
            setPlaceEditModalVisible(false);
            setEditingPlace(null);
          }}
          onSave={handlePlaceSave}
          onDelete={handleDeletePlace}
        />
      )}
    </>
  );
}
