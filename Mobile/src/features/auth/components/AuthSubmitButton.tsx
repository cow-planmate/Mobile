import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
  Dimensions,
  PixelRatio,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import PressableScale from './PressableScale';
import { RADIUS } from '../authTokens';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

const PRIMARY = '#1344FF';
const PRIMARY_DARK = '#0F36D6';

const FADE = { duration: 180, easing: Easing.out(Easing.quad) };

interface AuthSubmitButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  /**
   * 아직 다음으로 넘어갈 수 없는 상태.
   * 눌리지 않게 막지는 않는다. 회색으로 죽여 두면 무엇이 모자란지 알려줄
   * 기회가 사라지므로, 흐리게만 두고 누르면 이유를 띄운다.
   */
  muted?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** 인증 화면의 주 버튼. 로딩은 라벨과 스피너를 겹쳐 교차 전환한다. */
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
        baseColor={PRIMARY}
        pressedColor={PRIMARY_DARK}
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
          <ActivityIndicator color="#FFFFFF" />
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
    height: normalize(52),
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    overflow: 'hidden',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: normalize(16),
    fontFamily: 'Pretendard Variable',
    fontWeight: '600',
    lineHeight: normalize(24),
    color: '#FFFFFF',
    letterSpacing: 0,
  },
});
