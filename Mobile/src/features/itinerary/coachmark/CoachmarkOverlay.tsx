import React, { useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { tokens } from '../../../theme/tokens';
import type { CoachmarkStep } from './coachmarkSteps';
import type { CoachmarkRect } from './measureTarget';

const COLORS = tokens.colors;
const FONTS = tokens.fontFamily;

const SCRIM = 'rgba(10, 13, 20, 0.76)';
const TIP_MAX_WIDTH = 300;
const TIP_GAP = 12;
const EDGE = 16;
const ARROW = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

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
 * 웹처럼 그림자를 크게 번지게 해 구멍을 뚫는 수가 없어 어두운 판 넷으로 둘러싼다.
 * 판을 하나로 두고 구멍만 투명하게 만들려면 마스크가 필요한데, 그러자고 라이브러리를
 * 하나 더 들이는 것보다 네 조각이 싸다.
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

  const radius =
    step.shape === 'circle' ? Math.max(hole.width, hole.height) / 2 : 14;

  const tipWidth = Math.min(TIP_MAX_WIDTH, winWidth - EDGE * 2);
  const holeCenterX = hole.x + hole.width / 2;
  const holeBottom = hole.y + hole.height;
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
  const arrowTop = fitsBelow ? tipTop - ARROW / 2 : tipTop + tipHeight - ARROW / 2;

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
        {/* 어두운 판 넷 */}
        <View
          style={[
            styles.scrim,
            styles.scrimTop,
            { width: winWidth, height: hole.y },
          ]}
        />
        <View
          style={[
            styles.scrim,
            styles.scrimLeftEdge,
            {
              top: holeBottom,
              width: winWidth,
              height: Math.max(0, winHeight - holeBottom),
            },
          ]}
        />
        <View
          style={[
            styles.scrim,
            styles.scrimLeftEdge,
            { top: hole.y, width: hole.x, height: hole.height },
          ]}
        />
        <View
          style={[
            styles.scrim,
            {
              left: hole.x + hole.width,
              top: hole.y,
              width: Math.max(0, winWidth - hole.x - hole.width),
              height: hole.height,
            },
          ]}
        />

        {/* 구멍 테두리 - 어디를 보라는 것인지 가장자리로 못박는다. */}
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
  scrim: {
    position: 'absolute',
    backgroundColor: SCRIM,
  },
  scrimTop: {
    left: 0,
    top: 0,
  },
  scrimLeftEdge: {
    left: 0,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
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
