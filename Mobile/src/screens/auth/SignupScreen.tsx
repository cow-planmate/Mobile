// src/screens/auth/SignupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable, // Button 대신 사용할 컴포넌트
} from 'react-native';

// 색상 팔레트를 정의하여 일관성 유지
const COLORS = {
  primary: '#007AFF', // 주요 파란색
  lightGray: '#F0F0F0', // 비활성 회색
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
};

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState(''); // 'male' or 'female'
  const [age, setAge] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>회원가입</Text>

        {/* 이메일 섹션 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <View style={styles.inlineInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Pressable style={[styles.inlineButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>인증번호발송</Text>
            </Pressable>
          </View>
        </View>

        {/* 비밀번호 섹션 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Text>👁️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 비밀번호 재입력 섹션 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호 재입력</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
            >
              <Text>👁️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 닉네임 섹션 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <View style={styles.inlineInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChangeText={setNickname}
            />
            <Pressable style={[styles.inlineButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>중복확인</Text>
            </Pressable>
          </View>
        </View>

        {/* 나이/성별 섹션 */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>나이</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderContainer}>
              <Pressable
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.primaryButton,
                ]}
                onPress={() => setGender('male')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.primaryButtonText,
                  ]}
                >
                  남
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.primaryButton,
                ]}
                onPress={() => setGender('female')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.primaryButtonText,
                  ]}
                >
                  여
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 회원가입 버튼 */}
        <Pressable style={styles.submitButton}>
          <Text style={styles.submitButtonText}>회원가입</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: COLORS.text,
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
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: COLORS.lightGray,
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineButton: {
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
  },
  eyeIcon: {
    padding: 15,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  genderContainer: {
    flexDirection: 'row',
    height: 50,
    gap: 10,
  },
  genderButton: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  genderButtonText: {
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  submitButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
});
