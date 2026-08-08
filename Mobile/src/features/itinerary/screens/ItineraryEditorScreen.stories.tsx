import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ItineraryEditorScreenView from './ItineraryEditorScreen.view';
import { Day } from '../../../contexts/ItineraryContext';
import { PlacesProvider, usePlaces } from '../../../contexts/PlacesContext';
import { AlertProvider } from '../../../contexts/AlertContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlanInfoModal, ShareModal } from '../../../components/common';
import { Modal, View, Text, TouchableOpacity, ScrollView, Pressable, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsers, faXmark, faMap } from '@fortawesome/free-solid-svg-icons';
import KakaoMapView from '../components/KakaoMapView';

import { resolveConflictsAndSort } from '../../../utils/timeUtils';

const mockDays: Day[] = [
  {
    dayNumber: 1,
    date: new Date('2024-08-01'),
    startTime: '09:00:00',
    endTime: '22:00:00',
    places: [
      {
        id: '1',
        name: '제주국제공항',
        address: '제주특별자치도 제주시 공항로 2',
        startTime: '09:30:00',
        endTime: '10:30:00',
        latitude: 33.5113,
        longitude: 126.493,
        categoryId: 4,
        type: '기타',
        rating: 4.5,
        imageUrl: '',
        memo: '도착 후 렌터카 수령',
      },
      {
        id: '2',
        name: '애월 카페거리',
        address: '제주특별자치도 제주시 애월읍 애월리',
        startTime: '11:30:00',
        endTime: '13:00:00',
        latitude: 33.4623,
        longitude: 126.3106,
        categoryId: 2,
        type: '식당',
        rating: 4.6,
        imageUrl: '',
        memo: '점심 식사 및 바다 구경',
      },
    ],
  },
  {
    dayNumber: 2,
    date: new Date('2024-08-02'),
    startTime: '09:00:00',
    endTime: '21:00:00',
    places: [],
  },
];

const meta = {
  title: 'Screens/Itinerary/ItineraryEditorScreen',
  component: ItineraryEditorScreenView,
  decorators: [
    (Story) => (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AlertProvider>
          <PlacesProvider>
            <Story />
          </PlacesProvider>
        </AlertProvider>
      </GestureHandlerRootView>
    ),
  ],
  args: {
    days: mockDays,
    selectedDayIndex: 0,
    setSelectedDayIndex: () => {},
    tripName: '제주도 여름 휴가',
    isEditingTripName: false,
    setIsEditingTripName: () => {},
    setTripName: () => {},
    onSaveTripName: () => {},
    isTimePickerVisible: false,
    setTimePickerVisible: () => {},
    editingTime: null,
    timelineScrollRef: { current: null },
    formatDate: (date: Date) => {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}.${day}`;
    },
    handleEditTime: () => {},
    handleUpdatePlaceTimes: () => {},
    handleDeletePlace: () => {},
    handleAddPlace: () => {},
    isScheduleEditVisible: false,
    setScheduleEditVisible: () => {},
    onConfirmScheduleEdit: () => {},
    onConfirmTimePicker: () => {},
    destination: '제주도',
    onComplete: () => {},
    onOpenParticipants: () => {},
    onOpenMap: () => {},
    onOpenShare: () => {},
    onOpenChecklist: () => {},
    onUndo: () => {},
    onRedo: () => {},
    onOpenPlanInfo: () => {},
    participantsCount: 3,
    planId: '123',
    selectedDay: mockDays[0],
    onOpenDetail: () => {},
    weatherMap: {
      '2024-08-01': {
        date: '2024-08-01',
        tempMin: 24,
        tempMax: 32,
        feelsLike: 30,
        description: '맑음',
      },
      '2024-08-02': {
        date: '2024-08-02',
        tempMin: 22,
        tempMax: 28,
        feelsLike: 26,
        description: '구름 많음',
      },
    },
  },
  render: function Render(args) {
    const [days, setDays] = React.useState(args.days);
    const [selectedDayIndex, setSelectedDayIndex] = React.useState(args.selectedDayIndex);
    const [isEditingTripName, setIsEditingTripName] = React.useState(args.isEditingTripName);
    const [tripName, setTripName] = React.useState(args.tripName);
    const [isTimePickerVisible, setTimePickerVisible] = React.useState(args.isTimePickerVisible);
    const [isScheduleEditVisible, setScheduleEditVisible] = React.useState(args.isScheduleEditVisible);
    const [isPlanInfoVisible, setPlanInfoVisible] = React.useState(false);
    const [isShareModalVisible, setShareModalVisible] = React.useState(false);
    const [isParticipantsVisible, setParticipantsVisible] = React.useState(false);
    const [isMapPreviewVisible, setMapPreviewVisible] = React.useState(false);
    const [weatherMap, setWeatherMap] = React.useState(args.weatherMap);
    const { fetchAllRecommendations } = usePlaces();

    React.useEffect(() => {
      fetchAllRecommendations(123);
    }, [fetchAllRecommendations]);

    const handleAddPlace = (newPlace: any) => {
      const updatedDays = [...days];
      const currentDay = { ...updatedDays[selectedDayIndex] };
      
      // Calculate a default time (last place end time + 1 hour)
      let startTime = '09:00:00';
      if (currentDay.places.length > 0) {
        const lastPlace = currentDay.places[currentDay.places.length - 1];
        startTime = lastPlace.endTime;
      }
      
      const [h, m] = startTime.split(':').map(Number);
      const endH = Math.min(h + 1, 23);
      const endTime = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;

      const placeToAdd = {
        ...newPlace,
        id: `place_${Date.now()}_${Math.random()}`,
        startTime,
        endTime,
      };

      currentDay.places = resolveConflictsAndSort([
        ...currentDay.places,
        placeToAdd
      ], placeToAdd.id);

      updatedDays[selectedDayIndex] = currentDay;
      setDays(updatedDays);
      console.log('Added place to Day', selectedDayIndex + 1, newPlace.name);
    };

    const handleDeletePlace = (placeId: string) => {
      const updatedDays = days.map(day => ({
        ...day,
        places: day.places.filter(p => p.id !== placeId),
      }));
      setDays(updatedDays);
      console.log('Deleted place via Storybook interaction:', placeId);
    };

    const handleUpdatePlaceTimes = (placeId: string, start: number, end: number) => {
      const updatedDays = [...days];
      const currentDay = { ...updatedDays[selectedDayIndex] };
      const format = (min: number) => {
        const h = Math.floor(min / 60).toString().padStart(2, '0');
        const m = (min % 60).toString().padStart(2, '0');
        return `${h}:${m}:00`;
      };
      
      const newPlacesList = currentDay.places.map(p =>
        p.id === placeId
          ? { ...p, startTime: format(start), endTime: format(end) }
          : { ...p }
      );
      
      currentDay.places = resolveConflictsAndSort(
        newPlacesList,
        placeId
      );
      
      updatedDays[selectedDayIndex] = currentDay;
      setDays(updatedDays);
    };

    const handleConfirmScheduleEdit = (updatedDays: any[]) => {
      const newDays: Day[] = updatedDays.map((ud, index) => {
        const dateStr = ud.date.toISOString().split('T')[0];
        // 동적으로 가상 날씨 탑재
        if (!weatherMap[dateStr]) {
          setWeatherMap(prev => ({
            ...prev,
            [dateStr]: {
              temp: 24 + (index % 5),
              condition: index % 2 === 0 ? 'Sunny' : 'Cloudy',
              icon: index % 2 === 0 ? '01d' : '03d',
              description: index % 2 === 0 ? '맑음' : '구름 조금',
            }
          }));
        }

        const existingDay = days.find(
          d => d.date.toISOString().split('T')[0] === ud.date.toISOString().split('T')[0]
        );
        return {
          dayNumber: index + 1,
          date: ud.date,
          startTime: ud.startTime,
          endTime: ud.endTime,
          places: existingDay ? existingDay.places : [],
        };
      });
      setDays(newDays);
      setSelectedDayIndex(0);
      setScheduleEditVisible(false);
    };

    return (
      <>
        <ItineraryEditorScreenView
          {...args}
          days={days}
          selectedDayIndex={selectedDayIndex}
          setSelectedDayIndex={setSelectedDayIndex}
          selectedDay={days[selectedDayIndex] || days[0]}
          isEditingTripName={isEditingTripName}
          setIsEditingTripName={setIsEditingTripName}
          tripName={tripName}
          setTripName={setTripName}
          onSaveTripName={() => setIsEditingTripName(false)}
          isTimePickerVisible={isTimePickerVisible}
          setTimePickerVisible={setTimePickerVisible}
          isScheduleEditVisible={isScheduleEditVisible}
          setScheduleEditVisible={setScheduleEditVisible}
          onOpenDetail={() => {}}
          onConfirmScheduleEdit={handleConfirmScheduleEdit}
          onConfirmTimePicker={() => setTimePickerVisible(false)}
          handleAddPlace={handleAddPlace}
          handleDeletePlace={handleDeletePlace}
          handleUpdatePlaceTimes={handleUpdatePlaceTimes}
          onOpenPlanInfo={() => setPlanInfoVisible(true)}
          onOpenShare={() => setShareModalVisible(true)}
          onOpenParticipants={() => setParticipantsVisible(true)}
          onOpenMap={() => setMapPreviewVisible(true)}
          weatherMap={weatherMap}
        />
        <PlanInfoModal
          visible={isPlanInfoVisible}
          onClose={() => setPlanInfoVisible(false)}
          planName={tripName}
          destination="제주도 애월읍"
          startDate="2026-08-01"
          endDate="2026-08-02"
          adultCount={2}
          childCount={1}
          transport="대중교통"
        />
        <ShareModal
          visible={isShareModalVisible}
          onClose={() => setShareModalVisible(false)}
          planId="123"
          isMock={true}
          isOwner
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
                      현재 일정에 참여 중인 사람 (스토리북)
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
                <View style={modalStyles.participantRow}>
                  <View style={modalStyles.participantAvatar}>
                    <Text style={modalStyles.participantAvatarText}>홍</Text>
                  </View>
                  <View style={modalStyles.participantInfo}>
                    <Text style={modalStyles.participantName}>홍길동 (나)</Text>
                    <Text style={modalStyles.participantStatus}>현재 일정에 접속 중</Text>
                  </View>
                </View>
                <View style={modalStyles.participantRow}>
                  <View style={modalStyles.participantAvatar}>
                    <Text style={modalStyles.participantAvatarText}>김</Text>
                  </View>
                  <View style={modalStyles.participantInfo}>
                    <Text style={modalStyles.participantName}>김철수</Text>
                    <Text style={modalStyles.participantStatus}>현재 일정에 접속 중</Text>
                  </View>
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          visible={isMapPreviewVisible}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setMapPreviewVisible(false)}
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
                    현재 선택한 일차의 장소를 보여줍니다 (스토리북)
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setMapPreviewVisible(false)}>
                <FontAwesomeIcon icon={faXmark} color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>

            <View style={modalStyles.mapBody}>
              <KakaoMapView
                places={
                  days[selectedDayIndex]?.places.map(place => ({
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
      </>
    );
  },
} satisfies Meta<typeof ItineraryEditorScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RecommendationTab: Story = {
  args: {
    activeTab: '장소추가',
  },
};

export const Loading: Story = {
  args: {
    selectedDay: null,
  },
  render: (args) => <ItineraryEditorScreenView {...args} selectedDay={null} />,
};

export const EmptyDay: Story = {
  args: {
    selectedDayIndex: 1,
  },
};

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
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: '#111827',
  },
  panelSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
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
  participantAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: '#111827',
  },
  participantStatus: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
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
