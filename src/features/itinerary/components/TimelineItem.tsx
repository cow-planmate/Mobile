import React, { useState } from 'react';
import Ellipsis from 'lucide-react-native/dist/esm/icons/ellipsis';
import { View, Text, TouchableOpacity } from 'react-native';

import { styles, CATEGORY_COLORS } from './TimelineItem.styles';
import BlockActionSheet, { type BlockAction } from './BlockActionSheet';
import { tokens } from '../../../theme/tokens';
import { timeToMinutes } from '../../../utils/timeUtils';
import { useCoachmarkTarget } from '../coachmark/CoachmarkContext';
import { buildNaverMapUrl } from '../../../utils/naverMapLink';
import { openExternalUrl } from '../../../utils/externalLink';

const IS_COMPACT_VIEW_THRESHOLD_MINUTES = 30;

export type Place = {
  id: string;
  placeRefId?: string;
  name: string;
  type: '관광지' | '숙소' | '식당' | '직접 추가' | '검색' | '기타';
  categoryId?: number;
  startTime: string;
  endTime: string;
  address: string;
  rating?: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
  memo?: string;
  place_url?: string;
  contentTypeId?: string;
  copyrightDivCd?: string;

  category?: string;
};

type TimelineItemProps = {
  item: Place;
  onDelete?: () => void;
  /** 장소 메모 및 시간 수정 모달을 여는 핸들러 */
  onEditPlace?: () => void;
  /** 어떤 곳인지 보는 길. 열쇠를 모르는 장소(직접 추가)에는 주지 않는다. */
  onShowDetail?: () => void;
  /** 지도 열기 핸들러 (지정하지 않으면 기본 네이버 지도 검색 URL 사용) */
  onOpenMap?: () => void;
  onPress?: () => void;
  style?: object;
  isReadOnly?: boolean;
  /** 첫 진입 안내가 수정·삭제를 짚을 블록 하나에만 켠다. */
  isTourAnchor?: boolean;
  /** 안내 투어가 실제로 실행 중인지 여부. 안내 중에만 앵커 블록의 삭제가 제한된다. */
  isTourRunning?: boolean;
};

/** 카드와 완성 화면이 같은 기준으로 갈래를 정하도록 한곳에 둔다. */
export const resolveCategoryId = (
  item: Partial<Pick<Place, 'categoryId' | 'category' | 'type'>>,
): number => {
  if (
    typeof item.categoryId === 'number' &&
    [0, 1, 2, 3, 4].includes(item.categoryId)
  ) {
    return item.categoryId;
  }
  const catStr = String(item.category || '');
  const typeStr = String(item.type || '');

  if (typeStr === '관광지' || catStr === 'ATTRACTION') return 0;
  if (typeStr === '숙소' || catStr === 'ACCOMMODATION') return 1;
  if (typeStr === '식당' || catStr === 'RESTAURANT') return 2;
  if (typeStr === '직접 추가' || catStr === 'FREE') return 3;
  if (typeStr === '검색' || catStr === 'SEARCH') return 4;
  return 4;
};

export const CATEGORY_NAMES: { [key: number]: string } = {
  0: '관광지',
  1: '숙소',
  2: '식당',
  3: '직접 추가',
  4: '검색',
};

const TimelineItem = React.memo(function TimelineItem({
  item,
  onDelete,
  onEditPlace,
  onShowDetail,
  onOpenMap,
  style,
  isReadOnly = false,
  isTourAnchor = false,
  isTourRunning = false,
}: TimelineItemProps) {
  const isDeleteDisabled = isTourAnchor && isTourRunning;
  const actionsTarget = useCoachmarkTarget(
    'blockActions',
    isTourAnchor && !isReadOnly,
  );
  const durationMinutes =
    timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
  const isCompact = durationMinutes < IS_COMPACT_VIEW_THRESHOLD_MINUTES;

  const categoryId = resolveCategoryId(item);
  const categoryColor =
    CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] ||
    CATEGORY_COLORS[4];
  const categoryName = CATEGORY_NAMES[categoryId] || item.type || '기타';

  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleOpenMap = () => {
    if (onOpenMap) {
      onOpenMap();
      return;
    }
    const mapUrl =
      item.place_url && /^https:\/\/map\.naver\.com\//i.test(item.place_url)
        ? item.place_url
        : buildNaverMapUrl({ name: item.name, address: item.address });
    if (mapUrl) {
      openExternalUrl(mapUrl);
    }
  };

  // 메뉴를 닫은 뒤에 동작을 부른다. 열려 있는 창 위에서 다른 창이 뜨지 않게 한다.
  const runAfterClose = (action?: () => void) => () => {
    setMenuOpen(false);
    action?.();
  };

  const timeRange = `${item.startTime.slice(0, 5)} – ${item.endTime.slice(0, 5)}`;
  const actions: BlockAction[] = [
    ...(onShowDetail
      ? [
          {
            key: 'detail',
            label: '장소 정보 보기',
            accessibilityLabel: '장소 정보 보기',
            description: '사진, 소개, 이용 시간',
            onPress: runAfterClose(onShowDetail),
          },
        ]
      : []),
    {
      key: 'map',
      label: '지도에서 보기',
      accessibilityLabel: '지도에서 보기',
      description: '지도 앱에서 열어요',
      onPress: runAfterClose(handleOpenMap),
    },
    {
      key: 'edit',
      label: '시간·메모 수정',
      accessibilityLabel: '일정 수정',
      description: `${timeRange} · ${item.memo?.trim() ? '메모 있음' : '메모 없음'}`,
      onPress: runAfterClose(onEditPlace),
    },
    {
      key: 'delete',
      label: '삭제',
      accessibilityLabel: '장소 삭제',
      description: '이 일정에서 장소를 빼요',
      onPress: runAfterClose(onDelete),
      destructive: true,
      disabled: isDeleteDisabled,
    },
  ];

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={[styles.card, isCompact && styles.cardCompact]}>
        {/* 카드를 누르면 바로 수정 창이 열린다. 길게 누르면 끌어 옮긴다. */}
        <TouchableOpacity
          style={[styles.head, isCompact && styles.headCompact]}
          onPress={isReadOnly ? undefined : onEditPlace}
          disabled={isReadOnly}
          activeOpacity={0.7}
          accessibilityRole={isReadOnly ? undefined : 'button'}
          accessibilityLabel={isReadOnly ? undefined : `${item.name} 수정`}
        >
          {/* 갈래 색은 이 막대에만 쓴다. */}
          <View
            style={[
              styles.accentBar,
              { backgroundColor: categoryColor.border },
            ]}
          />

          <View style={styles.infoContainer}>
            {isCompact ? (
              <Text style={styles.nameTextCompact} numberOfLines={1}>
                {item.name}
              </Text>
            ) : (
              <>
                <Text style={styles.nameText} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  {categoryName} · {item.startTime} - {item.endTime}
                </Text>
                {!!item.memo?.trim() && (
                  <Text style={styles.memoText} numberOfLines={2}>
                    {item.memo.trim()}
                  </Text>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>

        {!isReadOnly && (
          <View
            ref={actionsTarget}
            style={[styles.actionContainer, isCompact && styles.actionCompact]}
            testID="timeline-item-actions"
          >
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => setMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="장소 옵션 열기"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.6}
            >
              <Ellipsis size={20} color={tokens.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!isReadOnly && (
        <BlockActionSheet
          visible={isMenuOpen}
          title={item.name}
          subtitle={`${categoryName} · ${timeRange}`}
          imageUri={item.imageUrl}
          actions={actions}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </View>
  );
});

export default TimelineItem;
