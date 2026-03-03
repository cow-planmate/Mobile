import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const DOT_COUNT = 3;
const DOT_SIZE = 10;
const PRIMARY = '#1344FF';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

function BounceDot({
  index,
  color,
  dotSize,
}: {
  index: number;
  color: string;
  dotSize: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    const delay = index * 150;
    const timer = setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(-dotSize, {
          duration: 400,
          easing: Easing.bezier(0.33, 0, 0.67, 1),
        }),
        -1,
        true,
      );
      opacity.value = withRepeat(
        withTiming(1, {
          duration: 400,
          easing: Easing.bezier(0.33, 0, 0.67, 1),
        }),
        -1,
        true,
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [index, dotSize, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
          marginHorizontal: dotSize * 0.4,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function LoadingSpinner({
  size = 'large',
  color = PRIMARY,
}: LoadingSpinnerProps) {
  const dotSize = size === 'large' ? DOT_SIZE : 6;

  return (
    <View
      style={[
        styles.container,
        size === 'large' ? styles.fullScreen : styles.inline,
      ]}
    >
      <View style={styles.dotRow}>
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <BounceDot key={i} index={i} color={color} dotSize={dotSize} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  inline: {
    paddingVertical: 12,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
