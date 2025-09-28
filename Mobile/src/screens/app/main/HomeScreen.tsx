// src/screens/app/main/HomeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
// ⭐️ 1. 기존 DatePicker import를 삭제하고, 새로 만든 CalendarModal을 불러옵니다.
import CalendarModal from '../../../components/common/CalendarModal';

// (이하 COLORS, InputField 컴포넌트는 이전과 동일)
const COLORS = {
  primary: '#007AFF',
  background: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
};
type InputFieldProps = {
  label: string;
  value: string;
  icon: string;
  isLast?: boolean;
  onPress?: () => void;
};
const InputField = ({
  label,
  value,
  icon,
  isLast = false,
  onPress,
}: InputFieldProps) => (
  <>
    <TouchableOpacity style={styles.inputSection} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
    {!isLast && <View style={styles.separator} />}
  </>
);

export default function HomeScreen() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 3)),
  ); // 예시로 3일 뒤로 설정
  // ⭐️ 2. isPickerVisible을 isCalendarVisible로 이름 변경 (의미 명확화)
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const [departure, setDeparture] = useState('서울');
  const [destination, setDestination] = useState('부산');
  const [pax, setPax] = useState('성인 2명');
  const [transport, setTransport] = useState('대중교통');

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>어디로 떠나볼까요?</Text>

        <View style={styles.card}>
          <InputField label="출발지" value={departure} icon="📍" />
          <InputField label="여행지" value={destination} icon="🌍" />
          <InputField
            label="기간"
            value={`${formatDate(startDate)} ~ ${formatDate(endDate)}`}
            icon="🗓️"
            // ⭐️ 3. 달력 모달을 열도록 onPress 이벤트 수정
            onPress={() => setCalendarVisible(true)}
          />
          <InputField label="인원수" value={pax} icon="👥" />
          <InputField
            label="이동수단"
            value={transport}
            icon="🚗"
            isLast={true}
          />
        </View>

        <Pressable style={styles.submitButton}>
          <Text style={styles.submitButtonText}>일정 생성하기</Text>
        </Pressable>
      </ScrollView>

      {/* ⭐️ 4. 기존 DatePicker를 지우고 CalendarModal 컴포넌트를 사용 */}
      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
        onConfirm={({ startDate, endDate }) => {
          setStartDate(startDate);
          setEndDate(endDate);
          setCalendarVisible(false);
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </SafeAreaView>
  );
}

// (styles 부분은 이전과 동일합니다.)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  icon: {
    fontSize: 24,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.placeholder,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 55,
  },
  submitButton: {
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 30,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
