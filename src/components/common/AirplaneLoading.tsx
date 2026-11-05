import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  DimensionValue,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { tokens } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PLANE_SIZE = 96;
const TRAIL_WIDTH = 100;
const SOFT = Easing.inOut(Easing.sin);

/**
 * 바탕색 위에 흰색을 amount만큼 섞은 불투명 색.
 *
 * 구름을 반투명으로 칠하면 덩어리가 겹친 자리의 경계가 비쳐서 한 덩어리로
 * 보이지 않는다. 바탕과 미리 섞은 색은 같은 밝기를 내면서 겹쳐도 경계가 없다.
 */
const mixWithWhite = (hex: string, amount: number) => {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(c + (255 - c) * amount);
  });
  return `rgb(${r}, ${g}, ${b})`;
};

const CLOUD_FAR = mixWithWhite(tokens.colors.primaryTint, 0.55);
const CLOUD_MID = mixWithWhite(tokens.colors.primaryTint, 0.8);
const CLOUD_NEAR = tokens.colors.white;

type CloudProps = {
  top: DimensionValue;
  width: number;
  /** 화면 오른쪽 끝에서 왼쪽 끝까지 가는 데 걸리는 시간. 짧을수록 가까운 구름이다. */
  duration: number;
  /** 처음 위치(0~1). 구름들이 한 줄로 출발하지 않게 흩어 놓는다. */
  startAt: number;
  /** 멀수록 바탕에 가까운 연한 색. 불투명하게 칠한다. */
  color: string;
};

const Cloud = ({ top, width, duration, startAt, color }: CloudProps) => {
  const progress = useSharedValue(startAt);

  useEffect(() => {
    progress.value = withSequence(
      withTiming(1, {
        duration: duration * (1 - startAt),
        easing: Easing.linear,
      }),
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration, easing: Easing.linear }),
        ),
        -1,
        false,
      ),
    );
  }, [duration, startAt, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: SCREEN_WIDTH - progress.value * (SCREEN_WIDTH + width) },
    ],
  }));

  const height = width * 0.3;
  const fill = { backgroundColor: color };
  return (
    <Animated.View
      style={[styles.cloudBase, { top, width, height }, animatedStyle]}
    >
      <View style={[styles.cloudPuff, fill, { borderRadius: height / 2 }]} />
      <View
        style={[
          styles.cloudPuff,
          styles.cloudBump,
          fill,
          {
            width: width * 0.34,
            height: width * 0.34,
            left: width * 0.14,
            bottom: height * 0.4,
          },
        ]}
      />
      <View
        style={[
          styles.cloudPuff,
          styles.cloudBump,
          fill,
          {
            width: width * 0.46,
            height: width * 0.46,
            right: width * 0.12,
            bottom: height * 0.3,
          },
        ]}
      />
    </Animated.View>
  );
};

const AirplaneLoading = () => {
  // 둥실: 느린 위아래 물결 위에, 박자가 다른 좌우 일렁임과 기수 끄덕임을 겹친다.
  const heave = useSharedValue(10);
  const swayX = useSharedValue(-9);
  const swayRotate = useSharedValue(-5);
  const trail = useSharedValue(0.6);
  const bar = useSharedValue(0);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    heave.value = withRepeat(
      withTiming(-20, { duration: 2600, easing: SOFT }),
      -1,
      true,
    );
    swayX.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1950, easing: SOFT }),
        withTiming(9, { duration: 1950, easing: SOFT }),
        withTiming(0, { duration: 1950, easing: SOFT }),
        withTiming(-9, { duration: 1950, easing: SOFT }),
      ),
      -1,
      false,
    );
    swayRotate.value = withRepeat(
      withSequence(
        withTiming(-11, { duration: 1950, easing: SOFT }),
        withTiming(-6, { duration: 1950, easing: SOFT }),
        withTiming(-1, { duration: 1950, easing: SOFT }),
        withTiming(-5, { duration: 1950, easing: SOFT }),
      ),
      -1,
      false,
    );
    trail.value = withRepeat(
      withTiming(1, { duration: 2600, easing: SOFT }),
      -1,
      true,
    );
    bar.value = withRepeat(
      withTiming(1, {
        duration: 1600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      -1,
      false,
    );
  }, [heave, swayX, swayRotate, trail, bar]);

  const flightStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: heave.value }],
  }));

  const planeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: swayX.value },
      { rotate: `${swayRotate.value}deg` },
    ],
  }));

  const trailStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + (trail.value - 0.6) * 1.125,
    transform: [{ scaleX: trail.value }],
  }));

  const fillWidth = trackWidth * 0.4;
  const fillStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -fillWidth + bar.value * (trackWidth + fillWidth) },
    ],
  }));

  const handleTrackLayout = (e: LayoutChangeEvent) =>
    setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="일정 정보를 불러오는 중"
    >
      {/* 상태바 뒤까지 하늘이 이어지므로 글자는 어두운 색으로 둔다. */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Cloud
          top="12%"
          width={120}
          duration={24000}
          startAt={0.1}
          color={CLOUD_FAR}
        />
        <Cloud
          top="80%"
          width={140}
          duration={28000}
          startAt={0.45}
          color={CLOUD_FAR}
        />
        <Cloud
          top="22%"
          width={160}
          duration={16000}
          startAt={0.4}
          color={CLOUD_MID}
        />
        <Cloud
          top="90%"
          width={160}
          duration={18000}
          startAt={0.2}
          color={CLOUD_MID}
        />
        {/* 제목(56%)과 겹치지 않도록 비행기 높이 근처로 올린다. 비행기가 앞을 지난다. */}
        <Cloud
          top="44%"
          width={220}
          duration={10000}
          startAt={0.4}
          color={CLOUD_NEAR}
        />
      </View>

      <Animated.View style={[styles.flight, flightStyle]}>
        <Animated.View style={[styles.trail, trailStyle]}>
          <Svg width={TRAIL_WIDTH} height={3}>
            <Defs>
              <LinearGradient id="trailFade" x1="0" y1="0" x2="1" y2="0">
                <Stop
                  offset="0"
                  stopColor={tokens.colors.primary}
                  stopOpacity={0}
                />
                <Stop
                  offset="1"
                  stopColor={tokens.colors.primary}
                  stopOpacity={0.3}
                />
              </LinearGradient>
            </Defs>
            <Rect
              width={TRAIL_WIDTH}
              height={3}
              rx={1.5}
              fill="url(#trailFade)"
            />
          </Svg>
        </Animated.View>
        <Animated.View style={planeStyle}>
          <Svg
            width={PLANE_SIZE}
            height={PLANE_SIZE}
            viewBox="0 0 576 512"
            fill={tokens.colors.primary}
          >
            <Path d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-8 6.4-13.4 6.4l-42 0c-7.8 0-13.6-7.3-11.7-14.8L35.6 256 1.7 142.8C-.2 135.3 5.6 128 13.4 128l42 0c5.4 0 10.4 2.4 13.4 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z" />
          </Svg>
        </Animated.View>
      </Animated.View>

      <View style={styles.copy}>
        <Text style={styles.title}>일정 정보를 불러오는 중...</Text>
        <Text style={styles.subtitle}>
          PlanMate가 당신의 완벽한 여행을 그리고 있어요
        </Text>
      </View>

      <View style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View style={[styles.fill, { width: fillWidth }, fillStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.primaryTint,
  },
  cloudBase: {
    position: 'absolute',
    left: 0,
  },
  cloudPuff: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: tokens.colors.white,
  },
  cloudBump: {
    borderRadius: tokens.radius.round,
  },
  flight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '27%',
    height: PLANE_SIZE,
    alignItems: 'center',
  },
  trail: {
    position: 'absolute',
    top: PLANE_SIZE / 2 - 1.5,
    right: '50%',
    marginRight: 38,
    width: TRAIL_WIDTH,
    height: 3,
    transformOrigin: 'right center',
  },
  copy: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '56%',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.m,
  },
  title: {
    fontSize: tokens.fontSize.l,
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: tokens.spacing.s,
    fontSize: tokens.fontSize.s,
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textMuted,
    textAlign: 'center',
  },
  track: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: '76%',
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.white,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: tokens.colors.primary,
  },
});

export default AirplaneLoading;
