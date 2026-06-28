import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HomeScreenView } from './HomeScreen.view';

const meta = {
  title: 'Screens/App/Main/HomeScreen',
  component: HomeScreenView,
  args: {
    nickname: '플랜메이트',
    email: 'test@planmate.com',
    pendingRequestsCount: 0,
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
    transportOptions: [],
    onCloseNotificationModal: () => {},
    onAcceptNotification: () => {},
    onRejectNotification: () => {},
    onNotificationPress: () => {},
    onNavigateProfile: () => {},
    onOpenSearchModal: () => {},
    onCloseSearchModal: () => {},
    onSelectLocation: () => {},
    onOpenCalendar: () => {},
    onCloseCalendar: () => {},
    onConfirmCalendar: () => {},
    onOpenPaxModal: () => {},
    onClosePaxModal: () => {},
    onConfirmPax: () => {},
    onOpenTransportModal: () => {},
    onCloseTransportModal: () => {},
    onSelectTransport: () => {},
    onCreateItinerary: () => {},
  },
  render: function Render(args) {
    const [isSearchModalVisible, setSearchModalVisible] = React.useState(
      args.isSearchModalVisible,
    );
    const [isCalendarVisible, setCalendarVisible] = React.useState(
      args.isCalendarVisible,
    );
    const [isPaxModalVisible, setPaxModalVisible] = React.useState(
      args.isPaxModalVisible,
    );
    const [isTransportModalVisible, setTransportModalVisible] = React.useState(
      args.isTransportModalVisible,
    );
    const [isNotificationModalVisible, setNotificationModalVisible] =
      React.useState(args.isNotificationModalVisible);

    React.useEffect(() => {
      setSearchModalVisible(args.isSearchModalVisible);
      setCalendarVisible(args.isCalendarVisible);
      setPaxModalVisible(args.isPaxModalVisible);
      setTransportModalVisible(args.isTransportModalVisible);
      setNotificationModalVisible(args.isNotificationModalVisible);
    }, [
      args.isSearchModalVisible,
      args.isCalendarVisible,
      args.isPaxModalVisible,
      args.isTransportModalVisible,
      args.isNotificationModalVisible,
    ]);

    return (
      <HomeScreenView
        {...args}
        isSearchModalVisible={isSearchModalVisible}
        onOpenSearchModal={() => setSearchModalVisible(true)}
        onCloseSearchModal={() => setSearchModalVisible(false)}
        isCalendarVisible={isCalendarVisible}
        onOpenCalendar={() => setCalendarVisible(true)}
        onCloseCalendar={() => setCalendarVisible(false)}
        onConfirmCalendar={() => setCalendarVisible(false)}
        isPaxModalVisible={isPaxModalVisible}
        onOpenPaxModal={() => setPaxModalVisible(true)}
        onClosePaxModal={() => setPaxModalVisible(false)}
        onConfirmPax={() => setPaxModalVisible(false)}
        isTransportModalVisible={isTransportModalVisible}
        onOpenTransportModal={() => setTransportModalVisible(true)}
        onCloseTransportModal={() => setTransportModalVisible(false)}
        onSelectTransport={() => setTransportModalVisible(false)}
        isNotificationModalVisible={isNotificationModalVisible}
        onNotificationPress={() => setNotificationModalVisible(true)}
        onCloseNotificationModal={() => setNotificationModalVisible(false)}
        onAcceptNotification={() => setNotificationModalVisible(false)}
        onRejectNotification={() => setNotificationModalVisible(false)}
      />
    );
  },
} satisfies Meta<typeof HomeScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FormFilled: Story = {
  args: {
    destination: '제주특별자치도',
    dateText: '2026.08.01 ~ 2026.08.03',
    paxText: '성인 2명, 어린이 1명',
    transport: '대중교통',
    isFormValid: true,
  },
};

export const WithNotifications: Story = {
  args: {
    pendingRequestsCount: 1,
    pendingRequestList: [
      {
        requestId: 1,
        senderNickname: 'Alice',
        planName: '제주도 여름 휴가',
      },
    ],
  },
};
