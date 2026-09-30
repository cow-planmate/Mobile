import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import XIcon from 'lucide-react-native/dist/esm/icons/x';
import { tokens } from '../../../theme/tokens';
import CoachmarkGesture from './CoachmarkGesture';
import type { CoachmarkStep } from './coachmarkSteps';
import { holeRect, type CoachmarkRect } from './measureTarget';

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
/**
 * 말풍선을 화면 끝으로 치울 때 위쪽에 남기는 자리.
 *
 * 상단바와 일차 탭 아래로 내려 앉힌다. 화면 맨 위에 붙이면 상태바에
 * 걸터앉고, 더 내리면 손짓이 지나갈 길을 막는다.
 */
const FAR_TOP = 200;
/**
 * 함께 밝힌 자리와 짚은 것 사이에 두는 어두운 틈.
 *
 * 둘이 맞닿으면 한 덩어리로 보여 어디가 놓는 곳이고 어디가 고르는 곳인지
 * 갈리지 않는다. 두 테두리가 서로 닿지 않을 만큼은 띄운다.
 */
const LIGHT_GAP = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * 어두운 곳을 덮는 벽이 손가락을 먹게 한다. 그냥 얹어 두기만 하면 리액트
 * 네이티브는 만지겠다고 나서지 않은 View를 그대로 통과시킨다.
 */
const claimTouch = () => true;

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
  /**
   * 짚은 것 말고 함께 밝혀 둘 자리. 어두운 막에 구멍만 하나 더 뚫는다 -
   * 테두리도 손가락 판정도 짚은 것 하나만 쓴다.
   */
  extraRect?: CoachmarkRect | null;
  /** 해보기를 권하는 한마디. 없으면 눌러 보라는 기본 안내가 들어간다. */
  practiceHint?: string | null;
  onNext: () => void;
  /** 앞 단계로. 첫 단계에서는 주지 않는다 - 돌아갈 곳이 없다. */
  onPrev?: () => void;
  onSkip: () => void;
}

/**
 * 화면을 어둡게 덮고 짚을 것 하나만 남긴다.
 *
 * Modal로 띄우지 않는다. Modal은 따로 뜬 창이라 구멍을 아무리 그려 넣어도
 * 손가락이 아래 화면에 닿지 못한다 - 밝게 그려진 유리일 뿐이었다. 같은 층에
 * 깔고 구멍 둘레에만 벽을 세우면 그 자리는 진짜로 비어 짚어 준 버튼이 눌린다.
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
  extraRect = null,
  practiceHint = null,
  onNext,
  onPrev,
  onSkip,
}: CoachmarkOverlayProps) {
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  // 말풍선을 위에 둘지 아래에 둘지는 높이를 알아야 정해진다. 재기 전에는 숨긴다.
  const [tipHeight, setTipHeight] = useState(0);

  const hole = useMemo(() => {
    const raw = holeRect(step, rect);
    const x = Math.max(0, raw.x);
    const y = Math.max(0, raw.y);
    return {
      x,
      y,
      width: Math.max(0, Math.min(winWidth - x, raw.width)),
      height: Math.max(0, Math.min(winHeight - y, raw.height)),
    };
  }, [step, rect, winWidth, winHeight]);

  /**
   * 함께 밝힐 자리. 화면 밖으로 나간 만큼과 짚은 구멍에 겹치는 만큼을 잘라 둔다.
   *
   * 구멍 둘을 한 길에 담아 evenodd로 칠하므로, 겹친 자리는 두 번 세어져 도로
   * 어두워진다. 시간표는 아래 패널 뒤까지 깔려 있어 그냥 두면 정작 짚어 준
   * 패널이 어둡게 남았다.
   */
  const alsoHole = useMemo(() => {
    if (!extraRect) return null;
    const x = Math.max(0, extraRect.x);
    const y = Math.max(0, extraRect.y);
    const width = Math.max(0, Math.min(winWidth - x, extraRect.width));
    let top = y;
    let bottom = y + Math.max(0, Math.min(winHeight - y, extraRect.height));
    const mainTop = Math.max(0, holeRect(step, rect).y);
    const mainBottom = mainTop + holeRect(step, rect).height;
    if (top < mainTop) {
      bottom = Math.min(bottom, mainTop - LIGHT_GAP);
    } else {
      top = Math.max(top, mainBottom + LIGHT_GAP);
    }
    return { x, y: top, width, height: Math.max(0, bottom - top) };
  }, [extraRect, step, rect, winWidth, winHeight]);

  const holeBottom = hole.y + hole.height;
  const holeRight = hole.x + hole.width;

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

  // 손짓이 짚은 것 밖으로 멀리 나가는 단계는 말풍선을 그 길에서 치운다.
  const holeAtBottom = hole.y + hole.height / 2 > winHeight / 2;
  // 아래로 뻗는 손짓을 덮지 않도록, 자리가 날 때는 위에 앉힌다.
  const preferAbove =
    !!step.tipAbove && hole.y - TIP_GAP - tipHeight >= EDGE && tipHeight > 0;
  const fitsBelow = step.tipAway
    ? !holeAtBottom
    : !preferAbove && holeBottom + TIP_GAP + tipHeight <= winHeight - EDGE;
  /**
   * 화면 끝으로 치울 때 얼마나 올릴지.
   *
   * 함께 밝힌 자리가 있으면 그 위에 붙인다 - 밝혀 놓고 그 위에 말풍선을
   * 얹으면 밝힌 뜻이 없어진다. 없으면 예전처럼 상단바 아래에 둔다.
   */
  const tipAwayTop =
    alsoHole && alsoHole.height > 0 && tipHeight > 0
      ? Math.max(EDGE, alsoHole.y - TIP_GAP - tipHeight)
      : Math.min(FAR_TOP, winHeight / 3);
  const tipTop = step.tipAway
    ? holeAtBottom
      ? tipAwayTop
      : Math.max(FAR_TOP, winHeight - EDGE - tipHeight)
    : fitsBelow
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
  // 눌러 보면 안 되는 것은 셋뿐이다 - coachmarkSteps.ts 참고.
  const isInteractive = step.interactive !== false;

  return (
    <View style={styles.root} pointerEvents="box-none">
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
          )}${
            alsoHole && alsoHole.height > 0
              ? ` ${roundedRectPath(
                  alsoHole.x,
                  alsoHole.y,
                  alsoHole.width,
                  alsoHole.height,
                  HOLE_RADIUS,
                )}`
              : ''
          }`}
          fill={SCRIM}
          fillRule="evenodd"
        />
      </Svg>

      {/* 손가락을 먹는 벽 넷. 어두운 곳은 그대로 막히고 구멍만 비어 있다.
          짚어 준 것을 눌러 볼 수 있는 단계에서는 이 자리에 아무것도 없어
          손가락이 진짜 버튼에 닿는다. */}
      <View
        style={[styles.wallTop, { width: winWidth, height: hole.y }]}
        onStartShouldSetResponder={claimTouch}
      />
      <View
        style={[
          styles.wallFlush,
          {
            top: holeBottom,
            width: winWidth,
            height: Math.max(0, winHeight - holeBottom),
          },
        ]}
        onStartShouldSetResponder={claimTouch}
      />
      <View
        style={[
          styles.wallFlush,
          { top: hole.y, width: hole.x, height: hole.height },
        ]}
        onStartShouldSetResponder={claimTouch}
      />
      <View
        style={[
          styles.wall,
          {
            left: holeRight,
            top: hole.y,
            width: Math.max(0, winWidth - holeRight),
            height: hole.height,
          },
        ]}
        onStartShouldSetResponder={claimTouch}
      />
      {/* 눌리면 되돌릴 수 없는 셋은 구멍까지 덮는다 - 보여 주기만 한다. */}
      {!isInteractive && (
        <View
          testID="coachmark-hole-block"
          style={[
            styles.wall,
            {
              left: hole.x,
              top: hole.y,
              width: hole.width,
              height: hole.height,
            },
          ]}
          onStartShouldSetResponder={claimTouch}
        />
      )}

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

      {/* 함께 밝힌 자리도 같은 두 겹으로 두른다 - 테두리가 없으면 어디까지가
          놓을 수 있는 곳인지 가장자리가 흐려진다. */}
      {!!alsoHole && alsoHole.height > 0 && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.glowRing,
              {
                left: alsoHole.x - GLOW_WIDTH,
                top: alsoHole.y - GLOW_WIDTH,
                width: alsoHole.width + GLOW_WIDTH * 2,
                height: alsoHole.height + GLOW_WIDTH * 2,
                borderRadius: HOLE_RADIUS + GLOW_WIDTH,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.ring,
              {
                left: alsoHole.x,
                top: alsoHole.y,
                width: alsoHole.width,
                height: alsoHole.height,
                borderRadius: HOLE_RADIUS,
              },
            ]}
          />
        </>
      )}

      {/* 짚어 준 것 위에서 손짓을 흉내 낸다. 말풍선보다 아래에 그려 말풍선이
          가려지지 않게 한다. */}
      {!!step.demo && <CoachmarkGesture rect={rect} demo={step.demo} />}

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
        <View style={styles.tipHead}>
          <Text style={styles.tipTitle}>{step.title}</Text>
          {/* 닫기는 글자 대신 X로 둔다 - 말풍선 어디에 있든 같은 자리에 있다. */}
          <TouchableOpacity
            onPress={onSkip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="안내 건너뛰기"
          >
            <XIcon color={COLORS.textTertiary} size={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles.tipBody}>{step.body}</Text>
        {!!step.note && (
          <View style={styles.tipNote}>
            <Text style={styles.tipNoteText}>{step.note}</Text>
          </View>
        )}
        {/* 해보기를 권하는 단계나 여러 버튼을 눌러보는 단계는 짚은 것을 눌렀다고 바로 넘어가지 않는다. */}
        {step.target === 'blockActions' ? (
          <Text style={styles.tipHint}>
            버튼을 눌러 확인해 보고 다음을 누르세요.
          </Text>
        ) : (
          (!!practiceHint || (isInteractive && !step.practice)) && (
            <Text style={styles.tipHint}>
              {practiceHint ?? '직접 눌러 보면 다음으로 넘어가요.'}
            </Text>
          )
        )}
        <View style={styles.tipFoot}>
          <Text style={styles.tipCount}>
            {index + 1} / {total}
          </Text>
          <View style={styles.tipButtons}>
            {!!onPrev && (
              <TouchableOpacity
                onPress={onPrev}
                style={styles.tipPrev}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="이전 안내"
              >
                <Text style={styles.tipPrevText}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onNext}
              style={styles.tipNext}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isLast ? '안내 완료' : '다음 안내'}
            >
              <Text style={styles.tipNextText}>{isLast ? '완료' : '다음'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 말풍선 뒤가 아니라 위에 그려야 카드와 만나는 자리의 이음매가 가려진다. */}
      {tipHeight > 0 && !step.tipAway && (
        <View
          pointerEvents="none"
          style={[styles.arrow, { left: arrowLeft, top: arrowTop }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    // 시간표 블록은 끌 때 elevation 8까지 올라간다. 그 위에 서야 한다.
    zIndex: 1000,
    elevation: 24,
  },
  wall: {
    position: 'absolute',
  },
  wallTop: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  wallFlush: {
    position: 'absolute',
    left: 0,
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
  tipHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tipTitle: {
    flexShrink: 1,
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
  /** 본문에 이어지는 보조 설명. 본문과 같은 시작선에서 읽히도록 둔다. */
  tipNote: {
    marginTop: 8,
  },
  tipNoteText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textTertiary,
  },
  tipHint: {
    marginTop: 7,
    fontFamily: FONTS.semibold,
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
  tipNext: {
    height: 30,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  /** 되돌아가는 쪽은 테두리만 둔다 - 파랑 둘이 나란히 서면 어느 쪽이 앞인지 흐려진다. */
  tipPrev: {
    height: 30,
    paddingHorizontal: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipPrevText: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tipNextText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
});
