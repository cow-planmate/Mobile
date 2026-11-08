import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

/** 이 시간 안에 끝나는 로딩에는 뼈대를 보이지 않는다. 번쩍였다 사라지는 것을 막는다. */
export const SKELETON_DELAY_MS = 1000;

const PULSE_MS = 650;

const PulseContext = createContext<SharedValue<number> | null>(null);

type SkeletonProps = PropsWithChildren<{
  /** 스크린 리더가 읽는 문구. 예: '게시글을 불러오는 중' */
  label: string;
  style?: StyleProp<ViewStyle>;
  /** 조각들을 감싸는 안쪽 틀의 스타일. 조각 사이 간격을 줄 때 쓴다. */
  contentStyle?: StyleProp<ViewStyle>;
  delayMs?: number;
}>;

/**
 * 로딩 중인 자리를 회색 조각(Bone)으로 먼저 보여 주는 틀.
 *
 * 기준 시간(기본 1초)이 지나기 전에는 아무것도 그리지 않고, 지나면 모든 조각이
 * 같은 진행 값으로 함께 깜빡인다. 모션 줄이기를 켠 기기에서는 회색만 보인다.
 */
export function Skeleton({
  label,
  style,
  contentStyle,
  delayMs = SKELETON_DELAY_MS,
  children,
}: SkeletonProps) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  useEffect(() => {
    if (!visible || reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [visible, reduceMotion, progress]);

  return (
    <View
      style={style}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      {visible && (
        <PulseContext.Provider value={progress}>
          <View testID="skeleton-bones" style={contentStyle}>
            {children}
          </View>
        </PulseContext.Provider>
      )}
    </View>
  );
}

type Size = number | `${number}%`;

type BoneProps = {
  width: Size;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

const scale = (value: Size) =>
  typeof value === 'number' ? normalize(value) : value;

/** 회색 두 단계(바탕 회색과 선 회색)를 오가는 조각 하나. Skeleton 안에서만 깜빡인다. */
export function Bone({ width, height, radius = 6, style }: BoneProps) {
  const own = useSharedValue(0);
  const progress = useContext(PulseContext) ?? own;
  const animated = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [tokens.colors.pageGround, tokens.colors.border],
    ),
  }));
  return (
    <Animated.View
      style={[
        {
          width: scale(width),
          height: normalize(height),
          borderRadius: normalize(radius),
        },
        animated,
        style,
      ]}
    />
  );
}

export const skeletonStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
