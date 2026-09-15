import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import { tokens } from '../../../theme/tokens';
import { CATEGORY_COLORS } from '../components/TimelineItem.styles';
import type { CoachmarkDemo } from './coachmarkSteps';
import type { CoachmarkRect } from './measureTarget';

const COLORS = tokens.colors;
/** 시간표에 놓인 관광지 블록과 같은 색. 흉내가 진짜와 달라 보이면 안 된다. */
const BLOCK = CATEGORY_COLORS[0];

/** 손가락 자국의 지름. 진짜 손끝만 하게 둔다 - 더 크면 짚은 것을 가린다. */
const DOT = 30;
/** 들려 가는 카드의 크기. */
const CARD_W = 210;
const CARD_H = 58;

/** 한 바퀴에 걸리는 시간(ms). 눌렀다 끌고 놓고 쉬는 데까지다. */
const CYCLE_MS = 2900;

/**
 * 한 바퀴 안에서 무엇이 언제 일어나는지(0이 시작, 1이 끝).
 *
 * 값 하나를 처음부터 끝까지 고르게 돌리고 나머지는 전부 여기서 갈라 쓴다.
 * 애니메이션 여럿을 줄지어 붙이면 네이티브로 넘긴 구간과 아닌 구간이 섞여
 * 한 바퀴만 돌고 멈춘다.
 */
const PRESS_IN = 0.06;
const DRAG_FROM = 0.2;
const DRAG_TO = 0.62;
const FADE_FROM = 0.78;
const FADE_TO = 0.88;

interface CoachmarkGestureProps {
  /** 짚어 준 자리(안내가 그려지는 판 기준). */
  rect: CoachmarkRect;
  demo: CoachmarkDemo;
}

/**
 * 짚어 준 자리 위에서 손짓을 되풀이해 보여 준다.
 *
 * 글로만 '끌어올리면'이라고 적어 두면 어디를 잡아 어느 쪽으로 끄는 것인지가
 * 남지 않는다. 손가락만 움직이는 것으로도 모자란 자리가 있어, 끌려가는 것과
 * 그래서 어떻게 되는지까지 보여 준다.
 *
 * - carry: 카드를 들고 올라가 시간표에 놓이는 것까지
 * - grow: 손잡이를 끈 만큼 그 자리가 옅게 늘어나는 것까지
 * - point: 손가락만
 *
 * 손가락을 먹지 않는다. 이 겹은 그림일 뿐이고, 짚어 준 것은 그대로 눌린다.
 */
export default function CoachmarkGesture({
  rect,
  demo,
}: CoachmarkGestureProps) {
  // 기기에서 '동작 줄이기'를 켠 사람에게는 움직이지 않는다.
  const [reduceMotion, setReduceMotion] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.())
      .then(enabled => {
        if (alive) setReduceMotion(!!enabled);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    progress.setValue(0);
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: CYCLE_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, progress]);

  /** 손가락이 처음 놓이는 자리. */
  const start = useMemo(
    () => ({
      left: rect.x + rect.width * demo.fromX - DOT / 2,
      top: rect.y + rect.height * demo.fromY - DOT / 2,
    }),
    [rect, demo],
  );

  /** 끌려가는 길. 가운데를 빠르게, 끝을 느리게 - 진짜 손이 그렇게 움직인다. */
  const travel = useMemo(() => {
    const span = DRAG_TO - DRAG_FROM;
    const path = [
      { at: 0, gone: 0 },
      { at: DRAG_FROM, gone: 0 },
      { at: DRAG_FROM + span * 0.3, gone: 0.22 },
      { at: DRAG_FROM + span * 0.7, gone: 0.86 },
      { at: DRAG_TO, gone: 1 },
      { at: FADE_TO, gone: 1 },
      { at: 1, gone: 0 },
    ];
    return {
      inputRange: path.map(point => point.at),
      gone: path.map(point => point.gone),
      x: path.map(point => point.gone * demo.dx),
      y: path.map(point => point.gone * demo.dy),
    };
  }, [demo]);

  if (reduceMotion) return null;

  const moving = {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: travel.inputRange,
          outputRange: travel.x,
        }),
      },
      {
        translateY: progress.interpolate({
          inputRange: travel.inputRange,
          outputRange: travel.y,
        }),
      },
    ],
  };

  /** 카드는 놓이는 순간 손에서 떠난다 - 그때부터는 놓인 자리가 대신 보인다. */
  const carriedOpacity = progress.interpolate({
    inputRange: [0, PRESS_IN, DRAG_TO, DRAG_TO + 0.06],
    outputRange: [0, 1, 1, 0],
  });
  const droppedOpacity = progress.interpolate({
    inputRange: [0, DRAG_TO, DRAG_TO + 0.06, FADE_FROM, FADE_TO],
    outputRange: [0, 0, 1, 1, 0],
  });

  const cardAt = {
    left: start.left + DOT / 2 - CARD_W / 2,
    top: start.top + DOT / 2 - CARD_H / 2,
  };

  // 늘어나는 자리는 아래를 붙박아 둔 채 위로 자란다. 높이를 직접 바꾸는 대신
  // 눌러 편 비율을 쓰고, 줄어든 만큼 내려 밀어 아랫변을 제자리에 둔다 -
  // 그래야 네이티브 쪽에서 그려져 끊기지 않는다.
  const grow = Math.abs(demo.dy);

  return (
    <>
      {/* 끈 만큼 옅게 늘어난다. 진하게 칠하면 흉내가 진짜 블록처럼 보여
          어느 쪽이 지금 것인지 흐려진다. */}
      {demo.kind === 'grow' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.grow,
            demo.dy < 0 ? styles.growUp : styles.growDown,
            {
              left: rect.x,
              top: demo.dy < 0 ? rect.y - grow : rect.y + rect.height,
              width: rect.width,
              height: grow,
              opacity: progress.interpolate({
                inputRange: [0, PRESS_IN, FADE_FROM, FADE_TO],
                outputRange: [0, 0.45, 0.45, 0],
              }),
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: travel.inputRange,
                    outputRange: travel.gone.map(
                      gone =>
                        ((demo.dy < 0 ? 1 : -1) * (grow * (1 - gone))) / 2,
                    ),
                  }),
                },
                {
                  scaleY: progress.interpolate({
                    inputRange: travel.inputRange,
                    outputRange: travel.gone,
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {/* 놓이는 자리. 손이 떠난 뒤에 자리를 이어받는다. */}
      {demo.kind === 'carry' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dropped,
            {
              left: cardAt.left + demo.dx,
              top: cardAt.top + demo.dy,
              opacity: droppedOpacity,
            },
          ]}
        >
          <View style={styles.droppedLines}>
            <View style={styles.droppedLine} />
            <View style={[styles.droppedLine, styles.lineShort]} />
          </View>
        </Animated.View>
      )}

      {/* 들려 가는 카드. 손가락과 같은 길을 같은 속도로 간다. */}
      {demo.kind === 'carry' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.card,
            cardAt,
            {
              opacity: carriedOpacity,
              // 손에 들려 살짝 기운다. moving과 한 묶음이어야 둘 다 걸린다.
              transform: [...moving.transform, { rotate: '-2deg' }],
            },
          ]}
        >
          <View style={styles.cardThumb} />
          <View style={styles.cardLines}>
            <View style={styles.cardLine} />
            <View style={[styles.cardLine, styles.lineShort]} />
          </View>
        </Animated.View>
      )}

      <Animated.View
        testID="coachmark-gesture"
        pointerEvents="none"
        style={[
          styles.root,
          start,
          {
            opacity: progress.interpolate({
              inputRange: [0, PRESS_IN, FADE_FROM, FADE_TO, 1],
              outputRange: [0, 1, 1, 0, 0],
            }),
          },
          moving,
        ]}
      >
        {/* 눌리는 순간 번지는 테두리. 손끝이 닿았다는 것만 알리고 사라진다. */}
        <Animated.View
          style={[
            styles.halo,
            {
              opacity: progress.interpolate({
                inputRange: [0, PRESS_IN, DRAG_FROM],
                outputRange: [0.5, 0.35, 0],
              }),
              transform: [
                {
                  scale: progress.interpolate({
                    inputRange: [0, PRESS_IN, DRAG_FROM],
                    outputRange: [0.5, 1.2, 1.9],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [
                {
                  scale: progress.interpolate({
                    inputRange: [0, PRESS_IN, DRAG_FROM],
                    outputRange: [0.8, 1.06, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DOT / 2,
    backgroundColor: COLORS.primary,
  },
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    elevation: 8,
  },
  cardThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  cardLines: {
    flex: 1,
    gap: 7,
  },
  cardLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  lineShort: {
    width: '55%',
  },
  dropped: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: BLOCK.border,
    backgroundColor: BLOCK.bg,
  },
  droppedLines: {
    gap: 7,
  },
  droppedLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: BLOCK.border,
    opacity: 0.55,
  },
  grow: {
    position: 'absolute',
    backgroundColor: BLOCK.bg,
  },
  growUp: {
    borderTopWidth: 2,
    borderTopColor: BLOCK.border,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  growDown: {
    borderBottomWidth: 2,
    borderBottomColor: BLOCK.border,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
