import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { LoadingSpinner, UpdateGenderModal, UpdatePasswordModal, UpdateThemeModal } from '../../../components/common';
import {
  User,
  Settings,
  Award,
  Trophy,
  Lock,
  X,
  Camera,
  AlertTriangle,
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
  handleUpdateNickname: (val: string) => Promise<void>;
  handleUpdateAge: (val: string) => Promise<void>;
  handleUpdateGender: (val: string) => Promise<void>;
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [tempAge, setTempAge] = useState('');
  const [tempGender, setTempGender] = useState('');

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

  const handleOpenEditModal = () => {
    setTempNickname(user.name);
    setTempAge(user.age === '미설정' ? '' : user.age.toString());
    setTempGender(user.gender);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!tempNickname.trim()) {
        Toast.show({
          type: 'error',
          text1: '닉네임을 입력해주세요.',
          position: 'top',
        });
        return;
      }
      
      let hasChange = false;
      if (tempNickname !== user.name) {
        await handleUpdateNickname(tempNickname);
        hasChange = true;
      }
      if (tempAge !== (user.age === '미설정' ? '' : user.age.toString())) {
        await handleUpdateAge(tempAge);
        hasChange = true;
      }
      if (tempGender !== user.gender) {
        await handleUpdateGender(tempGender);
        hasChange = true;
      }
      
      if (hasChange) {
        Toast.show({
          type: 'success',
          text1: '프로필 정보가 저장되었습니다.',
          position: 'top',
        });
      }
      setEditModalVisible(false);
    } catch (err) {
      console.log('Failed to save profile modifications', err);
    }
  };

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
                onPress={handleOpenEditModal}
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

      {/* ── 3. 통합 프로필 수정 모달 ── */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editDialogCard}>
            {/* 상단 파란색 배경 헤더 */}
            <View style={styles.editDialogHeader}>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.8}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* 프로필 이미지 & 카메라 배지 */}
              <View style={styles.avatarEditContainer}>
                {user.email ? (
                  <FastImage
                    source={{ uri: gravatarUrl(user.email, 200), priority: FastImage.priority.normal }}
                    style={styles.avatarEditImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <View style={styles.avatarEditPlaceholder}>
                    <User size={50} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <ScrollView 
              style={styles.scrollArea}
              contentContainerStyle={styles.editDialogBody} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.editDialogTitle}>프로필 수정</Text>
              <Text style={styles.editDialogSubtitle}>나를 표현하는 정보를 변경해보세요</Text>

              {/* 이메일 계정 (Read-only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일 계정</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputDisabled]}
                  value={user.email}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* 닉네임 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>닉네임</Text>
                <View style={styles.rowInputWrap}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={tempNickname}
                    onChangeText={setTempNickname}
                    placeholder="닉네임을 입력하세요"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    style={styles.checkButton}
                    onPress={() => {
                      if (!tempNickname.trim()) {
                        Toast.show({
                          type: 'error',
                          text1: '닉네임을 입력해 주세요.',
                          position: 'top',
                        });
                      } else {
                        Toast.show({
                          type: 'success',
                          text1: '사용 가능한 닉네임입니다.',
                          position: 'top',
                        });
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.checkButtonText}>중복 확인</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 나이 & 성별 가로 배치 */}
              <View style={styles.twoColumnRow}>
                {/* 나이 */}
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>나이</Text>
                  <TextInput
                    style={styles.textInput}
                    value={tempAge}
                    onChangeText={setTempAge}
                    keyboardType="numeric"
                    placeholder="나이"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* 성별 */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>성별</Text>
                  <View style={styles.genderSelectTrack}>
                    <TouchableOpacity 
                      style={[styles.genderOptionButton, tempGender === '남자' && styles.genderOptionActive]}
                      onPress={() => setTempGender('남자')}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.genderOptionText, tempGender === '남자' && styles.genderOptionActiveText]}>남성</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.genderOptionButton, tempGender === '여자' && styles.genderOptionActive]}
                      onPress={() => setTempGender('여자')}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.genderOptionText, tempGender === '여자' && styles.genderOptionActiveText]}>여성</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 여행 취향 & 보안 설정 가로 배치 */}
              <View style={styles.twoColumnRow}>
                {/* 여행 취향 */}
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>여행 취향</Text>
                  <TouchableOpacity 
                    style={styles.actionNavButton}
                    onPress={() => setThemeModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionNavButtonText}>테마 변경</Text>
                    <Settings size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* 보안 설정 */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>보안 설정</Text>
                  <TouchableOpacity 
                    style={[styles.actionNavButton, user.socialLogin && styles.actionNavButtonDisabled]}
                    onPress={() => {
                      if (!user.socialLogin) {
                        setPasswordModalVisible(true);
                      }
                    }}
                    disabled={user.socialLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionNavButtonText}>비밀번호 변경</Text>
                    <Settings size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 오작동 우려로 스크롤 영역 하단 맨 끝에 계정 탈퇴하기 배치 */}
              <TouchableOpacity 
                style={styles.resignLinkButton}
                onPress={() => {
                  setEditModalVisible(false);
                  setTimeout(() => {
                    handleResign();
                  }, 200);
                }}
                activeOpacity={0.8}
              >
                <AlertTriangle size={14} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.resignLinkText}>계정 탈퇴하기</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* 스크롤 유도를 위한 하단 반투명 그라데이션 페이드 레이어 */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)', '#FFFFFF']}
              style={styles.fadeOverlay}
              pointerEvents="none"
            />

            {/* 스크롤 영역 밖 하단에 항시 고정된 변경사항 저장하기 버튼 */}
            <View style={styles.fixedBottomArea}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>변경사항 저장하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── 기존 Modal 포탈들 ── */}
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
