import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { styles } from './ScheduleEditModal.styles';
import DatePicker from 'react-native-date-picker';

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

    // Parse time string 'HH:mm:ss' to Date
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
      // Adjust subsequent dates
      for (let i = targetIndex + 1; i < newDays.length; i++) {
        const prevDate = new Date(newDays[i - 1].date);
        prevDate.setDate(prevDate.getDate() + 1);
        newDays[i].date = prevDate;
      }
    } else {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = '00'; // Simply use 00 for seconds as per image
      const timeStr = `${hours}:${minutes}:${seconds}`;

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

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <Pressable style={styles.centeredView} onPress={onClose}>
        <Pressable style={styles.modalView} onPress={() => {}}>
          <Text style={styles.title}>일정 변경</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 0.8 }]}>일차</Text>
            <Text style={[styles.headerText, { flex: 1.5 }]}>날짜</Text>
            <Text style={[styles.headerText, { flex: 1.2 }]}>시작 시간</Text>
            <Text style={[styles.headerText, { flex: 1.2 }]}>종료 시간</Text>
          </View>

          <ScrollView style={{ maxHeight: 300 }}>
            {days.map((day, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.dayText}>{day.dayNumber}일차</Text>

                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => openDatePicker(index)}
                >
                  <Text style={styles.dateText}>{formatDate(day.date)}</Text>
                  <Text>📅</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => openTimePicker(index, 'start')}
                >
                  <Text style={styles.timeText}>
                    {day.startTime.substring(0, 5)}
                  </Text>
                  <Text>⌄</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => openTimePicker(index, 'end')}
                >
                  <Text style={styles.timeText}>
                    {day.endTime.substring(0, 5)}
                  </Text>
                  <Text>⌄</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleRemoveDay}
            >
              <Text style={styles.controlButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleAddDay}
            >
              <Text style={styles.controlButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => onConfirm(days)}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
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
