import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  PixelRatio,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../../navigation/types';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

const COLORS = {
  primary: '#1344FF',
  primaryLight: '#E8EDFF',
  primaryDark: '#0F36D6',
  lightGray: '#F3F4F6',
  gray: '#E5E7EB',
  darkGray: '#9CA3AF',
  text: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  success: '#34C759',
  error: '#FF3B30',
  surface: '#F9FAFB',
  border: '#E5E7EB',
};

type OAuthAdditionalInfoScreenRouteProp = RouteProp<
  AuthStackParamList,
  'OAuthAdditionalInfo'
>;

type OAuthAdditionalInfoScreenProps = {
  route: OAuthAdditionalInfoScreenRouteProp;
  navigation: { goBack: () => void };
};

export default function OAuthAdditionalInfoScreen({
  route,
  navigation,
}: OAuthAdditionalInfoScreenProps) {
  const { signupId, needEmail } = route.params;
  const oauthComplete = useAuthStore((state) => state.oauthComplete);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<number | null>(null); // 0: 남성, 1: 여성
  const [focused, setFocused] = useState<string | null>(null);

  const handleComplete = async () => {
    if (needEmail && !email.trim()) {
      Toast.show({
        type: 'error',
        text1: '이메일을 입력해주세요.',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    if (needEmail) {
      const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;
      if (!emailRegex.test(email.trim())) {
        Toast.show({
          type: 'error',
          text1: '이메일 형식이 올바르지 않습니다.',
          position: 'top',
          visibilityTime: 2500,
        });
        return;
      }
    }

    if (!age.trim()) {
      Toast.show({
        type: 'error',
        text1: '나이를 입력해주세요.',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      Toast.show({
        type: 'error',
        text1: '올바른 나이를 입력해주세요. (0-150)',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    if (gender === null) {
      Toast.show({
        type: 'error',
        text1: '성별을 선택해주세요.',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    try {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - ageNum;
      const birthdate = `${birthYear}-01-01`;
      const genderEnum = gender === 0 ? 'MALE' : 'FEMALE';

      await oauthComplete({
        signupId,
        email: needEmail ? email.trim() : null,
        birthdate,
        gender: genderEnum,
      });
      Toast.show({
        type: 'success',
        text1: '가입이 완료되었습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: e.message || '가입 처리 중 오류가 발생했습니다.',
        position: 'top',
        visibilityTime: 2500,
      });
    }
  };

  const isButtonEnabled = (!needEmail || email.length > 0) && age.length > 0 && gender !== null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <ArrowLeft size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>추가 정보 입력</Text>
          <Text style={styles.description}>
            서비스 이용을 위해 추가 정보를 입력해 주세요.
          </Text>

          {needEmail && (
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputContainer,
                  focused === 'email' && styles.inputFocused,
                ]}
              >
                <Text style={styles.label}>이메일</Text>
                <TextInput
                  style={styles.input}
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  editable={!isLoading}
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <View
              style={[
                styles.inputContainer,
                focused === 'age' && styles.inputFocused,
              ]}
            >
              <Text style={styles.label}>나이</Text>
              <TextInput
                style={styles.input}
                placeholder="나이를 입력하세요"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                onFocus={() => setFocused('age')}
                onBlur={() => setFocused(null)}
                editable={!isLoading}
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          <View style={styles.genderGroup}>
            <Text style={styles.genderLabel}>성별</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 0 && styles.genderButtonSelected,
                ]}
                onPress={() => setGender(0)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 0 && styles.genderButtonTextSelected,
                  ]}
                >
                  남성
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 1 && styles.genderButtonSelected,
                ]}
                onPress={() => setGender(1)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 1 && styles.genderButtonTextSelected,
                  ]}
                >
                  여성
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (isLoading || !isButtonEnabled) && styles.submitButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={isLoading || !isButtonEnabled}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>완료</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    paddingHorizontal: normalize(24),
    paddingTop: normalize(16),
    paddingBottom: normalize(10),
  },
  headerBackButton: {
    width: normalize(34),
    height: normalize(34),
    borderRadius: normalize(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollContainer: { padding: normalize(24), paddingBottom: normalize(40) },
  title: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  description: {
    fontSize: normalize(15),
    color: COLORS.textSecondary,
    marginBottom: normalize(32),
  },
  inputGroup: { marginBottom: normalize(16) },
  inputContainer: {
    width: '100%',
    minHeight: normalize(62),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: normalize(2),
  },
  input: {
    fontSize: normalize(16),
    color: COLORS.text,
    padding: 0,
    marginTop: normalize(2),
  },
  genderGroup: {
    marginBottom: normalize(32),
  },
  genderLabel: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: normalize(12),
  },
  genderButtons: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  genderButton: {
    flex: 1,
    height: normalize(48),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  genderButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  genderButtonText: {
    fontSize: normalize(15),
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  genderButtonTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(16),
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  submitButtonText: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: COLORS.white,
  },
});
