import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ItineraryViewScreenView from './ItineraryViewScreen.view';
import { Day } from '../../../contexts/ItineraryContext';
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
    places: [
       {
        id: '3',
        name: '성산일출봉',
        address: '제주특별자치도 서귀포시 성산읍 성산리 1',
        startTime: '10:00:00',
        endTime: '12:00:00',
        latitude: 33.4582,
        longitude: 126.9424,
        categoryId: 0,
        type: '관광지',
        rating: 4.8,
        imageUrl: '',
        memo: '일출 구경',
      },
    ],
  },
];

const meta = {
  title: 'Screens/App/Itinerary/ItineraryViewScreen',
  component: ItineraryViewScreenView,
  decorators: [
    (Story) => (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AlertProvider>
          <Story />
        </AlertProvider>
      </GestureHandlerRootView>
    ),
  ],
  args: {
    days: mockDays,
    selectedDayIndex: 0,
    setSelectedDayIndex: () => {},
    isMapVisible: false,
    setMapVisible: () => {},
    isShareModalVisible: false,
    setShareModalVisible: () => {},
    scrollRef: { current: null } as any,
    gridHours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    offsetMinutes: 9 * 60,
    handleConfirm: () => {},
    goBack: () => {},
    handleEdit: () => {},
    planId: '123',
    tripName: '제주도 여름 휴가 (완료)',
    weatherMap: {
      '2024-08-01': {
        date: '2024-08-01',
        temp_min: 24,
        temp_max: 32,
        feels_like: 30,
        description: '맑음',
      },
      '2024-08-02': {
        date: '2024-08-02',
        temp_min: 22,
        temp_max: 28,
        feels_like: 26,
        description: '흐림',
      },
    },
    isBacking: false,
    isWeatherLoading: false,
  },
  render: function Render(args) {
    const [selectedDayIndex, setSelectedDayIndex] = React.useState(args.selectedDayIndex);
    const [isMapVisible, setMapVisible] = React.useState(args.isMapVisible);
    const [isShareModalVisible, setShareModalVisible] = React.useState(args.isShareModalVisible);

    return (
      <ItineraryViewScreenView
        {...args}
        selectedDayIndex={selectedDayIndex}
        setSelectedDayIndex={setSelectedDayIndex}
        isMapVisible={isMapVisible}
        setMapVisible={setMapVisible}
        isShareModalVisible={isShareModalVisible}
        setShareModalVisible={setShareModalVisible}
      />
    );
  },
} satisfies Meta<typeof ItineraryViewScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MapVisible: Story = {
  args: {
    isMapVisible: true,
  },
};

export const ShareModalOpen: Story = {
  args: {
    isShareModalVisible: true,
  },
};

export const DayTwo: Story = {
  args: {
    selectedDayIndex: 1,
  },
};
