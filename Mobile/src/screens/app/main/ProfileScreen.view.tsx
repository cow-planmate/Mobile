import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import UpdateValueModal from '../../../components/common/UpdateValueModal';
import UpdateGenderModal from '../../../components/common/UpdateGenderModal';
import UpdateThemeModal from '../../../components/common/UpdateThemeModal';
import UpdatePasswordModal from '../../../components/common/UpdatePasswordModal';
import { styles, COLORS } from './ProfileScreen.styles';

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
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            <Text style={styles.profileIconText}>👤</Text>
          </View>
          <TouchableOpacity
            style={styles.profileNameContainer}
            onPress={() => setNicknameModalVisible(true)}
          >
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
            onPress={() => setAgeModalVisible(true)}
          />
          <View style={styles.separator} />
          <EditableCard
            icon="♂"
            label="성별"
            value={user.gender}
            onPress={() => setGenderModalVisible(true)}
          />
          <View style={styles.separator} />
          <EditableCard
            icon="❤️"
            label="선호테마"
            value={user.preferredTheme}
            onPress={() => setThemeModalVisible(true)}
          />
          <View style={styles.separator} />
          <EditableCard
            icon="🔒"
            label="비밀번호"
            value="••••••••"
            onPress={() => setPasswordModalVisible(true)}
          />
        </View>

        <View style={styles.linksContainer}>
          <Pressable onPress={logout}>
            <Text style={styles.linkText}>로그아웃</Text>
          </Pressable>
          <Pressable onPress={handleResign}>
            <Text style={[styles.linkText, styles.deleteLinkText]}>
              탈퇴하기
            </Text>
          </Pressable>
        </View>
      </ScrollView>

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
