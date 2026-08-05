import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

export type FieldState = 'default' | 'focus' | 'error' | 'success';

const BORDER_COLOR: Record<FieldState, string> = {
  default: '#E5E7EB',
  focus: '#1344FF',
  error: '#FF3B30',
  success: '#34C759',
};

const DURATION = 160;

/**
 * 입력 칸의 테두리 색을 부드럽게 갈아 끼운다.
 *
 * 상태를 인덱스로 두고 보간하면 default에서 success로 갈 때 focus와 error 색이
 * 스쳐 지나간다. 직전 색과 목표 색 두 개만 들고 그 사이를 건넌다.
 *
 * 굵기는 상태와 무관하게 고정한다. 포커스될 때만 굵어지면 박스 크기가 함께
 * 바뀌어 입력 중에 글자가 흔들린다.
 */
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

interface AuthFieldBoxProps {
  state?: FieldState;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/** 인증 화면의 입력 칸 테두리. 상태가 바뀌면 색이 전환된다. */
export default function AuthFieldBox({
  state = 'default',
  style,
  children,
}: AuthFieldBoxProps) {
  const animatedStyle = useAnimatedBorderColor(BORDER_COLOR[state]);
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
