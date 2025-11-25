import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

const COLORS = {
  primary: '#1344FF',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  success: '#34C759',
  lightBlue: '#e6f0ff',
};

const PasswordRequirement = React.memo(
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

export default function SignupScreen() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    gender: '',
    age: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const navigation = useNavigation();

  const handleChange = useCallback((name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const passwordRequirements = useMemo(() => {
    const hasMinLength = form.password.length >= 8;
    const hasCombination = /(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(
      form.password,
    );
    return { hasMinLength, hasCombination };
  }, [form.password]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.backButtonIcon}>{'‹'}</Text>
        <Text style={styles.backButtonText}>뒤로가기</Text>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>회원가입</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <View style={styles.inlineInputContainer}>
            <TextInput
              style={[
                styles.input,
                styles.flex1,
                focusedInput === 'email' && styles.inputFocused,
              ]}
              placeholder="이메일을 입력하세요"
              value={form.email}
              onChangeText={v => handleChange('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
            <Pressable style={styles.inlineButton}>
              <Text style={styles.inlineButtonText}>인증번호발송</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <View
            style={[
              styles.passwordContainer,
              focusedInput === 'password' && styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={form.password}
              placeholder="••••••••"
              placeholderTextColor={COLORS.darkGray}
              onChangeText={v => handleChange('password', v)}
              secureTextEntry={!isPasswordVisible}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(v => !v)}
            >
              <Text>👁️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.requirementsContainer}>
            <PasswordRequirement
              met={passwordRequirements.hasMinLength}
              label="최소 8자"
            />
            <PasswordRequirement
              met={passwordRequirements.hasCombination}
              label="영문, 숫자, 특수문자 3가지 조합"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호 재입력</Text>
          <View
            style={[
              styles.passwordContainer,
              focusedInput === 'confirmPassword' && styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={form.confirmPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.darkGray}
              onChangeText={v => handleChange('confirmPassword', v)}
              secureTextEntry={!isConfirmPasswordVisible}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsConfirmPasswordVisible(v => !v)}
            >
              <Text>👁️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <View style={styles.inlineInputContainer}>
            <TextInput
              style={[
                styles.input,
                styles.flex1,
                focusedInput === 'nickname' && styles.inputFocused,
              ]}
              placeholder="닉네임을 입력하세요"
              value={form.nickname}
              onChangeText={v => handleChange('nickname', v)}
              onFocus={() => setFocusedInput('nickname')}
              onBlur={() => setFocusedInput(null)}
            />
            <Pressable style={styles.inlineButton}>
              <Text style={styles.inlineButtonText}>중복확인</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>나이</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'age' && styles.inputFocused,
              ]}
              value={form.age}
              onChangeText={v => handleChange('age', v)}
              keyboardType="number-pad"
              onFocus={() => setFocusedInput('age')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderContainer}>
              <Pressable
                style={[
                  styles.genderButton,
                  form.gender === 'male' && styles.genderButtonSelected,
                ]}
                onPress={() => handleChange('gender', 'male')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    form.gender === 'male' && styles.genderButtonTextSelected,
                  ]}
                >
                  남
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.genderButton,
                  form.gender === 'female' && styles.genderButtonSelected,
                ]}
                onPress={() => handleChange('gender', 'female')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    form.gender === 'female' && styles.genderButtonTextSelected,
                  ]}
                >
                  여
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        <Pressable style={styles.submitButton}>
          <Text style={styles.submitButtonText}>회원가입</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
  },
  scrollContainer: {
    padding: normalize(24),
    paddingTop: normalize(24),
  },
  title: {
    fontSize: normalize(32),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: normalize(48),
    color: COLORS.text,
    marginTop: normalize(24),
    letterSpacing: 1,
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(24),
  },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(10),
    fontWeight: 'bold',
    marginLeft: normalize(4),
  },
  input: {
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  passwordInput: {
    flex: 1,
    height: normalize(52),
    borderWidth: 0,
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: 'transparent',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  inlineButton: {
    height: normalize(52),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  inlineButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(8),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  eyeIcon: {
    padding: normalize(15),
  },
  rowContainer: {
    flexDirection: 'row',
    gap: normalize(20),
  },
  genderContainer: {
    flexDirection: 'row',
    height: normalize(52),
    gap: normalize(10),
  },
  genderButton: {
    flex: 1,
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontWeight: 'bold',
    color: COLORS.darkGray,
    fontSize: normalize(16),
  },
  genderButtonTextSelected: {
    color: COLORS.white,
  },
  submitButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    marginTop: normalize(20),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: normalize(17),
    fontWeight: 'bold',
    color: COLORS.darkGray,
    letterSpacing: 0.5,
  },
  requirementsContainer: {
    marginTop: normalize(10),
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  requirementIcon: {
    marginRight: normalize(10),
    fontWeight: 'bold',
    fontSize: normalize(16),
  },
  requirementText: {
    fontSize: normalize(14),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(24),
    marginLeft: normalize(16),
    marginBottom: normalize(10),
    width: normalize(100),
  },
  backButtonIcon: {
    fontSize: normalize(24),
    color: COLORS.primary,
    marginRight: normalize(4),
    fontWeight: 'bold',
  },
  backButtonText: {
    fontSize: normalize(16),
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
