import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAlert } from '../../../contexts/AlertContext';
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
import {
  SimpleWeatherInfo,
  fetchWeatherRecommendations,
} from '../../../api/trips';
import ItineraryEditorScreenView from './ItineraryEditorScreen.view';
import { styles } from './ItineraryEditorScreen.styles';
import ShareModal from '../../../components/itinerary/ShareModal';
import PlaceEditModal from '../../../components/itinerary/PlaceEditModal';
import KakaoMapView from '../../../components/itinerary/KakaoMapView';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMap, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons';

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryEditor'>;

export default function ItineraryEditorScreen({ route, navigation }: Props) {
  const { showAlert } = useAlert();
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

  const { updatePlaceMemo, updatePlaceDetails, setDays } = useItinerary();
  const { connect, disconnect, onlineUsers, sendMessage } = useWebSocket();
  const {
    fetchAllRecommendations,
    fetchAllRecommendationsNoAuth,
    resetPlaces,
  } = usePlaces();
  const planId = route.params.planId;
  const destination = route.params.destination;

  const parseDestination = useCallback((value?: string) => {
    const normalized = value?.trim() || '';
    if (!normalized) {
      return { category: '', name: '' };
    }

    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) {
      return { category: normalized, name: normalized };
    }

    return {
      category: parts[0],
      name: parts.slice(1).join(' '),
    };
  }, []);

  const [isScheduleEditVisible, setScheduleEditVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isPlaceEditModalVisible, setPlaceEditModalVisible] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);
  const [isParticipantsVisible, setParticipantsVisible] = useState(false);
  const [isMapPreviewVisible, setMapPreviewVisible] = useState(false);

  // Detail popup state
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [isDetailVisible, setDetailVisible] = useState(false);

  // ── Weather state ──
  const [weatherMap, setWeatherMap] = useState<
    Record<string, SimpleWeatherInfo>
  >({});

  useEffect(() => {
    if (!destination || days.length === 0) return;
    const startDate = days[0].date.toISOString().split('T')[0];
    const endDate = days[days.length - 1].date.toISOString().split('T')[0];
    fetchWeatherRecommendations(destination, startDate, endDate)
      .then(res => {
        const map: Record<string, SimpleWeatherInfo> = {};
        res.weather.forEach(w => {
          map[w.date] = w;
        });
        setWeatherMap(map);
      })
      .catch(() => {
        // weather is non-critical – silently ignore
      });
  }, [destination, days.length]);

  useEffect(() => {
    if (planId) {
      connect(planId);
    }
    return () => {
      disconnect();
    };
  }, [planId, connect, disconnect]); // connect/disconnect are stable (useCallback)

  // Disconnect WebSocket when navigating away (back or forward)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      disconnect();
    });
    return unsubscribe;
  }, [navigation, disconnect]);

  // Fetch place recommendations via PlacesContext
  useEffect(() => {
    if (planId) {
      fetchAllRecommendations(planId);
    } else if (destination) {
      // No planId yet — use NoAuth API with destination name
      const { category, name } = parseDestination(destination);
      fetchAllRecommendationsNoAuth(category, name);
    }
    return () => {
      resetPlaces();
    };
  }, [
    planId,
    destination,
    fetchAllRecommendations,
    fetchAllRecommendationsNoAuth,
    parseDestination,
    resetPlaces,
  ]);

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

  const handleSaveTripName = useCallback(() => {
    setIsEditingTripName(false);
    if (tripName && planId) {
      sendMessage('update', 'plan', { planId, title: tripName });
    }
  }, [planId, sendMessage, setIsEditingTripName, tripName]);

  const handleOpenParticipants = useCallback(() => {
    setParticipantsVisible(true);
  }, []);

  const handleOpenMap = useCallback(() => {
    setMapPreviewVisible(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    setMapPreviewVisible(false);
  }, []);

  const handleUndo = useCallback(() => {
    showAlert({ title: '안내', message: '되돌리기 기능은 준비 중입니다.' });
  }, [showAlert]);

  const handleRedo = useCallback(() => {
    showAlert({ title: '안내', message: '다시 실행 기능은 준비 중입니다.' });
  }, [showAlert]);

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
        const newTimetables = addedDates.map(dateStr => {
          const matched = updatedDays.find(
            ud => ud.date.toISOString().split('T')[0] === dateStr,
          );
          return {
            timetableId: 0,
            date: dateStr,
            startTime: matched?.startTime || '09:00:00',
            endTime: matched?.endTime || '20:00:00',
          };
        });
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
            startTime: d.startTime || '09:00:00',
            endTime: d.endTime || '20:00:00',
          }));

        if (removedTimetables.length > 0) {
          sendMessage('delete', 'timetable', removedTimetables);
        }
      }

      // Update startTime/endTime on existing days (sync with schedule edit changes)
      setDays(prevDays => {
        return prevDays.map(day => {
          const dateStr = day.date.toISOString().split('T')[0];
          const matched = updatedDays.find(
            ud => ud.date.toISOString().split('T')[0] === dateStr,
          );
          if (matched) {
            return {
              ...day,
              startTime: matched.startTime,
              endTime: matched.endTime,
            };
          }
          return day;
        });
      });

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
    // Disconnect WebSocket immediately when completing
    disconnect();

    // If plan already exists (editing from MySchedule), just navigate to view
    if (route.params.planId) {
      navigation.navigate('ItineraryView', {
        days,
        tripName,
        planId: route.params.planId,
        departure: route.params.departure,
        destination: route.params.destination,
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
        destination: route.params.destination,
        travelId: route.params.travelId,
        transport: route.params.transport,
        adults: route.params.adults,
        children: route.params.children,
        startDate: route.params.startDate,
        endDate: route.params.endDate,
      });
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      showAlert({ title: '오류', message: '일정 저장에 실패했습니다.' });
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
        isEditingTripName={isEditingTripName}
        setIsEditingTripName={setIsEditingTripName}
        setTripName={setTripName}
        onSaveTripName={handleSaveTripName}
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
        onOpenParticipants={handleOpenParticipants}
        onOpenMap={handleOpenMap}
        onOpenShare={() => setShareModalVisible(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        participantsCount={onlineUsers.length}
        planId={planId ?? null}
        detailPlace={detailPlace}
        isDetailVisible={isDetailVisible}
        onOpenDetail={handleOpenDetail}
        onCloseDetail={() => {
          setDetailVisible(false);
          setDetailPlace(null);
        }}
        weatherMap={weatherMap}
      />
      <Modal
        visible={isParticipantsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setParticipantsVisible(false)}
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setParticipantsVisible(false)}
        >
          <Pressable
            style={modalStyles.panel}
            onPress={e => e.stopPropagation()}
          >
            <View style={modalStyles.panelHeader}>
              <View style={modalStyles.panelHeaderTitleRow}>
                <View style={modalStyles.panelHeaderIcon}>
                  <FontAwesomeIcon icon={faUsers} color="#1344FF" size={18} />
                </View>
                <View>
                  <Text style={modalStyles.panelTitle}>참여자</Text>
                  <Text style={modalStyles.panelSubtitle}>
                    현재 일정에 참여 중인 사람
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setParticipantsVisible(false)}>
                <FontAwesomeIcon icon={faXmark} color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={modalStyles.participantList}
              contentContainerStyle={modalStyles.participantListContent}
              showsVerticalScrollIndicator={false}
            >
              {onlineUsers.length === 0 ? (
                <View style={modalStyles.emptyState}>
                  <Text style={modalStyles.emptyStateText}>
                    현재 참여 중인 사람이 없습니다.
                  </Text>
                </View>
              ) : (
                onlineUsers.map(user => {
                  const initial =
                    user.userNickname?.charAt(0) ||
                    user.userInfo?.nickname?.charAt(0) ||
                    '?';

                  return (
                    <View key={user.uid} style={modalStyles.participantRow}>
                      <View style={modalStyles.participantAvatar}>
                        {user.avatarUrl ? (
                          <Image
                            source={{ uri: user.avatarUrl }}
                            style={modalStyles.participantAvatarImage}
                          />
                        ) : (
                          <Text style={modalStyles.participantAvatarText}>
                            {initial}
                          </Text>
                        )}
                      </View>
                      <View style={modalStyles.participantInfo}>
                        <Text style={modalStyles.participantName}>
                          {user.userNickname ||
                            user.userInfo?.nickname ||
                            '사용자'}
                        </Text>
                        <Text style={modalStyles.participantStatus}>
                          현재 일정에 접속 중
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isMapPreviewVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={handleCloseMap}
      >
        <View style={modalStyles.mapContainer}>
          <View style={modalStyles.mapHeader}>
            <View style={modalStyles.panelHeaderTitleRow}>
              <View style={modalStyles.panelHeaderIcon}>
                <FontAwesomeIcon icon={faMap} color="#1344FF" size={18} />
              </View>
              <View>
                <Text style={modalStyles.panelTitle}>일정 지도</Text>
                <Text style={modalStyles.panelSubtitle}>
                  현재 선택한 일차의 장소를 보여줍니다
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleCloseMap}>
              <FontAwesomeIcon icon={faXmark} color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.mapBody}>
            <KakaoMapView
              places={
                selectedDay?.places.map(place => ({
                  id: place.id,
                  name: place.name,
                  address: place.address,
                  latitude: place.latitude,
                  longitude: place.longitude,
                  place_url: place.place_url,
                })) || []
              }
            />
          </View>
        </View>
      </Modal>
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    maxHeight: '78%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  panelHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panelHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard Variable',
    fontWeight: '700',
    color: '#111827',
  },
  panelSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Pretendard Variable',
    color: '#6B7280',
  },
  participantList: {
    flexGrow: 0,
  },
  participantListContent: {
    gap: 10,
    paddingBottom: 6,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1344FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  participantAvatarImage: {
    width: '100%',
    height: '100%',
  },
  participantAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Pretendard Variable',
    fontWeight: '700',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontFamily: 'Pretendard Variable',
    fontWeight: '700',
    color: '#111827',
  },
  participantStatus: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Pretendard Variable',
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Pretendard Variable',
    color: '#6B7280',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mapBody: {
    flex: 1,
    padding: 16,
  },
});
