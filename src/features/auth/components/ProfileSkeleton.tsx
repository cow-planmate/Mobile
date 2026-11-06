import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
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
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

/** 이 시간 안에 끝나는 로딩에는 뼈대를 보이지 않는다. 번쩍였다 사라지는 것을 막는다. */
export const SKELETON_DELAY_MS = 1000;

type BoneProps = {
  progress: SharedValue<number>;
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** 회색 두 단계를 오가는 한 조각. 모든 조각이 같은 진행 값을 써서 함께 깜빡인다. */
const Bone = ({ progress, width, height, radius = 6, style }: BoneProps) => {
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
        { width, height, borderRadius: normalize(radius) },
        animated,
        style,
      ]}
    />
  );
};

const TASTE_ROWS = 3;

/**
 * 마이페이지 프로필 탭의 뼈대. 실제 화면(프로필 머리, 취향 카드)과 같은 자리·크기로 짠다.
 */
export default function ProfileSkeleton() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration: 650, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [visible, reduceMotion, progress]);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="프로필을 불러오는 중"
    >
      {visible && (
        <View testID="profile-skeleton-bones">
          <View style={styles.head}>
            <View style={styles.headRow}>
              <Bone
                progress={progress}
                width={normalize(56)}
                height={normalize(56)}
                radius={28}
              />
              <View style={styles.nameBlock}>
                <Bone
                  progress={progress}
                  width={normalize(96)}
                  height={normalize(18)}
                />
                <Bone
                  progress={progress}
                  width={normalize(150)}
                  height={normalize(12)}
                />
              </View>
            </View>
            <Bone
              progress={progress}
              width="100%"
              height={normalize(40)}
              radius={10}
            />
          </View>

          <View style={styles.band} />

          <View style={styles.tasteHeader}>
            <View style={styles.tasteHeaderText}>
              <Bone
                progress={progress}
                width={normalize(132)}
                height={normalize(16)}
              />
              <Bone
                progress={progress}
                width={normalize(72)}
                height={normalize(11)}
              />
            </View>
            <Bone
              progress={progress}
              width={normalize(44)}
              height={normalize(26)}
              radius={8}
            />
          </View>

          <View style={styles.tasteRows}>
            {Array.from({ length: TASTE_ROWS }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.tasteRow,
                  index === TASTE_ROWS - 1 && styles.tasteRowLast,
                ]}
              >
                <View style={styles.tasteRowLeft}>
                  <Bone
                    progress={progress}
                    width={normalize(34)}
                    height={normalize(34)}
                    radius={10}
                  />
                  <View style={styles.tasteRowText}>
                    <Bone
                      progress={progress}
                      width={normalize(52)}
                      height={normalize(13)}
                    />
                    <Bone
                      progress={progress}
                      width={normalize(70)}
                      height={normalize(10)}
                    />
                  </View>
                </View>
                <Bone
                  progress={progress}
                  width={normalize(56)}
                  height={normalize(22)}
                  radius={6}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  head: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(18),
    paddingBottom: normalize(15),
    gap: normalize(14),
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  nameBlock: {
    gap: normalize(8),
  },
  band: {
    height: normalize(20),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.pageGround,
  },
  tasteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(17),
  },
  tasteHeaderText: {
    gap: normalize(6),
  },
  tasteRows: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(6),
  },
  tasteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(11),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  tasteRowLast: {
    borderBottomWidth: 0,
  },
  tasteRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  tasteRowText: {
    gap: normalize(4),
  },
});
