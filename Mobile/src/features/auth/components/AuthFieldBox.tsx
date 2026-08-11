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
import { sf, sp } from '../../../design/scale';

export type FieldState = 'default' | 'focus' | 'error' | 'success';

const BORDER_COLOR: Record<FieldState, string> = {
  default: COLORS.border,
  focus: COLORS.primary,
  error: COLORS.errorBorder,
  success: COLORS.success,
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

const LABEL_COLOR: Record<FieldState, string> = {
  default: COLORS.textSecondary,
  focus: COLORS.primary,
  error: COLORS.error,
  success: COLORS.textSecondary,
};

/** 라벨 글자 높이. 절반이 테두리 위로, 절반이 아래로 걸친다. */
const LABEL_HEIGHT = sp(TYPO.caption.lineHeight);

interface AuthFieldBoxProps {
  state?: FieldState;
  /** 테두리를 그리는 박스에 적용된다. */
  style?: StyleProp<ViewStyle>;
  /**
   * 바깥 감싸개에 적용된다. 라벨이 있으면 박스가 한 겹 안으로 들어가므로,
   * fieldRow 안에서 flex를 주는 것처럼 바깥에 걸어야 하는 값은 이쪽에 넘긴다.
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * 테두리 선 위에 얹을 라벨. 박스 안에 한 줄을 따로 차지하지 않으므로
   * 칸 높이가 68에서 52로 줄어든다.
   */
  label?: string;
  /**
   * 라벨 뒤를 덮을 색. 라벨은 테두리 선을 가리고 앉으므로 칸 배경과 같아야
   * 선이 글자를 관통하지 않는다. 잠긴 칸처럼 배경이 다르면 함께 넘긴다.
   */
  labelBackground?: string;
  children?: React.ReactNode;
}

/**
 * 인증 화면의 입력 칸.
 *
 * 상태가 바뀌면 테두리와 라벨 색이 함께 전환된다. 라벨을 화면이 직접
 * 그리면 상태를 따로 내려줘야 하므로 여기서 함께 맡는다.
 */
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

  /*
   * 라벨을 박스 바깥으로 넘치게 두면 안드로이드에서 잘릴 수 있다.
   * 감싸개가 라벨 높이의 절반을 미리 비워 두고, 라벨은 그 안에 머문다.
   */
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
  /** 감싸개 맨 위. 박스 윗변이 라벨 한가운데를 지난다. */
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
