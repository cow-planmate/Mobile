// src/components/itinerary/TimelineItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';

const COLORS = {
  primary: '#007AFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  error: '#FF3B30', // 삭제 버튼을 위한 색상
};

export type Place = {
  id: string;
  name: string;
  type: '관광지' | '숙소' | '식당';
  time: string;
  address: string;
  rating: number;
  imageUrl: string;
};

// ⭐️ 1. onDelete prop 추가
type TimelineItemProps = {
  item: Place;
  onDelete: () => void;
};

export default function TimelineItem({ item, onDelete }: TimelineItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{item.time}</Text>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.metaText}>
            ⭐️ {item.rating} · {item.type}
          </Text>
          <Text style={styles.metaText}>{item.address}</Text>
        </View>
        {/* ⭐️ 2. '+' 버튼을 '삭제' 버튼으로 변경하고 onPress에 onDelete 연결 */}
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  timeText: {
    width: 60,
    fontSize: 14,
    color: COLORS.placeholder,
    fontWeight: '600',
    paddingTop: 5,
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
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
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
  // ⭐️ 3. 삭제 버튼 스타일 추가
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
