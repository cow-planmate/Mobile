import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
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

export default function CalendarModal({
  visible,
  onClose,
  onConfirm,
  initialStartDate,
  initialEndDate,
}: CalendarModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 현재 표시 중인 달력의 연/월 상태 (0-indexed month)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (visible) {
      const start = initialStartDate || null;
      const end = initialEndDate || null;
      setStartDate(start);
      setEndDate(end);

      // 모달이 열릴 때 선택된 시작일 기준 또는 오늘 날짜 기준으로 연/월 포커스
      const baseDate = start || new Date();
      setCurrentYear(baseDate.getFullYear());
      setCurrentMonth(baseDate.getMonth());
    }
  }, [visible, initialStartDate, initialEndDate]);

  // 해당 월의 42개 일자 그리드 데이터 계산
  const daysGrid = useMemo<CalendarDay[]>(() => {
    const grid: CalendarDay[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (일요일) ~ 6 (토요일)
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    // 1. 이전 달의 날짜 채우기 (회색 표시)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDayNum = prevTotalDays - i;
      const date = new Date(currentYear, currentMonth - 1, prevDayNum);
      grid.push({
        date,
        isCurrentMonth: false,
        dayNumber: prevDayNum,
      });
    }

    // 2. 현재 달의 날짜 채우기
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentYear, currentMonth, i);
      grid.push({
        date,
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    // 3. 다음 달의 날짜 채우기 (그리드 42개 고정)
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

  const onDayPress = (date: Date) => {
    // 시간 정보 초기화하여 비교 일치성 보장
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (!startDate || (startDate && endDate)) {
      setStartDate(targetDate);
      setEndDate(null);
    } else {
      if (targetDate < startDate) {
        setStartDate(targetDate);
        setEndDate(null);
      } else {
        setEndDate(targetDate);
      }
    }
  };

  const handleConfirm = () => {
    if (startDate && endDate) {
      onConfirm({ startDate, endDate });
    } else if (startDate && !endDate) {
      onConfirm({ startDate, endDate: startDate });
    }
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
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>여행 기간 선택</Text>
              <Text style={styles.headerSubtitle}>{formatSelectedRange()}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButtonContainer}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color={COLORS.placeholder} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* ── Custom Calendar Body ── */}
          <View style={styles.calendarContainer}>
            {/* 연/월 내비게이션 바 */}
            <View style={styles.monthNavRow}>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={handlePrevMonth}
                activeOpacity={0.7}
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
              >
                <ChevronRight size={20} color={COLORS.subtext} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
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

            {/* 일자 그리드 */}
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

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.dayCell}
                    onPress={() => onDayPress(item.date)}
                    activeOpacity={0.8}
                  >
                    {/* 범위 선택 시 물결 연결 배경 */}
                    {isRangeActive && (isBetween || isStart || isEnd) && (
                      <View
                        style={[
                          styles.rangeBg,
                          isStart && styles.rangeBgStart,
                          isEnd && styles.rangeBgEnd,
                        ]}
                      />
                    )}

                    {/* 일자 숫자 원 */}
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

          {/* 하단 확인 버튼 */}
          <View style={styles.confirmFooter}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
