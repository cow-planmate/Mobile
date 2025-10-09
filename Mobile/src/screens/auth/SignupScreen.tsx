import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';

const COLORS = {
  primary: '#1344FF',
  lightGray: '#F0F0F0',
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
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
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
                { flex: 1 },
                focusedInput === 'email' && styles.inputFocused,
              ]}
              placeholder="이메일을 입력하세요"
              value={email}
              onChangeText={setEmail}
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
              value={password}
              placeholder="••••••••"
              placeholderTextColor={COLORS.darkGray}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Text>👁️</Text>
            </TouchableOpacity>
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
              value={confirmPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.darkGray}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <View style={styles.inlineInputContainer}>
            <TextInput
              style={[
                styles.input,
                { flex: 1 },
                focusedInput === 'nickname' && styles.inputFocused,
              ]}
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChangeText={setNickname}
              onFocus={() => setFocusedInput('nickname')}
              onBlur={() => setFocusedInput(null)}
            />
            <Pressable style={styles.inlineButton}>
              <Text style={styles.inlineButtonText}>중복확인</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>나이</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'age' && styles.inputFocused,
              ]}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              onFocus={() => setFocusedInput('age')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderContainer}>
              <Pressable
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonSelected,
                ]}
                onPress={() => setGender('male')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.genderButtonTextSelected,
                  ]}
                >
                  남
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonSelected,
                ]}
                onPress={() => setGender('female')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.genderButtonTextSelected,
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
    color: COLORS.text,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    height: 52,
    borderWidth: 0,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineButton: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  inlineButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
  },
  eyeIcon: {
    padding: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  genderContainer: {
    flexDirection: 'row',
    height: 52,
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
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontWeight: 'bold',
    color: COLORS.darkGray,
    fontSize: 16,
  },
  genderButtonTextSelected: {
    color: COLORS.white,
  },
  submitButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
});
