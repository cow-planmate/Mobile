import React, { useRef } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import ItineraryEditorScreenView from '../../../screens/app/itinerary/ItineraryEditorScreen.view';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlacesProvider } from '../../../contexts/PlacesContext';

const meta = {
  title: 'Screens/Itinerary/ItineraryEditorScreen',
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
      {
        dayNumber: 1,
        date: new Date('2024-03-01'),
        places: [
          {
            id: 'p1',
            name: '인천국제공항',
            startTime: '10:00',
            endTime: '11:00',
            type: '관광지',
            address: '인천광역시 중구 공항로 272',
            rating: 4.5,
            imageUrl: '',
            latitude: 37.4602,
            longitude: 126.4407,
          },
          {
            id: 'p2',
            name: '제주국제공항',
            startTime: '13:00',
            endTime: '14:00',
            type: '관광지',
            address: '제주특별자치도 제주시 공항로 2',
            rating: 4.3,
            imageUrl: '',
            latitude: 33.5113,
            longitude: 126.493,
          },
        ],
      },
      {
        dayNumber: 2,
        date: new Date('2024-03-02'),
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
    formatDate: date => `${date.getMonth() + 1}/${date.getDate()}`,
    handleEditTime: (id, type, time) =>
      console.log(`Edit ${type} for ${id} to ${time}`),
    handleUpdatePlaceTimes: (id, start, end) =>
      console.log(`Update ${id} times: ${start}-${end}`),
    handleDeletePlace: id => console.log(`Delete ${id}`),
    handleAddPlace: place => console.log('Add place', place),
    selectedDay: {
      dayNumber: 1,
      date: new Date('2024-03-01'),
      places: [
        {
          id: 'p1',
          name: '인천국제공항',
          startTime: '10:00',
          endTime: '11:00',
          type: '관광지',
          address: '인천광역시 중구 공항로 272',
          rating: 4.5,
          imageUrl: '',
          latitude: 37.4602,
          longitude: 126.4407,
        },
        {
          id: 'p2',
          name: '제주국제공항',
          startTime: '13:00',
          endTime: '14:00',
          type: '관광지',
          address: '제주특별자치도 제주시 공항로 2',
          rating: 4.3,
          imageUrl: '',
          latitude: 33.5113,
          longitude: 126.493,
        },
      ],
    },
    onlineUsers: [],
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
    weatherMap: {},
  },
} satisfies Meta<typeof ItineraryEditorScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyDay: Story = {
  args: {
    selectedDayIndex: 1,
    selectedDay: {
      dayNumber: 2,
      date: new Date('2024-03-02'),
      places: [],
    },
  },
};
