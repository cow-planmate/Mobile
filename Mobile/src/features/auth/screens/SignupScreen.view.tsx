import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  FadeInRight,
  FadeInLeft,
  FadeOutLeft,
  FadeOutRight,
} from 'react-native-reanimated';
import DatePicker from 'react-native-date-picker';
import ArrowLeft from 'lucide-react-native/dist/esm/icons/arrow-left';
import Eye from 'lucide-react-native/dist/esm/icons/eye';
import EyeOff from 'lucide-react-native/dist/esm/icons/eye-off';
import Check from 'lucide-react-native/dist/esm/icons/check';
import Circle from 'lucide-react-native/dist/esm/icons/circle';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import Loader from 'lucide-react-native/dist/esm/icons/loader';
import { styles } from './SignupScreen.styles';
import { COLORS } from '../authTokens';
import { sf } from '../../../utils/normalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from '../components/PressableScale';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthFieldBox, { FieldState } from '../components/AuthFieldBox';
import AuthProgressBar from '../components/AuthProgressBar';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import { PASSWORD_MAX_LENGTH } from '../../../utils/passwordPolicy';
import { NICKNAME_MAX_LENGTH } from '../../../utils/nickname';
import { revealStep } from '../motion';
import {
  formatBirthdate,
  parseBirthdate,
  toBirthdateString,
} from '../../../utils/birthdate';
import type { NicknameStatus } from './SignupScreen';

export const PasswordRequirement = React.memo(
  ({ met, label }: { met: boolean; label: string }) => (
    <View style={styles.requirementRow}>

      {met ? (
        <Check size={sf(15)} color={COLORS.success} strokeWidth={3} />
      ) : (
        <Circle size={sf(15)} color={COLORS.textDisabled} strokeWidth={2} />
      )}
      <Text
        style={[
          styles.requirementText,
          { color: met ? COLORS.success : COLORS.textSecondary },
        ]}
      >
        {label}
      </Text>
    </View>
  ),
);

const InlineError = ({ message }: { message: string }) => (
  <Animated.View
    style={styles.errorRow}
    entering={FadeInDown.duration(180)}
    exiting={FadeOut.duration(120)}
    accessibilityLiveRegion="polite"
  >
    <AlertCircle size={sf(15)} color={COLORS.error} style={styles.errorIcon} />
    <Text style={styles.errorText}>{message}</Text>
  </Animated.View>
);

export interface SignupErrors {
  email?: string;
  verificationCode?: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
  birthdate?: string;
  gender?: string;
  agreement?: string;
  form?: string;
}

export interface SignupScreenViewProps {
  step: number;
  totalSteps: number;
  form: any;
  errors: SignupErrors;
  focusSeq: number;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  isSendingEmail: boolean;
  isVerifying: boolean;
  isSubmitting: boolean;
  isEmailFormatValid: boolean;
  showVerificationInput: boolean;
  isEmailVerified: boolean;
  isCodeExpired: boolean;
  resendCooldown: number;
  nicknameStatus: NicknameStatus;
  focusedField: string | null;
  timeLeft: number;
  passwordRequirements: { hasMinLength: boolean; hasCombination: boolean };
  isPasswordMatch: boolean;
  isNextEnabled: boolean;
  isAgreed: boolean;
  onChangeAgreement: (agreed: boolean) => void;
  onChange: (name: string, value: string) => void;
  onSendEmail: () => void;
  onEditEmail: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  setFocusedField: (field: string | null) => void;
  setIsPasswordVisible: (visible: boolean | ((v: boolean) => boolean)) => void;
  setIsConfirmPasswordVisible: (
    visible: boolean | ((v: boolean) => boolean),
  ) => void;
  formatTime: (seconds: number) => string;
}

const STEP_TITLES = ['이메일 인증', '비밀번호 설정', '프로필 설정'];
const STEP_DESCRIPTIONS = [
  '로그인에 사용할 이메일을 인증해 주세요.',
  '안전하게 사용할 비밀번호를 설정해 주세요.',
  '프로필과 여행 맞춤 정보를 설정해 주세요.',
];

export const SignupScreenView = ({
  step,
  totalSteps,
  form,
  errors,
  focusSeq,
  isPasswordVisible,
  isConfirmPasswordVisible,
  isSendingEmail,
  isVerifying,
  isSubmitting,
  isEmailFormatValid,
  showVerificationInput,
  isEmailVerified,
  isCodeExpired,
  resendCooldown,
  nicknameStatus,
  focusedField,
  timeLeft,
  passwordRequirements,
  isPasswordMatch,
  isNextEnabled,
  isAgreed,
  onChangeAgreement,
  onChange,
  onSendEmail,
  onEditEmail,
  onNextStep,
  onPrevStep,
  setFocusedField,
  setIsPasswordVisible,
  setIsConfirmPasswordVisible,
  formatTime,
}: SignupScreenViewProps) => {
  const insets = useSafeAreaInsets();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isBirthdatePickerOpen, setBirthdatePickerOpen] = useState(false);

  const [screenHeight] = useState(() => Dimensions.get('window').height);

  const emailRef = useRef<TextInput>(null);
  const codeRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const nicknameRef = useRef<TextInput>(null);

  const prevStepRef = useRef(step);
  const goingForward = step >= prevStepRef.current;
  useEffect(() => {
    prevStepRef.current = step;
  }, [step]);

  const hasMountedRef = useRef(false);
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);
  const stepEntering = hasMountedRef.current
    ? (goingForward ? FadeInRight : FadeInLeft).duration(220)
    : revealStep(1);

  const stepExiting = (
    goingForward
      ? FadeOutLeft || FadeOut
      : FadeOutRight || FadeOut
  ).duration(180);

  useEffect(() => {
    if (focusSeq === 0) return;
    const id = setTimeout(() => {
      if (errors.email) return emailRef.current?.focus();
      if (errors.verificationCode) return codeRef.current?.focus();
      if (errors.password) return passwordRef.current?.focus();
      if (errors.confirmPassword) return confirmRef.current?.focus();
      if (errors.nickname) return nicknameRef.current?.focus();

      if (step === 1) {
        return showVerificationInput && !isEmailVerified
          ? codeRef.current?.focus()
          : emailRef.current?.focus();
      }
      if (step === 2) return passwordRef.current?.focus();
      if (step === 3) return nicknameRef.current?.focus();
    }, 120);
    return () => clearTimeout(id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSeq]);

  const emailLocked = showVerificationInput || isEmailVerified;
  const isBusy = isSendingEmail || isVerifying || isSubmitting;

  const fieldState = (invalid: boolean, isFocused: boolean): FieldState =>
    invalid ? 'error' : isFocused ? 'focus' : 'default';

  const codeState: FieldState = errors.verificationCode
    ? 'error'
    : isEmailVerified
    ? 'success'
    : focusedField === 'verificationCode'
    ? 'focus'
    : 'default';

  const nicknameState: FieldState =
    errors.nickname || nicknameStatus === 'taken'
      ? 'error'
      : nicknameStatus === 'available'
      ? 'success'
      : focusedField === 'nickname'
      ? 'focus'
      : 'default';

  const nicknameHint = () => {
    if (nicknameStatus === 'checking') {
      return (
        <View style={styles.statusRow}>
          <Loader size={sf(14)} color={COLORS.textSecondary} />
          <Text style={styles.statusTextMuted}>확인 중…</Text>
        </View>
      );
    }
    if (nicknameStatus === 'available') {
      return (
        <Animated.View
          style={styles.statusRow}
          entering={FadeInDown.duration(160)}
        >
          <Check size={sf(14)} color={COLORS.success} strokeWidth={3} />
          <Text style={styles.statusTextOk}>사용할 수 있는 닉네임이에요.</Text>
        </Animated.View>
      );
    }
    if (nicknameStatus === 'taken') {
      return (
        <Animated.View
          style={styles.statusRow}
          entering={FadeInDown.duration(160)}
        >
          <AlertCircle size={sf(14)} color={COLORS.error} />
          <Text style={styles.statusTextError}>
            이미 사용 중인 닉네임이에요.
          </Text>
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <View
      style={[styles.container, { height: screenHeight }]}
    >

      <Animated.View
        style={[styles.header, { paddingTop: insets.top }]}
        entering={revealStep(0)}
      >
        <Pressable
          style={styles.headerBackButton}
          onPress={onPrevStep}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel={step > 1 ? '이전 단계' : '뒤로 가기'}
          accessibilityState={{ disabled: isBusy }}
        >
          <ArrowLeft size={22} color={COLORS.text} />
        </Pressable>

        <AuthProgressBar step={step} totalSteps={totalSteps} />

        <Text style={styles.progressCount}>
          {step} / {totalSteps}
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={step}
          entering={stepEntering}
          exiting={stepExiting}
        >
          <Text style={styles.title}>{STEP_TITLES[step - 1]}</Text>
          <Text style={styles.description}>{STEP_DESCRIPTIONS[step - 1]}</Text>

          {step === 1 && (
            <>
              <View style={styles.inputGroup}>
                <View style={styles.fieldRow}>
                  <AuthFieldBox
                    state={fieldState(!!errors.email, focusedField === 'email')}
                    style={[
                      styles.authInputContainer,
                      emailLocked && styles.inputLocked,
                    ]}
                    containerStyle={styles.flex1}
                    label="이메일"
                    labelBackground={
                      emailLocked ? COLORS.surface : COLORS.surfaceRaised
                    }
                  >
                    {emailLocked ? (
                      <Text style={styles.authValue} numberOfLines={1}>
                        {form.email}
                      </Text>
                    ) : (
                      <TextInput
                        ref={emailRef}
                        style={styles.authInput}
                        placeholder="example@email.com"
                        placeholderTextColor={COLORS.textSecondary}
                        value={form.email}
                        onChangeText={v => onChange('email', v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        autoComplete="email"
                        importantForAutofill="yes"
                        returnKeyType="send"
                        onSubmitEditing={onSendEmail}
                        editable={!isSendingEmail}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        accessibilityLabel="이메일"
                      />
                    )}
                  </AuthFieldBox>

                  {!emailLocked ? (
                    <PressableScale
                      style={[
                        styles.inlineButton,
                        (!isEmailFormatValid || isSendingEmail) &&
                          styles.inlineButtonDisabled,
                      ]}
                      baseColor={
                        !isEmailFormatValid || isSendingEmail
                          ? COLORS.border
                          : COLORS.primary
                      }
                      pressedColor={COLORS.primaryPressed}
                      scaleTo={0.95}
                      onPress={onSendEmail}
                      disabled={!isEmailFormatValid || isSendingEmail}
                      accessibilityRole="button"
                      accessibilityLabel="인증번호 요청"
                    >
                      {isSendingEmail ? (
                        <ActivityIndicator
                          color={COLORS.onPrimary}
                          size="small"
                        />
                      ) : (
                        <Text style={styles.inlineButtonText}>인증요청</Text>
                      )}
                    </PressableScale>
                  ) : (
                    !isEmailVerified && (
                      <Pressable
                        style={styles.editButton}
                        onPress={onEditEmail}
                        accessibilityRole="button"
                        accessibilityLabel="이메일 수정"
                      >
                        <Text style={styles.editButtonText}>수정</Text>
                      </Pressable>
                    )
                  )}
                </View>
                {!!errors.email && <InlineError message={errors.email} />}
              </View>

              {showVerificationInput && (
                <Animated.View
                  style={styles.inputGroup}
                  entering={FadeInDown.duration(220)}
                >
                  <AuthFieldBox
                    state={codeState}
                    style={styles.authInputContainer}
                    label="인증번호"
                  >
                    <View style={styles.authInputRow}>
                      <TextInput
                        ref={codeRef}
                        style={styles.authInput}
                        placeholder="6자리 숫자"
                        placeholderTextColor={COLORS.textSecondary}
                        value={form.verificationCode}
                        onChangeText={v =>
                          onChange('verificationCode', v.replace(/[^0-9]/g, ''))
                        }
                        keyboardType="number-pad"
                        maxLength={6}
                        autoComplete="sms-otp"
                        importantForAutofill="yes"
                        editable={
                          !isEmailVerified && !isCodeExpired && !isVerifying
                        }
                        onFocus={() => setFocusedField('verificationCode')}
                        onBlur={() => setFocusedField(null)}
                        accessibilityLabel="인증번호 6자리"
                      />
                      {isVerifying ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.primary}
                        />
                      ) : isEmailVerified ? (
                        <Check
                          size={sf(20)}
                          color={COLORS.success}
                          strokeWidth={3}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.timerText,
                            isCodeExpired && styles.timerTextExpired,
                          ]}
                        >
                          {formatTime(timeLeft)}
                        </Text>
                      )}
                    </View>
                  </AuthFieldBox>

                  {!!errors.verificationCode && (
                    <InlineError message={errors.verificationCode} />
                  )}

                  {isEmailVerified ? (
                    <Animated.View
                      style={styles.statusRow}
                      entering={FadeInDown.duration(160)}
                    >
                      <Check
                        size={sf(14)}
                        color={COLORS.success}
                        strokeWidth={3}
                      />
                      <Text style={styles.statusTextOk}>
                        인증이 완료되었어요.
                      </Text>
                    </Animated.View>
                  ) : (
                    <View style={styles.resendRow}>
                      <Text style={styles.resendHint}>
                        {isCodeExpired
                          ? '인증 시간이 지났어요.'
                          : '메일이 오지 않았나요?'}
                      </Text>
                      <Pressable
                        onPress={onSendEmail}
                        disabled={resendCooldown > 0 || isSendingEmail}
                        style={styles.resendButton}
                        accessibilityRole="button"
                        accessibilityLabel="인증번호 다시 받기"
                        accessibilityState={{ disabled: resendCooldown > 0 || isSendingEmail }}
                      >
                        <Text
                          style={[
                            styles.resendButtonText,
                            resendCooldown > 0 &&
                              styles.resendButtonTextDisabled,
                          ]}
                        >
                          {resendCooldown > 0
                            ? `다시 받기 (${resendCooldown}초)`
                            : '다시 받기'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </Animated.View>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.inputGroup}>
                <AuthFieldBox
                  state={fieldState(
                    !!errors.password,
                    focusedField === 'password',
                  )}
                  style={styles.authInputContainer}
                  label="비밀번호"
                >
                  <View style={styles.authInputRow}>
                    <TextInput
                      ref={passwordRef}
                      style={styles.authInput}
                      value={form.password}
                      onChangeText={v => onChange('password', v)}
                      secureTextEntry={!isPasswordVisible}
                      maxLength={PASSWORD_MAX_LENGTH}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                      importantForAutofill="yes"
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={() => confirmRef.current?.focus()}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      accessibilityLabel="비밀번호"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setIsPasswordVisible(v => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 표시'
                      }
                    >
                      {isPasswordVisible ? (
                        <EyeOff size={20} color={COLORS.textSecondary} />
                      ) : (
                        <Eye size={20} color={COLORS.textSecondary} />
                      )}
                    </Pressable>
                  </View>
                </AuthFieldBox>
                {!!errors.password && <InlineError message={errors.password} />}
                <View style={styles.requirementsContainer}>
                  <PasswordRequirement
                    met={passwordRequirements.hasMinLength}
                    label="8자 이상"
                  />
                  <PasswordRequirement
                    met={passwordRequirements.hasCombination}
                    label="영문 · 숫자 · 특수문자 포함"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <AuthFieldBox
                  state={fieldState(
                    !!errors.confirmPassword,
                    focusedField === 'confirmPassword',
                  )}
                  style={styles.authInputContainer}
                  label="비밀번호 확인"
                >
                  <View style={styles.authInputRow}>
                    <TextInput
                      ref={confirmRef}
                      style={styles.authInput}
                      value={form.confirmPassword}
                      onChangeText={v => onChange('confirmPassword', v)}
                      secureTextEntry={!isConfirmPasswordVisible}
                      maxLength={PASSWORD_MAX_LENGTH}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                      importantForAutofill="yes"
                      returnKeyType="done"
                      onSubmitEditing={onNextStep}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      accessibilityLabel="비밀번호 확인"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setIsConfirmPasswordVisible(v => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isConfirmPasswordVisible
                          ? '비밀번호 숨기기'
                          : '비밀번호 표시'
                      }
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeOff size={20} color={COLORS.textSecondary} />
                      ) : (
                        <Eye size={20} color={COLORS.textSecondary} />
                      )}
                    </Pressable>
                  </View>
                </AuthFieldBox>
                {!!errors.confirmPassword && (
                  <InlineError message={errors.confirmPassword} />
                )}
                {form.confirmPassword.length > 0 && (
                  <View style={styles.requirementsContainer}>
                    <PasswordRequirement
                      met={isPasswordMatch}
                      label="비밀번호 일치"
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.inputGroup}>
                <AuthFieldBox
                  state={nicknameState}
                  style={styles.authInputContainer}
                  label="닉네임"
                >
                  <View style={styles.authInputRow}>
                    <TextInput
                      ref={nicknameRef}
                      style={styles.authInput}
                      placeholder="플랜메이트"
                      placeholderTextColor={COLORS.textSecondary}
                      value={form.nickname}
                      onChangeText={v => onChange('nickname', v)}
                      autoComplete="username"
                      importantForAutofill="yes"
                      returnKeyType="next"
                      onSubmitEditing={() => setBirthdatePickerOpen(true)}
                      maxLength={NICKNAME_MAX_LENGTH}
                      onFocus={() => setFocusedField('nickname')}
                      onBlur={() => setFocusedField(null)}
                      accessibilityLabel="닉네임"
                    />
                  </View>
                </AuthFieldBox>
                {!!errors.nickname && <InlineError message={errors.nickname} />}
                {!errors.nickname && nicknameHint()}
              </View>

              <View style={styles.inputGroup}>
                <AuthFieldBox
                  state={errors.birthdate ? 'error' : 'default'}
                  style={styles.authInputContainer}
                  label="생년월일"
                >
                  <TouchableOpacity
                    style={styles.authInputRow}
                    onPress={() => setBirthdatePickerOpen(true)}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="생년월일 선택"
                    accessibilityState={{ disabled: isSubmitting }}
                  >
                    <Text
                      style={[
                        styles.authInput,
                        !form.birthdate && styles.authInputPlaceholder,
                      ]}
                    >
                      {form.birthdate
                        ? formatBirthdate(form.birthdate)
                        : '생년월일 선택'}
                    </Text>
                  </TouchableOpacity>
                </AuthFieldBox>
                {!!errors.birthdate && (
                  <InlineError message={errors.birthdate} />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.groupLabel}>성별</Text>
                <View style={styles.genderContainer}>
                  {(
                    [
                      { key: 'male', label: '남성' },
                      { key: 'female', label: '여성' },
                    ] as const
                  ).map(option => (
                    <PressableScale
                      key={option.key}
                      style={[
                        styles.genderButton,
                        !!errors.gender && styles.genderButtonError,
                        form.gender === option.key &&
                          styles.genderButtonSelected,
                      ]}
                      baseColor={
                        form.gender === option.key
                          ? COLORS.primary
                          : COLORS.surfaceRaised
                      }
                      pressedColor={
                        form.gender === option.key
                          ? COLORS.primaryPressed
                          : COLORS.surface
                      }
                      scaleTo={0.96}
                      onPress={() => onChange('gender', option.key)}
                      accessibilityRole="radio"
                      accessibilityState={{
                        selected: form.gender === option.key,
                      }}
                      accessibilityLabel={option.label}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          form.gender === option.key &&
                            styles.genderButtonTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
                {!!errors.gender && <InlineError message={errors.gender} />}
              </View>

              <View style={styles.agreementRow}>
                <Pressable
                  testID="agreement-checkbox"
                  style={styles.checkboxHit}
                  onPress={() => onChangeAgreement(!isAgreed)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isAgreed }}
                  accessibilityLabel="개인정보 수집 및 이용 동의, 필수"
                >
                  <View
                    style={[styles.checkbox, isAgreed && styles.checkboxActive]}
                  >
                    {isAgreed && (
                      <Check
                        size={sf(13)}
                        color={COLORS.onPrimary}
                        strokeWidth={3}
                      />
                    )}
                  </View>
                  <Text style={styles.agreementText}>
                    <Text style={styles.requiredText}>(필수) </Text>
                    개인정보 수집 및 이용 동의
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.agreementViewButton}
                  onPress={() => setShowPrivacyModal(true)}
                  accessibilityRole="button"
                  accessibilityLabel="개인정보 수집 및 이용 약관 보기"
                >
                  <Text style={styles.agreementViewText}>보기</Text>
                  <ChevronRight size={sf(14)} color={COLORS.textSecondary} />
                </Pressable>
              </View>
              {!!errors.agreement && <InlineError message={errors.agreement} />}
              {!!errors.form && <InlineError message={errors.form} />}
            </>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: sf(16) + insets.bottom }]}>
        <AuthSubmitButton
          label={step === totalSteps ? '회원가입 완료' : '다음'}
          onPress={onNextStep}
          loading={isSubmitting}
          muted={!isNextEnabled}
          disabled={isBusy}
        />
      </View>

      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        variant="consent"
      />

      <DatePicker
        modal
        mode="date"
        title="생년월일 선택"
        confirmText="확인"
        cancelText="취소"
        locale="ko"
        maximumDate={new Date()}
        open={isBirthdatePickerOpen}
        date={parseBirthdate(form.birthdate)}
        onConfirm={date => {
          setBirthdatePickerOpen(false);
          onChange('birthdate', toBirthdateString(date));
        }}
        onCancel={() => setBirthdatePickerOpen(false)}
      />
    </View>
  );
};
