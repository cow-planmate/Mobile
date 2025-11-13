// src/screens/app/main/MyPageScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
  error: '#FF3B30',
  lightGray: '#F0F2F5',
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <View style={styles.cardContent}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  </View>
);

const EditableCard = ({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <View style={styles.cardContent}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.changeButtonText}>변경하기</Text>
    </TouchableOpacity>
  </View>
);

export default function MyPageScreen() {
  const { logout } = useAuth();

  const user = {
    name: '민영',
    email: 'min301313@gmail.com',
    age: '22',
    gender: '남자',
    preferredTheme: '미설정',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            <Text style={styles.profileIconText}>👤</Text>
          </View>
          <TouchableOpacity style={styles.profileNameContainer}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <InfoCard icon="✉️" label="이메일" value={user.email} />
          <View style={styles.separator} />
          <EditableCard
            icon="🗓️"
            label="나이"
            value={user.age}
            onPress={() => alert('나이 변경')}
          />
          <View style={styles.separator} />
          <EditableCard
            icon="♂"
            label="성별"
            value={user.gender}
            onPress={() => alert('성별 변경')}
          />
          <View style={styles.separator} />
          <EditableCard
            icon="❤️"
            label="선호테마"
            value={user.preferredTheme}
            onPress={() => alert('선호 테마 변경')}
          />
          <View style={styles.separator} />
          <EditableCard
            icon="🔒"
            label="비밀번호"
            value="••••••••"
            onPress={() => alert('비밀번호 변경')}
          />
        </View>

        <View style={styles.linksContainer}>
          <Pressable onPress={logout}>
            <Text style={styles.linkText}>로그아웃</Text>
          </Pressable>
          <Pressable onPress={() => alert('탈퇴하기')}>
            <Text style={[styles.linkText, styles.deleteLinkText]}>
              탈퇴하기
            </Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileIconText: {
    fontSize: 40,
    color: COLORS.placeholder,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editIcon: {
    fontSize: 20,
    color: COLORS.text,
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardIcon: {
    fontSize: 24,
    color: COLORS.text,
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  changeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 62,
  },
  linksContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.placeholder,
    paddingVertical: 12,
  },
  deleteLinkText: {
    color: COLORS.error,
  },
});
