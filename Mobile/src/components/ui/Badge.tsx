import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { tokens, ToneName } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

export interface BadgeProps {
  label: string;
  tone?: ToneName;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Badge({
  label,
  tone = 'neutral',
  icon,
  style,
}: BadgeProps) {
  const palette = tokens.tones[tone];

  return (
    <View style={[styles.base, { backgroundColor: palette.bg }, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(3),
    borderRadius: tokens.radius.s,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    fontSize: normalize(tokens.fontSize.xxs),
    fontFamily: tokens.fontFamily.bold,
  },
});
