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
  primary: '#1344FF', // 기본 색상 #1344FF로 통일
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  error: '#FF3B30',
  lightGray: '#F0F2F5', // 연한 회색 추가
};

export type Place = {
  id: string;
  name: string;
  type: '관광지' | '숙소' | '식당';
  time: string;
  address: string;
  rating: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
};

type TimelineItemProps = {
  item: Place;
  onDelete: () => void;
  onEditTime: () => void;
};

export default function TimelineItem({
  item,
  onDelete,
  onEditTime,
}: TimelineItemProps) {
  return (
    <View style={styles.container}>
      {/* 1. 시간 표시 영역 */}
      <View style={styles.timeContainer}>
        <TouchableOpacity onPress={onEditTime}>
          <Text style={styles.timeText}>{item.time}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. 타임라인 (세로줄 + 원) 영역 */}
      <View style={styles.timelineLineContainer}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
      </View>

      {/* 3. 장소 카드 영역 */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.metaText}>
              ⭐️ {item.rating} · {item.type}
            </Text>
            <Text style={styles.metaText}>{item.address}</Text>
          </View>
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>삭제</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10, // 카드 간 간격 조정
    alignItems: 'flex-start',
  },
  // 1. 시간 표시 영역 스타일
  timeContainer: {
    width: 60,
    paddingTop: 13, // 카드 상단과 시간 텍스트 정렬
    alignItems: 'center', // 시간 중앙 정렬
  },
  timeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // 2. 타임라인 (세로줄 + 원) 스타일
  timelineLineContainer: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 18, // 카드 상단과 원 정렬
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    backgroundColor: COLORS.border,
    flex: 1,
    marginTop: -8, // 원과 겹치도록
  },
  // 3. 장소 카드 영역 스타일
  cardContainer: {
    flex: 1,
    paddingTop: 10, // 시간, 원과 높이 맞추기
    paddingBottom: 10, // 카드 하단 여백
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
