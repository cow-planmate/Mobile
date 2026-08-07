import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import FastImage from 'react-native-fast-image';
import { X, Map as MapIcon } from 'lucide-react-native';
import { openExternalUrl } from '../../../utils/externalLink';
import { theme } from '../../../theme/theme';
import { useAlert } from '../../../contexts/AlertContext';
import { CATEGORY_COLORS } from './TimelineItem.styles';

const CATEGORY_NAMES: { [key: number]: string } = {
  0: '관광지',
  1: '숙소',
  2: '식당',
  3: '직접 추가',
  4: '검색',
};

const COLORS = theme.colors;
const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

interface PlaceEditModalProps {
  visible: boolean;
  place: any;
  onClose: () => void;
  onSave: (updatedPlace: any) => void;
  onDelete: (placeId: string) => void;
}

export default function PlaceEditModal({
  visible,
  place,
  onClose,
  onSave,
  onDelete,
}: PlaceEditModalProps) {
  const { showAlert } = useAlert();
  const [memo, setMemo] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  useEffect(() => {
    if (visible && place) {
      setMemo(place.memo || '');
      // Parse time string "HH:mm:ss" to Date object
      const today = new Date();
      const [sh, sm] = (place.startTime || '09:00').split(':').map(Number);
      const [eh, em] = (place.endTime || '10:00').split(':').map(Number);

      const sDate = new Date(today);
      sDate.setHours(sh, sm, 0);
      setStartTime(sDate);

      const eDate = new Date(today);
      eDate.setHours(eh, em, 0);
      setEndTime(eDate);
    }
  }, [visible, place]);

  const handleSave = () => {
    const formatTime = (date: Date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}:00`;
    };

    // 종료가 시작보다 이르면 duration이 음수가 되어 시간 충돌 해결이 붕괴한다.
    if (
      startTime.getHours() * 60 + startTime.getMinutes() >=
      endTime.getHours() * 60 + endTime.getMinutes()
    ) {
      showAlert({
        title: '시간 설정 오류',
        message: '종료 시간은 시작 시간보다 늦어야 합니다.',
      });
      return;
    }

    onSave({
      ...place,
      memo,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(place.id || place.placeId);
    onClose();
  };

  /**
   * 외부 지도 앱으로 연다. place_url이 있으면 그것을, 없으면 좌표를 쓴다.
   *
   * place_url은 외부 장소 API에서 온 값이라 웹 링크인지 확인하고 연다.
   * 웹 링크가 아니면 좌표로 대신 연다.
   */
  const handleOpenMap = () => {
    if (openExternalUrl(place.place_url)) {
      return;
    }
    if (place.latitude && place.longitude) {
      openExternalUrl(
        `https://maps.google.com/?q=${place.latitude},${place.longitude}`,
      );
    }
  };

  if (!place) return null;

  const categoryId = place.categoryId ?? 4;
  const categoryColor =
    CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] ||
    CATEGORY_COLORS[4];
  const categoryName = CATEGORY_NAMES[categoryId] || place.type || '기타';
  const canOpenMap = !!place.place_url || !!(place.latitude && place.longitude);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>장소 수정</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#9CA3AF" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* ── 장소 정보 ── */}
            <View style={styles.infoSection}>
              {place.imageUrl ? (
                <FastImage
                  source={{
                    uri: place.imageUrl,
                    priority: FastImage.priority.normal,
                  }}
                  style={styles.photo}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View style={[styles.photo, styles.photoPlaceholder]}>
                  <Text style={styles.photoPlaceholderText}>
                    {place.name?.charAt(0) || '?'}
                  </Text>
                </View>
              )}

              <View style={styles.infoTextGroup}>
                <Text style={styles.placeName} numberOfLines={2}>
                  {place.name}
                </Text>

                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor: categoryColor.bg,
                        borderColor: categoryColor.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        { color: categoryColor.border },
                      ]}
                    >
                      {categoryName}
                    </Text>
                  </View>
                  {!!place.rating && place.rating > 0 && (
                    <Text style={styles.ratingText}>⭐ {place.rating}</Text>
                  )}
                </View>

                {!!place.address && (
                  <Text style={styles.addressText} numberOfLines={2}>
                    {place.address}
                  </Text>
                )}
              </View>
            </View>

            {canOpenMap && (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleOpenMap}
                activeOpacity={0.8}
              >
                <MapIcon size={15} color="#111827" strokeWidth={1.5} />
                <Text style={styles.mapButtonText}>지도에서 보기</Text>
              </TouchableOpacity>
            )}

            <View style={styles.row}>
              <View style={styles.timeContainer}>
                <Text style={styles.label}>시작 시간</Text>
                <TouchableOpacity
                  onPress={() => setOpenStartPicker(true)}
                  style={styles.timeButton}
                >
                  <Text style={styles.timeText}>
                    {startTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeContainer}>
                <Text style={styles.label}>종료 시간</Text>
                <TouchableOpacity
                  onPress={() => setOpenEndPicker(true)}
                  style={styles.timeButton}
                >
                  <Text style={styles.timeText}>
                    {endTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>메모</Text>
              <TextInput
                style={styles.input}
                value={memo}
                onChangeText={setMemo}
                placeholder="메모를 입력하세요"
                multiline
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={[styles.buttonText, styles.deleteText]}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <DatePicker
            modal
            open={openStartPicker}
            date={startTime}
            mode="time"
            onConfirm={date => {
              setOpenStartPicker(false);
              setStartTime(date);
            }}
            onCancel={() => {
              setOpenStartPicker(false);
            }}
          />
          <DatePicker
            modal
            open={openEndPicker}
            date={endTime}
            mode="time"
            onConfirm={date => {
              setOpenEndPicker(false);
              setEndTime(date);
            }}
            onCancel={() => {
              setOpenEndPicker(false);
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contentScroll: {
    flexGrow: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#111827',
  },
  content: {
    gap: 16,
  },
  infoSection: {
    flexDirection: 'row',
    gap: 12,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoPlaceholderText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: '#9CA3AF',
  },
  infoTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  placeName: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: '#111827',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },
  addressText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#6B7280',
    lineHeight: 16,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapButtonText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: FONTS.regular,
  },
  timeButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#111827',
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: FONTS.regular,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
  },
  deleteText: {
    color: '#EF4444',
  },
});
