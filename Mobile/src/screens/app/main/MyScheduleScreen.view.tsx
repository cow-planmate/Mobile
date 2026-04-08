import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import {
  Calendar,
  MoreVertical,
  MapPin,
  Users,
  FolderOpen,
  CalendarDays,
} from 'lucide-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faT,
  faUser,
  faPen,
  faShare,
  faTrash,
  faCalendar,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import UpdateValueModal from '../../../components/common/UpdateValueModal';
import NotificationModal, {
  Invitation,
} from '../../../components/common/NotificationModal';
import ShareModal from '../../../components/common/ShareModal';
import MenuModal from '../../../components/common/MenuModal';
import Header from '../../../components/common/Header';
import { SimplePlanVO } from '../../../types/env';
import { styles, COLORS, FONTS } from './MyScheduleScreen.styles';
import gravatarUrl from '../../../utils/gravatarUrl';
import { normalize } from '../../../utils/normalize';

export const MENU_OPTIONS = [
  { label: '제목 바꾸기', action: 'rename', icon: faT },
  { label: '수정하기', action: 'edit', icon: faPen },
  { label: '공유 및 초대', action: 'share', icon: faShare },
  { label: '삭제하기', action: 'delete', icon: faTrash, isDestructive: true },
];

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
  <Pressable
    style={({ pressed }) => [styles.itineraryCard, pressed && { opacity: 0.7 }]}
    onPress={onPress}
  >
    <View style={styles.itineraryIconContainer}>
      <FontAwesomeIcon icon={faCalendarAlt} size={24} color={COLORS.primary} />
    </View>
    <View style={styles.itineraryContent}>
      <Text style={styles.itineraryTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.itinerarySubtitle} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
    <TouchableOpacity onPress={onPressMore} style={styles.moreButton}>
      <MoreVertical size={20} color="#9CA3AF" strokeWidth={2} />
    </TouchableOpacity>
  </Pressable>
);

export interface MyScheduleScreenViewProps {
  loading: boolean;
  myItineraries: SimplePlanVO[];
  sharedItineraries: SimplePlanVO[];
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  selectedPlan: SimplePlanVO | null;
  renameModalVisible: boolean;
  setRenameModalVisible: (visible: boolean) => void;
  shareModalVisible: boolean;
  setShareModalVisible: (visible: boolean) => void;
  handleMenuPress: (plan: SimplePlanVO) => void;
  handleMenuSelect: (action: string) => void;
  handleRenameTitle: (newTitle: string) => Promise<void>;
  navigateToView: (plan: SimplePlanVO) => void;
  navigateToEditor: (plan: SimplePlanVO) => void;
  nickname?: string;
  email?: string;
  pendingRequestsCount?: number;
  isNotificationModalVisible: boolean;
  pendingRequestList: Invitation[];
  onCloseNotificationModal: () => void;
  onAcceptNotification: (requestId: number) => void;
  onRejectNotification: (requestId: number) => void;
  onNotificationPress: () => void;
  onNavigateProfile: () => void;
}

export default function MyScheduleScreenView({
  loading,
  myItineraries,
  sharedItineraries,
  menuVisible,
  setMenuVisible,
  selectedPlan,
  renameModalVisible,
  setRenameModalVisible,
  shareModalVisible,
  setShareModalVisible,
  handleMenuPress,
  handleMenuSelect,
  handleRenameTitle,
  navigateToView,
  nickname,
  email,
  pendingRequestsCount = 0,
  isNotificationModalVisible,
  pendingRequestList,
  onCloseNotificationModal,
  onAcceptNotification,
  onRejectNotification,
  onNotificationPress,
  onNavigateProfile,
}: MyScheduleScreenViewProps) {
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LoadingSpinner color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header
        nickname={nickname}
        email={email}
        pendingRequestsCount={pendingRequestsCount}
        onNotificationPress={onNotificationPress}
        onNavigateProfile={onNavigateProfile}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── My Itineraries ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>나의 일정</Text>
              <View style={styles.sectionRightContainer}>
                <View style={styles.sectionInfoWrap}>
                  <FontAwesomeIcon
                    icon={faCalendar}
                    size={14}
                    color="#868B94"
                  />
                  <Text style={styles.sectionCountText}>
                    {myItineraries.length}개의 계획
                  </Text>
                </View>
                {myItineraries.length > 0 && (
                  <TouchableOpacity style={styles.multiDeleteButton}>
                    <Text style={styles.multiDeleteButtonText}>다중삭제</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              직접 생성한 일정을 관리하세요
            </Text>
          </View>

          <View style={styles.sectionListContent}>
            {myItineraries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesomeIcon icon={faCalendar} size={36} color="#D1D5DB" />
                <Text style={styles.emptyText}>생성된 일정이 없습니다</Text>
              </View>
            ) : (
              myItineraries.map(item => (
                <ItineraryCard
                  key={item.planId}
                  title={item.planName}
                  subtitle={
                    item.startDate && item.endDate
                      ? `${item.startDate} ~ ${item.endDate}`
                      : '클릭하여 상세보기'
                  }
                  onPress={() => navigateToView(item)}
                  onPressMore={() => handleMenuPress(item)}
                />
              ))
            )}
          </View>
        </View>

        {/* ── Shared Itineraries ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>우리들의 일정</Text>
              <View style={styles.sectionRightContainer}>
                <View style={styles.sectionInfoWrap}>
                  <FontAwesomeIcon
                    icon={faCalendar}
                    size={14}
                    color="#868B94"
                  />
                  <Text style={styles.sectionCountText}>
                    {sharedItineraries.length}개의 계획
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              초대받은 일정에서 다른 멤버와 함께 편집하세요
            </Text>
          </View>

          <View style={styles.sectionListContent}>
            {sharedItineraries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesomeIcon icon={faCalendar} size={36} color="#D1D5DB" />
                <Text style={styles.emptyText}>
                  편집 권한을 받은 일정이 없습니다
                </Text>
              </View>
            ) : (
              sharedItineraries.map(item => (
                <ItineraryCard
                  key={item.planId}
                  title={item.planName}
                  subtitle={
                    item.startDate && item.endDate
                      ? `${item.startDate} ~ ${item.endDate}`
                      : '클릭하여 상세보기'
                  }
                  onPress={() => navigateToView(item)}
                  onPressMore={() => handleMenuPress(item)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <MenuModal
        visible={menuVisible}
        title="일정 관리"
        options={MENU_OPTIONS}
        onClose={() => setMenuVisible(false)}
        onSelect={handleMenuSelect}
      />

      <UpdateValueModal
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        onConfirm={handleRenameTitle}
        title="제목 바꾸기"
        label="새로운 제목"
        initialValue={selectedPlan?.planName || ''}
      />

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        planId={selectedPlan?.planId}
      />

      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={onCloseNotificationModal}
        invitations={pendingRequestList}
        onAccept={onAcceptNotification}
        onReject={onRejectNotification}
      />
    </View>
  );
}
