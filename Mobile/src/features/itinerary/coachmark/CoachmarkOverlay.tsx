import React, { useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '../../../theme/tokens';
import type { CoachmarkStep } from './coachmarkSteps';
import type { CoachmarkRect } from './measureTarget';

const COLORS = tokens.colors;
const FONTS = tokens.fontFamily;

// 웹 CreateTutorial의 스포트라이트를 그대로 옮긴 값들.
// 흰 테두리 안쪽, 파란 링 바깥쪽, 그 밖은 어둡게 — 세 겹이 한 벌이다.
const SCRIM = 'rgba(2, 6, 23, 0.65)';
const GLOW = 'rgba(19, 68, 255, 0.72)';
const GLOW_WIDTH = 4;
const HOLE_RADIUS = 16;
const TIP_MAX_WIDTH = 300;
const TIP_GAP = 12;
const EDGE = 16;
const ARROW = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/** 둥근 네모 한 바퀴. 반지름이 절반을 넘으면 그대로 동그라미가 된다. */
const roundedRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  return (
    `M${x + r},${y}` +
    `H${x + width - r}A${r},${r} 0 0 1 ${x + width},${y + r}` +
    `V${y + height - r}A${r},${r} 0 0 1 ${x + width - r},${y + height}` +
    `H${x + r}A${r},${r} 0 0 1 ${x},${y + height - r}` +
    `V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`
  );
};

interface CoachmarkOverlayProps {
  step: CoachmarkStep;
  index: number;
  total: number;
  rect: CoachmarkRect;
  onNext: () => void;
  onSkip: () => void;
}

/**
 * 화면을 어둡게 덮고 짚을 것 하나만 남긴다.
 *
 * 어두운 판 넷으로 둘러싸던 것을 길 하나로 바꿨다. 판으로는 구멍이 네모로만
 * 뚫려 둥근 테두리 바깥 귀퉁이가 밝게 남았고, 귀퉁이를 조각으로 메우면
 * RN이 모서리 반지름을 제 맘대로 줄여 안쪽이 별 모양으로 파였다.
 * 화면 전체와 구멍을 한 길에 담고 evenodd로 칠하면 구멍만 정확히 비워진다.
 */
export default function CoachmarkOverlay({
  step,
  index,
  total,
  rect,
  onNext,
  onSkip,
}: CoachmarkOverlayProps) {
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  // 말풍선을 위에 둘지 아래에 둘지는 높이를 알아야 정해진다. 재기 전에는 숨긴다.
  const [tipHeight, setTipHeight] = useState(0);

  const padding = step.padding ?? (step.shape === 'circle' ? 6 : 5);

  const hole = useMemo(() => {
    const x = Math.max(0, rect.x - padding);
    const y = Math.max(0, rect.y - padding);
    return {
      x,
      y,
      width: Math.max(0, Math.min(winWidth - x, rect.width + padding * 2)),
      height: Math.max(0, Math.min(winHeight - y, rect.height + padding * 2)),
    };
  }, [rect, padding, winWidth, winHeight]);

  const holeBottom = hole.y + hole.height;

  const radius =
    step.shape === 'circle'
      ? Math.max(hole.width, hole.height) / 2
      : HOLE_RADIUS;

  const tipWidth = Math.min(TIP_MAX_WIDTH, winWidth - EDGE * 2);
  const holeCenterX = hole.x + hole.width / 2;
  const tipLeft = clamp(
    holeCenterX - tipWidth / 2,
    EDGE,
    Math.max(EDGE, winWidth - EDGE - tipWidth),
  );

  const fitsBelow = holeBottom + TIP_GAP + tipHeight <= winHeight - EDGE;
  const tipTop = fitsBelow
    ? holeBottom + TIP_GAP
    : Math.max(EDGE, hole.y - TIP_GAP - tipHeight);

  const arrowLeft = clamp(
    holeCenterX - ARROW / 2,
    tipLeft + 14,
    tipLeft + tipWidth - 14 - ARROW,
  );
  const arrowTop = fitsBelow
    ? tipTop - ARROW / 2
    : tipTop + tipHeight - ARROW / 2;

  const isLast = index === total - 1;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      // statusBarTranslucent를 켜면 창이 상태바까지 덮어 measureInWindow가 준
      // 좌표와 상태바 높이만큼 어긋난다.
      onRequestClose={onSkip}
    >
      <View style={styles.root} accessibilityViewIsModal>
        {/* 화면 전체를 덮되 구멍만 비운다 */}
        <Svg
          style={StyleSheet.absoluteFill}
          width={winWidth}
          height={winHeight}
          pointerEvents="none"
        >
          <Path
            d={`M0,0H${winWidth}V${winHeight}H0Z ${roundedRectPath(
              hole.x,
              hole.y,
              hole.width,
              hole.height,
              radius,
            )}`}
            fill={SCRIM}
            fillRule="evenodd"
          />
        </Svg>

        {/* 구멍 테두리 - 어디를 보라는 것인지 가장자리로 못박는다.
          웹처럼 두 겹으로 두른다. 파란 링이 어두운 판 위로 번져 나가고,
          흰 테두리가 짚은 것의 윤곽을 딴다. 흰 줄 하나만으로는 어두운 바탕에
          묻혀 '네모 하나 쳐 놓은' 것으로 보인다. */}
        <View
          pointerEvents="none"
          style={[
            styles.glowRing,
            {
              left: hole.x - GLOW_WIDTH,
              top: hole.y - GLOW_WIDTH,
              width: hole.width + GLOW_WIDTH * 2,
              height: hole.height + GLOW_WIDTH * 2,
              borderRadius: radius + GLOW_WIDTH,
            },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              left: hole.x,
              top: hole.y,
              width: hole.width,
              height: hole.height,
              borderRadius: radius,
            },
          ]}
        />

        <View
          style={[
            styles.tip,
            {
              left: tipLeft,
              top: tipTop,
              width: tipWidth,
              opacity: tipHeight ? 1 : 0,
            },
          ]}
          onLayout={event => setTipHeight(event.nativeEvent.layout.height)}
        >
          <Text style={styles.tipTitle}>{step.title}</Text>
          <Text style={styles.tipBody}>{step.body}</Text>
          {/* 안내는 이제 스스로 뜨지 않는다. 다시 보는 길을 마지막에 일러둔다. */}
          {isLast && (
            <Text style={styles.tipReplay}>
              오른쪽 아래 물음표를 누르면 다시 볼 수 있어요.
            </Text>
          )}
          <View style={styles.tipFoot}>
            <Text style={styles.tipCount}>
              {index + 1} / {total}
            </Text>
            <View style={styles.tipButtons}>
              <TouchableOpacity
                onPress={onSkip}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="안내 건너뛰기"
              >
                <Text style={styles.tipSkip}>건너뛰기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onNext}
                style={styles.tipNext}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={isLast ? '안내 완료' : '다음 안내'}
              >
                <Text style={styles.tipNextText}>
                  {isLast ? '완료' : '다음'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 말풍선 뒤가 아니라 위에 그려야 카드와 만나는 자리의 이음매가 가려진다. */}
        {tipHeight > 0 && (
          <View
            pointerEvents="none"
            style={[styles.arrow, { left: arrowLeft, top: arrowTop }]}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: GLOW_WIDTH,
    borderColor: GLOW,
  },
  tip: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 12,
  },
  arrow: {
    position: 'absolute',
    width: ARROW,
    height: ARROW,
    backgroundColor: COLORS.white,
    transform: [{ rotate: '45deg' }],
  },
  tipTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  tipBody: {
    marginTop: 5,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  tipReplay: {
    marginTop: 8,
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.primary,
  },
  tipFoot: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipCount: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  tipButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipSkip: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  tipNext: {
    height: 30,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNextText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
});
