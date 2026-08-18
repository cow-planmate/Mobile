import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react';
import { SignupScreenView, SignupScreenViewProps, SignupErrors } from './SignupScreen.view';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import type { NicknameStatus } from './SignupScreen';

const emptyForm = {
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  birthdate: '',
  gender: '',
};

const filledForm = {
  email: 'planmate@example.com',
  verificationCode: '123456',
  password: 'planmate1!',
  confirmPassword: 'planmate1!',
  nickname: '플랜메이트',
  birthdate: '1998-05-20',
  gender: 'female',
};

const meta = {
  title: 'Auth/회원가입',
  component: SignupScreenView,
  args: {
    step: 1,
    totalSteps: 3,
    form: emptyForm,
    errors: {},
    focusSeq: 0,
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
    isSendingEmail: false,
    isVerifying: false,
    isSubmitting: false,
    isEmailFormatValid: false,
    showVerificationInput: false,
    isEmailVerified: false,
    isCodeExpired: false,
    resendCooldown: 0,
    nicknameStatus: 'idle' as const,
    focusedField: null,
    timeLeft: 300,
    passwordRequirements: { hasMinLength: false, hasCombination: false },
    isPasswordMatch: false,
    isNextEnabled: false,
    isAgreed: false,
    onChangeAgreement: action('onChangeAgreement'),
    onChange: action('onChange'),
    onSendEmail: action('onSendEmail'),
    onEditEmail: action('onEditEmail'),
    onNextStep: action('onNextStep'),
    onPrevStep: action('onPrevStep'),
    setFocusedField: action('setFocusedField'),
    setIsPasswordVisible: action('setIsPasswordVisible'),
    setIsConfirmPasswordVisible: action('setIsConfirmPasswordVisible'),
    formatTime: (seconds: number) =>
      `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
  },
} satisfies Meta<typeof SignupScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

interface StoryProps extends Partial<SignupScreenViewProps> {
  autoVerifyEmail?: boolean;
}

function StatefulSignupStory(props: StoryProps) {
  const [step, setStep] = useState(props.step || 1);
  const [form, setForm] = useState(props.form || emptyForm);
  const [focusedField, setFocusedField] = useState<string | null>(props.focusedField || null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(props.isPasswordVisible || false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(props.isConfirmPasswordVisible || false);
  const [showVerificationInput, setShowVerificationInput] = useState(props.showVerificationInput || false);
  const [isEmailVerified, setIsEmailVerified] = useState(props.isEmailVerified || false);
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>(props.nicknameStatus || 'idle');
  const [isAgreed, setIsAgreed] = useState(props.isAgreed || false);
  const [errors, setErrors] = useState<SignupErrors>(props.errors || {});
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const passwordRequirements = {
    hasMinLength: form.password.length >= 8,
    hasCombination: /[A-Za-z]/.test(form.password) && /\d/.test(form.password) && /[^A-Za-z0-9]/.test(form.password),
  };
  const isPasswordMatch =
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const isNextEnabled =
    props.isNextEnabled !== undefined
      ? props.isNextEnabled
      : (step === 1 && isEmailVerified) ||
        (step === 2 && passwordRequirements.hasMinLength && passwordRequirements.hasCombination && isPasswordMatch) ||
        (step === 3 && form.nickname.length >= 2 && nicknameStatus === 'available' && isAgreed);

  return (
    <SignupScreenView
      {...meta.args}
      {...props}
      step={step}
      form={form}
      errors={errors}
      focusedField={focusedField}
      isPasswordVisible={isPasswordVisible}
      isConfirmPasswordVisible={isConfirmPasswordVisible}
      showVerificationInput={showVerificationInput}
      isEmailVerified={isEmailVerified}
      isEmailFormatValid={isEmailValid}
      isSendingEmail={isSendingEmail}
      nicknameStatus={nicknameStatus}
      passwordRequirements={props.passwordRequirements || passwordRequirements}
      isPasswordMatch={props.isPasswordMatch !== undefined ? props.isPasswordMatch : isPasswordMatch}
      isNextEnabled={isNextEnabled}
      isAgreed={isAgreed}
      onChange={(name, value) => {
        setForm((prev: typeof emptyForm) => ({ ...prev, [name]: value }));
        if (errors[name as keyof SignupErrors]) {
          setErrors((prev: SignupErrors) => ({ ...prev, [name]: undefined }));
        }
        if (name === 'nickname') {
          if (value.length >= 2) {
            setNicknameStatus('checking');
            setTimeout(() => setNicknameStatus('available'), 400);
          } else {
            setNicknameStatus('idle');
          }
        }
        action('onChange')(name, value);
      }}
      onChangeAgreement={val => {
        setIsAgreed(val);
        action('onChangeAgreement')(val);
      }}
      onSendEmail={() => {
        setIsSendingEmail(true);
        action('onSendEmail')();
        setTimeout(() => {
          setIsSendingEmail(false);
          setShowVerificationInput(true);
          if (props.autoVerifyEmail) {
            setTimeout(() => setIsEmailVerified(true), 600);
          }
        }, 500);
      }}
      onEditEmail={() => {
        setShowVerificationInput(false);
        setIsEmailVerified(false);
        action('onEditEmail')();
      }}
      onNextStep={() => {
        action('onNextStep')(step);
        if (step < 3) setStep(s => s + 1);
        else action('onCompleteSignup')(form);
      }}
      onPrevStep={() => {
        action('onPrevStep')(step);
        if (step > 1) setStep(s => s - 1);
        else action('onExitSignup')();
      }}
      setFocusedField={setFocusedField}
      setIsPasswordVisible={setIsPasswordVisible}
      setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
    />
  );
}

export const Interactive_Flow: Story = {
  render: () => <StatefulSignupStory autoVerifyEmail />,
};

export const Step1_Initial: Story = {
  render: () => (
    <StatefulSignupStory
      step={1}
      form={emptyForm}
      showVerificationInput={false}
      isEmailVerified={false}
    />
  ),
};

export const Step1_CodeSent: Story = {
  render: () => (
    <StatefulSignupStory
      step={1}
      form={{ ...emptyForm, email: 'user@planmate.com' }}
      showVerificationInput={true}
      isEmailVerified={false}
      timeLeft={299}
    />
  ),
};

export const Step1_CodeError: Story = {
  render: () => (
    <StatefulSignupStory
      step={1}
      form={{
        ...emptyForm,
        email: 'user@planmate.com',
        verificationCode: '999999',
      }}
      showVerificationInput={true}
      isEmailVerified={false}
      errors={{
        verificationCode: '인증번호가 일치하지 않아요. 다시 확인해 주세요.',
      }}
      timeLeft={245}
    />
  ),
};

export const Step1_Verified: Story = {
  render: () => (
    <StatefulSignupStory
      step={1}
      form={{
        ...emptyForm,
        email: 'user@planmate.com',
        verificationCode: '123456',
      }}
      showVerificationInput={true}
      isEmailVerified={true}
      isNextEnabled={true}
    />
  ),
};

export const Step2_Typing: Story = {
  render: () => (
    <StatefulSignupStory
      step={2}
      form={{
        ...emptyForm,
        email: 'user@planmate.com',
        password: 'mypassword123',
      }}
      passwordRequirements={{
        hasMinLength: true,
        hasCombination: false,
      }}
      isPasswordMatch={false}
      isNextEnabled={false}
    />
  ),
};

export const Step2_MismatchError: Story = {
  render: () => (
    <StatefulSignupStory
      step={2}
      form={{
        ...emptyForm,
        email: 'user@planmate.com',
        password: 'planmate1!',
        confirmPassword: 'different1!',
      }}
      passwordRequirements={{
        hasMinLength: true,
        hasCombination: true,
      }}
      errors={{
        confirmPassword: '비밀번호가 일치하지 않아요.',
      }}
      isPasswordMatch={false}
      isNextEnabled={false}
    />
  ),
};

export const Step2_Valid: Story = {
  render: () => (
    <StatefulSignupStory
      step={2}
      form={{
        ...emptyForm,
        email: 'user@planmate.com',
        password: 'planmate1!',
        confirmPassword: 'planmate1!',
      }}
      passwordRequirements={{
        hasMinLength: true,
        hasCombination: true,
      }}
      isPasswordMatch={true}
      isNextEnabled={true}
    />
  ),
};

export const Step3_NicknameChecking: Story = {
  render: () => (
    <StatefulSignupStory
      step={3}
      form={{ ...filledForm, nickname: '여행메이트' }}
      nicknameStatus="checking"
      passwordRequirements={{ hasMinLength: true, hasCombination: true }}
      isPasswordMatch={true}
      isEmailVerified={true}
    />
  ),
};

export const Step3_NicknameTaken: Story = {
  render: () => (
    <StatefulSignupStory
      step={3}
      form={{ ...filledForm, nickname: '이미사용중' }}
      nicknameStatus="taken"
      errors={{
        nickname: '이미 사용 중인 닉네임이에요.',
      }}
      passwordRequirements={{ hasMinLength: true, hasCombination: true }}
      isPasswordMatch={true}
      isEmailVerified={true}
    />
  ),
};

export const Step3_AllValid_Unchecked: Story = {
  render: () => (
    <StatefulSignupStory
      step={3}
      form={filledForm}
      nicknameStatus="available"
      passwordRequirements={{ hasMinLength: true, hasCombination: true }}
      isPasswordMatch={true}
      isEmailVerified={true}
      isAgreed={false}
      isNextEnabled={false}
    />
  ),
};

export const Step3_Completed: Story = {
  render: () => (
    <StatefulSignupStory
      step={3}
      form={filledForm}
      nicknameStatus="available"
      passwordRequirements={{ hasMinLength: true, hasCombination: true }}
      isPasswordMatch={true}
      isEmailVerified={true}
      isAgreed={true}
      isNextEnabled={true}
    />
  ),
};

function InteractivePrivacyModalStory() {
  const [visible, setVisible] = useState(true);
  return (
    <View style={styles.modalStoryWrapper}>
      <PrivacyPolicyModal
        visible={visible}
        onClose={() => {
          setVisible(false);
          action('onCloseModal')();
          setTimeout(() => setVisible(true), 1000);
        }}
        variant="consent"
      />
    </View>
  );
}

export const Modal_PrivacySheet: Story = {
  render: () => <InteractivePrivacyModalStory />,
};

const styles = StyleSheet.create({
  modalStoryWrapper: {
    flex: 1,
  },
});
