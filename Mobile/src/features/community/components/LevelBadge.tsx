import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';
import { levelBadgeColor } from '../constants/levels';

interface LevelBadgeProps {
  level: number;
}

export default function LevelBadge({ level }: LevelBadgeProps) {
  const color = levelBadgeColor(level);

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>Lv.{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: normalize(5),
    paddingVertical: normalize(1),
    borderRadius: theme.borderRadius.xs,
  },
  text: {
    fontSize: normalize(9),
    fontFamily: theme.typography.fontFamily.bold,
  },
});
