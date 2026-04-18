import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import MyScheduleScreenView, {
  MENU_OPTIONS,
} from '../../../screens/app/main/MyScheduleScreen.view';

const mockPlans = [
  {
    planId: 1,
    planName: '제주도 여행',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
  },
  {
    planId: 2,
    planName: '부산 먹방 여행',
    startDate: '2024-04-10',
    endDate: '2024-04-12',
  },
];

const meta = {
  title: 'Screens/Main/MyScheduleScreen',
  component: MyScheduleScreenView,
  decorators: [
    Story => (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    loading: false,
    myItineraries: mockPlans,
    sharedItineraries: [mockPlans[0]],
    menuVisible: false,
    menuOptions: MENU_OPTIONS,
    selectedPlan: mockPlans[0],
    setMenuVisible: visible => console.log(`Set menu visible: ${visible}`),
    renameModalVisible: false,
    setRenameModalVisible: visible =>
      console.log(`Set rename modal visible: ${visible}`),
    shareModalVisible: false,
    setShareModalVisible: visible =>
      console.log(`Set share modal visible: ${visible}`),
    handleMenuPress: plan => console.log('Menu press', plan),
    handleMenuSelect: action => console.log('Menu select', action),
    handleRenameTitle: async title => console.log('Rename to', title),
    navigateToView: plan => console.log('Navigate to view', plan),
    navigateToEditor: plan => console.log('Navigate to editor', plan),
    nickname: '디자인테스트',
    email: 'design@example.com',
    pendingRequestsCount: 2,
    isNotificationModalVisible: false,
    pendingRequestList: [],
    onCloseNotificationModal: () => console.log('Close notification modal'),
    onAcceptNotification: requestId =>
      console.log('Accept notification', requestId),
    onRejectNotification: requestId =>
      console.log('Reject notification', requestId),
    onNotificationPress: () => console.log('Notification pressed'),
    onNavigateProfile: () => console.log('Navigate profile'),
  },
} satisfies Meta<typeof MyScheduleScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    myItineraries: [],
    sharedItineraries: [],
  },
};
