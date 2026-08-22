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
import X from 'lucide-react-native/dist/esm/icons/x';
import MapIcon from 'lucide-react-native/dist/esm/icons/map';
import { openExternalUrl } from '../../../utils/externalLink';
import { dateToTime, timeToDate, timeToMinutes } from '../../../utils/timeUtils';
import { theme } from '../../../theme/theme';
import { useAlert } from '../../../contexts/AlertContext';
import { CATEGORY_COLORS } from './TimelineItem.styles';
import { tokens } from '../../../theme/tokens';

const CATEGORY_NAMES: { [key: number]: string } = {
  0: '관광지',
  1: '숙소',
  2: '식당',
  3: '직접 추가',
  4: '검색',
};

const COLORS = theme.colors;
const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

interface PlaceEditModalProps {
  visible: boolean;
  place: any;
  dayStartTime?: string;
  dayEndTime?: string;
  onClose: () => void;
  onSave: (updatedPlace: any) => void;
  onDelete: (placeId: string) => void;
}

export default function PlaceEditModal({
  visible,
  place,
  dayStartTime,
  dayEndTime,
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
      setStartTime(timeToDate(place.startTime || '09:00'));
      setEndTime(timeToDate(place.endTime || '10:00'));
    }
  }, [visible, place]);

  const handleSave = () => {
    const formatMinutes = (minutes: number) =>
      `${Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:00`;

    let startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    let endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    // 시간대를 하루 범위 밖으로 잡으면 타임라인 그리드 밖으로 밀려나 화면에서
    // 사라지므로, 저장 전에 그 날의 시작·종료 범위 안으로 당겨온다. 두 조건을
    // 독립된 if로 순서대로 적용하면 지속시간이 하루 범위보다 긴 경우 한쪽을
    // 맞추다 반대쪽이 다시 범위를 벗어날 수 있어, 지속시간부터 범위 안으로
    // 줄인 뒤 시작 시간을 그 안에서만 움직이도록 한 번에 계산한다.
    if (dayStartTime || dayEndTime) {
      const minMinutes = timeToMinutes(dayStartTime || '00:00');
      const maxMinutes = dayEndTime ? timeToMinutes(dayEndTime) : 24 * 60;
      const windowSize = Math.max(0, maxMinutes - minMinutes);
      const duration = Math.max(
        0,
        Math.min(endMinutes - startMinutes, windowSize),
      );
      startMinutes = Math.max(
        minMinutes,
        Math.min(startMinutes, maxMinutes - duration),
      );
      endMinutes = startMinutes + duration;
    }

    if (startMinutes >= endMinutes) {
      showAlert({
        title: '시간 설정 오류',
        message: '종료 시간은 시작 시간보다 늦어야 합니다.',
      });
      return;
    }

    onSave({
      ...place,
      memo,
      startTime: formatMinutes(startMinutes),
      endTime: formatMinutes(endMinutes),
    });
    onClose();
  };

  const handleDelete = () => {
    showAlert({
      title: '장소 삭제',
      message: `'${place.name || '이 장소'}'를 일정에서 삭제할까요? 메모와 시간도 함께 사라집니다.`,
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            onDelete(place.id || place.placeId);
            onClose();
          },
        },
      ],
    });
  };

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
              <X size={20} color={tokens.colors.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >

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
                <MapIcon size={15} color={tokens.colors.text} strokeWidth={1.5} />
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
                    {dateToTime(startTime)}
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
                    {dateToTime(endTime)}
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
    backgroundColor: tokens.colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: tokens.colors.border,
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
    color: tokens.colors.text,
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
    backgroundColor: tokens.colors.borderLight,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  photoPlaceholderText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: tokens.colors.textTertiary,
  },
  infoTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  placeName: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: tokens.colors.text,
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
    color: tokens.colors.textSecondary,
  },
  addressText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: tokens.colors.textSecondary,
    lineHeight: 16,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: tokens.colors.borderLight,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  mapButtonText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: tokens.colors.text,
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
    color: tokens.colors.textSecondary,
    marginBottom: 4,
    fontFamily: FONTS.regular,
  },
  timeButton: {
    backgroundColor: tokens.colors.borderLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  timeText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: tokens.colors.text,
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    backgroundColor: tokens.colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: FONTS.regular,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: tokens.colors.border,
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
    color: tokens.colors.white,
  },
  deleteText: {
    color: '#EF4444',
  },
});
