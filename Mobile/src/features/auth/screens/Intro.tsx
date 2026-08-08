import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/types';

export type IntroProps = {
  onStart?: () => void;
  onLogin?: () => void;
};

export function Intro({ onStart, onLogin }: IntroProps) {
  const navigation = useNavigation<
    NativeStackNavigationProp<AuthStackParamList, 'Intro'>
  >();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>planmate</Text>
        <Text style={styles.title}>Plan your next trip together.</Text>
        <Text style={styles.description}>
          Organize places, schedules, and memories in one simple travel plan.
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.primary}
          onPress={onStart ?? (() => navigation.navigate('Signup'))}
          accessibilityRole="button"
          accessibilityLabel="Start planning"
        >
          <Text style={styles.primaryText}>Start planning</Text>
        </Pressable>
        <Pressable
          style={styles.secondary}
          onPress={onLogin ?? (() => navigation.navigate('Login'))}
          accessibilityRole="button"
          accessibilityLabel="Log in"
        >
          <Text style={styles.secondaryText}>I already have an account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  content: { flex: 1, justifyContent: 'center' },
  logo: { color: '#4f46e5', fontSize: 18, fontWeight: '700', marginBottom: 32 },
  title: { color: '#111827', fontSize: 34, lineHeight: 42, fontWeight: '700' },
  description: { color: '#6b7280', fontSize: 16, lineHeight: 24, marginTop: 16 },
  actions: { gap: 12, paddingBottom: 12 },
  primary: { alignItems: 'center', backgroundColor: '#4f46e5', borderRadius: 14, padding: 16 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: { alignItems: 'center', padding: 14 },
  secondaryText: { color: '#4f46e5', fontSize: 15, fontWeight: '600' },
});

export default Intro;
