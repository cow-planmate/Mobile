import React, { useState, useEffect, useRef } from 'react';
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
import X from 'lucide-react-native/dist/esm/icons/x';
import Plus from 'lucide-react-native/dist/esm/icons/plus';
import Minus from 'lucide-react-native/dist/esm/icons/minus';
import CalendarDays from 'lucide-react-native/dist/esm/icons/calendar-days';
import Clock from 'lucide-react-native/dist/esm/icons/clock';
import ChevronDown from 'lucide-react-native/dist/esm/icons/chevron-down';
import { useAlert } from '../../contexts/AlertContext';
import { timeToMinutes } from '../../utils/timeUtils';
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
      showAlert({ title: '알림', message: '일정은 최대 14일까지 추가할 수 있습니다.' });
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
        message: `${lastDay.dayNumber}일차에 등록된 장소가 존재합니다. 정말 삭제하시겠습니까?`,
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
        message: `${days[invalidIndex].dayNumber}일차 날짜가 이전 일차와 같거나 앞섭니다. 날짜를 순서대로 지정해주세요.`,
      });
      return;
    }

    for (const day of days) {
      const startMinutes = timeToMinutes(day.startTime);
      const endMinutes = timeToMinutes(day.endTime);

      if (startMinutes >= endMinutes) {
        showAlert({
          title: '시간 설정 오류',
          message: `${day.dayNumber}일차의 시작 시간이 종료 시간보다 늦거나 같습니다.`,
        });
        return;
      }

      if (endMinutes - startMinutes < 60) {
        showAlert({
          title: '시간 범위 오류',
          message: `${day.dayNumber}일차의 일정 운영 시간은 최소 1시간 이상 설정해야 합니다.`,
        });
        return;
      }
    }
    onConfirm(days);
  };

  const formatCompactDate = (date: Date) => {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const w = WEEKDAYS[date.getDay()];
    return { dateStr: `${m}.${d}`, dayOfWeek: w };
  };

  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>

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

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {days.map((day, index) => {
              const { dateStr, dayOfWeek } = formatCompactDate(day.date);
              return (
                <View key={index} style={styles.dayCard}>

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

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleFinalConfirm}
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
