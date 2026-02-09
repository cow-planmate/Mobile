import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { HomeScreenView } from '../../../screens/app/main/HomeScreen.view';

const meta = {
  title: 'Screens/HomeScreen',
  component: HomeScreenView,
  decorators: [
    Story => (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Story />
      </View>
    ),
  ],
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
    fieldToUpdate: 'departure',
    transportOptions: [
      { label: '대중교통', icon: '🚌' },
      { label: '자동차', icon: '🚗' },
    ],
    onNotificationPress: () => console.log('Notification Pressed'),
    onNavigateProfile: () => console.log('Profile Pressed'),
    onOpenSearchModal: field => console.log(`Open Search Modal: ${field}`),
    onCloseSearchModal: () => console.log('Close Search Modal'),
    onSelectLocation: loc => console.log(`Selected Location: ${loc}`),
    onOpenCalendar: () => console.log('Open Calendar'),
    onCloseCalendar: () => console.log('Close Calendar'),
    onConfirmCalendar: () => console.log('Confirm Calendar'),
    onOpenPaxModal: () => console.log('Open Pax Modal'),
    onClosePaxModal: () => console.log('Close Pax Modal'),
    onConfirmPax: () => console.log('Confirm Pax'),
    onOpenTransportModal: () => console.log('Open Transport Modal'),
    onCloseTransportModal: () => console.log('Close Transport Modal'),
    onSelectTransport: t => console.log(`Selected Transport: ${t}`),
    onCreateItinerary: () => console.log('Create Itinerary'),
  },
} satisfies Meta<typeof HomeScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Filled: Story = {
  args: {
    departure: '서울',
    destination: '부산',
    dateText: '2024. 04. 01. ~ 2024. 04. 03.',
    paxText: '성인 2명, 어린이 1명',
    transport: '대중교통',
    isFormValid: true,
  },
};

export const WithNotifications: Story = {
  args: {
    pendingRequestsCount: 3,
  },
};

export const ShowErrors: Story = {
  args: {
    showErrors: true,
    isFormValid: false,
  },
};
