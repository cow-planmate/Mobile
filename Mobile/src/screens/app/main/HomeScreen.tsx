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

// 색상 팔레트
const COLORS = {
  primary: '#1344ff',
  background: '#F0F2F5', // 화면 전체 배경색
  card: '#FFFFFF', // 카드 배경색
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF', // 추가: 흰색
};

// 재사용 컴포넌트를 조금 더 개선합니다.
type InputFieldProps = {
  label: string;
  value: string;
  icon: string;
  isLast?: boolean; // 마지막 항목인지 여부를 받기 위함
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
  const [departure, setDeparture] = useState('서울');
  const [destination, setDestination] = useState('부산');
  const [period, setPeriod] = useState('2025. 9. 25. ~ 9. 28.');
  const [pax, setPax] = useState('성인 2명');
  const [transport, setTransport] = useState('대중교통');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>어디로 떠나볼까요?</Text>

        {/* 입력 필드들을 담는 카드 컨테이너 */}
        <View style={styles.card}>
          <InputField label="출발지" value={departure} icon="📍" />
          <InputField label="여행지" value={destination} icon="🌍" />
          <InputField label="기간" value={period} icon="🗓️" />
          <InputField label="인원수" value={pax} icon="👥" />
          <InputField
            label="이동수단"
            value={transport}
            icon="🚗"
            isLast={true}
          />
        </View>

        {/* 일정 생성 버튼 */}
        <Pressable style={styles.submitButton}>
          <Text style={styles.submitButtonText}>일정 생성하기</Text>
        </Pressable>
      </ScrollView>
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
    // 그림자 효과
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
    marginLeft: 55, // 아이콘 너비 + 마진 만큼 왼쪽 여백
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
