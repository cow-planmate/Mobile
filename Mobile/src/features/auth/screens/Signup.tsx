import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/types';

export type SignupProps = {
  onSubmit?: (name: string, email: string, password: string) => void;
  initialName?: string;
  initialEmail?: string;
  initialPassword?: string;
  initialAgreed?: boolean;
};

export function Signup({
  onSubmit,
  initialName = '',
  initialEmail = '',
  initialPassword = '',
  initialAgreed = false,
}: SignupProps) {
  const navigation = useNavigation<
    NativeStackNavigationProp<AuthStackParamList, 'Signup'>
  >();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [agreed, setAgreed] = useState(initialAgreed);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!name.trim() || !email.trim() || password.length < 8 || !agreed) {
      setError('Complete all fields, use 8+ characters, and accept the terms.');
      return;
    }
    setError('');
    setDone(true);
    onSubmit?.(name.trim(), email.trim(), password);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back">
        <Text style={styles.back}>‹ Back</Text>
      </Pressable>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.description}>A few details and your next trip is ready.</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} accessibilityLabel="Name" />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="Email" />
      <TextInput style={styles.input} placeholder="Password (8+ characters)" value={password} onChangeText={setPassword} secureTextEntry accessibilityLabel="Password" />
      <Pressable style={styles.agreement} onPress={() => setAgreed(value => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: agreed }}>
        <Text style={styles.checkbox}>{agreed ? '✓' : ''}</Text>
        <Text style={styles.agreementText}>I agree to the terms</Text>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {done && <Text style={styles.success}>Account details are ready.</Text>}
      <Pressable style={styles.primary} onPress={submit} accessibilityRole="button">
        <Text style={styles.primaryText}>Create account</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="button">
        <Text style={styles.link}>Already have an account?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 40 },
  title: { color: '#111827', fontSize: 30, fontWeight: '700' },
  description: { color: '#6b7280', fontSize: 16, lineHeight: 22, marginTop: 8, marginBottom: 24 },
  input: { borderColor: '#d1d5db', borderRadius: 12, borderWidth: 1, color: '#111827', fontSize: 16, padding: 15, marginBottom: 12 },
  agreement: { alignItems: 'center', flexDirection: 'row', marginVertical: 8 },
  checkbox: { alignItems: 'center', borderColor: '#4f46e5', borderRadius: 5, borderWidth: 1, color: '#4f46e5', fontSize: 16, height: 22, marginRight: 10, textAlign: 'center', width: 22 },
  agreementText: { color: '#374151', fontSize: 15 },
  error: { color: '#dc2626', fontSize: 14, marginVertical: 8 },
  success: { color: '#15803d', fontSize: 14, marginVertical: 8 },
  primary: { alignItems: 'center', backgroundColor: '#4f46e5', borderRadius: 14, padding: 16, marginTop: 12 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#4f46e5', fontSize: 15, fontWeight: '600', marginTop: 24, textAlign: 'center' },
});

export default Signup;
