import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollView } from 'react-native';
import { action } from 'storybook/actions';
import ItineraryEditorScreenView from './ItineraryEditorScreen.view';
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

const INITIAL_DAYS: Day[] = [
  {
    dayNumber: 1,
    date: new Date(2026, 8, 12),
    places: [
      place('p1', '성산일출봉', '09:00', '10:30'),
      place('p2', '섭지코지', '11:00', '12:30'),
      place('p3', '광치기 식당', '13:00', '14:00', '식당'),
    ],
  },
  {
    dayNumber: 2,
    date: new Date(2026, 8, 13),
    places: [place('p4', '카멜리아힐', '10:00', '11:30')],
  },
];

const formatDate = (date: Date) =>
  `${`${date.getMonth() + 1}`.padStart(2, '0')}.${`${date.getDate()}`.padStart(
    2,
    '0',
  )}`;

/** 일자 전환·이름 편집·장소 삭제가 실제로 반영되도록 상태를 스토리에서 들고 있는다 */
function EditorHarness(props: {
  initialDays?: Day[];
  participantsCount?: number;
  initialTimePicker?: boolean;
  initialScheduleEdit?: boolean;
  initialEditingTripName?: boolean;
}) {
  const [days, setDays] = useState<Day[]>(props.initialDays ?? INITIAL_DAYS);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tripName, setTripName] = useState('가을 제주 3일');
  const [isEditingTripName, setIsEditingTripName] = useState(
    !!props.initialEditingTripName,
  );
  const [isTimePickerVisible, setTimePickerVisible] = useState(
    !!props.initialTimePicker,
  );
  const [isScheduleEditVisible, setScheduleEditVisible] = useState(
    !!props.initialScheduleEdit,
  );
  const [editingTime, setEditingTime] = useState<{
    placeId: string;
    type: 'startTime' | 'endTime';
    time: string;
  } | null>(
    props.initialTimePicker
      ? { placeId: 'p1', type: 'startTime', time: '09:00' }
      : null,
  );
  const timelineScrollRef = useRef<ScrollView>(null);

  const selectedDay = days[selectedDayIndex] ?? null;

  const updateSelectedDay = (updater: (day: Day) => Day) =>
    setDays(prev =>
      prev.map((day, index) => (index === selectedDayIndex ? updater(day) : day)),
    );

  return (
    <ItineraryEditorScreenView
      days={days}
      selectedDayIndex={selectedDayIndex}
      setSelectedDayIndex={index => {
        action('일자 선택')(index + 1);
        setSelectedDayIndex(index);
      }}
      tripName={tripName}
      isEditingTripName={isEditingTripName}
      setIsEditingTripName={setIsEditingTripName}
      setTripName={setTripName}
      onSaveTripName={() => {
        action('일정 이름 저장')(tripName);
        setIsEditingTripName(false);
      }}
      isTimePickerVisible={isTimePickerVisible}
      setTimePickerVisible={setTimePickerVisible}
      editingTime={editingTime}
      timelineScrollRef={timelineScrollRef}
      formatDate={formatDate}
      handleEditTime={(placeId, type, time) => {
        action('시간 편집 열기')({ placeId, type, time });
        setEditingTime({ placeId, type, time });
        setTimePickerVisible(true);
      }}
      handleUpdatePlaceTimes={(placeId, startMinutes, endMinutes) =>
        action('장소 시간 변경')({ placeId, startMinutes, endMinutes })
      }
      handleDeletePlace={placeId => {
        action('장소 삭제')(placeId);
        updateSelectedDay(day => ({
          ...day,
          places: day.places.filter(item => item.id !== placeId),
        }));
      }}
      handleAddPlace={added => {
        action('장소 추가')(added.name);
        updateSelectedDay(day => ({
          ...day,
          places: [
            ...day.places,
            { ...added, startTime: '15:00', endTime: '16:00' },
          ],
        }));
      }}
      selectedDay={selectedDay}
      isScheduleEditVisible={isScheduleEditVisible}
      setScheduleEditVisible={setScheduleEditVisible}
      onConfirmScheduleEdit={action('일정 시간표 저장')}
      onConfirmTimePicker={date => {
        action('시간 확정')(date.toISOString());
        setTimePickerVisible(false);
        setEditingTime(null);
      }}
      destination="제주"
      onComplete={action('완료')}
      onOpenParticipants={action('참여자 열기')}
      onOpenMap={action('지도 열기')}
      onOpenShare={action('공유 열기')}
      onOpenChecklist={action('체크리스트 열기')}
      onUndo={action('되돌리기')}
      onRedo={action('다시실행')}
      participantsCount={props.participantsCount ?? 3}
      planId="101"
      travelId={1}
      onOpenDetail={item => action('장소 상세')(item.name)}
      weatherMap={{}}
      onOpenPlanInfo={action('일정 정보 열기')}
      onGoBack={action('뒤로가기')}
    />
  );
}

const meta = {
  title: '04. 일정/01. 일정 편집',
  component: ItineraryEditorScreenView,
  args: {
    days: INITIAL_DAYS,
    selectedDayIndex: 0,
    setSelectedDayIndex: noop,
    tripName: '가을 제주 3일',
    isEditingTripName: false,
    setIsEditingTripName: noop,
    setTripName: noop,
    onSaveTripName: noop,
    isTimePickerVisible: false,
    setTimePickerVisible: noop,
    editingTime: null,
    timelineScrollRef: { current: null },
    formatDate,
    handleEditTime: noop,
    handleUpdatePlaceTimes: noop,
    handleDeletePlace: noop,
    handleAddPlace: noop,
    selectedDay: INITIAL_DAYS[0],
    isScheduleEditVisible: false,
    setScheduleEditVisible: noop,
    onConfirmScheduleEdit: noop,
    onConfirmTimePicker: noop,
    destination: '제주',
    onComplete: action('완료'),
    onOpenParticipants: action('참여자 열기'),
    onOpenMap: action('지도 열기'),
    onOpenShare: action('공유 열기'),
    onOpenChecklist: action('체크리스트 열기'),
    onUndo: action('되돌리기'),
    onRedo: action('다시실행'),
    participantsCount: 3,
    planId: '101',
    weatherMap: {},
    onOpenDetail: action('장소 상세'),
    onOpenPlanInfo: action('일정 정보 열기'),
  },
} satisfies Meta<typeof ItineraryEditorScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 타임라인 탭 — 일자 전환, 장소 삭제, 시간 편집, undo/redo */
export const Timeline: Story = {
  name: '일정표',
  render: () => <EditorHarness />,
};

/** 장소 시트 — 시간표 아래에서 바로 고르고, 꾹 눌러 시간표에 놓는다 */
export const AddPlace: Story = {
  name: '장소 추가',
  render: () => <EditorHarness />,
};

export const EmptyDay: Story = {
  name: '빈 날짜',
  render: () => (
    <EditorHarness
      initialDays={[{ dayNumber: 1, date: new Date(2026, 8, 12), places: [] }]}
    />
  ),
};

export const SoloPlan: Story = {
  name: '혼자 여행',
  render: () => <EditorHarness participantsCount={1} />,
};

/** 일정명 인라인 편집 */
export const EditingTripName: Story = {
  name: '여행 이름 편집',
  render: () => <EditorHarness initialEditingTripName />,
};

/** 타임라인 블록의 시간을 눌러 여는 시간 선택 모달 */
export const TimePickerOpen: Story = {
  name: '시간 선택 열림',
  render: () => <EditorHarness initialTimePicker />,
};

/** 일자 시간표 편집 모달 */
export const ScheduleEditOpen: Story = {
  name: '일정 편집 열림',
  render: () => <EditorHarness initialScheduleEdit />,
};
