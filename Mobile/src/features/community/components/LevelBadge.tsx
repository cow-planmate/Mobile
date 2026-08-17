import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
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
    flexShrink: 0,
    paddingHorizontal: normalize(5),
    paddingVertical: normalize(1),
    borderRadius: tokens.radius.xs,
  },
  text: {
    fontSize: normalize(9),
    fontFamily: tokens.fontFamily.bold,
  },
});
