import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { styles, COLORS } from './ScheduleEditModal.styles';
import DatePicker from 'react-native-date-picker';
import {
  X,
  Plus,
  Minus,
  CalendarDays,
  Clock,
  ChevronDown,
} from 'lucide-react-native';

type DayConfig = {
  dayNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
};

type ScheduleEditModalProps = {
  visible: boolean;
  initialDays: { date: Date; startTime?: string; endTime?: string }[];
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
  const [days, setDays] = useState<DayConfig[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [pickerType, setPickerType] = useState<'date' | 'start' | 'end'>(
    'date',
  );
  const [pickerDate, setPickerDate] = useState(new Date());

  useEffect(() => {
    if (visible) {
      setDays(
        initialDays.map((day, index) => ({
          dayNumber: index + 1,
          date: new Date(day.date),
          startTime: day.startTime || '09:00:00',
          endTime: day.endTime || '20:00:00',
        })),
      );
    }
  }, [visible, initialDays]);

  const handleAddDay = () => {
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
      },
    ]);
  };

  const handleRemoveDay = () => {
    if (days.length > 1) {
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

  const formatCompactDate = (date: Date) => {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const w = WEEKDAYS[date.getDay()];
    return { dateStr: `${m}.${d}`, dayOfWeek: w };
  };

  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextArea}>
              <Text style={styles.title}>일정 변경</Text>
              <Text style={styles.subtitle}>
                날짜와 시간을 조정할 수 있어요
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color={COLORS.subtext} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Day Counter */}
          <View style={styles.counterSection}>
            <Text style={styles.counterLabel}>여행 일수</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  days.length <= 1 && styles.counterBtnDisabled,
                ]}
                onPress={handleRemoveDay}
                disabled={days.length <= 1}
                activeOpacity={0.7}
              >
                <Minus
                  size={16}
                  color={days.length <= 1 ? COLORS.disabled : COLORS.text}
                  strokeWidth={2}
                />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{days.length}일</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={handleAddDay}
                activeOpacity={0.7}
              >
                <Plus size={16} color={COLORS.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Day Cards */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {days.map((day, index) => {
              const { dateStr, dayOfWeek } = formatCompactDate(day.date);
              return (
                <View key={index} style={styles.dayCard}>
                  {/* Day badge + date */}
                  <View style={styles.dayCardTop}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>
                        {day.dayNumber}일차
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dateChip}
                      onPress={() => openDatePicker(index)}
                      activeOpacity={0.7}
                    >
                      <CalendarDays
                        size={14}
                        color={COLORS.primary}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.dateChipText}>{dateStr}</Text>
                      <Text style={styles.dayOfWeek}>({dayOfWeek})</Text>
                      <ChevronDown
                        size={12}
                        color={COLORS.subtext}
                        strokeWidth={1.5}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Time row */}
                  <View style={styles.timeRow}>
                    <TouchableOpacity
                      style={styles.timeChip}
                      onPress={() => openTimePicker(index, 'start')}
                      activeOpacity={0.7}
                    >
                      <Clock
                        size={13}
                        color={COLORS.primary}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.timeChipText}>
                        {formatTime(day.startTime)}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.timeDash}>~</Text>
                    <TouchableOpacity
                      style={styles.timeChip}
                      onPress={() => openTimePicker(index, 'end')}
                      activeOpacity={0.7}
                    >
                      <Clock
                        size={13}
                        color={COLORS.subtext}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.timeChipText}>
                        {formatTime(day.endTime)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => onConfirm(days)}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmBtnText}>확인</Text>
            </TouchableOpacity>
          </View>

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
        </Pressable>
      </Pressable>
    </Modal>
  );
}
