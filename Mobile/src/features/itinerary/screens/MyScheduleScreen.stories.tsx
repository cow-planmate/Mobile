import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MyScheduleScreenView, { MENU_OPTIONS } from './MyScheduleScreen.view';
import { AlertProvider } from '../../../contexts/AlertContext';

const meta = {
  title: 'Screens/App/Main/MyScheduleScreen',
  component: MyScheduleScreenView,
  decorators: [
    (Story) => (
      <AlertProvider>
        <Story />
      </AlertProvider>
    ),
  ],
  args: {
    loading: false,
    myItineraries: [],
    sharedItineraries: [],
    menuVisible: false,
    setMenuVisible: () => {},
    selectedPlan: null,
    menuOptions: MENU_OPTIONS,
    renameModalVisible: false,
    setRenameModalVisible: () => {},
    shareModalVisible: false,
    setShareModalVisible: () => {},
    handleMenuPress: () => {},
    handleMenuSelect: () => {},
    handleRenameTitle: async () => {},
    navigateToView: () => {},
    navigateToEditor: () => {},
    nickname: '플랜메이트',
    email: 'test@planmate.com',
    pendingRequestsCount: 0,
    isNotificationModalVisible: false,
    pendingRequestList: [],
    onCloseNotificationModal: () => {},
    onAcceptNotification: () => {},
    onRejectNotification: () => {},
    onNotificationPress: () => {},
    onNavigateProfile: () => {},
  },
  render: function Render(args) {
    const [menuVisible, setMenuVisible] = React.useState(args.menuVisible);

    React.useEffect(() => {
      setMenuVisible(args.menuVisible);
    }, [args.menuVisible]);

    return (
      <MyScheduleScreenView
        {...args}
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
      />
    );
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

export const WithData: Story = {
  args: {
    myItineraries: [
      {
        planId: 1,
        planName: '제주도 푸른 밤',
        startDate: '2024-08-01',
        endDate: '2024-08-03',
        destination: '제주도',
      },
      {
        planId: 2,
        planName: '서울 도심 여행',
        startDate: '2024-09-10',
        endDate: '2024-09-11',
        destination: '서울',
      },
    ],
    sharedItineraries: [
      {
        planId: 3,
        planName: '부산 식도락 투어',
        startDate: '2024-10-05',
        endDate: '2024-10-07',
        destination: '부산',
      },
    ],
  },
};

export const MenuOpened: Story = {
  args: {
    ...WithData.args,
    menuVisible: true,
    selectedPlan: {
      planId: 1,
      planName: '제주도 푸른 밤',
      startDate: '2024-08-01',
      endDate: '2024-08-03',
      destination: '제주도',
    },
  },
};
