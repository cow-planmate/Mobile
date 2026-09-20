import React from 'react';
import Info from 'lucide-react-native/dist/esm/icons/info';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import XIcon from 'lucide-react-native/dist/esm/icons/x';
import { View, Text, TouchableOpacity } from 'react-native';

import { styles, CATEGORY_COLORS } from './TimelineItem.styles';
import { tokens } from '../../../theme/tokens';
import { timeToMinutes } from '../../../utils/timeUtils';
import { useCoachmarkTarget } from '../coachmark/CoachmarkContext';

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
  onEditTime?: (type: 'startTime' | 'endTime') => void;
  /** 장소 메모 및 시간 수정 모달을 여는 핸들러 */
  onEditPlace?: () => void;
  /** 어떤 곳인지 보는 길. 열쇠를 모르는 장소(직접 추가)에는 주지 않는다. */
  onShowDetail?: () => void;
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
  onEditTime,
  onEditPlace,
  onShowDetail,
  onPress,
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

  const textColorMain = categoryColor.textMain || tokens.colors.text;
  const textColorSub = categoryColor.textSub || tokens.colors.textSecondary;

  // 짧은 일정은 블록이 낮아 버튼도 같이 낮아진다. 눌리는 자리는 줄지 않게
  // 위아래로 더 벌려 둔다 - 손끝은 블록 높이를 따라 작아지지 않는다.
  const actionSlop = isCompact
    ? { top: 16, bottom: 16, left: 4 }
    : { top: 12, bottom: 12, left: 4 };
  // 지우기는 블록 오른쪽 끝에 붙어 있어 바깥쪽으로 더 내줄 수 있다.
  const deleteSlop = { ...actionSlop, right: 12 };

  return (
    <View style={[styles.cardContainer, style]}>
      <View
        style={[
          styles.card,
          {
            borderLeftColor: categoryColor.border,
            backgroundColor: categoryColor.bg,
          },
          isCompact && styles.cardCompact,
        ]}
      >
        <View style={styles.infoContainer}>
          <Text
            style={[styles.nameText, { color: textColorMain }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            <Text
              style={[styles.metaText, { color: textColorSub }]}
              numberOfLines={1}
            >
              {categoryName} | {item.startTime} - {item.endTime}
            </Text>
          </View>

          {/* 짧은 일정은 카드가 낮아 메모까지 넣으면 잘린다. */}
          {!isCompact && !!item.memo?.trim() && (
            <Text
              style={[styles.memoText, { color: textColorSub }]}
              numberOfLines={2}
            >
              {item.memo.trim()}
            </Text>
          )}
        </View>

        {!isReadOnly && (
          <View ref={actionsTarget} style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isCompact && styles.actionButtonCompact,
              ]}
              onPress={onEditPlace ?? (() => onEditTime?.('startTime'))}
              accessibilityRole="button"
              accessibilityLabel="일정 수정"
              hitSlop={actionSlop}
            >
              <Pencil size={16} color={textColorMain} />
            </TouchableOpacity>
            {!!onShowDetail && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isCompact && styles.actionButtonCompact,
                ]}
                onPress={onShowDetail}
                accessibilityRole="button"
                accessibilityLabel="장소 정보 보기"
                hitSlop={actionSlop}
              >
                <Info size={16} color={textColorMain} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.actionButton,
                isCompact && styles.actionButtonCompact,
                isDeleteDisabled && styles.actionButtonDisabled,
              ]}
              onPress={isDeleteDisabled ? undefined : onDelete}
              disabled={isDeleteDisabled}
              accessibilityRole="button"
              accessibilityLabel="장소 삭제"
              accessibilityState={{ disabled: isDeleteDisabled }}
              hitSlop={deleteSlop}
            >
              <XIcon size={18} color={textColorMain} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
});

export default TimelineItem;
