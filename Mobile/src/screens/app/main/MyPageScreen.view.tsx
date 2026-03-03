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
  Calendar,
  MoreVertical,
  MapPin,
  Users,
  FolderOpen,
} from 'lucide-react-native';
import UpdateValueModal from '../../../components/common/UpdateValueModal';
import ShareModal from '../../../components/common/ShareModal';
import MenuModal from '../../../components/common/MenuModal';
import { SimplePlanVO } from '../../../types/env';
import { styles, COLORS } from './MyPageScreen.styles';

export const MENU_OPTIONS = [
  { label: '제목 바꾸기', action: 'rename' },
  { label: '수정하기', action: 'edit' },
  { label: '공유 및 초대', action: 'share' },
  { label: '삭제하기', action: 'delete', isDestructive: true },
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
      <Calendar size={20} color={COLORS.primary} strokeWidth={1.5} />
    </View>
    <View style={styles.itineraryContent}>
      <Text style={styles.itineraryTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.itineraryDateRow}>
        <MapPin size={12} color={COLORS.placeholder} strokeWidth={1.5} />
        <Text style={styles.itinerarySubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
    <TouchableOpacity onPress={onPressMore} style={styles.moreButton}>
      <MoreVertical size={16} color={COLORS.placeholder} strokeWidth={2} />
    </TouchableOpacity>
  </Pressable>
);

export interface MyPageScreenViewProps {
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
}

export default function MyPageScreenView({
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
}: MyPageScreenViewProps) {
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LoadingSpinner color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ── Page Header ── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>마이페이지</Text>
          <Text style={styles.pageSubtitle}>나의 여행 일정을 관리하세요</Text>
        </View>

        {/* ── My Itineraries ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIconWrap}>
                <FolderOpen size={16} color={COLORS.primary} strokeWidth={2} />
              </View>
              <Text style={styles.sectionTitle}>나의 일정</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>
                {myItineraries.length}
              </Text>
            </View>
          </View>

          {myItineraries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calendar size={36} color="#D1D5DB" strokeWidth={1.5} />
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

        <View style={styles.sectionSeparator} />

        {/* ── Shared Itineraries ── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View
                style={[styles.sectionIconWrap, { backgroundColor: '#FEF3C7' }]}
              >
                <Users size={16} color="#F59E0B" strokeWidth={2} />
              </View>
              <Text style={styles.sectionTitle}>공유된 일정</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.sectionBadgeText, { color: '#F59E0B' }]}>
                {sharedItineraries.length}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            초대받은 일정에서 다른 멤버와 함께 편집하세요
          </Text>

          {sharedItineraries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={36} color="#D1D5DB" strokeWidth={1.5} />
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
                    : '초대된 일정'
                }
                onPress={() => navigateToView(item)}
                onPressMore={() => handleMenuPress(item)}
              />
            ))
          )}
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
    </SafeAreaView>
  );
}
