import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BedDouble from 'lucide-react-native/dist/esm/icons/bed-double';
import ExternalLink from 'lucide-react-native/dist/esm/icons/external-link';
import Landmark from 'lucide-react-native/dist/esm/icons/landmark';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import MessageSquareText from 'lucide-react-native/dist/esm/icons/message-square-text';
import Sparkles from 'lucide-react-native/dist/esm/icons/sparkles';
import Utensils from 'lucide-react-native/dist/esm/icons/utensils';
import FallbackImage from '../../../components/common/FallbackImage';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { toSecureImageUrl } from '../../../utils/imageUrl';
import { buildKakaoMapUrl } from '../../../utils/kakaoMapLink';
import { openExternalUrl } from '../../../utils/externalLink';
import {
  CATEGORY_NAMES,
  Place,
  resolveCategoryId,
} from './TimelineItem';

/** 웹의 완성 화면과 같은 표기. 2026년 9월 5일 (금) */
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const formatFullDate = (date?: Date | null): string => {
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${
    WEEKDAYS[date.getDay()]
  })`;
};

/**
 * 다 짠 일정을 읽는 목록만의 갈래 색.
 *
 * 편집 화면(TimelineItem.styles)의 색을 빌려 쓰지 않는다 — 거기 식당은 파랑이라
 * 앱 기본색과 겹치고 관광지는 앱 어디에도 없는 연두다. 여기서는 앱이 이미 가진
 * tones만 쓴다.
 */
const CATEGORY_TONE: Record<number, { bg: string; fg: string }> = {
  0: tokens.tones.primary,
  1: tokens.tones.warning,
  2: tokens.tones.place,
  3: tokens.tones.custom,
  4: tokens.tones.neutral,
};

const CATEGORY_ICON: Record<
  number,
  React.ComponentType<{ size: number; color: string; strokeWidth: number }>
> = {
  0: Landmark,
  1: BedDouble,
  2: Utensils,
  3: Sparkles,
  4: MapPin,
};

const toneFor = (categoryId: number) =>
  CATEGORY_TONE[categoryId] ?? CATEGORY_TONE[4];

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
  /** 카카오맵으로 넘길 주소. 없으면 넘길 길이 없는 곳이다. */
  mapUrl?: string;
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
    mapUrl: buildKakaoMapUrl({
      placeUrl: place.place_url,
      name: place.name,
      coords: { lat: place.latitude, lng: place.longitude },
      searchQuery: [place.name, place.address].filter(Boolean).join(' '),
    }),
  };
};

const CategoryChip = ({ entry }: { entry: ScheduleEntry }) => {
  const tone = toneFor(entry.categoryId);
  const Icon = CATEGORY_ICON[entry.categoryId] ?? CATEGORY_ICON[4];
  return (
    <View style={[styles.chip, { backgroundColor: tone.bg }]}>
      <Icon size={normalize(11)} color={tone.fg} strokeWidth={2} />
      <Text style={[styles.chipText, { color: tone.fg }]}>
        {entry.categoryName}
      </Text>
    </View>
  );
};

const ScheduleRow = React.memo(
  ({
    entry,
    isFirst,
    isLast,
    continueRail,
    showMapLink,
    onPress,
  }: {
    entry: ScheduleEntry;
    isFirst: boolean;
    isLast: boolean;
    /** 마지막 줄 아래로 이음줄을 더 내릴지. 닫는 표시가 뒤따를 때만 참이다. */
    continueRail: boolean;
    showMapLink?: boolean;
    onPress?: () => void;
  }) => {
    const memo = entry.memo?.trim();
    const photo = toSecureImageUrl(entry.photoUrl);
    const canOpenMap = !!showMapLink && !!entry.mapUrl;

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
          {!!entry.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{entry.badge}</Text>
            </View>
          )}
        </View>

        {/* 시각을 잇는 줄. 첫 곳만 짚어 어디서 하루가 시작하는지 보이게 한다. */}
        <View style={styles.rail}>
          {!isFirst && <View style={[styles.railLine, styles.railLineTop]} />}
          <View
            style={[
              styles.railDot,
              {
                backgroundColor: isFirst
                  ? tokens.colors.primary
                  : tokens.colors.border,
              },
            ]}
          />
          {continueRail && (
            <View style={[styles.railLine, styles.railLineBottom]} />
          )}
        </View>

        {/* 실선은 이음줄을 건드리지 않고 내용 쪽만 끊는다 — 메모가 긴 곳과 다음 곳이 붙어 보이지 않게. */}
        <View style={[styles.body, !isLast && styles.bodyDivided]}>
          <CategoryChip entry={entry} />
          <Text style={styles.name} numberOfLines={2}>
            {entry.name}
          </Text>
          {!!entry.subtitle && (
            <Text style={styles.address} numberOfLines={2}>
              {entry.subtitle}
            </Text>
          )}
          {!!memo && (
            <View style={styles.memoRow}>
              <MessageSquareText
                size={normalize(12)}
                color={tokens.colors.primary}
                strokeWidth={2}
              />
              <Text style={styles.memo} numberOfLines={3}>
                {memo}
              </Text>
            </View>
          )}
          {canOpenMap && (
            <TouchableOpacity
              style={styles.mapLink}
              onPress={() => openExternalUrl(entry.mapUrl)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="link"
              accessibilityLabel={`${entry.name} 지도에서 보기`}
            >
              <ExternalLink
                size={normalize(12)}
                color={tokens.colors.primary}
                strokeWidth={2}
              />
              <Text style={styles.mapLinkText}>지도에서 보기</Text>
            </TouchableOpacity>
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
        endLabel="하루 마무리"
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
  endLabel,
  showMapLink,
  onPressEntry,
}: {
  entries: ScheduleEntry[];
  emptyText?: string;
  /** 마지막 줄 아래를 닫는 표시. 하루를 고른 목록에서만 뜻이 통한다. */
  endLabel?: string;
  /** 남의 일정처럼 앱 안에서 더 볼 것이 없는 곳에 카카오맵으로 넘길 길을 낸다. */
  showMapLink?: boolean;
  onPressEntry?: (entry: ScheduleEntry, index: number) => void;
}) {
  if (entries.length === 0) {
    return emptyText ? <Text style={styles.empty}>{emptyText}</Text> : null;
  }

  const closingTime = endLabel ? entries[entries.length - 1].endTime : undefined;

  return (
    <>
      {entries.map((entry, index) => (
        <ScheduleRow
          key={entry.key}
          entry={entry}
          isFirst={index === 0}
          isLast={index === entries.length - 1}
          continueRail={index < entries.length - 1 || !!endLabel}
          showMapLink={showMapLink}
          onPress={onPressEntry ? () => onPressEntry(entry, index) : undefined}
        />
      ))}

      {/* 마지막 장소에서 줄이 그냥 끊기면 스크롤이 덜 된 것처럼 보인다. */}
      {!!endLabel && (
        <View style={styles.endRow}>
          <Text style={styles.endTimeText}>{closingTime ?? ''}</Text>
          <View style={styles.endRail}>
            <View style={styles.endRailLine} />
            <View style={styles.endDot} />
          </View>
          <Text style={styles.endLabel}>{endLabel}</Text>
        </View>
      )}
    </>
  );
}

const DOT = normalize(9);
const RAIL_WIDTH = normalize(16);
const DOT_TOP = normalize(15);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(32),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: normalize(20),
    paddingBottom: normalize(14),
  },
  headerTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: normalize(17),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  headerDate: {
    marginTop: normalize(3),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  headerCount: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textTertiary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeColumn: {
    width: normalize(46),
    alignItems: 'flex-end',
    paddingTop: normalize(12),
  },
  startTime: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  endTime: {
    marginTop: normalize(1),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    marginTop: normalize(5),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
    backgroundColor: tokens.colors.borderLight,
  },
  badgeText: {
    fontSize: normalize(9.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },

  rail: {
    width: RAIL_WIDTH,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: normalize(6),
  },
  railDot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    marginTop: DOT_TOP,
  },
  railLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: tokens.colors.border,
  },
  railLineTop: {
    top: 0,
    height: DOT_TOP,
  },
  railLineBottom: {
    top: DOT_TOP + DOT,
    bottom: 0,
  },

  body: {
    flex: 1,
    minWidth: 0,
    paddingTop: normalize(12),
    paddingBottom: normalize(14),
    paddingRight: normalize(12),
  },
  bodyDivided: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
  },
  chipText: {
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.bold,
  },
  name: {
    marginTop: normalize(6),
    fontSize: normalize(15),
    lineHeight: normalize(20),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
    letterSpacing: -0.2,
  },
  // 주소는 한 단 물러난다 — 눈이 이름과 메모에 먼저 가야 한다.
  address: {
    marginTop: normalize(3),
    fontSize: normalize(12),
    lineHeight: normalize(17),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  memoRow: {
    marginTop: normalize(7),
    paddingTop: normalize(7),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(5),
  },
  memo: {
    flex: 1,
    fontSize: normalize(12),
    lineHeight: normalize(17),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
  },
  mapLink: {
    marginTop: normalize(7),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  mapLinkText: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },

  photo: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(6),
    marginTop: normalize(12),
  },
  photoEmpty: {
    backgroundColor: tokens.colors.borderLight,
  },

  endRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: normalize(4),
  },
  endTimeText: {
    width: normalize(46),
    textAlign: 'right',
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  endRail: {
    width: RAIL_WIDTH,
    alignItems: 'center',
    marginHorizontal: normalize(6),
    height: normalize(18),
  },
  endRailLine: {
    position: 'absolute',
    top: 0,
    height: normalize(4),
    width: 1,
    backgroundColor: tokens.colors.border,
  },
  endDot: {
    marginTop: normalize(4),
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: tokens.colors.primary,
  },
  endLabel: {
    flex: 1,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textTertiary,
  },

  empty: {
    paddingVertical: normalize(48),
    textAlign: 'center',
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
});
