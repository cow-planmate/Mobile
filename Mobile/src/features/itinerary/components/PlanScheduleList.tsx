import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FallbackImage from '../../../components/common/FallbackImage';
import { tokens } from '../../../theme/tokens';
import { toSecureImageUrl } from '../../../utils/imageUrl';
import {
  CATEGORY_NAMES,
  Place,
  resolveCategoryId,
} from './TimelineItem';
import { CATEGORY_COLORS } from './TimelineItem.styles';

/** 웹의 완성 화면과 같은 표기. 2026년 9월 5일 (금) */
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const formatFullDate = (date?: Date | null): string => {
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${
    WEEKDAYS[date.getDay()]
  })`;
};

const ScheduleRow = React.memo(
  ({
    place,
    isFirst,
    isLast,
    onPress,
  }: {
    place: Place;
    isFirst: boolean;
    isLast: boolean;
    onPress?: () => void;
  }) => {
    const categoryId = resolveCategoryId(place);
    const color = CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS];
    const categoryName = CATEGORY_NAMES[categoryId] || place.type || '기타';
    const memo = place.memo?.trim();
    const photo = toSecureImageUrl(place.imageUrl);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`${place.startTime} ${place.name}`}
      >
        <View style={styles.timeColumn}>
          <Text style={styles.startTime}>{place.startTime}</Text>
          <Text style={styles.endTime}>~{place.endTime}</Text>
        </View>

        {/* 시각을 잇는 줄. 첫 곳만 갈래 색으로 짚어 시작을 보이게 한다. */}
        <View style={styles.rail}>
          {!isFirst && <View style={[styles.railLine, styles.railLineTop]} />}
          <View
            style={[
              styles.railDot,
              { backgroundColor: isFirst ? color.border : tokens.colors.border },
            ]}
          />
          {!isLast && <View style={[styles.railLine, styles.railLineBottom]} />}
        </View>

        <View style={styles.body}>
          <Text style={[styles.category, { color: color.textSub }]}>
            {categoryName}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {place.name}
          </Text>
          {!!place.address && (
            <Text style={styles.address} numberOfLines={2}>
              {place.address}
            </Text>
          )}
          {!!memo && (
            <Text style={styles.memo} numberOfLines={3}>
              {memo}
            </Text>
          )}
        </View>

        {!!photo && (
          <FallbackImage
            uri={photo}
            style={styles.photo}
            fallback={<View style={[styles.photo, styles.photoEmpty]} />}
          />
        )}
      </TouchableOpacity>
    );
  },
);

/**
 * 완성된 일정의 하루치 목록.
 *
 * 편집 화면은 시간 눈금 위에 카드를 얹어 길이로 시간을 보여주지만, 다 짠 일정을
 * 훑을 때는 빈 시간까지 스크롤하게 되어 읽기 나쁘다. 그래서 여기서는 시각을
 * 왼쪽에 적고 장소만 차례로 잇는다.
 */
export default function PlanScheduleList({
  places,
  dateLabel,
  onPressPlace,
}: {
  places: Place[];
  dateLabel?: string;
  onPressPlace?: (place: Place) => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>상세 일정</Text>
          {!!dateLabel && <Text style={styles.headerDate}>{dateLabel}</Text>}
        </View>
        <Text style={styles.headerCount}>
          {places.length > 0 ? `${places.length}곳` : ''}
        </Text>
      </View>

      {places.length === 0 ? (
        <Text style={styles.empty}>이 날에는 아직 일정이 없어요</Text>
      ) : (
        places.map((place, index) => (
          <ScheduleRow
            key={place.id}
            place={place}
            isFirst={index === 0}
            isLast={index === places.length - 1}
            onPress={onPressPlace ? () => onPressPlace(place) : undefined}
          />
        ))
      )}
    </View>
  );
}

const DOT = 9;
const RAIL_WIDTH = 14;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  headerDate: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  headerCount: {
    fontSize: 12,
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textTertiary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeColumn: {
    width: 46,
    alignItems: 'flex-end',
    paddingTop: 14,
  },
  startTime: {
    fontSize: 13,
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  endTime: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },

  rail: {
    width: RAIL_WIDTH,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: 6,
  },
  railDot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    marginTop: 16,
  },
  railLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: tokens.colors.border,
  },
  railLineTop: {
    top: 0,
    height: 16,
  },
  railLineBottom: {
    top: 16 + DOT,
    bottom: 0,
  },

  body: {
    flex: 1,
    minWidth: 0,
    paddingTop: 12,
    paddingBottom: 18,
    paddingRight: 12,
  },
  category: {
    fontSize: 11,
    fontFamily: tokens.fontFamily.semibold,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
    letterSpacing: -0.2,
  },
  address: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  memo: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },

  photo: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginTop: 12,
  },
  photoEmpty: {
    backgroundColor: tokens.colors.borderLight,
  },

  empty: {
    paddingVertical: 48,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
});
