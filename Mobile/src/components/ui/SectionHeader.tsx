import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

export interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  count?: number | string;
  description?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function SectionHeader({
  title,
  icon,
  count,
  description,
  right,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        <View style={styles.titleRow}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            style={styles.title}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {count !== undefined ? (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          ) : null}
        </View>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(8),
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flexShrink: 1,
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  countBadge: {
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(2),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.primaryTint,
  },
  countText: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  description: {
    marginTop: normalize(4),
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  right: {
    flexShrink: 0,
  },
});
