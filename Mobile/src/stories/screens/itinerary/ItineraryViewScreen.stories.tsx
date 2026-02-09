import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import ItineraryViewScreenView from '../../../screens/app/itinerary/ItineraryViewScreen.view';

const mockDays = [
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
];

const meta = {
  title: 'Screens/Itinerary/ItineraryViewScreen',
  component: ItineraryViewScreenView,
  decorators: [
    Story => (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    days: mockDays,
    selectedDayIndex: 0,
    setSelectedDayIndex: idx => console.log(`Selected day index: ${idx}`),
    isMapVisible: true,
    setMapVisible: visible => console.log(`Set map visible: ${visible}`),
    isShareModalVisible: false,
    setShareModalVisible: visible => console.log(`Set share modal: ${visible}`),
    scrollRef: { current: null },
    gridHours: Array.from({ length: 24 }, (_, i) => i),
    offsetMinutes: 0,
    handleConfirm: () => console.log('Confirm'),
    goBack: () => console.log('Go back'),
    planId: 1,
  },
} satisfies Meta<typeof ItineraryViewScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MapHidden: Story = {
  args: {
    isMapVisible: false,
  },
};
