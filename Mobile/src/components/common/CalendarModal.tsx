// src/components/common/CalendarModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// 달력 한글 설정
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

// 컴포넌트가 받을 props 타입 정의
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
  const [startDate, setStartDate] = useState<Date | null>(
    initialStartDate || null,
  );
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);

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

    const selectedColor = '#007AFF';
    const textColor = 'white';

    // 시작일만 선택된 경우, 동그랗게 표시
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

    // 기간이 선택된 경우
    let current = new Date(startDate.getTime());
    while (current <= endDate) {
      const key = current.toISOString().split('T')[0];
      const isStart = current.getTime() === startDate.getTime();
      const isEnd = current.getTime() === endDate.getTime();
      const isSunday = current.getDay() === 0;
      const isSaturday = current.getDay() === 6;

      const containerStyle: any = {
        backgroundColor: selectedColor,
        // 기본적으로는 모서리를 둥글게 하지 않음
        borderRadius: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      };

      // 조건에 따라 모서리 둥글게 처리
      if (isStart || isSunday) {
        containerStyle.borderTopLeftRadius = 15;
        containerStyle.borderBottomLeftRadius = 15;
      }
      if (isEnd || isSaturday) {
        containerStyle.borderTopRightRadius = 15;
        containerStyle.borderBottomRightRadius = 15;
      }
      // 하루만 선택된 경우 전체를 둥글게
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
      // 날짜를 하나만 선택하고 확인을 누른 경우, 시작일과 종료일을 동일하게 처리
      onConfirm({ startDate, endDate: startDate });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Calendar
            onDayPress={onDayPress}
            markingType={'custom'} // ⭐️ 'period'에서 'custom'으로 변경
            markedDates={getMarkedDates()}
          />
          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={onClose}>
              <Text>취소</Text>
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
    backgroundColor: 'white',
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
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
