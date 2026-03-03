import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import {
  User,
  Mail,
  Calendar,
  Heart,
  Lock,
  Pencil,
  ChevronRight,
  LogOut,
  UserX,
} from 'lucide-react-native';
import UpdateValueModal from '../../../components/common/UpdateValueModal';
import UpdateGenderModal from '../../../components/common/UpdateGenderModal';
import UpdateThemeModal from '../../../components/common/UpdateThemeModal';
import UpdatePasswordModal from '../../../components/common/UpdatePasswordModal';
import { styles, COLORS } from './ProfileScreen.styles';

/* ── Reusable row components ── */

const InfoRow = ({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
}) => {
  const content = (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>{icon}</View>
      <View style={styles.infoBody}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      {onPress && (
        <View style={styles.infoAction}>
          <ChevronRight size={16} color={COLORS.placeholder} strokeWidth={2} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
      >
        {content}
      </Pressable>
    );
  }
  return content;
};

export interface ProfileScreenViewProps {
  loading: boolean;
  user: {
    name: string;
    email: string;
    age: string;
    gender: string;
    preferredTheme: string;
  };
  isNicknameModalVisible: boolean;
  setNicknameModalVisible: (visible: boolean) => void;
  isAgeModalVisible: boolean;
  setAgeModalVisible: (visible: boolean) => void;
  isGenderModalVisible: boolean;
  setGenderModalVisible: (visible: boolean) => void;
  isThemeModalVisible: boolean;
  setThemeModalVisible: (visible: boolean) => void;
  isPasswordModalVisible: boolean;
  setPasswordModalVisible: (visible: boolean) => void;
  handleUpdateNickname: (val: string) => Promise<void>;
  handleUpdateAge: (val: string) => Promise<void>;
  handleUpdateGender: (val: string) => Promise<void>;
  handleUpdateTheme: () => Promise<void>;
  handleUpdatePassword: (current: string, newPass: string) => Promise<void>;
  handleResign: () => void;
  logout: () => Promise<void>;
}

export default function ProfileScreenView({
  loading,
  user,
  isNicknameModalVisible,
  setNicknameModalVisible,
  isAgeModalVisible,
  setAgeModalVisible,
  isGenderModalVisible,
  setGenderModalVisible,
  isThemeModalVisible,
  setThemeModalVisible,
  isPasswordModalVisible,
  setPasswordModalVisible,
  handleUpdateNickname,
  handleUpdateAge,
  handleUpdateGender,
  handleUpdateTheme,
  handleUpdatePassword,
  handleResign,
  logout,
}: ProfileScreenViewProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ── Profile Header ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color={COLORS.primary} strokeWidth={1.5} />
          </View>
          <Pressable
            style={styles.profileNameRow}
            onPress={() => setNicknameModalVisible(true)}
          >
            <Text style={styles.profileName}>{user.name}</Text>
            <View style={styles.editBadge}>
              <Pencil size={14} color={COLORS.primary} strokeWidth={2} />
            </View>
          </Pressable>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>

        {/* ── Account Info ── */}
        <Text style={styles.sectionLabel}>계정 정보</Text>
        <View style={styles.sectionContainer}>
          <InfoRow
            icon={
              <Mail size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
            }
            label="이메일"
            value={user.email}
          />
          <View style={styles.rowSeparator} />
          <InfoRow
            icon={
              <Calendar
                size={18}
                color={COLORS.textSecondary}
                strokeWidth={1.5}
              />
            }
            label="나이"
            value={user.age}
            onPress={() => setAgeModalVisible(true)}
          />
          <View style={styles.rowSeparator} />
          <InfoRow
            icon={
              <User size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
            }
            label="성별"
            value={user.gender}
            onPress={() => setGenderModalVisible(true)}
          />
        </View>

        {/* ── Preferences ── */}
        <Text style={styles.sectionLabel}>여행 설정</Text>
        <View style={styles.sectionContainer}>
          <InfoRow
            icon={
              <Heart size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
            }
            label="선호 테마"
            value={user.preferredTheme}
            onPress={() => setThemeModalVisible(true)}
          />
          <View style={styles.rowSeparator} />
          <InfoRow
            icon={
              <Lock size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
            }
            label="비밀번호"
            value="••••••••"
            onPress={() => setPasswordModalVisible(true)}
          />
        </View>

        {/* ── Danger Zone ── */}
        <Text style={styles.sectionLabel}>기타</Text>
        <View style={styles.dangerSection}>
          <Pressable
            onPress={logout}
            style={({ pressed }) => [
              styles.dangerRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.dangerIconWrap}>
              <LogOut
                size={18}
                color={COLORS.textSecondary}
                strokeWidth={1.5}
              />
            </View>
            <Text style={styles.dangerText}>로그아웃</Text>
            <ChevronRight
              size={16}
              color={COLORS.placeholder}
              strokeWidth={2}
            />
          </Pressable>
          <View style={styles.rowSeparator} />
          <Pressable
            onPress={handleResign}
            style={({ pressed }) => [
              styles.dangerRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View
              style={[styles.dangerIconWrap, { backgroundColor: '#FEF2F2' }]}
            >
              <UserX size={18} color={COLORS.error} strokeWidth={1.5} />
            </View>
            <Text style={[styles.dangerText, styles.dangerTextRed]}>
              회원 탈퇴
            </Text>
            <ChevronRight size={16} color={COLORS.error} strokeWidth={2} />
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Modals ── */}
      <UpdateValueModal
        visible={isNicknameModalVisible}
        onClose={() => setNicknameModalVisible(false)}
        onConfirm={handleUpdateNickname}
        title="닉네임 변경"
        label="새로운 닉네임"
        initialValue={user.name}
      />
      <UpdateValueModal
        visible={isAgeModalVisible}
        onClose={() => setAgeModalVisible(false)}
        onConfirm={handleUpdateAge}
        title="나이 변경"
        label="나이"
        keyboardType="numeric"
        initialValue={user.age === '미설정' ? '' : user.age}
      />
      <UpdateGenderModal
        visible={isGenderModalVisible}
        onClose={() => setGenderModalVisible(false)}
        onConfirm={handleUpdateGender}
        initialGender={user.gender === '남성' ? 'male' : 'female'}
      />
      <UpdateThemeModal
        visible={isThemeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        onConfirm={handleUpdateTheme}
      />
      <UpdatePasswordModal
        visible={isPasswordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        onConfirm={handleUpdatePassword}
      />
    </SafeAreaView>
  );
}
