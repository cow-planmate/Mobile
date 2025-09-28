// src/components/common/FloatingActionButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#007AFF',
  white: '#FFFFFF',
};

type FloatingActionButtonProps = {
  onPress: () => void;
};

export default function FloatingActionButton({
  onPress,
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    color: COLORS.white,
    fontSize: 36,
    lineHeight: 40,
  },
});
