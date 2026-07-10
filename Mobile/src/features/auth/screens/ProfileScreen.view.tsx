import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingSpinner, UpdateGenderModal, UpdatePasswordModal, UpdateThemeModal, UpdateValueModal } from '../../../components/common';
import {
  User,
  Settings,
  Award,
  Trophy,
  Lock,
  ChevronRight,
  X,
} from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import gravatarUrl from '../../../utils/gravatarUrl';
import { normalize } from '../../../utils/normalize';
import { styles, COLORS } from './ProfileScreen.styles';

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
  const [settingsVisible, setSettingsVisible] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner color={COLORS.primary} />
      </View>
    );
  }

  // 선호테마 추출 및 파싱
  const preferredThemes = user.preferredThemes || [];
  const themeNames = preferredThemes.map((t: any) => t.preferredThemeName || t);
  const defaultThemes = ['해수욕장', '호텔', '한식', '고기집', '이자카야'];
  const displayThemes = themeNames.length > 0 ? themeNames : defaultThemes;

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + normalize(40) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. 프로필 카드 ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            {/* 프로필 이미지 & 설정 버튼 */}
            <View style={styles.avatarContainer}>
              {user.email ? (
                <FastImage
                  source={{ uri: gravatarUrl(user.email, 200), priority: FastImage.priority.normal }}
                  style={styles.avatarImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#9CA3AF" />
                </View>
              )}
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setSettingsVisible(true)}
                activeOpacity={0.8}
              >
                <Settings size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 닉네임, 등급, 이메일, 성별/나이 */}
            <View style={styles.profileTextInfo}>
              <View style={styles.nicknameRow}>
                <Text style={styles.nicknameText}>{user.name || '사용자'}</Text>
                <View style={styles.levelBadge}>
                  <Award size={10} color="#FFFFFF" />
                  <Text style={styles.levelBadgeText}>LV.1 • 여행 입문자</Text>
                </View>
              </View>

              <View style={styles.emailRow}>
                <Text style={styles.emailText} numberOfLines={1}>{user.email || '이메일 없음'}</Text>
                <Text style={styles.emailDivider}>|</Text>
                <View style={styles.genderAgeBadge}>
                  <Text style={styles.genderAgeBadgeText}>
                    {user.gender || '미설정'} • {user.age === '미설정' ? '미설정' : `${user.age}세`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 경험치 프로그레스 바 */}
          <View style={styles.experienceSection}>
            <View style={styles.experienceLabelRow}>
              <Text style={styles.experienceTitle}>현재 경험치</Text>
              <Text style={styles.experienceValue}>10 / 100 EXP</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '10%' }]} />
            </View>
          </View>

          {/* 관심 분야 태그 */}
          <View style={styles.tagSection}>
            {displayThemes.map((theme: string, idx: number) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestTagText}>
                  {theme.startsWith('#') ? theme : `#${theme}`}
                </Text>
              </View>
            ))}
          </View>

          {/* 통계 수치 3종 */}
          <View style={styles.statsSection}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>나의 일정</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>초대된 일정</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>좋아요</Text>
            </View>
          </View>
        </View>

        {/* ── 2. 내 업적 카드 ── */}
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <View style={styles.achievementTitleRow}>
              <Award size={18} color="#1344FF" />
              <Text style={styles.achievementTitle}>내 업적</Text>
            </View>
            <View style={styles.achievementProgressBadge}>
              <Text style={styles.achievementProgressText}>3 / 5 달성</Text>
            </View>
          </View>

          <View style={styles.badgeList}>
            {/* 업적 1: 첫 걸음 (활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#FEF3C7' }]}>
              <Trophy size={11} color="#D97706" />
              <Text style={[styles.badgeText, { color: '#D97706' }]}>첫 걸음</Text>
            </View>

            {/* 업적 2: 계획의 달인 (활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#DBEAFE' }]}>
              <Trophy size={11} color="#2563EB" />
              <Text style={[styles.badgeText, { color: '#2563EB' }]}>계획의 달인</Text>
            </View>

            {/* 업적 3: 열혈 리뷰어 (활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#FCE7F3' }]}>
              <Trophy size={11} color="#DB2777" />
              <Text style={[styles.badgeText, { color: '#DB2777' }]}>열혈 리뷰어</Text>
            </View>

            {/* 업적 4: 베스트 파트너 (비활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>베스트 파트너</Text>
            </View>

            {/* 업적 5: 전국 제패 (비활성) */}
            <View style={[styles.achievementBadge, { backgroundColor: '#F3F4F6' }]}>
              <Lock size={11} color="#9CA3AF" />
              <Text style={[styles.badgeText, { color: '#9CA3AF' }]}>전국 제패</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── 3. 설정 바텀 시트 모달 ── */}
      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.settingsOverlay}>
          <Pressable 
            style={styles.settingsDismiss} 
            onPress={() => setSettingsVisible(false)} 
          />
          <View style={styles.settingsSheet}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>프로필 설정</Text>
              <TouchableOpacity 
                style={styles.settingsCloseButton} 
                onPress={() => setSettingsVisible(false)}
              >
                <X size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
              {/* 닉네임 변경 */}
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => {
                  setSettingsVisible(false);
                  setNicknameModalVisible(true);
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>닉네임 변경</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 나이 변경 */}
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => {
                  setSettingsVisible(false);
                  setAgeModalVisible(true);
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>나이 변경</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 성별 변경 */}
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => {
                  setSettingsVisible(false);
                  setGenderModalVisible(true);
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>성별 변경</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 선호테마 변경 */}
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => {
                  setSettingsVisible(false);
                  setThemeModalVisible(true);
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>선호 테마 변경</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 비밀번호 변경 */}
              {user.socialLogin === false && (
                <TouchableOpacity 
                  style={styles.settingsItem}
                  onPress={() => {
                    setSettingsVisible(false);
                    setPasswordModalVisible(true);
                  }}
                >
                  <View style={styles.settingsItemLeft}>
                    <Text style={styles.settingsItemText}>비밀번호 변경</Text>
                  </View>
                  <ChevronRight size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {/* 로그아웃 */}
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => {
                  setSettingsVisible(false);
                  logout();
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>로그아웃</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>

              {/* 회원 탈퇴 */}
              <TouchableOpacity 
                style={[styles.settingsItem, { borderBottomWidth: 0 }]}
                onPress={() => {
                  setSettingsVisible(false);
                  handleResign();
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemDangerText}>회원 탈퇴</Text>
                </View>
                <ChevronRight size={18} color="#EF4444" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 기존 Modal 포탈들 ── */}
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
    </View>
  );
}
