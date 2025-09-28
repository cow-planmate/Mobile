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
import CalendarModal from '../../../components/common/CalendarModal';
import PaxModal from '../../../components/common/PaxModal';
import SelectionModal, {
  OptionType,
} from '../../../components/common/SelectionModal';

// --- 컴포넌트 및 상수 정의 (이전과 동일) ---
const COLORS = {
  primary: '#007AFF',
  background: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
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
// --- 여기까지 컴포넌트 및 상수 정의 ---

export default function HomeScreen() {
  // 날짜 관련 State
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 3)),
  );
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  // 인원수 관련 State
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isPaxModalVisible, setPaxModalVisible] = useState(false);

  // 이동수단 관련 State
  const [transport, setTransport] = useState('대중교통');
  const [isTransportModalVisible, setTransportModalVisible] = useState(false);
  const transportOptions: OptionType[] = [
    { label: '대중교통', icon: '🚌' },
    { label: '자동차', icon: '🚗' },
  ];

  // 기타 입력값 State
  const [departure, setDeparture] = useState('서울');
  const [destination, setDestination] = useState('부산');

  // 날짜 포맷 함수
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  // 인원수 텍스트 포맷 함수
  const getPaxText = () => {
    let text = `성인 ${adults}명`;
    if (children > 0) {
      text += `, 어린이 ${children}명`;
    }
    return text;
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
            onPress={() => setCalendarVisible(true)}
          />
          <InputField
            label="인원수"
            value={getPaxText()}
            icon="👥"
            onPress={() => setPaxModalVisible(true)}
          />
          <InputField
            label="이동수단"
            value={transport}
            icon="🚗"
            isLast={true}
            onPress={() => setTransportModalVisible(true)}
          />
        </View>

        <Pressable style={styles.submitButton}>
          <Text style={styles.submitButtonText}>일정 생성하기</Text>
        </Pressable>
      </ScrollView>

      {/* 달력 모달 */}
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

      {/* 인원수 선택 모달 */}
      <PaxModal
        visible={isPaxModalVisible}
        onClose={() => setPaxModalVisible(false)}
        onConfirm={({ adults, children }) => {
          setAdults(adults);
          setChildren(children);
          setPaxModalVisible(false);
        }}
        initialAdults={adults}
        initialChildren={children}
      />

      {/* 이동수단 선택 모달 */}
      <SelectionModal
        visible={isTransportModalVisible}
        title="이동수단 선택"
        options={transportOptions}
        onClose={() => setTransportModalVisible(false)}
        onSelect={(option: string) => {
          setTransport(option);
          setTransportModalVisible(false);
        }}
        currentValue={transport}
      />
    </SafeAreaView>
  );
}

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
