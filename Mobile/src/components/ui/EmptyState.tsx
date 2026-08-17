import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function EmptyState({
  title,
  description,
  icon,
  loading = false,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {loading ? <ActivityIndicator color={tokens.colors.primary} /> : icon}
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.action}
          onPress={onAction}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(8),
    paddingVertical: normalize(40),
    paddingHorizontal: normalize(24),
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  title: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
    textAlign: 'center',
  },
  action: {
    marginTop: normalize(8),
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(10),
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.primary,
  },
  actionText: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
