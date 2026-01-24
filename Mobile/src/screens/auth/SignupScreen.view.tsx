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
import { styles, COLORS, normalize } from './SignupScreen.styles';

export const PasswordRequirement = React.memo(
  ({ met, label }: { met: boolean; label: string }) => (
    <View style={styles.requirementRow}>
      <Text
        style={[
          styles.requirementIcon,
          { color: met ? COLORS.success : COLORS.darkGray },
        ]}
      >
        ✓
      </Text>
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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {step} / {totalSteps}
          </Text>
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
                <View style={styles.labelRow}>
                  <Text style={[styles.label, styles.marginBottom0]}>
                    이메일
                  </Text>
                </View>

                <View style={styles.inlineInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.flex1,
                      focusedField === 'email' && styles.inputFocused,
                      (showVerificationInput || isEmailVerified) &&
                        styles.inputDisabled,
                      isEmailDuplicate && { borderColor: COLORS.error },
                    ]}
                    placeholder="example@email.com"
                    placeholderTextColor={COLORS.darkGray}
                    value={form.email}
                    onChangeText={v => onChange('email', v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!showVerificationInput && !isEmailVerified}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Pressable
                    style={[
                      styles.inlineButton,
                      (isEmailVerified ||
                        showVerificationInput ||
                        isEmailDuplicate) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={onSendEmail}
                    disabled={
                      isEmailVerified || showVerificationInput || isLoading
                    }
                  >
                    <Text style={styles.inlineButtonText}>
                      {isEmailVerified
                        ? '인증완료'
                        : showVerificationInput
                        ? '전송됨'
                        : '인증요청'}
                    </Text>
                  </Pressable>
                </View>
                {isEmailDuplicate && (
                  <Text style={styles.errorText}>
                    이미 가입된 이메일입니다.
                  </Text>
                )}
              </View>

              {showVerificationInput && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>인증번호</Text>
                  <View style={styles.inlineInputContainer}>
                    <View
                      style={[
                        styles.input,
                        styles.flex1,
                        styles.codeInputWrapper,
                        focusedField === 'verificationCode' &&
                          styles.inputFocused,
                        isEmailVerified && styles.inputDisabled,
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.codeInput,
                          isEmailVerified && { color: COLORS.darkGray },
                        ]}
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
                      <Text style={styles.timerText}>
                        {isEmailVerified ? '' : formatTime(timeLeft)}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.inlineButton,
                        (isLoading || isEmailVerified) && styles.buttonDisabled,
                      ]}
                      onPress={onVerifyCode}
                      disabled={isLoading || isEmailVerified}
                    >
                      <Text style={styles.inlineButtonText}>
                        {isEmailVerified ? '완료' : '확인'}
                      </Text>
                    </Pressable>
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
                <Text style={styles.label}>비밀번호</Text>
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === 'password' && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
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
                    <Text>{isPasswordVisible ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
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
                <Text style={styles.label}>비밀번호 확인</Text>
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === 'confirmPassword' && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
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
                    <Text>{isConfirmPasswordVisible ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
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
                <Text style={styles.label}>닉네임</Text>
                <View style={styles.inlineInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.flex1,
                      focusedField === 'nickname' && styles.inputFocused,
                    ]}
                    placeholder="플랜메이트"
                    placeholderTextColor={COLORS.darkGray}
                    value={form.nickname}
                    onChangeText={v => onChange('nickname', v)}
                    editable={!isLoading}
                    onFocus={() => setFocusedField('nickname')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Pressable
                    style={styles.inlineButton}
                    onPress={onCheckNickname}
                  >
                    <Text style={styles.inlineButtonText}>중복확인</Text>
                  </Pressable>
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
                <Text style={styles.label}>나이</Text>
                <TouchableOpacity
                  style={[styles.input, styles.justifyCenter]}
                  onPress={() => setAgeModalVisible(true)}
                >
                  <Text
                    style={{
                      fontSize: normalize(16),
                      color: form.age ? COLORS.text : COLORS.darkGray,
                    }}
                  >
                    {form.age ? `${form.age}세` : '나이를 선택해주세요'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>성별</Text>
                <View style={styles.genderContainer}>
                  <Pressable
                    style={[
                      styles.genderButton,
                      form.gender === 'male' && styles.genderButtonSelected,
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
                    style={[
                      styles.genderButton,
                      form.gender === 'female' && styles.genderButtonSelected,
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
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {step < 4 ? (
          <>
            <Pressable
              style={[
                styles.submitButton,
                !isNextButtonEnabled && styles.buttonDisabled,
              ]}
              onPress={onNextStep}
              disabled={!isNextButtonEnabled}
            >
              <Text style={styles.submitButtonText}>다음</Text>
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
          <Pressable style={styles.submitButton} onPress={onSignup}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>회원가입 완료</Text>
            )}
          </Pressable>
        )}

        <TouchableOpacity
          style={styles.bottomBackButton}
          onPress={onPrevStep}
          disabled={isLoading}
        >
          <Text style={styles.bottomBackButtonText}>
            {step === 1 ? '로그인 화면으로 돌아가기' : '이전 단계'}
          </Text>
        </TouchableOpacity>
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
