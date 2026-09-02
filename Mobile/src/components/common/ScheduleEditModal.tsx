import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
import Minus from 'lucide-react-native/dist/esm/icons/minus';
import PopupModal from './PopupModal';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';
import { useAlert } from '../../contexts/AlertContext';
import { timeToMinutes, normalizeTime } from '../../utils/timeUtils';
import { findInvalidDateOrder } from '../../utils/scheduleEditSync';

type DayConfig = {
  dayNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
  places?: any[];
};

type ScheduleEditModalProps = {
  visible: boolean;
  initialDays: { date: Date; startTime?: string; endTime?: string; places?: any[] }[];
  onClose: () => void;
  onConfirm: (days: DayConfig[]) => void;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ScheduleEditModal({
  visible,
  initialDays,
  onClose,
  onConfirm,
}: ScheduleEditModalProps) {
  const { showAlert } = useAlert();
  const [days, setDays] = useState<DayConfig[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [pickerType, setPickerType] = useState<'date' | 'start' | 'end'>(
    'date',
  );
  const [pickerDate, setPickerDate] = useState(new Date());

  const initialDaysRef = useRef(initialDays);
  initialDaysRef.current = initialDays;

  useEffect(() => {
    if (!visible) return;
    setDays(
      initialDaysRef.current.map((day, index) => ({
        dayNumber: index + 1,
        date: new Date(day.date),
        startTime: day.startTime || '09:00:00',
        endTime: day.endTime || '20:00:00',
        places: day.places || [],
      })),
    );
  }, [visible]);

  const handleAddDay = () => {
    if (days.length >= 14) {
      showAlert({ title: '알림', message: '일정은 최대 14일까지 추가할 수 있어요.' });
      return;
    }

    const lastDay = days[days.length - 1];
    const newDate = new Date(lastDay ? lastDay.date : new Date());
    if (lastDay) {
      newDate.setDate(newDate.getDate() + 1);
    }

    setDays([
      ...days,
      {
        dayNumber: days.length + 1,
        date: newDate,
        startTime: lastDay ? lastDay.startTime : '09:00:00',
        endTime: lastDay ? lastDay.endTime : '20:00:00',
        places: [],
      },
    ]);
  };

  const handleRemoveDay = () => {
    if (days.length <= 1) return;

    const lastDay = days[days.length - 1];
    if (lastDay.places && lastDay.places.length > 0) {
      showAlert({
        title: '삭제 확인',
        message: `${lastDay.dayNumber}일차에 등록된 장소가 있어요. 정말 삭제할까요?`,
        type: 'confirm',
        buttons: [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              setDays(days.slice(0, -1));
            },
          },
        ],
      });
    } else {
      setDays(days.slice(0, -1));
    }
  };

  const openDatePicker = (index: number) => {
    setTargetIndex(index);
    setPickerType('date');
    setPickerDate(days[index].date);
    setDatePickerOpen(true);
  };

  const openTimePicker = (index: number, type: 'start' | 'end') => {
    setTargetIndex(index);
    setPickerType(type);

    const timeStr =
      type === 'start' ? days[index].startTime : days[index].endTime;
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0);
    date.setMinutes(minutes || 0);
    date.setSeconds(seconds || 0);

    setPickerDate(date);
    setTimePickerOpen(true);
  };

  const handleConfirm = (date: Date) => {
    if (targetIndex === null) return;

    const newDays = [...days];

    if (pickerType === 'date') {
      newDays[targetIndex].date = date;
      for (let i = targetIndex + 1; i < newDays.length; i++) {
        const prevDate = new Date(newDays[i - 1].date);
        prevDate.setDate(prevDate.getDate() + 1);
        newDays[i].date = prevDate;
      }
    } else {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}:00`;

      if (pickerType === 'start') {
        newDays[targetIndex].startTime = timeStr;
      } else {
        newDays[targetIndex].endTime = timeStr;
      }
    }

    setDays(newDays);
    setDatePickerOpen(false);
    setTimePickerOpen(false);
  };

  const handleFinalConfirm = () => {

    const invalidIndex = findInvalidDateOrder(days);
    if (invalidIndex !== null) {
      showAlert({
        title: '날짜 설정 오류',
        message: `${days[invalidIndex].dayNumber}일차 날짜가 이전 일차와 같거나 앞서요. 날짜를 순서대로 지정해 주세요.`,
      });
      return;
    }

    for (const day of days) {
      const startMinutes = timeToMinutes(day.startTime);
      const endMinutes = timeToMinutes(day.endTime);

      if (startMinutes >= endMinutes) {
        showAlert({
          title: '시간 설정 오류',
          message: `${day.dayNumber}일차의 시작 시간이 종료 시간보다 늦거나 같아요.`,
        });
        return;
      }

      if (endMinutes - startMinutes < 60) {
        showAlert({
          title: '시간 범위 오류',
          message: `${day.dayNumber}일차의 일정 운영 시간은 최소 1시간 이상이어야 해요.`,
        });
        return;
      }
    }
    onConfirm(days);
  };

  const formatCompactDate = (date: Date) =>
    `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;

  return (
    <PopupModal
      visible={visible}
      title="일정 변경"
      onClose={onClose}
      footer={
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleFinalConfirm}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="변경 확인"
        >
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.counterRow}>
        <Text style={styles.counterLabel}>여행 일수</Text>
        <View style={styles.counterControls}>
          <TouchableOpacity
            style={[
              styles.counterButton,
              days.length <= 1 && styles.counterButtonOff,
            ]}
            onPress={handleRemoveDay}
            disabled={days.length <= 1}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="일수 줄이기"
            accessibilityState={{ disabled: days.length <= 1 }}
            hitSlop={8}
          >
            <Minus
              size={normalize(15)}
              color={
                days.length <= 1
                  ? tokens.colors.textTertiary
                  : tokens.colors.text
              }
              strokeWidth={2}
            />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{days.length}일</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={handleAddDay}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="일수 늘리기"
            hitSlop={8}
          >
            <Plus
              size={normalize(15)}
              color={tokens.colors.text}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {days.map((day, index) => (
          <View key={index} style={styles.dayRow}>
            <Text style={styles.dayLabel}>{day.dayNumber}일차</Text>

            <View style={styles.dayBody}>
              <TouchableOpacity
                onPress={() => openDatePicker(index)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${day.dayNumber}일차 날짜 ${formatCompactDate(day.date)}`}
              >
                <Text style={styles.dateText}>
                  {formatCompactDate(day.date)}
                </Text>
              </TouchableOpacity>

              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => openTimePicker(index, 'start')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${day.dayNumber}일차 시작 시간`}
                >
                  <Text style={styles.timeText}>
                    {normalizeTime(day.startTime)}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.timeDash}>~</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => openTimePicker(index, 'end')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${day.dayNumber}일차 종료 시간`}
                >
                  <Text style={styles.timeText}>
                    {normalizeTime(day.endTime)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <DatePicker
          modal
          open={datePickerOpen}
          date={pickerDate}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerOpen(false)}
          locale="ko"
        />

        <DatePicker
          modal
          open={timePickerOpen}
          date={pickerDate}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={() => setTimePickerOpen(false)}
          locale="ko"
          is24hourSource="locale"
        />
      </ScrollView>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(12),
  },
  counterLabel: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
  },
  counterButton: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonOff: {
    borderColor: tokens.colors.borderLight,
  },
  counterValue: {
    minWidth: normalize(38),
    textAlign: 'center',
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },

  list: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(12),
    paddingVertical: normalize(12),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  dayLabel: {
    width: normalize(46),
    paddingTop: normalize(1),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  dayBody: {
    flex: 1,
    minWidth: 0,
    gap: normalize(7),
  },
  // 날짜는 누를 수 있다는 것을 색으로만 알린다. 테두리까지 두르면
  // 아래 시간 칸과 같은 무게로 보여 위계가 사라진다.
  dateText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  timeButton: {
    flex: 1,
    height: normalize(38),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  timeDash: {
    fontSize: normalize(12),
    color: tokens.colors.textTertiary,
  },

  confirmButton: {
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
