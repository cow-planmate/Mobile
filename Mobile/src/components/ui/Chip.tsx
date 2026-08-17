import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

export type ChipVariant = 'solid' | 'soft';
export type ChipSize = 's' | 'm';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  count?: number;
  icon?: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  style?: StyleProp<ViewStyle>;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  count,
  icon,
  variant = 'solid',
  size = 'm',
  style,
}: ChipProps) {
  const isSolid = variant === 'solid';
  const selectedTextStyle = isSolid
    ? styles.solidSelectedText
    : styles.softSelectedText;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        size === 's' ? styles.sizeS : styles.sizeM,
        isSolid ? styles.solidIdle : styles.softIdle,
        selected && (isSolid ? styles.solidSelected : styles.softSelected),
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count === undefined ? label : `${label} ${count}개`}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={[
          styles.label,
          size === 's' ? styles.labelS : styles.labelM,
          selected && selectedTextStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {count !== undefined ? (
        <Text
          style={[
            styles.count,
            size === 's' ? styles.labelS : styles.labelM,
            selected && selectedTextStyle,
          ]}
        >
          {count}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    borderRadius: tokens.radius.round,
    borderWidth: 1,
  },
  sizeS: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
  },
  sizeM: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8),
  },
  solidIdle: {
    backgroundColor: tokens.colors.white,
    borderColor: tokens.colors.border,
  },
  solidSelected: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  softIdle: {
    backgroundColor: tokens.colors.surface,
    borderColor: 'transparent',
  },
  softSelected: {
    backgroundColor: tokens.colors.primaryTint,
    borderColor: tokens.colors.primary,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  labelS: {
    fontSize: normalize(tokens.fontSize.xs),
  },
  labelM: {
    fontSize: normalize(tokens.fontSize.s),
  },
  count: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textTertiary,
  },
  solidSelectedText: {
    color: tokens.colors.white,
  },
  softSelectedText: {
    color: tokens.colors.primary,
  },
});
