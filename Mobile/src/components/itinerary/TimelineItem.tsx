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

// 1. Place 타입을 수정합니다.
export type Place = {
  id: string;
  name: string;
  type: '관광지' | '숙소' | '식당';
  // time: string; // -> 삭제
  startTime: string; // -> '10:00' 형식
  endTime: string; // -> '11:30' 형식
  address: string;
  rating: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
};

type TimelineItemProps = {
  item: Place;
  onDelete: () => void;
  // onEditTime: () => void; // -> 우선 제거 (로직이 복잡해짐)
  style?: object; // 2. 외부에서 top, height를 받기 위해 style prop 추가
};

export default function TimelineItem({
  item,
  onDelete,
  style, // 2. style prop 받기
}: TimelineItemProps) {
  return (
    // 3. 레이아웃을 카드 본체만 남도록 수정합니다.
    <View style={[styles.cardContainer, style]}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          {/* 4. 카드 내부에 시간 표시 (PC UI 참고) */}
          <Text style={styles.timeText}>
            {item.startTime} ~ {item.endTime}
          </Text>
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
  );
}

const styles = StyleSheet.create({
  // 5. 스타일을 카드 중심으로 재구성
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingLeft: 90, // 시간 영역(60) + 세로줄 영역(30) 만큼 왼쪽 여백
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
  timeText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontWeight: '500',
    marginBottom: 4,
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
