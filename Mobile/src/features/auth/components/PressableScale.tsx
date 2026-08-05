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

/** 누를 때는 빠르게 들어가고, 뗄 때는 살짝 튀며 돌아온다. */
const PRESS_IN = { duration: 90, easing: Easing.out(Easing.quad) };
const PRESS_OUT = { damping: 14, stiffness: 260, mass: 0.5 };

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** 배경색을 함께 전환하려면 두 값을 모두 넘긴다. */
  baseColor?: string;
  pressedColor?: string;
  /** 눌렀을 때 줄어드는 비율 */
  scaleTo?: number;
  children?: React.ReactNode;
}

/**
 * 눌림을 애니메이션으로 알리는 Pressable.
 *
 * Pressable에 스타일 함수를 넘기면 눌린 상태의 스타일이 전환 없이 즉시
 * 바뀐다. TouchableOpacity가 최소한 투명도는 애니메이션하던 것과 달리
 * 아무 움직임도 남지 않아, 눌렀는지 알기 어려웠다.
 */
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
