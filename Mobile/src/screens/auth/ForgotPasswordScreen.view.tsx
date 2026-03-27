import React from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { ArrowLeft, Info } from 'lucide-react-native';
import { styles, COLORS, normalize } from './ForgotPasswordScreen.styles';

export interface ForgotPasswordScreenViewProps {
  step: number;
  totalSteps: number;
  email: string;
  verificationCode: string;
  showVerificationInput: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  focusedField: string | null;
  timeLeft: number;
  onEmailChange: (email: string) => void;
  onVerificationCodeChange: (code: string) => void;
  onSendVerificationEmail: () => void;
  onVerifyCode: () => void;
  onNextStep: () => void;
  onSendTempPassword: () => void;
  onPrevStep: () => void;
  onResetVerification: () => void;
  setFocusedField: (field: string | null) => void;
  formatTime: (seconds: number) => string;
}

export const ForgotPasswordScreenView = ({
  step,
  totalSteps,
  email,
  verificationCode,
  showVerificationInput,
  isEmailVerified,
  isLoading,
  focusedField,
  timeLeft,
  onEmailChange,
  onVerificationCodeChange,
  onSendVerificationEmail,
  onVerifyCode,
  onNextStep,
  onSendTempPassword,
  onPrevStep,
  onResetVerification,
  setFocusedField,
  formatTime,
}: ForgotPasswordScreenViewProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {step === 1 && (
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
        )}
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {step === 1 ? '비밀번호 찾기' : '임시 비밀번호 발급'}
          </Text>
          <Text style={styles.description}>
            {step === 1
              ? '가입하신 이메일 주소로 인증번호를 보내드려요.'
              : '아래 버튼을 누르면 이메일로 임시 비밀번호가 발송됩니다.'}
          </Text>

          {step === 1 && (
            <>
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'email' && styles.inputFocused,
                    (showVerificationInput || isEmailVerified) &&
                      styles.inputDisabled,
                  ]}
                >
                  <Text style={styles.label}>이메일</Text>
                  <View style={styles.inputRow}>
                    {showVerificationInput || isEmailVerified ? (
                      <View style={styles.emailValueWrapper}>
                        <Text style={styles.emailValue}>{email}</Text>
                      </View>
                    ) : (
                      <TextInput
                        style={[styles.input, styles.flex1]}
                        placeholder="example@email.com"
                        placeholderTextColor={COLORS.darkGray}
                        value={email}
                        onChangeText={onEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    )}
                  </View>
                </View>
              </View>

              {showVerificationInput && (
                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === 'verificationCode' &&
                        styles.inputFocused,
                      isEmailVerified && styles.inputDisabled,
                    ]}
                  >
                    <Text style={styles.label}>인증번호</Text>
                    <View style={styles.inputRow}>
                      <View
                        style={[
                          styles.codeInputWrapper,
                          styles.flex1,
                          isEmailVerified && styles.inputDisabled,
                        ]}
                      >
                        {isEmailVerified ? (
                          <View style={styles.emailValueWrapper}>
                            <Text style={styles.emailValue}>
                              {verificationCode}
                            </Text>
                          </View>
                        ) : (
                          <TextInput
                            style={styles.innerInput}
                            placeholder="123456"
                            placeholderTextColor={COLORS.darkGray}
                            value={verificationCode}
                            onChangeText={onVerificationCodeChange}
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
                  <Pressable
                    style={({ pressed }) => [
                      styles.resendButton,
                      isLoading && styles.resendButtonDisabled,
                      pressed && !isLoading && { opacity: 0.7 },
                    ]}
                    onPress={onSendVerificationEmail}
                    disabled={isLoading}
                  >
                    <Text style={styles.resendButtonText}>
                      인증번호 다시 받기
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {step === 2 && (
            <View style={styles.tempPasswordContainer}>
              <View style={styles.infoBox}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Info
                    size={32}
                    color={COLORS.primary}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.infoBoxText}>
                    이메일 확인이 완료되었습니다.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step === 1 ? (
            <>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (isLoading ||
                    (showVerificationInput &&
                      !isEmailVerified &&
                      timeLeft === 0)) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={
                  isEmailVerified
                    ? onNextStep
                    : showVerificationInput && timeLeft > 0
                    ? onVerifyCode
                    : onSendVerificationEmail
                }
                disabled={
                  isLoading ||
                  (showVerificationInput && !isEmailVerified && timeLeft === 0)
                }
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEmailVerified
                      ? '다음'
                      : showVerificationInput
                      ? '인증번호 확인'
                      : '인증요청'}
                  </Text>
                )}
              </TouchableOpacity>

              {(showVerificationInput || isEmailVerified) && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={onResetVerification}
                  disabled={isLoading}
                >
                  <Text style={styles.retryButtonText}>이메일 수정하기</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={onSendTempPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>임시 비밀번호 발송</Text>
              )}
            </TouchableOpacity>
          )}

          {step === 2 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onPrevStep}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>이전 단계</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
