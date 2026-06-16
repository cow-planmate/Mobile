import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ItineraryEditorScreenView from './ItineraryEditorScreen.view';
import { Day } from '../../../contexts/ItineraryContext';
import { PlacesProvider } from '../../../contexts/PlacesContext';
import { AlertProvider } from '../../../contexts/AlertContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
        category: '교통',
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
        category: '음식점',
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
  title: 'Screens/App/Itinerary/ItineraryEditorScreen',
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
    selectedDay: mockDays[0],
    onlineUsers: [],
    isScheduleEditVisible: false,
    setScheduleEditVisible: () => {},
    onConfirmScheduleEdit: () => {},
    onConfirmTimePicker: () => {},
    destination: '제주도',
    onComplete: () => {},
    onOpenParticipants: () => {},
    onOpenMap: () => {},
    onOpenShare: () => {},
    onUndo: () => {},
    onRedo: () => {},
    participantsCount: 3,
    planId: 123,
    detailPlace: null,
    isDetailVisible: false,
    onOpenDetail: () => {},
    onCloseDetail: () => {},
    weatherMap: {
      '2024-08-01': {
        temp: 28,
        condition: 'Sunny',
        icon: '01d',
        description: '맑음',
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
    const [isDetailVisible, setDetailVisible] = React.useState(args.isDetailVisible);
    const [detailPlace, setDetailPlace] = React.useState(args.detailPlace);

    const handleAddPlace = (newPlace: any) => {
      const updatedDays = [...days];
      const currentDay = updatedDays[selectedDayIndex];
      
      // Calculate a default time (last place end time + 1 hour)
      let startTime = '09:00:00';
      if (currentDay.places.length > 0) {
        const lastPlace = currentDay.places[currentDay.places.length - 1];
        startTime = lastPlace.endTime;
      }
      
      const [h, m] = startTime.split(':').map(Number);
      const endH = Math.min(h + 1, 23);
      const endTime = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;

      currentDay.places.push({
        ...newPlace,
        startTime,
        endTime,
      });
      setDays(updatedDays);
      console.log('Added place to Day', selectedDayIndex + 1, newPlace.name);
    };

    const handleDeletePlace = (placeId: string) => {
      const updatedDays = [...days];
      updatedDays[selectedDayIndex].places = updatedDays[selectedDayIndex].places.filter(
        p => p.id !== placeId
      );
      setDays(updatedDays);
    };

    const handleUpdatePlaceTimes = (placeId: string, start: number, end: number) => {
      const updatedDays = [...days];
      const place = updatedDays[selectedDayIndex].places.find(p => p.id === placeId);
      if (place) {
        const format = (min: number) => {
          const h = Math.floor(min / 60).toString().padStart(2, '0');
          const m = (min % 60).toString().padStart(2, '0');
          return `${h}:${m}:00`;
        };
        place.startTime = format(start);
        place.endTime = format(end);
        setDays(updatedDays);
      }
    };

    return (
      <ItineraryEditorScreenView
        {...args}
        days={days}
        selectedDayIndex={selectedDayIndex}
        setSelectedDayIndex={setSelectedDayIndex}
        selectedDay={days[selectedDayIndex]}
        isEditingTripName={isEditingTripName}
        setIsEditingTripName={setIsEditingTripName}
        tripName={tripName}
        setTripName={setTripName}
        onSaveTripName={() => setIsEditingTripName(false)}
        isTimePickerVisible={isTimePickerVisible}
        setTimePickerVisible={setTimePickerVisible}
        isScheduleEditVisible={isScheduleEditVisible}
        setScheduleEditVisible={setScheduleEditVisible}
        isDetailVisible={isDetailVisible}
        detailPlace={detailPlace}
        onOpenDetail={(place) => {
          setDetailPlace(place);
          setDetailVisible(true);
        }}
        onCloseDetail={() => setDetailVisible(false)}
        onConfirmScheduleEdit={() => setScheduleEditVisible(false)}
        onConfirmTimePicker={() => setTimePickerVisible(false)}
        handleAddPlace={handleAddPlace}
        handleDeletePlace={handleDeletePlace}
        handleUpdatePlaceTimes={handleUpdatePlaceTimes}
      />
    );
  },
} satisfies Meta<typeof ItineraryEditorScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RecommendationTab: Story = {
  args: {
    initialTabName: '장소추가',
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

export const EditingName: Story = {
  args: {
    isEditingTripName: true,
  },
};

export const ScheduleEditOpen: Story = {
  args: {
    isScheduleEditVisible: true,
  },
};
