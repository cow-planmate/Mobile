import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { tokens } from '../../theme/tokens';

const PRIMARY = tokens.colors.primary;
const TRACK = tokens.colors.border;

/** 큰 것은 화면 한가운데, 작은 것은 줄 사이에 놓는다. */
const SIZES = {
  large: { diameter: 40, stroke: 3.5 },
  small: { diameter: 20, stroke: 2.5 },
} as const;

const SPIN_MS = 1400;
const SPIN_MS_REDUCED = 3200;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  /** 호 아래 깔리는 연한 원의 색. 파란 버튼 안처럼 원이 거슬리는 곳에서는 'transparent'. */
  trackColor?: string;
}

/**
 * 연한 원 위를 파란 호가 늘었다 줄며 도는 로딩 표시. 자리를 차지하는 틀 없이 그림만 그린다.
 * 모션 줄이기를 켠 기기에서는 호 길이를 고정하고 천천히 돌려, 멈춘 것처럼 보이지 않게 한다.
 */
export function Spinner({
  size = 'small',
  color = PRIMARY,
  trackColor = TRACK,
}: SpinnerProps) {
  const { diameter, stroke } = SIZES[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const reduceMotion = useReducedMotion();

  const rotation = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, {
        duration: reduceMotion ? SPIN_MS_REDUCED : SPIN_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    if (!reduceMotion) {
      breath.value = withRepeat(
        withTiming(1, {
          duration: SPIN_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false,
      );
    }
  }, [reduceMotion, rotation, breath]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  const arcProps = useAnimatedProps(() => {
    if (reduceMotion) {
      return {
        strokeDasharray: [circumference * 0.4, circumference],
        strokeDashoffset: 0,
      };
    }
    const arc = interpolate(breath.value, [0, 0.5, 1], [0.06, 0.6, 0.06]);
    const offset = interpolate(breath.value, [0, 0.5, 1], [0, -0.16, -0.88]);
    return {
      strokeDasharray: [circumference * arc, circumference],
      strokeDashoffset: circumference * offset,
    };
  });

  return (
    <Animated.View style={spinStyle}>
      <Svg width={diameter} height={diameter}>
        <Circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          animatedProps={arcProps}
        />
      </Svg>
    </Animated.View>
  );
}

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

/** 큰 것은 남는 자리 한가운데에, 작은 것은 줄 사이에 놓는 틀까지 포함한 로딩 표시. */
export default function LoadingSpinner({
  size = 'large',
  color = PRIMARY,
}: LoadingSpinnerProps) {
  return (
    <View
      style={[
        styles.container,
        size === 'large' ? styles.fullScreen : styles.inline,
      ]}
    >
      <Spinner size={size} color={color} />
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
});
