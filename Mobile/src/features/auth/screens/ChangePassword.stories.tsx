import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import {
  ChangePasswordScreenView,
  ChangePasswordForm,
  ChangePasswordErrors,
} from './ChangePasswordScreen.view';

const noop = () => {};

const EMPTY_FORM: ChangePasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const meta = {
  title: '02. 시작 및 인증/06. 비밀번호 변경',
  component: ChangePasswordScreenView,
  args: {
    form: EMPTY_FORM,
    errors: {},
    passwordRequirements: { hasMinLength: false, hasCombination: false },
    isPasswordMatch: false,
    isSubmitting: false,
    isSubmitEnabled: false,
    focusedField: null,
    isCurrentVisible: false,
    isNewVisible: false,
    isConfirmVisible: false,
    onChange: action('입력'),
    onSubmit: action('변경하기'),
    onBack: action('뒤로가기'),
    setFocusedField: noop,
    setIsCurrentVisible: noop,
    setIsNewVisible: noop,
    setIsConfirmVisible: noop,
  },
} satisfies Meta<typeof ChangePasswordScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Valid: Story = {
  args: {
    form: {
      currentPassword: 'oldPass1234!',
      newPassword: 'newPass1234!',
      confirmPassword: 'newPass1234!',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isSubmitEnabled: true,
  },
};

export const WithErrors: Story = {
  args: {
    form: {
      currentPassword: 'oldPass1234!',
      newPassword: 'short',
      confirmPassword: 'shor',
    },
    errors: {
      newPassword: '8자 이상, 영문과 숫자를 함께 사용해 주세요.',
      confirmPassword: '비밀번호가 일치하지 않습니다.',
      form: '입력값을 다시 확인해 주세요.',
    } as ChangePasswordErrors,
  },
};

export const Submitting: Story = {
  args: { ...Valid.args, isSubmitting: true },
};

/** 입력에 따라 요건 체크와 제출 활성화가 실시간으로 바뀌는 상태 */
function InteractiveChangePassword() {
  const [form, setForm] = useState<ChangePasswordForm>(EMPTY_FORM);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const requirements = useMemo(
    () => ({
      hasMinLength: form.newPassword.length >= 8,
      hasCombination:
        /[A-Za-z]/.test(form.newPassword) && /\d/.test(form.newPassword),
    }),
    [form.newPassword],
  );
  const isPasswordMatch =
    !!form.newPassword && form.newPassword === form.confirmPassword;

  return (
    <ChangePasswordScreenView
      form={form}
      errors={{}}
      passwordRequirements={requirements}
      isPasswordMatch={isPasswordMatch}
      isSubmitting={false}
      isSubmitEnabled={
        !!form.currentPassword &&
        requirements.hasMinLength &&
        requirements.hasCombination &&
        isPasswordMatch
      }
      focusedField={focusedField}
      isCurrentVisible={isCurrentVisible}
      isNewVisible={isNewVisible}
      isConfirmVisible={isConfirmVisible}
      onChange={(field, value) => {
        action('입력')({ field, value });
        setForm(prev => ({ ...prev, [field]: value }));
      }}
      onSubmit={action('변경하기')}
      onBack={action('뒤로가기')}
      setFocusedField={setFocusedField}
      setIsCurrentVisible={setIsCurrentVisible}
      setIsNewVisible={setIsNewVisible}
      setIsConfirmVisible={setIsConfirmVisible}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveChangePassword />,
};
