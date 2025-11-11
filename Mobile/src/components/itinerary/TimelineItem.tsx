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

// 1. timeToMinutes 헬퍼 함수 추가 (ItineraryEditorScreen.tsx에서 가져옴)
const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 2. (수정) 30분 미만일 때 컴팩트 뷰로 전환 (45 -> 30)
const IS_COMPACT_VIEW_THRESHOLD_MINUTES = 30;

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
  // 3. 일정 시간(분) 계산
  const durationMinutes =
    timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
  const isCompact = durationMinutes < IS_COMPACT_VIEW_THRESHOLD_MINUTES;

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.card}>
        {/* 4. isCompact가 아닐 때만 이미지 표시 */}
        {!isCompact && (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        )}
        {/* 5. isCompact일 때 marginLeft 0으로 조정 */}
        <View style={[styles.infoContainer, isCompact && { marginLeft: 0 }]}>
          {/* 6. isCompact가 아닐 때만 시간 표시 */}
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

          {/* 7. 이름은 항상 표시 */}
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>

          {/* 8. isCompact가 아닐 때만 부가 텍스트 표시 */}
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
          {/* "삭제" 텍스트를 "x"로 변경 */}
          <Text style={styles.deleteButtonText}>x</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 0, // ⭐️ 수정: 90 -> 0
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
    overflow: 'hidden',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});
