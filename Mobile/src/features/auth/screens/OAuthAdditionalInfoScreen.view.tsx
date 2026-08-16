import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import DatePicker from 'react-native-date-picker';
import ArrowLeft from 'lucide-react-native/dist/esm/icons/arrow-left';
import AlertCircle from 'lucide-react-native/dist/esm/icons/circle-alert';
import { styles } from './OAuthAdditionalInfoScreen.styles';
import { COLORS } from '../authTokens';
import { sf } from '../../../utils/normalize';
import PressableScale from '../components/PressableScale';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthFieldBox, { FieldState } from '../components/AuthFieldBox';
import {
  formatBirthdate,
  parseBirthdate,
  toBirthdateString,
} from '../../../utils/birthdate';

export type OAuthGender = '' | 'male' | 'female';

export interface OAuthAdditionalInfoErrors {
  email?: string;
  birthdate?: string;
  gender?: string;
  form?: string;
}

export interface OAuthAdditionalInfoForm {
  email: string;

  birthdate: string;
  gender: OAuthGender;
}

interface OAuthAdditionalInfoScreenViewProps {
  needEmail: boolean;
  form: OAuthAdditionalInfoForm;
  errors: OAuthAdditionalInfoErrors;
  isSubmitting: boolean;
  isCompleteEnabled: boolean;
  focusedField: string | null;
  isBirthdatePickerOpen: boolean;
  onChange: (field: keyof OAuthAdditionalInfoForm, value: string) => void;
  onComplete: () => void;
  onBack: () => void;
  setFocusedField: (field: string | null) => void;
  setBirthdatePickerOpen: (open: boolean) => void;
}

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

export const OAuthAdditionalInfoScreenView = ({
  needEmail,
  form,
  errors,
  isSubmitting,
  isCompleteEnabled,
  focusedField,
  isBirthdatePickerOpen,
  onChange,
  onComplete,
  onBack,
  setFocusedField,
  setBirthdatePickerOpen,
}: OAuthAdditionalInfoScreenViewProps) => {
  const fieldState = (invalid: boolean, isFocused: boolean): FieldState =>
    invalid ? 'error' : isFocused ? 'focus' : 'default';

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Pressable
          style={styles.headerBackButton}
          onPress={onBack}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <ArrowLeft size={22} color={COLORS.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>추가 정보 입력</Text>
        <Text style={styles.description}>
          서비스 이용을 위해 몇 가지만 더 알려주세요.
        </Text>

        {needEmail && (
          <View style={styles.inputGroup}>
            <AuthFieldBox
              state={fieldState(!!errors.email, focusedField === 'email')}
              style={styles.authInputContainer}
              label="이메일"
            >
              <TextInput
                style={styles.authInput}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.textSecondary}
                value={form.email}
                onChangeText={value => onChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="email"
                importantForAutofill="yes"
                returnKeyType="done"
                editable={!isSubmitting}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                accessibilityLabel="이메일"
              />
            </AuthFieldBox>
            {!!errors.email && <InlineError message={errors.email} />}
          </View>
        )}

        <View style={styles.inputGroup}>
          <AuthFieldBox
            state={fieldState(!!errors.birthdate, false)}
            style={styles.authInputContainer}
            label="생년월일"
          >
            <Pressable
              onPress={() => setBirthdatePickerOpen(true)}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="생년월일 선택"
            >
              <Text
                style={[
                  styles.authValue,
                  !form.birthdate && styles.authValuePlaceholder,
                ]}
              >
                {form.birthdate
                  ? formatBirthdate(form.birthdate)
                  : 'YYYY-MM-DD'}
              </Text>
            </Pressable>
          </AuthFieldBox>
          {!!errors.birthdate && <InlineError message={errors.birthdate} />}
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
                  form.gender === option.key && styles.genderButtonSelected,
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
                disabled={isSubmitting}
                accessibilityRole="radio"
                accessibilityState={{ selected: form.gender === option.key }}
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

        {!!errors.form && <InlineError message={errors.form} />}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: sf(16) }]}>
        <AuthSubmitButton
          label="완료"
          onPress={onComplete}
          loading={isSubmitting}
          muted={!isCompleteEnabled}
          disabled={isSubmitting}
        />
      </View>

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

export default OAuthAdditionalInfoScreenView;
