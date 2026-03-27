import React from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react-native';
import { styles, COLORS, normalize } from './SignupScreen.styles';

export const PasswordRequirement = React.memo(
  ({ met, label }: { met: boolean; label: string }) => (
    <View style={styles.requirementRow}>
      <Check
        size={normalize(14)}
        color={met ? COLORS.success : COLORS.darkGray}
        style={{ marginRight: normalize(8) }}
      />
      <Text
        style={[
          styles.requirementText,
          { color: met ? COLORS.text : COLORS.darkGray },
        ]}
      >
        {label}
      </Text>
    </View>
  ),
);

const AGE_OPTIONS = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

export interface SignupScreenViewProps {
  step: number;
  totalSteps: number;
  form: any;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  isLoading: boolean;
  showVerificationInput: boolean;
  isEmailVerified: boolean;
  isNicknameVerified: boolean;
  isEmailDuplicate: boolean;
  isAgeModalVisible: boolean;
  focusedField: string | null;
  timeLeft: number;
  passwordRequirements: { hasMinLength: boolean; hasCombination: boolean };
  isPasswordMatch: boolean;
  isNextButtonEnabled: boolean;
  onChange: (name: string, value: string) => void;
  onSendEmail: () => void;
  onVerifyCode: () => void;
  onCheckNickname: () => void;
  onSignup: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onResetEmail: () => void;
  onSelectAge: (age: string) => void;
  setAgeModalVisible: (visible: boolean) => void;
  setFocusedField: (field: string | null) => void;
  setIsPasswordVisible: (visible: boolean | ((v: boolean) => boolean)) => void;
  setIsConfirmPasswordVisible: (
    visible: boolean | ((v: boolean) => boolean),
  ) => void;
  formatTime: (seconds: number) => string;
}

export const SignupScreenView = ({
  step,
  totalSteps,
  form,
  isPasswordVisible,
  isConfirmPasswordVisible,
  isLoading,
  showVerificationInput,
  isEmailVerified,
  isNicknameVerified,
  isEmailDuplicate,
  isAgeModalVisible,
  focusedField,
  timeLeft,
  passwordRequirements,
  isPasswordMatch,
  isNextButtonEnabled,
  onChange,
  onSendEmail,
  onVerifyCode,
  onCheckNickname,
  onSignup,
  onNextStep,
  onPrevStep,
  onResetEmail,
  onSelectAge,
  setAgeModalVisible,
  setFocusedField,
  setIsPasswordVisible,
  setIsConfirmPasswordVisible,
  formatTime,
}: SignupScreenViewProps) => {
  const step1FooterLabel = isEmailVerified
    ? '다음'
    : showVerificationInput
    ? '인증번호 확인'
    : '인증요청';
  const step3FooterLabel = isNicknameVerified ? '다음' : '중복확인';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.headerBackButton,
            pressed && !isLoading && { opacity: 0.7 },
          ]}
          onPress={onPrevStep}
          disabled={isLoading}
        >
          <ArrowLeft size={18} color={COLORS.textSecondary} />
        </Pressable>
        <Text style={styles.stepText}>STEP {step}</Text>
        <View style={styles.stepIndicatorContainer}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                { width: i + 1 === step ? normalize(24) : normalize(8) },
                i + 1 <= step && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {step === 1 && '이메일 인증'}
            {step === 2 && '비밀번호 설정'}
            {step === 3 && '닉네임 설정'}
            {step === 4 && '내 정보 입력'}
          </Text>

          {step === 1 && (
            <>
              <Text style={styles.description}>
                로그인에 사용할 이메일을 인증해주세요.
              </Text>
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.authInputContainer,
                    focusedField === 'email' && styles.inputFocused,
                    (showVerificationInput || isEmailVerified) &&
                      styles.inputDisabled,
                    isEmailDuplicate && { borderColor: COLORS.error },
                  ]}
                >
                  <Text style={styles.label}>이메일</Text>
                  <View style={styles.authInputRow}>
                    {showVerificationInput || isEmailVerified ? (
                      <View style={styles.authValueWrapper}>
                        <Text style={styles.authValue}>{form.email}</Text>
                      </View>
                    ) : (
                      <TextInput
                        style={styles.authInput}
                        placeholder="example@email.com"
                        placeholderTextColor={COLORS.darkGray}
                        value={form.email}
                        onChangeText={v => onChange('email', v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    )}
                  </View>
                </View>
                {isEmailDuplicate && (
                  <Text style={styles.errorText}>
                    이미 가입된 이메일입니다.
                  </Text>
                )}
              </View>

              {showVerificationInput && (
                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.authInputContainer,
                      focusedField === 'verificationCode' &&
                        styles.inputFocused,
                      isEmailVerified && styles.inputDisabled,
                    ]}
                  >
                    <Text style={styles.label}>인증번호</Text>
                    <View style={styles.authInputRow}>
                      {isEmailVerified ? (
                        <View style={styles.authValueWrapper}>
                          <Text style={styles.authValue}>
                            {form.verificationCode}
                          </Text>
                        </View>
                      ) : (
                        <TextInput
                          style={styles.authInput}
                          placeholder="123456"
                          placeholderTextColor={COLORS.darkGray}
                          value={form.verificationCode}
                          onChangeText={v => onChange('verificationCode', v)}
                          keyboardType="number-pad"
                          maxLength={6}
                          editable={!isLoading && !isEmailVerified}
                          onFocus={() => setFocusedField('verificationCode')}
                          onBlur={() => setFocusedField(null)}
                        />
                      )}
                      <Text style={styles.timerText}>
                        {isEmailVerified ? '' : formatTime(timeLeft)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.description}>
                안전한 비밀번호를 설정해주세요.
              </Text>
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === 'password' && styles.inputFocused,
                  ]}
                >
                  <Text style={styles.label}>비밀번호</Text>
                  <View style={styles.authInputRow}>
                    <TextInput
                      style={styles.authInput}
                      value={form.password}
                      placeholder="********"
                      placeholderTextColor={COLORS.darkGray}
                      onChangeText={v => onChange('password', v)}
                      secureTextEntry={!isPasswordVisible}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setIsPasswordVisible(v => !v)}
                    >
                      {isPasswordVisible ? (
                        <EyeOff size={20} color={COLORS.textSecondary} />
                      ) : (
                        <Eye size={20} color={COLORS.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.requirementsContainer}>
                  <PasswordRequirement
                    met={passwordRequirements.hasMinLength}
                    label="최소 8자 이상"
                  />
                  <PasswordRequirement
                    met={passwordRequirements.hasCombination}
                    label="영문, 숫자, 특수문자 포함"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === 'confirmPassword' && styles.inputFocused,
                  ]}
                >
                  <Text style={styles.label}>비밀번호 확인</Text>
                  <View style={styles.authInputRow}>
                    <TextInput
                      style={styles.authInput}
                      value={form.confirmPassword}
                      placeholder="********"
                      placeholderTextColor={COLORS.darkGray}
                      onChangeText={v => onChange('confirmPassword', v)}
                      secureTextEntry={!isConfirmPasswordVisible}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setIsConfirmPasswordVisible(v => !v)}
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeOff size={20} color={COLORS.textSecondary} />
                      ) : (
                        <Eye size={20} color={COLORS.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.requirementsContainer}>
                  <PasswordRequirement
                    met={isPasswordMatch}
                    label="비밀번호 일치"
                  />
                </View>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.description}>
                앱에서 사용할 닉네임을 정해주세요.
              </Text>
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.authInputContainer,
                    focusedField === 'nickname' && styles.inputFocused,
                  ]}
                >
                  <Text style={styles.label}>닉네임</Text>
                  <View style={styles.nicknameInputRow}>
                    <TextInput
                      style={styles.authInput}
                      placeholder="플랜메이트"
                      placeholderTextColor={COLORS.darkGray}
                      value={form.nickname}
                      onChangeText={v => onChange('nickname', v)}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('nickname')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.description}>
                맞춤형 여행 계획을 위해 필요해요.
              </Text>
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={[styles.authInputContainer, styles.fieldContainerTop]}
                  onPress={() => setAgeModalVisible(true)}
                >
                  <Text style={styles.label}>나이</Text>
                  <Text style={[styles.authValue, styles.selectionValue]}>
                    {form.age ? `${form.age}세` : '나이를 선택해주세요'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.authInputContainer,
                    styles.fieldContainerTop,
                    styles.genderInputContainer,
                  ]}
                >
                  <Text style={styles.label}>성별</Text>
                  <View style={styles.genderContainer}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.genderButton,
                        form.gender === 'male' && styles.genderButtonSelected,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => onChange('gender', 'male')}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          form.gender === 'male' &&
                            styles.genderButtonTextSelected,
                        ]}
                      >
                        남성
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.genderButton,
                        form.gender === 'female' && styles.genderButtonSelected,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => onChange('gender', 'female')}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          form.gender === 'female' &&
                            styles.genderButtonTextSelected,
                        ]}
                      >
                        여성
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {step < 4 ? (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                (isLoading ||
                  (step !== 1 && step !== 3 && !isNextButtonEnabled)) &&
                  styles.buttonDisabled,
                pressed &&
                  !isLoading && {
                    opacity: 0.85,
                    transform: [{ scale: 0.98 }],
                  },
              ]}
              onPress={
                step === 1
                  ? isEmailVerified
                    ? onNextStep
                    : showVerificationInput
                    ? onVerifyCode
                    : onSendEmail
                  : step === 3
                  ? isNicknameVerified
                    ? onNextStep
                    : onCheckNickname
                  : onNextStep
              }
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {step === 1
                  ? step1FooterLabel
                  : step === 3
                  ? step3FooterLabel
                  : '다음'}
              </Text>
            </Pressable>

            {step === 1 && (showVerificationInput || isEmailVerified) && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onResetEmail}
                disabled={isLoading}
              >
                <Text style={styles.retryButtonText}>이메일 다시 입력하기</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed &&
                !isLoading && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={onSignup}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>회원가입 완료</Text>
            )}
          </Pressable>
        )}

        {step > 1 && (
          <TouchableOpacity
            style={styles.bottomBackButton}
            onPress={onPrevStep}
            disabled={isLoading}
          >
            <Text style={styles.bottomBackButtonText}>이전 단계</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={isAgeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAgeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAgeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>나이 선택</Text>
            <FlatList
              data={AGE_OPTIONS}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.ageOption}
                  onPress={() => onSelectAge(item)}
                >
                  <Text style={styles.ageOptionText}>{item}세</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
