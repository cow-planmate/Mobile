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
import { useMyPageScreen } from './useMyPageScreen';
import { styles, COLORS } from './MyPageScreen.styles';

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

const MyPageScreen = () => {
  const {
    isAgeModalVisible,
    isGenderModalVisible,
    isThemeModalVisible,
    isPasswordModalVisible,
    loading,
    user,
    myItineraries,
    sharedItineraries,
    logout,
    setAgeModalVisible,
    setGenderModalVisible,
    setThemeModalVisible,
    setPasswordModalVisible,
    handleUpdateAge,
    handleUpdateGender,
    handleUpdateTheme,
    handleUpdatePassword,
    handleResign,
  } = useMyPageScreen();

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
};

export default MyPageScreen;
