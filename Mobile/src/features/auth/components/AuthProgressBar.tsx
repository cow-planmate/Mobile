import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../authTokens';
import { sf } from '../../../utils/normalize';

interface AuthProgressBarProps {
  step: number;
  totalSteps: number;
}

const AuthProgressBar = React.memo(({ step, totalSteps }: AuthProgressBarProps) => {
  const progress = useSharedValue(step / totalSteps);

  useEffect(() => {
    progress.value = withTiming(step / totalSteps, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [step, totalSteps, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.bar, animatedStyle]} />
    </View>
  );
});

export default AuthProgressBar;

const styles = StyleSheet.create({
  track: {
    flex: 1,
    height: sf(4),
    borderRadius: sf(2),
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: sf(2),
    backgroundColor: COLORS.primary,
  },
});
