import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { X } from 'lucide-react-native';

LocaleConfig.locales.kr = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1.',
    '2.',
    '3.',
    '4.',
    '5.',
    '6.',
    '7.',
    '8.',
    '9.',
    '10.',
    '11.',
    '12.',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

import { styles, COLORS, FONTS } from './CalendarModal.styles';

type CalendarModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dates: { startDate: Date; endDate: Date }) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
};

export default function CalendarModal({
  visible,
  onClose,
  onConfirm,
  initialStartDate,
  initialEndDate,
}: CalendarModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (visible) {
      setStartDate(initialStartDate || null);
      setEndDate(initialEndDate || null);
    }
  }, [visible, initialStartDate, initialEndDate]);

  const onDayPress = (day: any) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(new Date(day.timestamp));
      setEndDate(null);
    } else if (startDate && !endDate) {
      const newEndDate = new Date(day.timestamp);
      if (newEndDate < startDate) {
        setStartDate(newEndDate);
        setEndDate(null);
      } else {
        setEndDate(newEndDate);
      }
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    if (!startDate) return marked;

    const selectedColor = COLORS.primary;
    const textColor = COLORS.white;

    if (!endDate || startDate.getTime() === endDate.getTime()) {
      const startKey = startDate.toISOString().split('T')[0];
      marked[startKey] = {
        startingDay: true,
        endingDay: true,
        color: selectedColor,
        textColor: textColor,
      };
      return marked;
    }

    let current = new Date(startDate.getTime());
    while (current <= endDate) {
      const key = current.toISOString().split('T')[0];
      const isStart = current.getTime() === startDate.getTime();
      const isEnd = current.getTime() === endDate.getTime();

      marked[key] = {
        startingDay: isStart,
        endingDay: isEnd,
        color: selectedColor,
        textColor: textColor,
      };

      current.setDate(current.getDate() + 1);
    }
    return marked;
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
          <Calendar
            onDayPress={onDayPress}
            markingType={'period'}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: COLORS.primary,
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.text,
              textMonthFontFamily: FONTS.bold,
              textMonthFontSize: 20,
              textDayHeaderFontFamily: FONTS.semibold,
              textDayHeaderFontSize: 16,
              textDayFontFamily: FONTS.medium,
              textDayFontSize: 18,
              textSectionTitleColor: COLORS.placeholder,
              'stylesheet.day.period': {
                fillers: {
                  position: 'absolute',
                  height: 34,
                  flexDirection: 'row',
                  left: -2,
                  right: -2,
                },
              },
            }}
          />
          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

