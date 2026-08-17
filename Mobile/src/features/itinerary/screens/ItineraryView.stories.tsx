import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollView } from 'react-native';
import { action } from 'storybook/actions';
import ItineraryViewScreenView from './ItineraryViewScreen.view';
import { Day } from '../../../contexts/ItineraryContext';
import { Place } from '../components/TimelineItem';

const noop = () => {};

const place = (
  id: string,
  name: string,
  startTime: string,
  endTime: string,
  type: Place['type'] = '관광지',
): Place => ({
  id,
  name,
  type,
  startTime,
  endTime,
  address: '제주특별자치도 서귀포시',
  imageUrl: '',
  latitude: 33.4586,
  longitude: 126.9425,
});

const DAYS: Day[] = [
  {
    dayNumber: 1,
    date: new Date(2026, 8, 12),
    places: [
      place('p1', '성산일출봉', '09:00', '10:30'),
      place('p2', '섭지코지', '11:00', '12:30'),
      place('p3', '광치기해변 근처 식당', '13:00', '14:00', '식당'),
      place('p4', '표선 해수욕장 숙소', '17:00', '18:00', '숙소'),
    ],
  },
  {
    dayNumber: 2,
    date: new Date(2026, 8, 13),
    places: [
      place('p5', '카멜리아힐', '10:00', '11:30'),
      place('p6', '오설록 티뮤지엄', '12:00', '13:30'),
    ],
  },
  {
    dayNumber: 3,
    date: new Date(2026, 8, 14),
    places: [place('p7', '제주공항', '15:00', '16:00', '기타')],
  },
];

const GRID_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const LOADING_DEMO_MS = 1500;

/** hooks(useState/useRef)가 필요해 스토리마다 래퍼를 둔다 */
function ViewHarness(props: {
  days?: Day[];
  isBacking?: boolean;
  initialMapVisible?: boolean;
  /** 로딩 오버레이를 잠깐 보여준 뒤 데이터를 채운다 */
  demoLoading?: boolean;
}) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  // 로딩 오버레이는 전체 화면 모달이라 계속 떠 있으면 스토리 목록을 덮는다.
  // 실제 로딩 흐름과 같게 잠깐 보여준 뒤 스스로 걷힌다.
  const [isLoadingDemo, setIsLoadingDemo] = useState(!!props.demoLoading);

  useEffect(() => {
    if (!props.demoLoading) return;
    const timer = setTimeout(() => setIsLoadingDemo(false), LOADING_DEMO_MS);
    return () => clearTimeout(timer);
  }, [props.demoLoading]);

  const [isMapVisible, setMapVisible] = useState(!!props.initialMapVisible);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isChecklistVisible, setChecklistVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ItineraryViewScreenView
      days={isLoadingDemo ? [] : (props.days ?? DAYS)}
      selectedDayIndex={selectedDayIndex}
      setSelectedDayIndex={index => {
        action('일자 선택')(index + 1);
        setSelectedDayIndex(index);
      }}
      isMapVisible={isMapVisible}
      setMapVisible={visible => {
        action('지도 토글')(visible);
        setMapVisible(visible);
      }}
      isShareModalVisible={isShareModalVisible}
      setShareModalVisible={visible => {
        action('공유 모달')(visible);
        setShareModalVisible(visible);
      }}
      isChecklistVisible={isChecklistVisible}
      setChecklistVisible={visible => {
        action('체크리스트')(visible);
        setChecklistVisible(visible);
      }}
      isPlanOwner
      scrollRef={scrollRef}
      gridHours={GRID_HOURS}
      offsetMinutes={8 * 60}
      endHour={20}
      handleConfirm={action('완료')}
      goBack={action('뒤로가기')}
      handleEdit={action('편집으로 이동')}
      planId="101"
      weatherMap={{}}
      tripName="가을 제주 3일"
      isBacking={!!props.isBacking}
      isWeatherLoading={false}
    />
  );
}

const meta = {
  title: 'Itinerary/일정 완성',
  component: ItineraryViewScreenView,
  args: {
    days: DAYS,
    selectedDayIndex: 0,
    setSelectedDayIndex: noop,
    isMapVisible: false,
    setMapVisible: noop,
    isShareModalVisible: false,
    setShareModalVisible: noop,
    isChecklistVisible: false,
    setChecklistVisible: noop,
    isPlanOwner: true,
    scrollRef: { current: null },
    gridHours: GRID_HOURS,
    offsetMinutes: 8 * 60,
    endHour: 20,
    handleConfirm: action('완료'),
    goBack: action('뒤로가기'),
    handleEdit: action('편집으로 이동'),
    planId: '101',
    weatherMap: {},
    tripName: '가을 제주 3일',
    isBacking: false,
    isWeatherLoading: false,
  },
} satisfies Meta<typeof ItineraryViewScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 일자 전환·지도 토글·공유·체크리스트를 실제로 눌러보는 상태 */
export const Timeline: Story = {
  render: () => <ViewHarness />,
};

export const WithMap: Story = {
  render: () => <ViewHarness initialMapVisible />,
};

export const SingleDay: Story = {
  render: () => <ViewHarness days={[DAYS[0]]} />,
};

/** 로딩 오버레이 → 일정 표시. 1.5초 뒤 스스로 걷혀 다른 스토리로 이동할 수 있다 */
export const Loading: Story = {
  render: () => <ViewHarness demoLoading />,
};
