import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

export type CardVariant = 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 's' | 'm' | 'l';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
}

const PADDINGS: Record<CardPadding, number> = {
  none: 0,
  s: normalize(12),
  m: normalize(16),
  l: normalize(20),
};

export default function Card({
  children,
  variant = 'elevated',
  padding = 'm',
  style,
  onPress,
  onLongPress,
  accessibilityLabel,
}: CardProps) {
  const composed = [
    styles.base,
    styles[variant],
    { padding: PADDINGS[padding] },
    style,
  ];

  if (!onPress && !onLongPress) {
    return <View style={composed}>{children}</View>;
  }

  return (
    <TouchableOpacity
      style={composed}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.l,
    overflow: 'hidden',
  },
  elevated: tokens.shadows.md,
  outlined: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  flat: tokens.shadows.none,
});
