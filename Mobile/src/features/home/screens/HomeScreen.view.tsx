import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUser,
  faLocationDot,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import { CalendarModal, Header, Invitation, NotificationModal, PaxModal, SearchLocationModal } from '../../../components/common';
import { normalize } from '../../../utils/normalize';
import { styles } from './HomeScreen.styles';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1608463123864-40a2961b7d00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
];

type InputRowProps = {
  label: string;
  value: string;
  placeholder?: string;
  icon: any;
  onPress?: () => void;
  isLast?: boolean;
};

const InputRow = ({
  label,
  value,
  placeholder,
  icon,
  onPress,
  isLast,
}: InputRowProps) => {
  const hasValue = Boolean(value);
  return (
    <TouchableOpacity
      style={[styles.inputRow, isLast && styles.inputRowLast]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={hasValue ? `${label}, ${value}` : `${label}, ${placeholder ?? '미입력'}`}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        {hasValue ? (
          <Text style={styles.valueText} numberOfLines={1}>
            {value}
          </Text>
        ) : (
          <Text style={styles.placeholderText}>{placeholder}</Text>
        )}
        <View style={styles.rowIcon}>
          <FontAwesomeIcon icon={icon} color="#6B7280" size={18} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export interface HomeScreenViewProps {
  nickname?: string;
  email?: string;
  pendingRequestsCount: number;
  destination: string;
  dateText: string;
  paxText: string;
  isFormValid: boolean;
  isSearchModalVisible: boolean;
  isCalendarVisible: boolean;
  isPaxModalVisible: boolean;
  isNotificationModalVisible: boolean;
  pendingRequestList: Invitation[];
  onCloseNotificationModal: () => void;
  onAcceptNotification: (requestId: number) => void;
  onRejectNotification: (requestId: number) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  adults?: number | null;
  children?: number | null;
  onNotificationPress: () => void;
  onNavigateProfile: () => void;
  onOpenSearchModal: () => void;
  onCloseSearchModal: () => void;
  onSelectLocation: (location: string, id?: number) => void;
  onOpenCalendar: () => void;
  onCloseCalendar: () => void;
  onConfirmCalendar: (dates: { startDate: Date; endDate: Date }) => void;
  onOpenPaxModal: () => void;
  onClosePaxModal: () => void;
  onConfirmPax: (pax: { adults: number; children: number }) => void;
  onCreateItinerary: () => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  nickname,
  email,
  pendingRequestsCount, // 알림 뱃지 등에 활용 가능
  destination,
  dateText,
  paxText,
  isFormValid,
  isSearchModalVisible,
  isCalendarVisible,
  isPaxModalVisible,
  startDate,
  endDate,
  adults,
  children,
  onNotificationPress,
  onNavigateProfile,
  onOpenSearchModal,
  onCloseSearchModal,
  onSelectLocation,
  onOpenCalendar,
  onCloseCalendar,
  onConfirmCalendar,
  onOpenPaxModal,
  onClosePaxModal,
  onConfirmPax,
  onCreateItinerary,
  isNotificationModalVisible,
  pendingRequestList,
  onCloseNotificationModal,
  onAcceptNotification,
  onRejectNotification,
}) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <Header
        nickname={nickname}
        email={email}
        pendingRequestsCount={pendingRequestsCount}
        onNotificationPress={onNotificationPress}
        onNavigateProfile={onNavigateProfile}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + normalize(24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Section */}
        <View style={styles.heroSection}>
          <FastImage
            source={{ uri: HERO_IMAGES[heroIndex], priority: FastImage.priority.normal }}
            style={styles.heroImage}
            resizeMode={FastImage.resizeMode.cover}
            accessible={false}
          />
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle} accessibilityRole="header">
            {'나다운, 우리다운\n여행의 시작'}
          </Text>
        </View>

        {/* 3. Action Card Section */}
        <View style={styles.actionContainer}>
          <View style={styles.cardWrapper}>
            <InputRow
              label="여행지"
              value={destination}
              placeholder="여행지 입력" // '어디로 떠나시나요?' 에서 '여행지 입력'으로 수정
              icon={faLocationDot}
              onPress={onOpenSearchModal}
            />

            <InputRow
              label="기간"
              value={dateText}
              placeholder="언제 떠나시나요?"
              icon={faCalendar}
              onPress={onOpenCalendar}
            />

            <InputRow
              label="인원수"
              value={paxText}
              placeholder="누구와 함께하시나요?"
              icon={faUser}
              onPress={onOpenPaxModal}
            />

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isFormValid && styles.submitButtonDisabled,
              ]}
              onPress={onCreateItinerary}
              disabled={!isFormValid}
              accessibilityRole="button"
              accessibilityLabel="일정생성"
              accessibilityState={{ disabled: !isFormValid }}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  !isFormValid && styles.submitButtonTextDisabled,
                ]}
              >
                일정생성
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals - 기존 유지 */}
      <SearchLocationModal
        visible={isSearchModalVisible}
        onClose={onCloseSearchModal}
        currentValue={destination}
        onSelect={onSelectLocation}
      />
      <CalendarModal
        visible={isCalendarVisible}
        onClose={onCloseCalendar}
        onConfirm={onConfirmCalendar}
        initialStartDate={startDate ?? undefined}
        initialEndDate={endDate ?? undefined}
      />
      <PaxModal
        visible={isPaxModalVisible}
        onClose={onClosePaxModal}
        onConfirm={onConfirmPax}
        initialAdults={adults ?? 1}
        initialChildren={children ?? 0}
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
};
