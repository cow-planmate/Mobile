import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { tokens } from '../../../theme/tokens';
import { CATEGORY_NAMES, resolveCategoryId, type Place } from './TimelineItem';
import { CATEGORY_COLORS } from './TimelineItem.styles';

const FONTS = tokens.fontFamily;

const WIDTH = 210;
const HEIGHT = 54;
/** 손끝보다 조금 위에 들린다. 카드가 손가락을 덮으면 어디를 짚었는지 모른다. */
const LIFT_ABOVE = 14;

interface PlaceDragGhostProps {
  /** 집힌 장소. 없으면 아무것도 그리지 않는다. */
  place: Omit<Place, 'startTime' | 'endTime'> | null;
  /** 손끝의 화면 좌표. */
  x: SharedValue<number>;
  y: SharedValue<number>;
  /** 들려 있는 정도(0이 놓임, 1이 들림). 집고 놓을 때 이 값만 움직인다. */
  lift: SharedValue<number>;
}

/**
 * 시트에서 집은 장소가 손끝에 들려 시간표로 따라가는 카드.
 *
 * 집은 자리는 흐려지기만 하고 손끝에는 아무것도 없었다. 어디로 가져가는
 * 중인지가 점선 하나로만 남아, 놓기 전까지 무엇을 옮기는지 보이지 않았다.
 *
 * 놓이면 될 시간표 블록과 같은 모양을 입는다 - 흰 면에 갈래 색 막대 하나.
 * 사진을 얹은 목록 카드 모양으로 들면 무엇으로 바뀔지가 손에 남지 않는다.
 * 떠 있는 상태라 블록과 달리 그림자를 얹어 아래 블록과 구분한다.
 *
 * 손끝 좌표는 화면 기준으로 들어오고 이 카드는 화면 맨 위 겹에 그대로
 * 얹히므로, 자리를 옮겨 적을 것 없이 받은 값을 그대로 쓴다.
 *
 * 손가락을 먹지 않는다 - 끌기는 원래대로 아래 목록의 제스처가 맡는다.
 */
export default function PlaceDragGhost({
  place,
  x,
  y,
  lift,
}: PlaceDragGhostProps) {
  const style = useAnimatedStyle(() => ({
    opacity: lift.value,
    transform: [
      { translateX: x.value - WIDTH / 2 },
      { translateY: y.value - HEIGHT / 2 - LIFT_ABOVE },
      // 놓는 순간 살짝 오므라들며 사라진다.
      { scale: 0.9 + 0.1 * lift.value },
    ],
  }));

  if (!place) return null;

  const categoryId = resolveCategoryId(place);
  const color =
    CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] ||
    CATEGORY_COLORS[4];

  return (
    <Animated.View
      testID="place-drag-ghost"
      pointerEvents="none"
      style={[styles.root, style]}
    >
      <View style={[styles.accentBar, { backgroundColor: color.border }]} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {CATEGORY_NAMES[categoryId] || place.type}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: WIDTH,
    height: HEIGHT,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.white,
    // 흰 블록 위를 지날 때 구분은 그림자가 맡는다.
    ...tokens.shadows.md,
    zIndex: 900,
  },
  accentBar: {
    width: 3,
    borderRadius: 999,
    marginRight: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    minWidth: 0,
  },
  name: {
    fontFamily: FONTS.semibold,
    fontSize: 14.5,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  meta: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
});
