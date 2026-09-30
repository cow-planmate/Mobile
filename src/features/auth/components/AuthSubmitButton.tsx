import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import PressableScale from './PressableScale';
import { COLORS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

const FADE = { duration: 180, easing: Easing.out(Easing.quad) };

interface AuthSubmitButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;

  muted?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export default function AuthSubmitButton({
  label,
  onPress,
  loading = false,
  muted = false,
  disabled = false,
  accessibilityLabel,
  style,
}: AuthSubmitButtonProps) {
  const loadingProgress = useSharedValue(loading ? 1 : 0);
  const mutedProgress = useSharedValue(muted ? 1 : 0);

  useEffect(() => {
    loadingProgress.value = withTiming(loading ? 1 : 0, FADE);
  }, [loading, loadingProgress]);

  useEffect(() => {
    mutedProgress.value = withTiming(muted ? 1 : 0, FADE);
  }, [muted, mutedProgress]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - loadingProgress.value,
  }));
  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: loadingProgress.value,
  }));
  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - 0.45 * mutedProgress.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <PressableScale
        style={[styles.button, style]}
        baseColor={COLORS.primary}
        pressedColor={COLORS.primaryPressed}
        scaleTo={0.985}
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ busy: loading }}
      >
        <Animated.View style={labelStyle}>
          <Text style={styles.label}>{label}</Text>
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.center, spinnerStyle]}
          pointerEvents="none"
        >
          <ActivityIndicator color={COLORS.onPrimary} />
        </Animated.View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: sf(52),
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: sp(TYPO.button.fontSize),
    fontFamily: TYPO.button.fontFamily,
    lineHeight: sp(TYPO.button.lineHeight),
    color: COLORS.onPrimary,
    letterSpacing: TYPO.button.letterSpacing,
  },
});
