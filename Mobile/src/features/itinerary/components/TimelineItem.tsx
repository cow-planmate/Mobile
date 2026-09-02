import React from 'react';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import XIcon from 'lucide-react-native/dist/esm/icons/x';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';

import { styles, CATEGORY_COLORS } from './TimelineItem.styles';
import { tokens } from '../../../theme/tokens';
import { timeToMinutes } from '../../../utils/timeUtils';

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
  onPress?: () => void;
  style?: object;
  isReadOnly?: boolean;
};

const CATEGORY_NAMES: { [key: number]: string } = {
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
  onPress,
  style,
  isReadOnly = false,
}: TimelineItemProps) {
  const durationMinutes =
    timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
  const isCompact = durationMinutes < IS_COMPACT_VIEW_THRESHOLD_MINUTES;

  const resolveCatId = () => {
    if (typeof item.categoryId === 'number' && [0, 1, 2, 3, 4].includes(item.categoryId)) {
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

  const categoryId = resolveCatId();
  const categoryColor =
    CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] ||
    CATEGORY_COLORS[4];
  const categoryName = CATEGORY_NAMES[categoryId] || item.type || '기타';

  const textColorMain = categoryColor.textMain || tokens.colors.text;
  const textColorSub = categoryColor.textSub || tokens.colors.textSecondary;

  return (
    <Pressable style={[styles.cardContainer, style]} onPress={onPress}>
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
        </View>

        {!isReadOnly && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isCompact && styles.actionButtonCompact,
              ]}
              onPress={() => onEditTime?.('startTime')}
              accessibilityRole="button"
              accessibilityLabel="시간 수정"
              hitSlop={{ top: 8, bottom: 8 }}
            >
              <Pencil size={16} color={textColorMain} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isCompact && styles.actionButtonCompact,
              ]}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel="장소 삭제"
              hitSlop={{ top: 8, bottom: 8, right: 8 }}
            >
              <XIcon size={18} color={textColorMain} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
});

export default TimelineItem;
