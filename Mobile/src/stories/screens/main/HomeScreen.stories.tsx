import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Bus, Car } from 'lucide-react-native';
import { HomeScreenView } from '../../../screens/app/main/HomeScreen.view';

const meta = {
  title: 'Screens/Main/HomeScreen',
  component: HomeScreenView,
  render: (args: any) => {
    const [isNotificationModalVisible, setNotificationModalVisible] = useState(
      args.isNotificationModalVisible,
    );
    const [isSearchModalVisible, setSearchModalVisible] = useState(
      args.isSearchModalVisible,
    );
    const [isCalendarVisible, setCalendarVisible] = useState(
      args.isCalendarVisible,
    );
    const [isPaxModalVisible, setPaxModalVisible] = useState(
      args.isPaxModalVisible,
    );
    const [isTransportModalVisible, setTransportModalVisible] = useState(
      args.isTransportModalVisible,
    );

    useEffect(() => {
      setNotificationModalVisible(args.isNotificationModalVisible);
      setSearchModalVisible(args.isSearchModalVisible);
      setCalendarVisible(args.isCalendarVisible);
      setPaxModalVisible(args.isPaxModalVisible);
      setTransportModalVisible(args.isTransportModalVisible);
    }, [args]);

    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <HomeScreenView
          {...args}
          isNotificationModalVisible={isNotificationModalVisible}
          onCloseNotificationModal={() => setNotificationModalVisible(false)}
          isSearchModalVisible={isSearchModalVisible}
          onCloseSearchModal={() => setSearchModalVisible(false)}
          isCalendarVisible={isCalendarVisible}
          onCloseCalendar={() => setCalendarVisible(false)}
          isPaxModalVisible={isPaxModalVisible}
          onClosePaxModal={() => setPaxModalVisible(false)}
          isTransportModalVisible={isTransportModalVisible}
          onCloseTransportModal={() => setTransportModalVisible(false)}
        />
      </View>
    );
  },
  args: {
    nickname: '디자인테스트',
    pendingRequestsCount: 0,
    departure: '',
    destination: '',
    transport: '',
    dateText: '',
    paxText: '',
    showErrors: false,
    isFormValid: false,
    isSearchModalVisible: false,
    isCalendarVisible: false,
    isPaxModalVisible: false,
    isTransportModalVisible: false,
    isNotificationModalVisible: false,
    pendingRequestList: [],
    fieldToUpdate: 'departure',
    transportOptions: [
      {
        label: '대중교통',
        icon: <Bus size={28} color="#1344FF" strokeWidth={1.5} />,
      },
      {
        label: '자동차',
        icon: <Car size={28} color="#1344FF" strokeWidth={1.5} />,
      },
    ],
    onNotificationPress: () => console.log('Notification Pressed'),
    onNavigateProfile: () => console.log('Profile Pressed'),
    onOpenSearchModal: field => console.log(`Open Search Modal: ${field}`),
    onCloseSearchModal: () => console.log('Close Search Modal'),
    onSelectLocation: loc => console.log(`Selected Location: ${loc}`),
    onOpenCalendar: () => console.log('Open Calendar'),
    onCloseCalendar: () => console.log('Close Calendar'),
    onConfirmCalendar: dates => console.log('Confirm Calendar', dates),
    onOpenPaxModal: () => console.log('Open Pax Modal'),
    onClosePaxModal: () => console.log('Close Pax Modal'),
    onConfirmPax: pax => console.log('Confirm Pax', pax),
    onOpenTransportModal: () => console.log('Open Transport Modal'),
    onCloseTransportModal: () => console.log('Close Transport Modal'),
    onSelectTransport: t => console.log(`Selected Transport: ${t}`),
    onCreateItinerary: () => console.log('Create Itinerary'),
    onCloseNotificationModal: () => console.log('Close Notification Modal'),
    onAcceptNotification: id => console.log(`Accept Notification: ${id}`),
    onRejectNotification: id => console.log(`Reject Notification: ${id}`),
  },
} satisfies Meta<typeof HomeScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본화면: Story = {};

export const 입력완료화면: Story = {
  args: {
    destination: '부산',
    dateText: '2024. 04. 01. ~ 2024. 04. 03.',
    paxText: '성인 2명, 어린이 1명',
    transport: '대중교통',
    isFormValid: true,
  },
};

export const 알림있는화면: Story = {
  args: {
    pendingRequestsCount: 3,
  },
};

export const 에러발생화면: Story = {
  args: {
    showErrors: true,
    isFormValid: false,
  },
};

export const 알림모달화면: Story = {
  args: {
    isNotificationModalVisible: true,
    pendingRequestsCount: 1,
    pendingRequestList: [{ id: 1, message: '새로운 여행 초대가 있습니다.' }],
  },
};

export const 장소검색모달화면: Story = {
  args: {
    isSearchModalVisible: true,
  },
};

export const 캘린더모달화면: Story = {
  args: {
    isCalendarVisible: true,
  },
};

export const 인원선택모달화면: Story = {
  args: {
    isPaxModalVisible: true,
  },
};

export const 교통수단모달화면: Story = {
  args: {
    isTransportModalVisible: true,
  },
};
