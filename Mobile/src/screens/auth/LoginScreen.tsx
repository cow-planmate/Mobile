// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

// 색상 팔레트를 정의하여 일관성 유지
const COLORS = {
  primary: '#007AFF', // 주요 파란색
  lightGray: '#F0F0F0', // 입력창 배경 회색
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  error: '#FF3B30', // 에러 색상
};

type LoginScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('Failed to fetch'); // 에러 메시지 UI 확인용
  const { login } = useAuth();

  function alert(arg0: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      {/* 에러 메시지 표시 영역 */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* 이메일 섹션 */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일을 입력하세요" // ⭐️ 1. 플레이스홀더 추가
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* 비밀번호 섹션 */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요" // ⭐️ 1. 플레이스홀더 추가
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* 로그인 버튼 */}
      <Pressable style={styles.submitButton} onPress={login}>
        <Text style={styles.submitButtonText}>로그인</Text>
      </Pressable>

      {/* 추가 옵션 링크 */}
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => alert('비밀번호 찾기!')}>
          <Text style={styles.linkText}>비밀번호 찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: COLORS.text,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FFD2D2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: COLORS.lightGray,
  },
  submitButton: {
    width: '100%',
    height: 50,
    borderRadius: 25, // ⭐️ 2. 버튼 모서리를 더 둥글게 수정
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  linkText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
});
