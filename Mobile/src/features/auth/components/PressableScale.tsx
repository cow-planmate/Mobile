import React, { useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_IN = { duration: 90, easing: Easing.out(Easing.quad) };
const PRESS_OUT = { damping: 14, stiffness: 260, mass: 0.5 };

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;

  baseColor?: string;
  pressedColor?: string;

  scaleTo?: number;
  children?: React.ReactNode;
}

export default function PressableScale({
  style,
  baseColor,
  pressedColor,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const pressed = useSharedValue(0);
  const tintable = !!baseColor && !!pressedColor;

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      pressed.value = withTiming(1, PRESS_IN);
      onPressIn?.(event);
    },
    [onPressIn, pressed],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      pressed.value = withSpring(0, PRESS_OUT);
      onPressOut?.(event);
    },
    [onPressOut, pressed],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - (1 - scaleTo) * pressed.value;
    if (!tintable) {
      return { transform: [{ scale }] };
    }
    return {
      transform: [{ scale }],
      backgroundColor: interpolateColor(
        pressed.value,
        [0, 1],
        [baseColor as string, pressedColor as string],
      ),
    };
  });

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
