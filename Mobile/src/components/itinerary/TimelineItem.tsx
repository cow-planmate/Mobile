// src/components/itinerary/TimelineItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';

const COLORS = {
  primary: '#007AFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
};

// 이 컴포넌트가 받을 데이터의 타입을 정의
export type Place = {
  id: string;
  name: string;
  type: '관광지' | '숙소' | '식당';
  time: string;
  address: string;
  rating: number;
  imageUrl: string;
};

type TimelineItemProps = {
  item: Place;
};

export default function TimelineItem({ item }: TimelineItemProps) {
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
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeText: {
    width: 60,
    fontSize: 14,
    color: COLORS.placeholder,
    fontWeight: '600',
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
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 22,
  },
});
