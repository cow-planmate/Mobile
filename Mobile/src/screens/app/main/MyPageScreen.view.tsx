import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
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
  navigateToEditor,
}: MyPageScreenViewProps) {
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
        <SectionHeader
          title="나의 일정"
          subtitle="직접 생성한 일정을 관리하세요"
          count={myItineraries.length}
          actionText="다중삭제"
          onActionPress={() => alert('다중삭제 미구현')}
        />

        {myItineraries.map(item => (
          <ItineraryCard
            key={item.planId}
            title={item.planName}
            subtitle={
              item.startDate && item.endDate
                ? `${item.startDate}~${item.endDate}`
                : '클릭하여 상세보기'
            }
            onPress={() => navigateToView(item)}
            onPressMore={() => handleMenuPress(item)}
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
              subtitle={
                item.startDate && item.endDate
                  ? `${item.startDate}~${item.endDate}`
                  : '초대된 일정'
              }
              onPress={() => navigateToEditor(item)}
              onPressMore={() => handleMenuPress(item)}
            />
          ))
        )}
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
