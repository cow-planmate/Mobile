import type { Meta, StoryObj } from '@storybook/react';
import { OAuthAdditionalInfoScreenView } from './OAuthAdditionalInfoScreen.view';

const meta = {
  title: 'Screens/Auth/OAuthAdditionalInfoScreen',
  component: OAuthAdditionalInfoScreenView,
  args: {
    needEmail: true,
    form: { email: '', birthdate: '', gender: '' as const },
    errors: {},
    isSubmitting: false,
    isCompleteEnabled: false,
    focusedField: null,
    isBirthdatePickerOpen: false,
    onChange: () => {},
    onComplete: () => {},
    onBack: () => {},
    setFocusedField: () => {},
    setBirthdatePickerOpen: () => {},
  },
} satisfies Meta<typeof OAuthAdditionalInfoScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 카카오처럼 이메일을 주지 않는 제공자. 세 칸을 모두 받는다. */
export const Empty: Story = {};

/** 구글처럼 이메일이 이미 확보된 제공자. 이메일 칸이 사라진다. */
export const WithoutEmail: Story = {
  args: {
    needEmail: false,
    form: { email: '', birthdate: '', gender: '' },
  },
};

/** 다 채운 상태. 완료 버튼이 흐림을 벗는다. */
export const Filled: Story = {
  args: {
    form: {
      email: 'planmate@example.com',
      birthdate: '1998-04-21',
      gender: 'female',
    },
    isCompleteEnabled: true,
  },
};

/** 빈 칸을 둔 채 완료를 눌렀을 때. 칸마다 이유가 붙는다. */
export const Errors: Story = {
  args: {
    form: { email: 'planmate', birthdate: '', gender: '' },
    errors: {
      email: '이메일 형식이 올바르지 않아요.',
      birthdate: '생년월일을 선택해 주세요.',
      gender: '성별을 선택해 주세요.',
    },
  },
};

/** 서버가 거절했을 때. 하단에 한 줄로 남는다. */
export const SubmitFailed: Story = {
  args: {
    form: {
      email: 'planmate@example.com',
      birthdate: '1998-04-21',
      gender: 'male',
    },
    isCompleteEnabled: true,
    errors: { form: '가입 처리 중 문제가 생겼어요.' },
  },
};

/** 전송 중. 버튼이 스피너로 교차 전환된다. */
export const Submitting: Story = {
  args: {
    form: {
      email: 'planmate@example.com',
      birthdate: '1998-04-21',
      gender: 'male',
    },
    isCompleteEnabled: true,
    isSubmitting: true,
  },
};
