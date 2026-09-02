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

/** 시각 목록 한 줄이 필요로 하는 값. 완성 화면과 여행기가 같은 모양을 쓰도록 추린다. */
export type ScheduleEntry = {
  key: string;
  startTime: string;
  endTime?: string;
  categoryId: number;
  categoryName: string;
  name: string;
  subtitle?: string;
  memo?: string;
  photoUrl?: string;
  /** 여러 날을 한 번에 볼 때 며칠차인지 짚어 주는 짧은 꼬리표. */
  badge?: string;
};

export const placeToEntry = (place: Place): ScheduleEntry => {
  const categoryId = resolveCategoryId(place);
  return {
    key: place.id,
    startTime: place.startTime,
    endTime: place.endTime,
    categoryId,
    categoryName: CATEGORY_NAMES[categoryId] || place.type || '기타',
    name: place.name,
    subtitle: place.address,
    memo: place.memo ?? undefined,
    photoUrl: place.imageUrl,
  };
};

const ScheduleRow = React.memo(
  ({
    entry,
    isFirst,
    isLast,
    onPress,
  }: {
    entry: ScheduleEntry;
    isFirst: boolean;
    isLast: boolean;
    onPress?: () => void;
  }) => {
    const color =
      CATEGORY_COLORS[entry.categoryId as keyof typeof CATEGORY_COLORS] ??
      CATEGORY_COLORS[4];
    const memo = entry.memo?.trim();
    const photo = toSecureImageUrl(entry.photoUrl);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`${entry.startTime} ${entry.name}`}
      >
        <View style={styles.timeColumn}>
          <Text style={styles.startTime}>{entry.startTime}</Text>
          {!!entry.endTime && (
            <Text style={styles.endTime}>~{entry.endTime}</Text>
          )}
          {!!entry.badge && <Text style={styles.badge}>{entry.badge}</Text>}
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
            {entry.categoryName}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {entry.name}
          </Text>
          {!!entry.subtitle && (
            <Text style={styles.address} numberOfLines={2}>
              {entry.subtitle}
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

      <ScheduleTimeline
        entries={places.map(placeToEntry)}
        emptyText="이 날에는 아직 일정이 없어요"
        onPressEntry={
          onPressPlace
            ? (_entry, index) => onPressPlace(places[index])
            : undefined
        }
      />
    </View>
  );
}

/** 시각·이음줄·장소로 이어지는 목록. 헤더 없이 줄만 그린다. */
export function ScheduleTimeline({
  entries,
  emptyText,
  onPressEntry,
}: {
  entries: ScheduleEntry[];
  emptyText?: string;
  onPressEntry?: (entry: ScheduleEntry, index: number) => void;
}) {
  if (entries.length === 0) {
    return emptyText ? <Text style={styles.empty}>{emptyText}</Text> : null;
  }

  return (
    <>
      {entries.map((entry, index) => (
        <ScheduleRow
          key={entry.key}
          entry={entry}
          isFirst={index === 0}
          isLast={index === entries.length - 1}
          onPress={onPressEntry ? () => onPressEntry(entry, index) : undefined}
        />
      ))}
    </>
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
  badge: {
    marginTop: 3,
    fontSize: 10,
    fontFamily: tokens.fontFamily.semibold,
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
