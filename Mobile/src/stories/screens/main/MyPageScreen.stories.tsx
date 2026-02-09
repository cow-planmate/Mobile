import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import MyPageScreenView from '../../../screens/app/main/MyPageScreen.view';

const mockPlans = [
  {
    planId: 1,
    title: '제주도 여행',
    departure: '서울',
    destination: '제주',
    departureTime: '2024-03-01',
    arrivalTime: '2024-03-05',
    pax: 2,
    transport: 'Airplane',
  },
  {
    planId: 2,
    title: '부산 먹방 여행',
    departure: '서울',
    destination: '부산',
    departureTime: '2024-04-10',
    arrivalTime: '2024-04-12',
    pax: 4,
    transport: 'Train',
  },
];

const meta = {
  title: 'Screens/Main/MyPageScreen',
  component: MyPageScreenView,
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
    setMenuVisible: visible => console.log(`Set menu visible: ${visible}`),
    selectedPlan: null,
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
  },
} satisfies Meta<typeof MyPageScreenView>;

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
