import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type SignupScreenViewProps = {
  isAgreed?: boolean;
  onChangeAgreement?: (value: boolean) => void;
  [key: string]: unknown;
};

/** Compatibility view kept for existing tests and integrations. */
export function SignupScreenView({
  isAgreed = false,
  onChangeAgreement = () => undefined,
}: SignupScreenViewProps) {
  return (
    <View style={styles.container}>
      <Pressable
        testID="agreement-checkbox"
        onPress={() => onChangeAgreement(!isAgreed)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isAgreed }}
      >
        <Text style={styles.checkbox}>{isAgreed ? '✓' : ''}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  checkbox: { borderColor: '#4f46e5', borderWidth: 1, height: 24, textAlign: 'center', width: 24 },
});

export default SignupScreenView;
