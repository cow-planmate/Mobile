import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';

// 이메일 정규식
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendTempPassword = async () => {
    // 1. 입력값 검증
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);

    try {
      // [수정 핵심]
      // 1. API 주소 변경: 로그인 없이 접근 가능한 '이메일 인증' API 사용
      // 2. Body 데이터 추가: 백엔드 Enum(EmailVerificationPurpose)에 맞춰 purpose 전달
      console.log(`요청 주소: ${API_URL}/api/auth/email/verification`);

      const response = await axios.post(
        `${API_URL}/api/auth/email/verification`,
        {
          email: email,
          purpose: 'RESET_PASSWORD', // 백엔드의 EmailVerificationPurpose.RESET_PASSWORD 대응
        },
      );

      // 성공 시 처리
      if (response.status === 200) {
        Alert.alert(
          '발송 성공',
          '입력하신 이메일로 인증 메일이 발송되었습니다.\n이메일을 확인해주세요.',
          [{ text: '확인', onPress: () => navigation.navigate('Login') }],
        );
      }
    } catch (error: any) {
      console.error('API Error:', error);

      let errorMessage = '이메일 발송에 실패했습니다.';

      if (error.response) {
        // 백엔드 에러 메시지 활용
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 404) {
          errorMessage = '가입되지 않은 이메일입니다.';
        } else if (error.response.status === 401) {
          // 이제 이 에러는 발생하지 않아야 합니다!
          errorMessage = '인증 오류가 발생했습니다. 관리자에게 문의하세요.';
        }
      } else if (error.request) {
        errorMessage = '서버와 연결할 수 없습니다. 네트워크를 확인해주세요.';
      }

      Alert.alert('발송 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>비밀번호 찾기</Text>
            <Text style={styles.subtitle}>
              가입하신 이메일을 입력하시면{'\n'}비밀번호 재설정을 위한 메일을
              보내드립니다.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendTempPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>인증 메일 발송</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>로그인 화면으로 돌아가기</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333333',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  buttonDisabled: { backgroundColor: '#A0A0A0' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  backButton: { alignItems: 'center', padding: 16 },
  backButtonText: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
