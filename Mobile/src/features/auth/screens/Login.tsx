import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../../store/useAuthStore';
import type { AuthStackParamList } from '../../../navigation/types';

export type LoginProps = {
  onSubmit?: (email: string, password: string) => void;
  initialEmail?: string;
  initialPassword?: string;
};

export function Login({ onSubmit, initialEmail = '', initialPassword = '' }: LoginProps) {
  const navigation = useNavigation<
    NativeStackNavigationProp<AuthStackParamList, 'Login'>
  >();
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError('');
    if (onSubmit) {
      onSubmit(normalizedEmail, password);
      return;
    }
    try {
      await login(normalizedEmail, password);
    } catch {
      setError('Login failed. Check your details and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back">
        <Text style={styles.back}>‹ Back</Text>
      </Pressable>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.description}>Log in to continue planning.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={value => {
          setEmail(value);
          setError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
        accessibilityLabel="Email"
      />
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={value => {
            setPassword(value);
            setError('');
          }}
          secureTextEntry={!showPassword}
          editable={!isLoading}
          accessibilityLabel="Password"
        />
        <Pressable onPress={() => setShowPassword(value => !value)} accessibilityRole="button">
          <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.primary} onPress={submit} disabled={isLoading} accessibilityRole="button">
        <Text style={styles.primaryText}>{isLoading ? 'Logging in…' : 'Log in'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Signup')} accessibilityRole="button">
        <Text style={styles.link}>Create an account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 48 },
  title: { color: '#111827', fontSize: 30, fontWeight: '700' },
  description: { color: '#6b7280', fontSize: 16, marginTop: 8, marginBottom: 32 },
  input: { borderColor: '#d1d5db', borderRadius: 12, borderWidth: 1, color: '#111827', fontSize: 16, padding: 15, marginBottom: 12 },
  passwordRow: { alignItems: 'center', borderColor: '#d1d5db', borderRadius: 12, borderWidth: 1, flexDirection: 'row', marginBottom: 12 },
  passwordInput: { color: '#111827', flex: 1, fontSize: 16, padding: 15 },
  toggle: { color: '#4f46e5', fontWeight: '600', paddingHorizontal: 14 },
  error: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
  primary: { alignItems: 'center', backgroundColor: '#4f46e5', borderRadius: 14, padding: 16, marginTop: 8 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#4f46e5', fontSize: 15, fontWeight: '600', marginTop: 24, textAlign: 'center' },
});

export default Login;
