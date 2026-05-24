import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import ItineraryViewScreenView from '../../../screens/app/itinerary/ItineraryViewScreen.view';
import { Day } from '../../../contexts/ItineraryContext';

const mockDays: Day[] = [
  {
    dayNumber: 1,
    date: new Date('2024-03-01'),
    startTime: '09:00',
    endTime: '22:00',
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
        place_url: '',
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
        place_url: '',
      },
    ],
  },
  {
    dayNumber: 2,
    date: new Date('2024-03-02'),
    startTime: '09:00',
    endTime: '22:00',
    places: [],
  },
];

const meta = {
  title: 'Screens/Itinerary/ItineraryViewScreen',
  component: ItineraryViewScreenView,
  render: (args: any) => {
    const scrollRef = useRef<ScrollView>(null);
    const [isShareModalVisible, setShareModalVisible] = useState(
      args.isShareModalVisible,
    );
    const [isMapVisible, setMapVisible] = useState(args.isMapVisible);
    const [selectedDayIndex, setSelectedDayIndex] = useState(
      args.selectedDayIndex,
    );

    useEffect(() => {
      setShareModalVisible(args.isShareModalVisible);
      setMapVisible(args.isMapVisible);
      setSelectedDayIndex(args.selectedDayIndex);
    }, [args.isShareModalVisible, args.isMapVisible, args.selectedDayIndex]);

    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <ItineraryViewScreenView
          {...args}
          scrollRef={scrollRef}
          isShareModalVisible={isShareModalVisible}
          setShareModalVisible={setShareModalVisible}
          isMapVisible={isMapVisible}
          setMapVisible={setMapVisible}
          selectedDayIndex={selectedDayIndex}
          setSelectedDayIndex={setSelectedDayIndex}
        />
      </View>
    );
  },
  args: {
    days: mockDays as any,
    selectedDayIndex: 0,
    setSelectedDayIndex: (idx: number) =>
      console.log(`Selected day index: ${idx}`),
    isMapVisible: true,
    setMapVisible: (visible: boolean) =>
      console.log(`Set map visible: ${visible}`),
    isShareModalVisible: false,
    setShareModalVisible: (visible: boolean) =>
      console.log(`Set share modal: ${visible}`),
    scrollRef: { current: null }, // Will be injected by decorator
    gridHours: Array.from({ length: 24 }, (_, i) => i),
    offsetMinutes: 0,
    handleConfirm: () => console.log('Confirm'),
    goBack: () => console.log('Go back'),
    handleEdit: () => console.log('Edit'),
    planId: 1,
    tripName: '제주도 2박 3일 여행',
    weatherMap: {
      '2024-03-01': {
        date: '2024-03-01',
        description: '맑음',
        temp_min: 10,
        temp_max: 20,
        feels_like: 15,
      },
    },
  },
} as any;

export default meta;

type Story = StoryObj<typeof meta>;

export const 지도표시화면: Story = {};

export const 지도숨김화면: Story = {
  args: {
    isMapVisible: false,
  },
};

export const 공유모달표시화면: Story = {
  args: {
    isShareModalVisible: true,
  },
};

export const 일정없는날화면: Story = {
  args: {
    selectedDayIndex: 1, // 2일차 선택
  },
};

export const 비오는날화면: Story = {
  args: {
    weatherMap: {
      '2024-03-01': {
        date: '2024-03-01',
        description: '비',
        temp_min: 5,
        temp_max: 12,
        feels_like: 8,
      },
    },
  },
};
