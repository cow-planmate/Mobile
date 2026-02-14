import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  Linking,
  Dimensions,
} from 'react-native';
import {Place} from './TimelineItem';
import {CATEGORY_COLORS} from './TimelineItem.styles';
import {StyleSheet} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface DetailPopupProps {
  visible: boolean;
  place: Place | null;
  onClose: () => void;
  onUpdateMemo: (memo: string) => void;
  onDelete: () => void;
}

const CATEGORY_NAMES: {[key: number]: string} = {
  0: '관광지',
  1: '숙소',
  2: '식당',
  3: '직접 추가',
  4: '검색',
};

export default function DetailPopup({
  visible,
  place,
  onClose,
  onUpdateMemo,
  onDelete,
}: DetailPopupProps) {
  const [memo, setMemo] = useState(place?.memo || '');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (place) {
      setMemo(place.memo || '');
    }
  }, [place]);

  const handleMemoChange = (text: string) => {
    setMemo(text);

    // Debounce WebSocket update for memo (500ms like Frontend)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onUpdateMemo(text);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!place) {
    return null;
  }

  const categoryId = place.categoryId ?? 4;
  const categoryColor =
    CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] ||
    CATEGORY_COLORS[4];
  const categoryName = CATEGORY_NAMES[categoryId] || place.type || '기타';

  const handleOpenMap = () => {
    if (place.place_url) {
      Linking.openURL(place.place_url);
    } else if (place.latitude && place.longitude) {
      const url = `https://maps.google.com/?q=${place.latitude},${place.longitude}`;
      Linking.openURL(url);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <Pressable style={popupStyles.overlay} onPress={onClose}>
        <Pressable style={popupStyles.container} onPress={() => {}}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {/* Header */}
            <View style={popupStyles.header}>
              <TouchableOpacity
                onPress={onClose}
                style={popupStyles.closeButton}>
                <Text style={popupStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Photo */}
            {place.imageUrl ? (
              <Image
                source={{uri: place.imageUrl}}
                style={popupStyles.photo}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  popupStyles.photo,
                  popupStyles.placeholderPhoto,
                ]}>
                <Text style={popupStyles.placeholderPhotoText}>
                  {place.name.charAt(0)}
                </Text>
              </View>
            )}

            {/* Info */}
            <View style={popupStyles.infoSection}>
              <Text style={popupStyles.placeName}>{place.name}</Text>

              <View style={popupStyles.badgeRow}>
                <View
                  style={[
                    popupStyles.categoryBadge,
                    {backgroundColor: categoryColor.bg, borderColor: categoryColor.border},
                  ]}>
                  <Text
                    style={[
                      popupStyles.categoryBadgeText,
                      {color: categoryColor.border},
                    ]}>
                    {categoryName}
                  </Text>
                </View>
                {place.rating > 0 && (
                  <Text style={popupStyles.ratingText}>
                    ⭐ {place.rating}
                  </Text>
                )}
              </View>

              <Text style={popupStyles.addressText}>{place.address}</Text>

              <View style={popupStyles.timeInfo}>
                <Text style={popupStyles.timeLabel}>시간</Text>
                <Text style={popupStyles.timeValue}>
                  {place.startTime} ~ {place.endTime}
                </Text>
              </View>

              {/* Map Link */}
              <TouchableOpacity
                style={popupStyles.mapButton}
                onPress={handleOpenMap}>
                <Text style={popupStyles.mapButtonText}>🗺️ 지도에서 보기</Text>
              </TouchableOpacity>
            </View>

            {/* Memo */}
            <View style={popupStyles.memoSection}>
              <Text style={popupStyles.memoLabel}>메모</Text>
              <TextInput
                style={popupStyles.memoInput}
                value={memo}
                onChangeText={handleMemoChange}
                placeholder="메모를 입력하세요..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={popupStyles.deleteButton}
              onPress={() => {
                onDelete();
                onClose();
              }}>
              <Text style={popupStyles.deleteButtonText}>일정에서 삭제</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  photo: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  placeholderPhoto: {
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderPhotoText: {
    fontSize: 48,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  placeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  addressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 8,
  },
  timeValue: {
    fontSize: 14,
    color: '#1344FF',
    fontWeight: '500',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F5',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  memoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  memoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  memoInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1C1C1E',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  deleteButton: {
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
