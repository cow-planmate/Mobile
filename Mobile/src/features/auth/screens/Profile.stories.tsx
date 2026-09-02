import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import ProfileScreenView from './ProfileScreen.view';

const noop = () => {};
const asyncAction = (label: string) => async (...args: unknown[]) => {
  action(label)(...args);
};

const USER = {
  name: '민영',
  email: 'minyeong@planmate.app',
  gender: '여자',
  birthdate: '1998-04-21',
  profilePublic: true,
  preferredThemes: ['해수욕장', '호텔', '한식'],
  myPlans: [
    {
      planId: '101',
      planName: '가을 제주 3일',
      startDate: '2026-09-12',
      endDate: '2026-09-14',
      isShared: false,
    },
    {
      planId: '102',
      planName: '부산 미식 여행',
      startDate: '2026-10-03',
      endDate: '2026-10-05',
      isShared: true,
    },
    {
      planId: '103',
      planName: '봄 경주 벚꽃길',
      startDate: '2026-04-04',
      endDate: '2026-04-06',
      isShared: false,
    },
  ],
};

const meta = {
  title: '06. 마이페이지/01. 프로필',
  component: ProfileScreenView,
  args: {
    loading: false,
    loadError: false,
    onRetryLoad: action('다시 불러오기'),
    user: USER,
    isThemeModalVisible: false,
    setThemeModalVisible: noop,
    isPasswordModalVisible: false,
    setPasswordModalVisible: noop,
    handleUpdateNickname: asyncAction('닉네임 변경'),
    handleUpdateBirthdate: asyncAction('생년월일 변경'),
    handleUpdateGender: asyncAction('성별 변경'),
    handleUpdateTheme: action('선호 테마 변경'),
    handleUpdatePassword: action('비밀번호 변경'),
    handleResign: action('회원 탈퇴'),
    onRenamePlan: asyncAction('일정 이름 변경'),
    onChangeProfileVisibility: asyncAction('프로필 공개 범위 변경'),
    onChangeProfileImage: asyncAction('프로필 사진 변경'),
    onDeleteProfileImage: asyncAction('프로필 사진 삭제'),
    isProfileImageUpdating: false,
    scrollToItinerary: false,
  },
} satisfies Meta<typeof ProfileScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 여행 탭 — 예정/지난 일정 탭과 일정 관리(선택 삭제) 진입 */
export const TravelSection: Story = { name: '여행 목록' };

export const NoPlans: Story = {
  name: '일정 없음',
  args: { user: { ...USER, myPlans: [] } },
};

export const PrivateProfile: Story = {
  name: '비공개 프로필',
  args: { user: { ...USER, profilePublic: false } },
};

export const StatsLoading: Story = {
  name: '통계 로딩',
  args: {},
};

export const Loading: Story = {
  name: '로딩',
  args: { loading: true },
};

export const LoadError: Story = {
  name: '불러오기 실패',
  args: { loadError: true },
};
