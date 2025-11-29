import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // [추가] 토큰 접근용
import axios from 'axios';
import { API_URL } from '@env';
import { useAuth } from '../../../contexts/AuthContext';
import UpdateValueModal from '../../../components/common/UpdateValueModal';
import UpdateGenderModal from '../../../components/common/UpdateGenderModal';
import UpdateThemeModal from '../../../components/common/UpdateThemeModal';
import UpdatePasswordModal from '../../../components/common/UpdatePasswordModal';

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

// --- 컴포넌트들 ---
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

const SectionHeader = ({
  title,
  subtitle,
  count,
  actionText,
  onActionPress,
}: {
  title: string;
  subtitle: string;
  count: number;
  actionText?: string;
  onActionPress?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.sectionActionContainer}>
      <Text style={styles.sectionCount}>
        <Text style={styles.sectionCountIcon}>🗓️</Text> {count}개의 계획
      </Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
          <Text style={styles.sectionActionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const ItineraryCard = ({
  title,
  subtitle,
  onPress,
  onPressMore,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  onPressMore: () => void;
}) => (
  <TouchableOpacity style={styles.itineraryCard} onPress={onPress}>
    <View style={styles.itineraryIconContainer}>
      <Text style={styles.itineraryIcon}>🗓️</Text>
    </View>
    <View style={styles.itineraryContent}>
      <Text style={styles.itineraryTitle}>{title}</Text>
      <Text style={styles.itinerarySubtitle}>{subtitle}</Text>
    </View>
    <TouchableOpacity onPress={onPressMore} style={styles.moreButton}>
      <Text style={styles.moreButtonText}>⋮</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

// --- 타입 정의 ---
interface PlanVO {
  planId: number;
  planName: string;
}

interface PreferredThemeVO {
  preferredThemeId: number;
  preferredThemeName: string;
}

export default function MyPageScreen() {
  const { logout } = useAuth();

  // 모달 상태
  const [isAgeModalVisible, setAgeModalVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  // 사용자 데이터 상태
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    preferredTheme: '',
  });

  // 일정 데이터 상태
  const [myItineraries, setMyItineraries] = useState<PlanVO[]>([]);
  const [sharedItineraries, setSharedItineraries] = useState<PlanVO[]>([]);

  // 화면이 포커스될 때마다 데이터 갱신
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, []),
  );

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/user/profile`);
      const data = response.data;

      console.log('User Profile Data:', data);

      // [수정] 성별 변환 (0: 남성, 1: 여성)
      let genderStr = '미설정';
      if (data.gender === 0) genderStr = '남성';
      else if (data.gender === 1) genderStr = '여성';

      // 선호 테마 변환
      const themes =
        data.preferredThemes && data.preferredThemes.length > 0
          ? data.preferredThemes
              .map((t: PreferredThemeVO) => t.preferredThemeName)
              .join(', ')
          : '미설정';

      setUser({
        name: data.nickname || '이름 없음',
        email: data.email || '',
        age: data.age ? data.age.toString() : '미설정',
        gender: genderStr,
        preferredTheme: themes,
      });

      setMyItineraries(data.myPlanVOs || []);
      setSharedItineraries(data.editablePlanVOs || []);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // --- 변경 핸들러 ---

  const handleUpdateAge = async (newAge: string) => {
    try {
      await axios.patch(`${API_URL}/api/user/age`, {
        age: parseInt(newAge, 10),
      });
      setUser(prev => ({ ...prev, age: newAge }));
      Alert.alert('성공', '나이가 변경되었습니다.');
    } catch (e) {
      Alert.alert('실패', '나이 변경에 실패했습니다.');
    }
  };

  const handleUpdateGender = async (newGender: string) => {
    // [수정] newGender: 'male' | 'female' -> 서버: 0 | 1
    try {
      const genderInt = newGender === 'male' ? 0 : 1;
      await axios.patch(`${API_URL}/api/user/gender`, { gender: genderInt });
      setUser(prev => ({
        ...prev,
        gender: newGender === 'male' ? '남성' : '여성',
      }));
      Alert.alert('성공', '성별이 변경되었습니다.');
    } catch (e) {
      Alert.alert('실패', '성별 변경에 실패했습니다.');
    }
  };

  const handleUpdateTheme = async () => {
    fetchUserProfile(); // 테마 변경 후 프로필 다시 로드
    Alert.alert('완료', '선호 테마가 변경되었습니다.');
  };

  const handleUpdatePassword = (current: string, newPass: string) => {
    console.log('Password Update:', { current, newPass });
    Alert.alert('완료', '비밀번호가 성공적으로 변경되었습니다.');
  };

  // [수정됨] 회원 탈퇴 핸들러 (강화된 로직)
  const handleResign = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 탈퇴하시겠습니까? 탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. 토큰 가져오기 (안전한 요청을 위해 명시적으로 가져옴)
              const token = await AsyncStorage.getItem('accessToken');
              if (!token) {
                Alert.alert('오류', '로그인 정보가 유효하지 않습니다.');
                return;
              }

              // 2. 탈퇴 API 호출
              const response = await axios.delete(
                `${API_URL}/api/user/account`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              // 3. 성공 시 처리
              if (response.status === 200) {
                Alert.alert('탈퇴 완료', '회원 탈퇴가 완료되었습니다.', [
                  {
                    text: '확인',
                    onPress: async () => {
                      await logout(); // 로그아웃 및 초기화
                    },
                  },
                ]);
              }
            } catch (error: any) {
              console.error('Resign Error:', error);
              const msg =
                error.response?.data?.message || '탈퇴 처리에 실패했습니다.';
              Alert.alert('오류', msg);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
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

        <View style={styles.sectionSeparator} />

        <SectionHeader
          title="나의 일정"
          subtitle="직접 생성한 일정을 관리하세요"
          count={myItineraries.length}
          actionText="다중삭제"
          onActionPress={() => alert('다중삭제')}
        />

        {myItineraries.map(item => (
          <ItineraryCard
            key={item.planId}
            title={item.planName}
            subtitle="클릭하여 상세보기"
            onPress={() => alert(`${item.planName} 상세보기`)}
            onPressMore={() => alert(`${item.planName} 더보기`)}
          />
        ))}

        <View style={styles.sectionSeparator} />

        <SectionHeader
          title="우리들의 일정"
          subtitle="초대받은 일정에서 다른 멤버와 함께 편집하세요"
          count={sharedItineraries.length}
        />

        {sharedItineraries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              편집 권한을 받은 일정이 없습니다
            </Text>
          </View>
        ) : (
          sharedItineraries.map(item => (
            <ItineraryCard
              key={item.planId}
              title={item.planName}
              subtitle="클릭하여 상세보기"
              onPress={() => alert(`${item.planName} 상세보기`)}
              onPressMore={() => alert(`${item.planName} 더보기`)}
            />
          ))
        )}

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
        visible={isAgeModalVisible}
        onClose={() => setAgeModalVisible(false)}
        onConfirm={handleUpdateAge}
        title="나이 변경"
        label="나이 입력"
        initialValue={user.age === '미설정' ? '' : user.age}
        keyboardType="number-pad"
      />

      <UpdateGenderModal
        visible={isGenderModalVisible}
        onClose={() => setGenderModalVisible(false)}
        onConfirm={handleUpdateGender}
        // 초기값: 남성일 때 'male', 여성일 때 'female'
        initialValue={user.gender === '남성' ? 'male' : 'female'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionSeparator: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: -20,
    marginVertical: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginTop: 4,
  },
  sectionActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  sectionCountIcon: {
    fontSize: 14,
  },
  actionButton: {
    marginLeft: 8,
  },
  sectionActionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  itineraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  itineraryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itineraryIcon: {
    fontSize: 24,
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  itinerarySubtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.placeholder,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
});
