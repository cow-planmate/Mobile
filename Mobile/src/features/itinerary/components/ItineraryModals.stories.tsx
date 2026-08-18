import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { action } from 'storybook/actions';
import {
  PlanInfoModal,
  ScheduleEditModal,
  ShareModal,
  TimePickerModal,
} from '../../../components/common';
import ChecklistSheet from './checklist/ChecklistSheet';
import EditAccessGate from './EditAccessGate';
import ParticipantsModal from './ParticipantsModal';
import PlaceEditModal from './PlaceEditModal';
import PlanMapModal from './PlanMapModal';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

const PARTICIPANTS = [
  { uid: 'u1', userNickname: '민영', avatarUrl: null },
  { uid: 'u2', userNickname: '지훈', avatarUrl: null },
  { uid: 'u3', userInfo: { nickname: '서연' }, avatarUrl: null },
];

const MAP_PLACES = [
  {
    id: 'p1',
    name: '성산일출봉',
    address: '제주 서귀포시 성산읍',
    latitude: 33.4586,
    longitude: 126.9425,
  },
  {
    id: 'p2',
    name: '섭지코지',
    address: '제주 서귀포시 성산읍',
    latitude: 33.4239,
    longitude: 126.9296,
  },
];

const SCHEDULE_DAYS = [
  { date: new Date(2026, 8, 12), startTime: '09:00', endTime: '20:00' },
  { date: new Date(2026, 8, 13), startTime: '10:00', endTime: '19:00' },
];

const PLACE = {
  id: 'p1',
  name: '성산일출봉',
  type: '관광지',
  startTime: '09:00',
  endTime: '10:30',
  address: '제주 서귀포시 성산읍 일출로 284-12',
  imageUrl: '',
  latitude: 33.4586,
  longitude: 126.9425,
  memo: '일출 시간 확인하기',
};

/**
 * 모달은 열려 있어야 볼 수 있지만, 계속 떠 있으면 스토리북 목록을 덮는다.
 * 각 스토리는 열기 버튼이 있는 화면에서 시작하고, 모달을 닫으면 되돌아온다.
 */
function ModalStage({
  label,
  render,
}: {
  label: string;
  render: (visible: boolean, close: () => void) => React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.stage}>
      <Text style={styles.stageTitle}>{label}</Text>
      <Text style={styles.stageHint}>
        버튼을 눌러 모달을 열고, 닫으면 이 화면으로 돌아옵니다.
      </Text>
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => {
          action('모달 열기')(label);
          setVisible(true);
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={styles.openButtonText}>{label} 열기</Text>
      </TouchableOpacity>

      {render(visible, () => {
        action('모달 닫기')(label);
        setVisible(false);
      })}
    </View>
  );
}

const meta = {
  title: 'Itinerary/일정 편집 모달',
  component: ModalStage,
  args: {
    label: '모달',
    render: () => null,
  },
} satisfies Meta<typeof ModalStage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 상단바 참여자 버튼 */
export const Participants: Story = {
  render: () => (
    <ModalStage
      label="참여자"
      render={(visible, close) => (
        <ParticipantsModal
          visible={visible}
          onClose={close}
          users={PARTICIPANTS}
          currentUserId="u1"
          isPlanOwner
        />
      )}
    />
  ),
};

export const ParticipantsEmpty: Story = {
  render: () => (
    <ModalStage
      label="참여자 (없음)"
      render={(visible, close) => (
        <ParticipantsModal visible={visible} onClose={close} users={[]} />
      )}
    />
  ),
};

/** 상단바 지도 버튼 */
export const PlanMap: Story = {
  render: () => (
    <ModalStage
      label="일정 지도"
      render={(visible, close) => (
        <PlanMapModal
          visible={visible}
          onClose={close}
          places={MAP_PLACES}
          onApplyOptimizedOrder={action('동선 최적화 적용')}
        />
      )}
    />
  ),
};

/** 상단바 공유 버튼 */
export const Share: Story = {
  render: () => (
    <ModalStage
      label="공유"
      render={(visible, close) => (
        <ShareModal visible={visible} onClose={close} planId="101" isOwner isMock />
      )}
    />
  ),
};

/** 상단바 정보 버튼 */
export const PlanInfo: Story = {
  render: () => (
    <ModalStage
      label="일정 정보"
      render={(visible, close) => (
        <PlanInfoModal
          visible={visible}
          onClose={close}
          planName="가을 제주 3일"
          destination="제주"
          startDate="2026-09-12"
          endDate="2026-09-14"
          adultCount={2}
          childCount={0}
        />
      )}
    />
  ),
};

/** 상단바 체크리스트 버튼 */
export const Checklist: Story = {
  render: () => (
    <ModalStage
      label="체크리스트"
      render={(visible, close) => (
        <ChecklistSheet visible={visible} onClose={close} planId="101" />
      )}
    />
  ),
};

/** 일자 헤더의 시간표 편집 */
export const ScheduleEdit: Story = {
  render: () => (
    <ModalStage
      label="일정 시간표 편집"
      render={(visible, close) => (
        <ScheduleEditModal
          visible={visible}
          initialDays={SCHEDULE_DAYS}
          onClose={close}
          onConfirm={days => {
            action('시간표 저장')(days.length);
            close();
          }}
        />
      )}
    />
  ),
};

/** 타임라인 블록의 시작/종료 시간 탭 */
export const TimePicker: Story = {
  render: () => (
    <ModalStage
      label="시간 선택"
      render={(visible, close) => (
        <TimePickerModal
          visible={visible}
          onClose={close}
          initialDate={new Date(2026, 8, 12, 9, 0)}
          onConfirm={date => {
            action('시간 확정')(date.toISOString());
            close();
          }}
        />
      )}
    />
  ),
};

/** 타임라인 블록 길게 눌러 여는 장소 편집 */
export const PlaceEdit: Story = {
  render: () => (
    <ModalStage
      label="장소 편집"
      render={(visible, close) => (
        <PlaceEditModal
          visible={visible}
          place={PLACE}
          onClose={close}
          onSave={updated => {
            action('장소 저장')(updated?.name);
            close();
          }}
          onDelete={placeId => {
            action('장소 삭제')(placeId);
            close();
          }}
        />
      )}
    />
  ),
};

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(8),
    padding: normalize(24),
    backgroundColor: tokens.colors.surface,
  },
  stageTitle: {
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  stageHint: {
    marginBottom: normalize(8),
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
  },
  openButton: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(12),
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.primary,
  },
  openButtonText: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});

/** 편집 권한이 없는 플랜을 열었을 때 화면 전체를 덮는다 */
export const EditAccessDenied: Story = {
  render: () => (
    <ModalStage
      label="편집 권한 없음"
      render={(visible, close) => (
        <EditAccessGate visible={visible} planId="101" onGoBack={close} />
      )}
    />
  ),
};
