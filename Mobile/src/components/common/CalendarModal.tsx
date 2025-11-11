// src/components/common/CalendarModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// ... (LocaleConfig 부분은 그대로 유지)
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

const COLORS = {
  primary: '#1344FF',
  white: '#FFFFFF',
  lightGray: '#F0F0F0',
  text: '#1C1C1E',
  placeholder: '#8E8E93', // ⭐️ placeholder 색상 추가
};

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

    if (!endDate) {
      const startKey = startDate.toISOString().split('T')[0];
      marked[startKey] = {
        customStyles: {
          container: { backgroundColor: selectedColor, borderRadius: 15 },
          text: { color: textColor, fontWeight: 'bold' },
        },
      };
      return marked;
    }

    let current = new Date(startDate.getTime());
    while (current <= endDate) {
      const key = current.toISOString().split('T')[0];
      const isStart = current.getTime() === startDate.getTime();
      const isEnd = current.getTime() === endDate.getTime();
      const isSunday = current.getDay() === 0;
      const isSaturday = current.getDay() === 6;

      const containerStyle: any = {
        backgroundColor: selectedColor,
        borderRadius: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      };

      if (isStart || isSunday) {
        containerStyle.borderTopLeftRadius = 15;
        containerStyle.borderBottomLeftRadius = 15;
      }
      if (isEnd || isSaturday) {
        containerStyle.borderTopRightRadius = 15;
        containerStyle.borderBottomRightRadius = 15;
      }
      if (isStart && isEnd) {
        containerStyle.borderRadius = 15;
      }

      marked[key] = {
        customStyles: {
          container: containerStyle,
          text: { color: textColor, fontWeight: 'bold' },
        },
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

  return (
    // ⭐️ 'slide'를 'fade'로 변경하여 다른 모달과 동일한 애니메이션 효과를 적용합니다.
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Calendar
            onDayPress={onDayPress}
            markingType={'custom'}
            markedDates={getMarkedDates()}
            // ⭐️ 수정: 테마 색상 적용
            theme={{
              todayTextColor: COLORS.primary,
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.text,
              textSectionTitleColor: COLORS.placeholder,
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

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginHorizontal: 5,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
