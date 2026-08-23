import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import { HomeScreenView } from './HomeScreen.view';

const noop = () => {};

const meta = {
  title: '03. 홈/01. 일정 생성',
  component: HomeScreenView,
  args: {
    nickname: '민영',
    email: 'minyeong@planmate.app',
    pendingRequestsCount: 0,
    destination: '',
    dateText: '',
    paxText: '',
    isFormValid: false,
    isSearchModalVisible: false,
    isCalendarVisible: false,
    isPaxModalVisible: false,
    isNotificationModalVisible: false,
    pendingRequestList: [],
    startDate: null,
    endDate: null,
    adults: 1,
    children: 0,
    onNotificationPress: action('알림 열기'),
    onNavigateProfile: action('마이페이지 이동'),
    onOpenSearchModal: action('여행지 모달 열기'),
    onCloseSearchModal: noop,
    onSelectLocation: action('여행지 선택'),
    onOpenCalendar: action('기간 모달 열기'),
    onCloseCalendar: noop,
    onConfirmCalendar: action('기간 확정'),
    onOpenPaxModal: action('인원 모달 열기'),
    onClosePaxModal: noop,
    onConfirmPax: action('인원 확정'),
    onCreateItinerary: action('일정 생성'),
    onCloseNotificationModal: noop,
    onAcceptNotification: action('초대 수락'),
    onRejectNotification: action('초대 거절'),
  },
} satisfies Meta<typeof HomeScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { name: '빈 일정' };

export const Filled: Story = {
  name: '일정 있음',
  args: {
    destination: '제주',
    dateText: '2026.09.12 - 2026.09.14',
    paxText: '성인 2명',
    isFormValid: true,
    adults: 2,
  },
};

export const WithNotifications: Story = {
  name: '알림 있음',
  args: {
    pendingRequestsCount: 2,
    pendingRequestList: [
      {
        requestId: 1,
        planId: '101',
        planName: '가을 제주 3일',
        senderNickname: '지훈',
        type: 'INVITE',
      },
      {
        requestId: 2,
        planId: '102',
        planName: '부산 미식 여행',
        senderNickname: '서연',
        type: 'REQUEST',
      },
    ] as any,
  },
};

/** 여행지 → 기간 → 인원을 차례로 채우면 생성 버튼이 활성화되는 흐름 */
function InteractiveHome() {
  const [destination, setDestination] = useState('');
  const [dateText, setDateText] = useState('');
  const [paxText, setPaxText] = useState('');

  return (
    <HomeScreenView
      {...meta.args}
      destination={destination}
      dateText={dateText}
      paxText={paxText}
      isFormValid={!!destination && !!dateText && !!paxText}
      onOpenSearchModal={() => {
        action('여행지 선택')('제주');
        setDestination('제주');
      }}
      onOpenCalendar={() => {
        action('기간 선택')('2026.09.12 - 2026.09.14');
        setDateText('2026.09.12 - 2026.09.14');
      }}
      onOpenPaxModal={() => {
        action('인원 선택')('성인 2명');
        setPaxText('성인 2명');
      }}
      onCreateItinerary={action('일정 생성')}
    />
  );
}

export const Interactive: Story = {
  name: '상호작용',
  render: () => <InteractiveHome />,
};

export const Option2Timeline: Story = {
  name: '시안 B - 타임라인 액센트 (채택안)',
  args: {
    destination: '제주',
    dateText: '2026.09.12 - 2026.09.14',
    paxText: '성인 2명',
    isFormValid: true,
    adults: 2,
  },
};
