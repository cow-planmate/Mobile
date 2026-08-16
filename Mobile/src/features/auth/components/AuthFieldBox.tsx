import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { COLORS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

export type FieldState = 'default' | 'focus' | 'error' | 'success';

const BORDER_COLOR: Record<FieldState, string> = {
  default: COLORS.border,
  focus: COLORS.primary,
  error: COLORS.errorBorder,
  success: COLORS.success,
};

const DURATION = 160;

export function useAnimatedBorderColor(color: string) {
  const from = useSharedValue(color);
  const to = useSharedValue(color);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (to.value === color) return;
    from.value = to.value;
    to.value = color;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: DURATION,
      easing: Easing.out(Easing.quad),
    });
  }, [color, from, to, progress]);

  return useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [from.value, to.value],
    ),
  }));
}

const LABEL_COLOR: Record<FieldState, string> = {
  default: COLORS.textSecondary,
  focus: COLORS.primary,
  error: COLORS.error,
  success: COLORS.textSecondary,
};

const LABEL_HEIGHT = sp(TYPO.caption.lineHeight);

interface AuthFieldBoxProps {
  state?: FieldState;

  style?: StyleProp<ViewStyle>;

  containerStyle?: StyleProp<ViewStyle>;

  label?: string;

  labelBackground?: string;
  children?: React.ReactNode;
}

export default function AuthFieldBox({
  state = 'default',
  style,
  containerStyle,
  label,
  labelBackground = COLORS.surfaceRaised,
  children,
}: AuthFieldBoxProps) {
  const animatedStyle = useAnimatedBorderColor(BORDER_COLOR[state]);
  const box = (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );

  if (!label) {
    return containerStyle ? <View style={containerStyle}>{box}</View> : box;
  }

  return (
    <View style={[styles.wrap, containerStyle]}>
      {box}
      <View style={styles.labelWrap} pointerEvents="none">
        <Text
          style={[
            styles.label,
            { color: LABEL_COLOR[state], backgroundColor: labelBackground },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: LABEL_HEIGHT / 2,
  },

  labelWrap: {
    position: 'absolute',
    top: 0,
    left: sf(12),
    flexDirection: 'row',
  },
  label: {
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: LABEL_HEIGHT,
    letterSpacing: TYPO.caption.letterSpacing,
    paddingHorizontal: sf(4),
    includeFontPadding: false,
  },
});
