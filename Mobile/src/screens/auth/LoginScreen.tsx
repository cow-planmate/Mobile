import React from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLoginScreen } from './useLoginScreen';
import { styles, COLORS } from './LoginScreen.styles';

type LoginScreenProps = {
  navigation: { navigate: (screen: string) => void };
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const {
    form,
    error,
    focused,
    isLoading,
    setFocused,
    handleChange,
    handleLogin,
  } = useLoginScreen();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={[styles.input, focused === 'email' && styles.inputFocused]}
          placeholder="이메일을 입력하세요"
          value={form.email}
          onChangeText={text => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          editable={!isLoading}
          placeholderTextColor={COLORS.darkGray}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={[styles.input, focused === 'password' && styles.inputFocused]}
          placeholder="비밀번호를 입력하세요"
          value={form.password}
          onChangeText={text => handleChange('password', text)}
          secureTextEntry
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          editable={!isLoading}
          placeholderTextColor={COLORS.darkGray}
        />
      </View>

      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>로그인</Text>
        )}
      </Pressable>
      <View style={styles.linksContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
