import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import { styles, COLORS } from './CalendarModal.styles';

type CalendarModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dates: { startDate: Date; endDate: Date }) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
};

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  dayNumber: number;
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const MAX_RANGE_DAYS = 30;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const daysBetween = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / 86400000) + 1;

export default function CalendarModal({
  visible,
  onClose,
  onConfirm,
  initialStartDate,
  initialEndDate,
}: CalendarModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const todayStart = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    if (visible) {
      const start = initialStartDate || null;
      const end = initialEndDate || null;
      setStartDate(start);
      setEndDate(end);
      setNotice(null);

      const baseDate = start || new Date();
      setCurrentYear(baseDate.getFullYear());
      setCurrentMonth(baseDate.getMonth());
    }
  }, [visible, initialStartDate, initialEndDate]);

  const daysGrid = useMemo<CalendarDay[]>(() => {
    const grid: CalendarDay[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDay.getDay(); 
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDayNum = prevTotalDays - i;
      const date = new Date(currentYear, currentMonth - 1, prevDayNum);
      grid.push({
        date,
        isCurrentMonth: false,
        dayNumber: prevDayNum,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentYear, currentMonth, i);
      grid.push({
        date,
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      grid.push({
        date,
        isCurrentMonth: false,
        dayNumber: i,
      });
    }

    return grid;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const onDayPress = useCallback(
    (date: Date, isCurrentMonth: boolean) => {

      const targetDate = startOfDay(date);

      if (!isCurrentMonth) {
        setCurrentYear(targetDate.getFullYear());
        setCurrentMonth(targetDate.getMonth());
      }

      setNotice(null);

      if (!startDate || (startDate && endDate)) {
        setStartDate(targetDate);
        setEndDate(null);
        return;
      }

      if (targetDate < startDate) {
        setStartDate(targetDate);
        setEndDate(null);
        return;
      }

      if (daysBetween(startDate, targetDate) > MAX_RANGE_DAYS) {
        setNotice(`한 번에 최대 ${MAX_RANGE_DAYS}일까지 선택할 수 있어요`);
        return;
      }

      setEndDate(targetDate);
      onConfirm({ startDate, endDate: targetDate });
    },
    [startDate, endDate, onConfirm],
  );

  // 시작일만 고른 채로 닫으면 당일치기로 확정한다.
  const handleDone = () => {
    if (startDate && !endDate) {
      onConfirm({ startDate, endDate: startDate });
    }
    onClose();
  };

  const formatSelectedRange = () => {
    if (!startDate) return '날짜를 선택하세요';
    const fmt = (d: Date) => {
      const m = d.getMonth() + 1;
      const day = d.getDate();
      return `${m}월 ${day}일`;
    };
    if (!endDate || startDate.getTime() === endDate.getTime()) {
      return fmt(startDate);
    }
    return `${fmt(startDate)} ~ ${fmt(endDate)}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDayColorType = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'outside';
    const day = date.getDay();
    if (day === 0) return 'sunday';
    if (day === 6) return 'saturday';
    return 'weekday';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDone}
    >
      <View style={styles.sheetRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>여행 기간 선택</Text>
            <TouchableOpacity
              onPress={handleDone}
              hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="선택 완료"
            >
              <Text style={styles.sheetDone}>완료</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.rangeLabel,
              notice == null && !startDate && styles.rangeLabelEmpty,
              notice != null && styles.rangeLabelNotice,
            ]}
          >
            {notice ?? formatSelectedRange()}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.calendarContainer}>

            <View style={styles.monthNavRow}>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={handlePrevMonth}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="이전 달"
              >
                <ChevronLeft size={20} color={COLORS.subtext} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {currentYear}년 {currentMonth + 1}월
              </Text>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={handleNextMonth}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="다음 달"
              >
                <ChevronRight size={20} color={COLORS.subtext} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {WEEK_DAYS.map((day, idx) => (
                <View key={idx} style={styles.weekDayCell}>
                  <Text
                    style={[
                      styles.weekDayText,
                      idx === 0 && { color: COLORS.danger },
                      idx === 6 && { color: COLORS.weekendBlue },
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {daysGrid.map((item, index) => {
                const itemTime = new Date(
                  item.date.getFullYear(),
                  item.date.getMonth(),
                  item.date.getDate()
                ).getTime();

                const startTime = startDate ? startDate.getTime() : null;
                const endTime = endDate ? endDate.getTime() : null;

                const isStart = startTime !== null && itemTime === startTime;
                const isEnd = endTime !== null && itemTime === endTime;
                const isBetween =
                  startTime !== null &&
                  endTime !== null &&
                  itemTime > startTime &&
                  itemTime < endTime;

                const isSelected = isStart || isEnd;
                const isRangeActive = startTime !== null && endTime !== null;

                const dayColorType = getDayColorType(item.date, item.isCurrentMonth);
                const isPast = itemTime < todayStart.getTime();

                const dayLabel = `${item.date.getFullYear()}년 ${item.date.getMonth() + 1}월 ${item.date.getDate()}일 ${WEEK_DAYS[item.date.getDay()]}요일`;

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.dayCell}
                    onPress={() => onDayPress(item.date, item.isCurrentMonth)}
                    disabled={isPast}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={dayLabel}
                    accessibilityState={{ selected: isSelected, disabled: isPast }}
                  >

                    {isRangeActive && (isBetween || isStart || isEnd) && (
                      <View
                        style={[
                          styles.rangeBg,
                          isStart && styles.rangeBgStart,
                          isEnd && styles.rangeBgEnd,
                        ]}
                      />
                    )}

                    <View
                      style={[
                        styles.dayCircle,
                        isSelected && styles.dayCircleSelected,
                        isToday(item.date) && !isSelected && styles.dayCircleToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          dayColorType === 'outside' && styles.dayTextOutside,
                          dayColorType === 'sunday' && !isSelected && { color: COLORS.danger },
                          dayColorType === 'saturday' && !isSelected && { color: COLORS.weekendBlue },
                          isToday(item.date) && !isSelected && styles.dayTextToday,
                          isPast && styles.dayTextPast,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {item.dayNumber}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
