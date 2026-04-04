import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faEnvelope,
  faCalendar,
  faVenus,
  faMars,
  faHeart,
  faLock,
  faPen,
  faMapMarkerAlt,
  faBed,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';
import {
  User,
  Mail,
  Calendar,
  Heart,
  Lock,
  ChevronRight,
  Pencil,
  LogOut,
} from 'lucide-react-native';
import { Image } from 'react-native';
import gravatarUrl from '../../../utils/gravatarUrl';
import UpdateValueModal from '../../../components/common/UpdateValueModal';
import UpdateGenderModal from '../../../components/common/UpdateGenderModal';
import UpdateThemeModal from '../../../components/common/UpdateThemeModal';
import UpdatePasswordModal from '../../../components/common/UpdatePasswordModal';
import { styles, COLORS } from './ProfileScreen.styles';

/* ── Reusable card components ── */

const InfoCard = ({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
}) => (
  <View style={styles.sectionCard}>
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleRow}>
        {icon}
        <Text style={styles.cardTitle}>{label}</Text>
      </View>
      {onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.changeText}>변경하기</Text>
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  </View>
);

const ThemeTag = ({ text }: { text: string }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{text}</Text>
  </View>
);

interface ProfileScreenViewProps {
  loading: boolean;
  user: any;
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
  handleUpdateNickname: (val: string) => void;
  handleUpdateAge: (val: string) => void;
  handleUpdateGender: (val: string) => void;
  handleUpdateTheme: () => void;
  handleUpdatePassword: (cur: string, n: string) => void;
  handleResign: () => void;
  logout: () => void;
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
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 요약 (PNG Style Header) */}
        <View style={styles.profileInfoArea}>
          <View style={styles.avatarWrap}>
            {user.email ? (
              <Image
                source={{ uri: gravatarUrl(user.email, 200) }}
                style={styles.avatarImage}
              />
            ) : (
              <User size={50} color="#D1D5DB" />
            )}
          </View>
          <TouchableOpacity
            style={styles.nicknameRow}
            onPress={() => setNicknameModalVisible(true)}
          >
            <Text style={styles.nicknameText}>{user.name}</Text>
            <FontAwesomeIcon
              icon={faPen}
              size={18}
              color="#6B7280"
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Content Area (내 일정 화면처럼 큰 테두리 하나로 감싸기) */}
        <View style={styles.sectionWrapper}>
          <View style={styles.contentArea}>
            {/* 이메일 카드 */}
            <InfoCard
              icon={
                <FontAwesomeIcon icon={faEnvelope} size={20} color="#374151" />
              }
              label="이메일"
              value={user.email}
            />

            {/* 나이 카드 */}
            <InfoCard
              icon={
                <FontAwesomeIcon icon={faCalendar} size={20} color="#374151" />
              }
              label="나이"
              value={user.age}
              onPress={() => setAgeModalVisible(true)}
            />

            {/* 성별 카드 */}
            <InfoCard
              icon={
                <FontAwesomeIcon
                  icon={user.gender === '남자' ? faMars : faVenus}
                  size={20}
                  color="#374151"
                />
              }
              label="성별"
              value={user.gender}
              onPress={() => setGenderModalVisible(true)}
            />

            {/* 선호테마 카드 */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <FontAwesomeIcon icon={faHeart} size={20} color="#374151" />
                  <Text style={styles.cardTitle}>선호테마</Text>
                </View>
                <TouchableOpacity onPress={() => setThemeModalVisible(true)}>
                  <Text style={styles.changeText}>변경하기</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.themeCategory}>
                <View style={styles.themeCategoryHeader}>
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    size={16}
                    color="#4B5563"
                  />
                  <Text style={styles.themeCategoryTitle}>관광지</Text>
                </View>
                <View style={styles.tagContainer}>
                  <ThemeTag text="해수욕장" />
                </View>
              </View>

              <View style={styles.themeCategory}>
                <View style={styles.themeCategoryHeader}>
                  <FontAwesomeIcon icon={faBed} size={16} color="#4B5563" />
                  <Text style={styles.themeCategoryTitle}>숙소</Text>
                </View>
                <View style={styles.tagContainer}>
                  <ThemeTag text="캠핑장" />
                </View>
              </View>

              <View style={styles.themeCategory}>
                <View style={styles.themeCategoryHeader}>
                  <FontAwesomeIcon
                    icon={faUtensils}
                    size={16}
                    color="#4B5563"
                  />
                  <Text style={styles.themeCategoryTitle}>식당</Text>
                </View>
                <View style={styles.tagContainer}>
                  <ThemeTag text="분식" />
                </View>
              </View>
            </View>

            {/* 비밀번호 카드 */}
            {user.socialLogin === false && (
              <InfoCard
                icon={
                  <FontAwesomeIcon icon={faLock} size={20} color="#374151" />
                }
                label="비밀번호"
                value="비밀번호 수정이 가능합니다"
                onPress={() => setPasswordModalVisible(true)}
              />
            )}
          </View>

          {/* 하단 버튼 영역 */}
          <View style={styles.footerArea}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resignButton}
              onPress={handleResign}
            >
              <Text style={styles.resignText}>탈퇴하기</Text>
            </TouchableOpacity>
          </View>
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
        initialGender={user.gender === '남자' ? 'male' : 'female'}
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
