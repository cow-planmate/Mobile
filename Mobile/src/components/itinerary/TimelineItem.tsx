import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';

import { styles } from './TimelineItem.styles';

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
  type: '관광지' | '숙소' | '식당';
  categoryId?: number;
  startTime: string;
  endTime: string;
  address: string;
  rating: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
};

type TimelineItemProps = {
  item: Place;
  onDelete: () => void;
  onEditTime: (type: 'startTime' | 'endTime') => void;
  style?: object;
};

const TimelineItem = React.memo(function TimelineItem({
  item,
  onDelete,
  onEditTime,
  style,
}: TimelineItemProps) {
  const durationMinutes =
    timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
  const isCompact = durationMinutes < IS_COMPACT_VIEW_THRESHOLD_MINUTES;

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.card}>
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
                ⭐️ {item.rating} · {item.type}
              </Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {item.address}
              </Text>
            </>
          )}
        </View>
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>x</Text>
        </Pressable>
      </View>
    </View>
  );
});

export default TimelineItem;
