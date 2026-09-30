import React from 'react';
import { StyleSheet, Text } from 'react-native';
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
 * 놓이면 될 시간표 블록과 같은 색을 입는다. 사진과 그림자를 얹은 목록 카드
 * 모양으로 들면 무엇으로 바뀔지가 손에 남지 않는다.
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
      style={[
        styles.root,
        {
          backgroundColor: color.bg,
          borderColor: color.border,
          borderLeftColor: color.border,
        },
        style,
      ]}
    >
      <Text style={[styles.name, { color: color.textMain }]} numberOfLines={1}>
        {place.name}
      </Text>
      <Text style={[styles.meta, { color: color.textSub }]} numberOfLines={1}>
        {CATEGORY_NAMES[categoryId] || place.type}
      </Text>
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
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 12,
    borderRadius: 8,
    // 블록 위를 지날 때 같은 색끼리 뭉개지지 않게 테두리를 한 줄 두른다.
    // 그림자를 지운 자리를 이 줄이 대신한다.
    borderWidth: 1.5,
    borderLeftWidth: 4,
    zIndex: 900,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
  },
  meta: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
  },
});
