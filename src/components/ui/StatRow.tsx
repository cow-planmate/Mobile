import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

export interface StatItemProps {
  icon: React.ReactNode;
  value: number | string;
  label?: string;
  active?: boolean;
  onPress?: () => void;
}

export function StatItem({
  icon,
  value,
  label,
  active = false,
  onPress,
}: StatItemProps) {
  const content = (
    <>
      {icon}
      <Text style={[styles.value, active && styles.valueActive]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.item} accessibilityLabel={label}>
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      {content}
    </TouchableOpacity>
  );
}

export interface StatRowProps {
  children: React.ReactNode;
  divided?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function StatRow({
  children,
  divided = true,
  style,
}: StatRowProps) {
  return (
    <View style={[styles.row, divided && styles.rowDivided, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  rowDivided: {
    marginTop: normalize(12),
    paddingTop: normalize(12),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  value: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  valueActive: {
    color: tokens.colors.primary,
  },
});
