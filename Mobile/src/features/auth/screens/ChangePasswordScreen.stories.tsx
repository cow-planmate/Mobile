import type { Meta, StoryObj } from '@storybook/react';
import { ChangePasswordScreenView } from './ChangePasswordScreen.view';

const meta = {
  title: 'Screens/Auth/ChangePasswordScreen',
  component: ChangePasswordScreenView,
  args: {
    form: { currentPassword: '', newPassword: '', confirmPassword: '' },
    errors: {},
    passwordRequirements: { hasMinLength: false, hasCombination: false },
    isPasswordMatch: false,
    isSubmitting: false,
    isSubmitEnabled: false,
    focusedField: null,
    isCurrentVisible: false,
    isNewVisible: false,
    isConfirmVisible: false,
    onChange: () => {},
    onSubmit: () => {},
    onBack: () => {},
    setFocusedField: () => {},
    setIsCurrentVisible: () => {},
    setIsNewVisible: () => {},
    setIsConfirmVisible: () => {},
  },
} satisfies Meta<typeof ChangePasswordScreenView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 들어온 직후. 조건 두 줄이 미리 보인다. */
export const Empty: Story = {};

/** 조건을 절반만 채운 상태. 형태(○/✓)로 구분된다. */
export const PartiallyValid: Story = {
  args: {
    form: {
      currentPassword: 'oldpass123!',
      newPassword: 'newpassword',
      confirmPassword: '',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: false },
  },
};

/** 다 채운 상태. 확인 칸이 초록 테두리로 바뀐다. */
export const Ready: Story = {
  args: {
    form: {
      currentPassword: 'oldpass123!',
      newPassword: 'newpass123!',
      confirmPassword: 'newpass123!',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isSubmitEnabled: true,
  },
};

/** 확인 칸이 어긋났을 때. */
export const Mismatch: Story = {
  args: {
    form: {
      currentPassword: 'oldpass123!',
      newPassword: 'newpass123!',
      confirmPassword: 'newpass123',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    errors: { confirmPassword: '비밀번호가 일치하지 않아요.' },
  },
};

/** 현재 비밀번호가 틀려 서버가 거절했을 때. */
export const ServerRejected: Story = {
  args: {
    form: {
      currentPassword: 'wrongpass1!',
      newPassword: 'newpass123!',
      confirmPassword: 'newpass123!',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isSubmitEnabled: true,
    errors: { form: '현재 비밀번호가 올바르지 않습니다.' },
  },
};

/** 전송 중. */
export const Submitting: Story = {
  args: {
    form: {
      currentPassword: 'oldpass123!',
      newPassword: 'newpass123!',
      confirmPassword: 'newpass123!',
    },
    passwordRequirements: { hasMinLength: true, hasCombination: true },
    isPasswordMatch: true,
    isSubmitEnabled: true,
    isSubmitting: true,
  },
};
