import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';

import { styles, CATEGORY_COLORS } from './TimelineItem.styles';

const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const IS_COMPACT_VIEW_THRESHOLD_MINUTES = 30;

export type Place = {
  id: string; // Internal Block ID (or temp ID)
  placeRefId?: string; // External Reference ID (e.g., Google Place ID)
  name: string;
  type: '관광지' | '숙소' | '식당' | '직접 추가' | '검색' | '기타';
  categoryId?: number;
  startTime: string;
  endTime: string;
  address: string;
  rating: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
  memo?: string;
  place_url?: string;
};

type TimelineItemProps = {
  item: Place;
  onDelete: () => void;
  onEditTime: (type: 'startTime' | 'endTime') => void;
  onPress?: () => void;
  style?: object;
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
}: TimelineItemProps) {
  const durationMinutes =
    timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
  const isCompact = durationMinutes < IS_COMPACT_VIEW_THRESHOLD_MINUTES;

  const categoryId = item.categoryId ?? 4;
  const categoryColor =
    CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] ||
    CATEGORY_COLORS[4];
  const categoryName = CATEGORY_NAMES[categoryId] || item.type || '기타';

  return (
    <Pressable style={[styles.cardContainer, style]} onPress={onPress}>
      <View
        style={[
          styles.card,
          {
            borderLeftColor: categoryColor.border,
            backgroundColor: categoryColor.bg,
          },
        ]}
      >
        <View style={styles.infoContainer}>
          {!isCompact && (
            <View style={styles.timeRow}>
              <TouchableOpacity onPress={() => onEditTime('startTime')}>
                <Text style={styles.timeTextEditable}>{item.startTime}</Text>
              </TouchableOpacity>
              <Text style={styles.timeText}> ~ </Text>
              <TouchableOpacity onPress={() => onEditTime('endTime')}>
                <Text style={styles.timeTextEditable}>{item.endTime}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>

          {!isCompact && (
            <>
              <Text style={styles.metaText} numberOfLines={1}>
                ⭐️ {item.rating} · {categoryName}
              </Text>
              {item.memo ? (
                <Text style={styles.memoText} numberOfLines={2}>
                  "{item.memo}"
                </Text>
              ) : (
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.address}
                </Text>
              )}
            </>
          )}
        </View>
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>x</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

export default TimelineItem;
