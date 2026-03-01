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
import { Info } from 'lucide-react-native';
import { styles, COLORS } from './ForgotPasswordScreen.styles';

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
                <Text style={styles.label}>이메일</Text>
                <View style={styles.inlineInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.flex1,
                      (showVerificationInput || isEmailVerified) &&
                        styles.inputDisabled,
                      focusedField === 'email' && styles.inputFocused,
                    ]}
                    placeholder="example@email.com"
                    placeholderTextColor={COLORS.darkGray}
                    value={email}
                    onChangeText={onEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={
                      !showVerificationInput && !isEmailVerified && !isLoading
                    }
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Pressable
                    style={[
                      styles.inlineButton,
                      (showVerificationInput || isEmailVerified) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={onSendVerificationEmail}
                    disabled={
                      showVerificationInput || isEmailVerified || isLoading
                    }
                  >
                    <Text style={styles.inlineButtonText}>
                      {showVerificationInput ? '전송됨' : '인증요청'}
                    </Text>
                  </Pressable>
                </View>
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
                          styles.innerInput,
                          isEmailVerified && { color: COLORS.darkGray },
                        ]}
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
                      <Text style={styles.timerText}>
                        {isEmailVerified ? '' : formatTime(timeLeft)}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.inlineButton,
                        (isEmailVerified || isLoading) && styles.buttonDisabled,
                      ]}
                      onPress={onVerifyCode}
                      disabled={isEmailVerified || isLoading}
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
            <View style={styles.tempPasswordContainer}>
              <View style={styles.infoBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Info size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.infoBoxText}>
                    이메일 확인이 완료되었습니다.
                  </Text>
                </View>
                <Text style={styles.infoBoxSubText}>
                  '임시 비밀번호 발송' 버튼을 누르면{'\n'}
                  가입하신 이메일로 비밀번호가 전송됩니다.
                </Text>
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
                  (!isEmailVerified || isLoading) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={onNextStep}
                disabled={!isEmailVerified || isLoading}
              >
                <Text style={styles.submitButtonText}>다음</Text>
              </TouchableOpacity>

              {(showVerificationInput || isEmailVerified) && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={onResetVerification}
                  disabled={isLoading}
                >
                  <Text style={styles.retryButtonText}>
                    이메일 다시 입력하기
                  </Text>
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

          <TouchableOpacity
            style={styles.backButton}
            onPress={onPrevStep}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>
              {step === 1 ? '로그인 화면으로 돌아가기' : '이전 단계'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
