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
  primary: '#007AFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  error: '#FF3B30', // 삭제 버튼을 위한 색상
};

// 이 컴포넌트가 받을 데이터의 타입을 정의합니다.
export type Place = {
  id: string;
  name: string;
  type: '관광지' | '숙소' | '식당';
  time: string;
  address: string;
  rating: number;
  imageUrl: string;
};

// onDelete와 onEditTime prop을 추가합니다.
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
      {/* 시간을 누르면 onEditTime 함수가 호출되도록 TouchableOpacity로 감쌉니다. */}
      <TouchableOpacity onPress={onEditTime}>
        <Text style={styles.timeText}>{item.time}</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.metaText}>
            ⭐️ {item.rating} · {item.type}
          </Text>
          <Text style={styles.metaText}>{item.address}</Text>
        </View>
        {/* '삭제' 버튼을 누르면 onDelete 함수가 호출됩니다. */}
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
    color: COLORS.primary, // 수정 가능하다는 느낌을 주기 위해 색상 변경
    fontWeight: '600',
    paddingTop: 5,
    textDecorationLine: 'underline', // 밑줄 추가
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
