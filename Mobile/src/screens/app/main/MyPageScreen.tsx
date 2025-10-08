// src/screens/app/main/MyPageScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

const COLORS = {
  primary: '#007AFF',
  background: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
};

// 재사용 가능한 메뉴 버튼 컴포넌트
const MenuButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress}>
    <Text style={styles.menuButtonText}>{label}</Text>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

export default function MyPageScreen() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>마이페이지</Text>
      <View style={styles.card}>
        <MenuButton
          label="나이/성별 변경하기"
          onPress={() => alert('나이/성별 변경')}
        />
        <View style={styles.separator} />
        <MenuButton
          label="선호 테마 변경하기"
          onPress={() => alert('선호 테마 변경')}
        />
        <View style={styles.separator} />
        <MenuButton
          label="비밀번호 변경"
          onPress={() => alert('비밀번호 변경')}
        />
      </View>
      <View style={styles.card}>
        <MenuButton label="로그아웃" onPress={logout} />
        <View style={styles.separator} />
        <MenuButton label="탈퇴하기" onPress={() => alert('탈퇴하기')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    margin: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingLeft: 20, // 왼쪽 여백만 줌
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  menuButtonText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.placeholder,
    marginHorizontal: 20,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
