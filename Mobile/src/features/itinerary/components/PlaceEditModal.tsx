import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import FallbackImage from '../../../components/common/FallbackImage';
import PopupModal from '../../../components/common/PopupModal';
import { openExternalUrl } from '../../../utils/externalLink';
import { dateToTime, timeToDate, timeToMinutes } from '../../../utils/timeUtils';
import { useAlert } from '../../../contexts/AlertContext';
import { CATEGORY_COLORS } from './TimelineItem.styles';
import { CATEGORY_NAMES, resolveCategoryId } from './TimelineItem';
import { toSecureImageUrl } from '../../../utils/imageUrl';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

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
        message: '종료 시간은 시작 시간보다 늦어야 해요.',
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
      message: `'${place.name || '이 장소'}'를 일정에서 삭제할까요? 메모와 시간도 함께 사라져요.`,
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

  const categoryId = resolveCategoryId(place);
  const color =
    CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] ??
    CATEGORY_COLORS[4];
  const categoryName = CATEGORY_NAMES[categoryId] || place.type || '기타';
  const canOpenMap = !!place.place_url || !!(place.latitude && place.longitude);

  return (
    <PopupModal
      visible={visible}
      title="장소 수정"
      onClose={onClose}
      footer={
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="장소 삭제"
          >
            <Text style={styles.deleteText}>삭제</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="저장"
          >
            <Text style={styles.saveText}>저장</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.head}>
          <FallbackImage
            uri={toSecureImageUrl(place.imageUrl)}
            style={styles.photo}
            fallback={<View style={[styles.photo, styles.photoEmpty]} />}
          />
          <View style={styles.headText}>
            <Text style={[styles.category, { color: color.textSub }]}>
              {categoryName}
            </Text>
            <Text style={styles.placeName} numberOfLines={2}>
              {place.name}
            </Text>
            {!!place.address && (
              <Text style={styles.address} numberOfLines={2}>
                {place.address}
              </Text>
            )}
          </View>
        </View>

        {canOpenMap && (
          <TouchableOpacity
            style={styles.mapRow}
            onPress={handleOpenMap}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel="지도에서 보기"
          >
            <Text style={styles.mapText}>지도에서 보기</Text>
          </TouchableOpacity>
        )}

        <View style={styles.timeRow}>
          <View style={styles.timeCell}>
            <Text style={styles.label}>시작</Text>
            <TouchableOpacity
              onPress={() => setOpenStartPicker(true)}
              style={styles.timeButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`시작 시간 ${dateToTime(startTime)}`}
            >
              <Text style={styles.timeText}>{dateToTime(startTime)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeCell}>
            <Text style={styles.label}>종료</Text>
            <TouchableOpacity
              onPress={() => setOpenEndPicker(true)}
              style={styles.timeButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`종료 시간 ${dateToTime(endTime)}`}
            >
              <Text style={styles.timeText}>{dateToTime(endTime)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text style={styles.label}>메모</Text>
          <TextInput
            style={styles.input}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모를 입력하세요"
            placeholderTextColor={tokens.colors.textTertiary}
            multiline
          />
        </View>

        <DatePicker
          modal
          open={openStartPicker}
          date={startTime}
          mode="time"
          onConfirm={date => {
            setOpenStartPicker(false);
            setStartTime(date);
          }}
          onCancel={() => setOpenStartPicker(false)}
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
          onCancel={() => setOpenEndPicker(false)}
        />
      </ScrollView>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(6),
    gap: normalize(18),
  },

  head: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  photo: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(4),
  },
  photoEmpty: {
    backgroundColor: tokens.colors.borderLight,
  },
  headText: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  category: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.semibold,
    marginBottom: normalize(2),
  },
  placeName: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
    letterSpacing: -0.2,
  },
  address: {
    marginTop: normalize(3),
    fontSize: normalize(12),
    lineHeight: normalize(17),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },

  // 바깥으로 나가는 자리는 줄 하나로만 표시한다. 채운 단추는 저장과 겨룬다.
  mapRow: {
    paddingVertical: normalize(11),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.borderLight,
  },
  mapText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },

  timeRow: {
    flexDirection: 'row',
    gap: normalize(10),
  },
  timeCell: {
    flex: 1,
  },
  label: {
    marginBottom: normalize(6),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  timeButton: {
    height: normalize(44),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  input: {
    minHeight: normalize(84),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: normalize(12),
    paddingTop: normalize(10),
    paddingBottom: normalize(10),
    fontSize: normalize(13.5),
    lineHeight: normalize(20),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    textAlignVertical: 'top',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  // 지우기는 되돌릴 수 없어 겨냥하기 쉬운 채운 단추로 두지 않는다.
  deleteButton: {
    height: normalize(48),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.tones.danger.fg,
  },
  saveButton: {
    flex: 1,
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
