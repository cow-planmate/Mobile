// src/components/itinerary/TimelineItem.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
} from 'react-native';

const COLORS = {
  primary: '#1344FF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  error: '#FF3B30',
  lightGray: '#F0F0F5',
};

export type Place = {
  id: string;
  name: string;
  type: '관광지' | '숙소' | '식당';
  startTime: string; // '10:00' 형식
  endTime: string; // '11:30' 형식
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

export default function TimelineItem({
  item,
  onDelete,
  onEditTime,
  style,
}: TimelineItemProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          <View style={styles.timeRow}>
            <TouchableOpacity onPress={() => onEditTime('startTime')}>
              <Text style={styles.timeTextEditable}>{item.startTime}</Text>
            </TouchableOpacity>
            <Text style={styles.timeText}> ~ </Text>
            <TouchableOpacity onPress={() => onEditTime('endTime')}>
              <Text style={styles.timeTextEditable}>{item.endTime}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            ⭐️ {item.rating} · {item.type}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 90,
    alignItems: 'stretch',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    alignItems: 'center',
    overflow: 'hidden', // ⭐️ 수정: 컨텐츠가 카드를 벗어나지 않도록 잘라냄
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  timeTextEditable: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
