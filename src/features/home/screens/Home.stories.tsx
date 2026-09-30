import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import { HomeScreenView } from './HomeScreen.view';
import { formatPeriod } from '../../../utils/timeUtils';

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
    children: 0,
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

function SearchModalStory() {
  const [isOpen, setIsOpen] = useState(true);
  const [destination, setDestination] = useState('');
  return (
    <HomeScreenView
      {...meta.args}
      destination={destination}
      isSearchModalVisible={isOpen}
      onOpenSearchModal={() => setIsOpen(true)}
      onCloseSearchModal={() => {
        action('여행지 모달 닫기')();
        setIsOpen(false);
      }}
      onSelectLocation={(loc: string) => {
        action('여행지 선택')(loc);
        setDestination(loc);
        setIsOpen(false);
      }}
    />
  );
}

export const SearchModalOpen: Story = {
  name: '모달 - 여행지 검색',
  render: () => <SearchModalStory />,
};

function CalendarModalStory() {
  const [isOpen, setIsOpen] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(new Date('2026-09-12'));
  const [endDate, setEndDate] = useState<Date | null>(new Date('2026-09-14'));
  const [dateText, setDateText] = useState('2026.09.12 - 2026.09.14');
  return (
    <HomeScreenView
      {...meta.args}
      startDate={startDate}
      endDate={endDate}
      dateText={dateText}
      isCalendarVisible={isOpen}
      onOpenCalendar={() => setIsOpen(true)}
      onCloseCalendar={() => {
        action('기간 모달 닫기')();
        setIsOpen(false);
      }}
      onConfirmCalendar={({ startDate: s, endDate: e }) => {
        action('기간 확정')({ startDate: s, endDate: e });
        setStartDate(s);
        setEndDate(e);
        setDateText(formatPeriod(s, e));
        setIsOpen(false);
      }}
    />
  );
}

export const CalendarModalOpen: Story = {
  name: '모달 - 기간 선택',
  render: () => <CalendarModalStory />,
};

function PaxModalStory() {
  const [isOpen, setIsOpen] = useState(true);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(1);
  const [paxText, setPaxText] = useState('성인 2명, 아동 1명');
  return (
    <HomeScreenView
      {...meta.args}
      adults={adults}
      children={children}
      paxText={paxText}
      isPaxModalVisible={isOpen}
      onOpenPaxModal={() => setIsOpen(true)}
      onClosePaxModal={() => {
        action('인원 모달 닫기')();
        setIsOpen(false);
      }}
      onConfirmPax={({ adults: a, children: c }) => {
        action('인원 확정')({ adults: a, children: c });
        setAdults(a);
        setChildren(c);
        const text = c > 0 ? `성인 ${a}명, 아동 ${c}명` : `성인 ${a}명`;
        setPaxText(text);
        setIsOpen(false);
      }}
    />
  );
}

export const PaxModalOpen: Story = {
  name: '모달 - 인원 선택',
  render: () => <PaxModalStory />,
};

function NotificationModalStory() {
  const [isOpen, setIsOpen] = useState(true);
  const [requests, setRequests] = useState([
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
  ]);
  return (
    <HomeScreenView
      {...meta.args}
      pendingRequestsCount={requests.length}
      pendingRequestList={requests as any}
      isNotificationModalVisible={isOpen}
      onNotificationPress={() => setIsOpen(true)}
      onCloseNotificationModal={() => {
        action('알림 모달 닫기')();
        setIsOpen(false);
      }}
      onAcceptNotification={(id: number) => {
        action('초대 수락')(id);
        setRequests(prev => prev.filter(r => r.requestId !== id));
      }}
      onRejectNotification={(id: number) => {
        action('초대 거절')(id);
        setRequests(prev => prev.filter(r => r.requestId !== id));
      }}
    />
  );
}

export const NotificationModalOpen: Story = {
  name: '모달 - 알림 목록',
  render: () => <NotificationModalStory />,
};

/** 여행지 → 기간 → 인원 모달을 직접 열고 닫으며 일정을 완성하는 상호작용 스토리 */
function InteractiveHome() {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateText, setDateText] = useState('');
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [paxText, setPaxText] = useState('');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPaxOpen, setIsPaxOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const isFormValid = Boolean(destination && dateText && paxText);

  return (
    <HomeScreenView
      {...meta.args}
      destination={destination}
      dateText={dateText}
      paxText={paxText}
      startDate={startDate}
      endDate={endDate}
      adults={adults}
      children={children}
      isFormValid={isFormValid}
      isSearchModalVisible={isSearchOpen}
      isCalendarVisible={isCalendarOpen}
      isPaxModalVisible={isPaxOpen}
      isNotificationModalVisible={isNotificationOpen}
      pendingRequestsCount={2}
      pendingRequestList={[
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
      ] as any}
      onNotificationPress={() => setIsNotificationOpen(true)}
      onCloseNotificationModal={() => setIsNotificationOpen(false)}
      onAcceptNotification={action('초대 수락')}
      onRejectNotification={action('초대 거절')}
      onOpenSearchModal={() => setIsSearchOpen(true)}
      onCloseSearchModal={() => setIsSearchOpen(false)}
      onSelectLocation={(loc: string) => {
        action('여행지 선택')(loc);
        setDestination(loc);
        setIsSearchOpen(false);
      }}
      onOpenCalendar={() => setIsCalendarOpen(true)}
      onCloseCalendar={() => setIsCalendarOpen(false)}
      onConfirmCalendar={({ startDate: s, endDate: e }) => {
        action('기간 확정')({ startDate: s, endDate: e });
        setStartDate(s);
        setEndDate(e);
        setDateText(formatPeriod(s, e));
        setIsCalendarOpen(false);
      }}
      onOpenPaxModal={() => setIsPaxOpen(true)}
      onClosePaxModal={() => setIsPaxOpen(false)}
      onConfirmPax={({ adults: a, children: c }) => {
        action('인원 확정')({ adults: a, children: c });
        setAdults(a);
        setChildren(c);
        const text = c > 0 ? `성인 ${a}명, 아동 ${c}명` : `성인 ${a}명`;
        setPaxText(text);
        setIsPaxOpen(false);
      }}
      onCreateItinerary={action('일정 생성')}
    />
  );
}

export const Interactive: Story = {
  name: '상호작용',
  render: () => <InteractiveHome />,
};
