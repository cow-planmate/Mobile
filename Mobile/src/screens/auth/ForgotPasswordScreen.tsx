import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Pressable,
  Alert,
  Dimensions,
  PixelRatio,
  TouchableOpacity,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 360;
function normalize(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const COLORS = {
  primary: '#1344FF',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  error: '#FF3B30',
  success: '#34C759',
  lightBlue: '#e6f0ff', // 연한 파란색 추가
};

type ForgotPasswordScreenProps = {
  navigation: {
    goBack: () => void;
    // ...other navigation props if needed
  };
};

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handlePasswordReset = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    console.log('Password reset requested for:', email);
    Alert.alert(
      '요청 완료',
      '비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.backButtonText} onPress={() => navigation.goBack()}>
        {'<'} 뒤로가기
      </Text>
      <Text style={styles.title}>비밀번호 찾기</Text>
      <Text style={styles.subtitle}>
        가입하신 이메일 주소를 입력하시면,{'\n'}비밀번호 재설정 메일을
        보내드립니다.
      </Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === 'email' && styles.inputFocused,
          ]}
          placeholder="이메일을 입력하세요"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
          placeholderTextColor={COLORS.darkGray}
        />
      </View>
      <Pressable style={styles.submitButton} onPress={handlePasswordReset}>
        <Text style={styles.submitButtonText}>확인</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: normalize(24),
    backgroundColor: COLORS.lightBlue,
  },
  // backButton style removed
  backButtonText: {
    fontSize: normalize(14),
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: normalize(24),
    marginBottom: normalize(16),
    color: COLORS.text,
  },
  subtitle: {
    fontSize: normalize(16),
    textAlign: 'center',
    color: COLORS.darkGray,
    marginBottom: normalize(48),
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
    width: '100%',
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: COLORS.white,
    color: COLORS.text,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  submitButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: normalize(24),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
