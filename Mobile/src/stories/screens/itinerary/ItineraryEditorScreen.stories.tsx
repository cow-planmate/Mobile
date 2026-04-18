import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import ItineraryEditorScreenView from '../../../screens/app/itinerary/ItineraryEditorScreen.view';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlacesProvider } from '../../../contexts/PlacesContext';
import type { Day } from '../../../contexts/ItineraryContext';
import type { Place } from '../../../components/itinerary/TimelineItem';
import type { SimpleWeatherInfo } from '../../../api/trips';

const mockTimelinePlaces: Place[] = [
  {
    id: 'p1',
    name: '성산일출봉',
    startTime: '09:00',
    endTime: '10:30',
    type: '관광지',
    categoryId: 0,
    address: '제주특별자치도 서귀포시 성산읍 성산리 1',
    rating: 4.8,
    imageUrl: '',
    latitude: 33.4581,
    longitude: 126.9424,
  },
  {
    id: 'p2',
    name: '제주 바다 호텔',
    startTime: '11:00',
    endTime: '12:00',
    type: '숙소',
    categoryId: 1,
    address: '제주특별자치도 제주시 연동 1234',
    rating: 4.6,
    imageUrl: '',
    latitude: 33.489,
    longitude: 126.4983,
  },
  {
    id: 'p3',
    name: '흑돼지 맛집',
    startTime: '13:00',
    endTime: '14:00',
    type: '식당',
    categoryId: 2,
    address: '제주특별자치도 제주시 중앙로 12',
    rating: 4.7,
    imageUrl: '',
    latitude: 33.4996,
    longitude: 126.5312,
  },
  {
    id: 'p4',
    name: '장소 검색 카드',
    startTime: '15:00',
    endTime: '15:30',
    type: '검색',
    categoryId: 4,
    address: '원하는 장소를 검색해서 일정에 추가하세요',
    rating: 0,
    imageUrl: '',
    latitude: 33.4996,
    longitude: 126.5312,
    memo: '검색 결과에서 바로 일정에 추가하는 카드입니다.',
  },
];

const mockDayOne: Day = {
  dayNumber: 1,
  date: new Date('2024-03-01'),
  startTime: '09:00',
  endTime: '20:00',
  places: mockTimelinePlaces,
};

const mockWeatherMap: Record<string, SimpleWeatherInfo> = {
  '2024-03-01': {
    date: '2024-03-01',
    description: '맑음',
    temp_min: 8,
    temp_max: 14,
    feels_like: 11,
  },
  '2024-03-02': {
    date: '2024-03-02',
    description: '구름 조금',
    temp_min: 6,
    temp_max: 12,
    feels_like: 9,
  },
};

const meta = {
  title: 'Screens/Itinerary/일정 생성 화면',
  component: ItineraryEditorScreenView,
  decorators: [
    Story => (
      <PlacesProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <Story />
        </GestureHandlerRootView>
      </PlacesProvider>
    ),
  ],
  args: {
    days: [
      mockDayOne,
      {
        dayNumber: 2,
        date: new Date('2024-03-02'),
        startTime: '09:00',
        endTime: '20:00',
        places: [],
      },
    ],
    selectedDayIndex: 0,
    setSelectedDayIndex: idx => console.log(`Selected day index: ${idx}`),
    tripName: '제주도 힐링 여행',
    isTimePickerVisible: false,
    setTimePickerVisible: visible => console.log(`Set time picker: ${visible}`),
    editingTime: null,
    timelineScrollRef: { current: null },
    formatDate: date =>
      `${String(date.getMonth() + 1).padStart(2, '0')}.${String(
        date.getDate(),
      ).padStart(2, '0')}.`,
    handleEditTime: (id, type, time) =>
      console.log(`Edit ${type} for ${id} to ${time}`),
    handleUpdatePlaceTimes: (id, start, end) =>
      console.log(`Update ${id} times: ${start}-${end}`),
    handleDeletePlace: id => console.log(`Delete ${id}`),
    handleAddPlace: place => console.log('Add place', place),
    selectedDay: mockDayOne,
    onlineUsers: [],
    isEditingTripName: false,
    setIsEditingTripName: visible =>
      console.log(`Set editing trip name: ${visible}`),
    setTripName: value => console.log(`Set trip name: ${value}`),
    onSaveTripName: () => console.log('Save trip name'),
    onOpenParticipants: () => console.log('Open participants'),
    onOpenMap: () => console.log('Open map'),
    onOpenShare: () => console.log('Open share'),
    onUndo: () => console.log('Undo'),
    onRedo: () => console.log('Redo'),
    participantsCount: 0,
    isScheduleEditVisible: false,
    setScheduleEditVisible: v => console.log(`Set schedule edit: ${v}`),
    onConfirmScheduleEdit: updated =>
      console.log('Confirm schedule edit', updated),
    onConfirmTimePicker: date => console.log('Confirm time picker', date),
    destination: '제주',
    onComplete: () => console.log('Complete'),
    planId: null,
    detailPlace: null,
    isDetailVisible: false,
    onOpenDetail: place => console.log('Open detail', place),
    onCloseDetail: () => console.log('Close detail'),
    weatherMap: mockWeatherMap,
  },
} satisfies Meta<typeof ItineraryEditorScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '기본 예시',
  args: { ...meta.args },
};

export const EmptyDay: Story = {
  name: '빈 일정',
  args: {
    ...meta.args,
    selectedDayIndex: 1,
    selectedDay: {
      dayNumber: 2,
      date: new Date('2024-03-02'),
      startTime: '09:00',
      endTime: '20:00',
      places: [],
    },
  },
};
