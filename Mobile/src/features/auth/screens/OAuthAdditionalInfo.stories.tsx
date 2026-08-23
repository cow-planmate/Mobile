import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import {
  OAuthAdditionalInfoScreenView,
  OAuthAdditionalInfoForm,
} from './OAuthAdditionalInfoScreen.view';

const noop = () => {};

const EMPTY_FORM: OAuthAdditionalInfoForm = {
  email: '',
  birthdate: '',
  gender: '',
};

const meta = {
  title: '02. 시작 및 인증/04. 소셜 가입 추가정보',
  component: OAuthAdditionalInfoScreenView,
  args: {
    needEmail: true,
    form: EMPTY_FORM,
    errors: {},
    isSubmitting: false,
    isCompleteEnabled: false,
    focusedField: null,
    isBirthdatePickerOpen: false,
    onChange: action('입력'),
    onComplete: action('가입 완료'),
    onBack: action('뒤로가기'),
    setFocusedField: noop,
    setBirthdatePickerOpen: noop,
  },
} satisfies Meta<typeof OAuthAdditionalInfoScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeedEmail: Story = {};

/** 소셜 계정에서 이메일을 이미 받아온 경우 — 생년월일·성별만 입력한다 */
export const EmailProvided: Story = {
  args: {
    needEmail: false,
    form: { email: 'minyeong@planmate.app', birthdate: '', gender: '' },
  },
};

export const Completed: Story = {
  args: {
    form: {
      email: 'minyeong@planmate.app',
      birthdate: '1998-04-21',
      gender: 'female',
    },
    isCompleteEnabled: true,
  },
};

export const WithErrors: Story = {
  args: {
    form: { email: 'not-an-email', birthdate: '', gender: '' },
    errors: {
      email: '이메일 형식이 올바르지 않습니다.',
      birthdate: '생년월일을 선택해 주세요.',
      form: '입력값을 다시 확인해 주세요.',
    },
  },
};

export const Submitting: Story = {
  args: { ...Completed.args, isSubmitting: true },
};

/** 입력을 채우면 완료 버튼이 켜지는 흐름 */
function InteractiveOAuthInfo() {
  const [form, setForm] = useState<OAuthAdditionalInfoForm>(EMPTY_FORM);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isBirthdatePickerOpen, setBirthdatePickerOpen] = useState(false);

  return (
    <OAuthAdditionalInfoScreenView
      needEmail
      form={form}
      errors={{}}
      isSubmitting={false}
      isCompleteEnabled={!!form.email && !!form.birthdate && !!form.gender}
      focusedField={focusedField}
      isBirthdatePickerOpen={isBirthdatePickerOpen}
      onChange={(field, value) => {
        action('입력')({ field, value });
        setForm(prev => ({ ...prev, [field]: value }));
      }}
      onComplete={action('가입 완료')}
      onBack={action('뒤로가기')}
      setFocusedField={setFocusedField}
      setBirthdatePickerOpen={setBirthdatePickerOpen}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveOAuthInfo />,
};
