import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUser,
  faLocationDot,
  faCalendar,
  faCar,
  faBus,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import CalendarModal from '../../../components/common/CalendarModal';
import PaxModal from '../../../components/common/PaxModal';
import NotificationModal, {
  Invitation,
} from '../../../components/common/NotificationModal';
import SelectionModal, {
  OptionType,
} from '../../../components/common/SelectionModal';
import SearchLocationModal from '../../../components/common/SearchLocationModal';
import Header from '../../../components/common/Header';
import { styles } from './HomeScreen.styles';
import gravatarUrl from '../../../utils/gravatarUrl';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
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
          <FontAwesomeIcon icon={icon} color="#9CA3AF" size={18} />
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
  transport: string;
  dateText: string;
  paxText: string;
  showErrors: boolean;
  isFormValid: boolean;
  isSearchModalVisible: boolean;
  isCalendarVisible: boolean;
  isPaxModalVisible: boolean;
  isTransportModalVisible: boolean;
  isNotificationModalVisible: boolean;
  pendingRequestList: Invitation[];
  onCloseNotificationModal: () => void;
  onAcceptNotification: (requestId: number) => void;
  onRejectNotification: (requestId: number) => void;
  fieldToUpdate: 'departure' | 'destination';
  startDate?: Date | null;
  endDate?: Date | null;
  adults?: number | null;
  children?: number | null;
  transportOptions: OptionType[];
  onNotificationPress: () => void;
  onNavigateProfile: () => void;
  onOpenSearchModal: (field: 'departure' | 'destination') => void;
  onCloseSearchModal: () => void;
  onSelectLocation: (location: string, id?: number) => void;
  onOpenCalendar: () => void;
  onCloseCalendar: () => void;
  onConfirmCalendar: (dates: { startDate: Date; endDate: Date }) => void;
  onOpenPaxModal: () => void;
  onClosePaxModal: () => void;
  onConfirmPax: (pax: { adults: number; children: number }) => void;
  onOpenTransportModal: () => void;
  onCloseTransportModal: () => void;
  onSelectTransport: (option: string) => void;
  onCreateItinerary: () => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  nickname,
  email,
  pendingRequestsCount, // 알림 뱃지 등에 활용 가능
  destination,
  transport,
  dateText,
  paxText,
  showErrors,
  isFormValid,
  isSearchModalVisible,
  isCalendarVisible,
  isPaxModalVisible,
  isTransportModalVisible,
  fieldToUpdate,
  startDate,
  endDate,
  adults,
  children,
  transportOptions,
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
  onOpenTransportModal,
  onCloseTransportModal,
  onSelectTransport,
  onCreateItinerary,
  isNotificationModalVisible,
  pendingRequestList,
  onCloseNotificationModal,
  onAcceptNotification,
  onRejectNotification,
}) => {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header
        nickname={nickname}
        email={email}
        pendingRequestsCount={pendingRequestsCount}
        onNotificationPress={onNotificationPress}
        onNavigateProfile={onNavigateProfile}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: HERO_IMAGES[heroIndex] }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle}>
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
              onPress={() => onOpenSearchModal('destination')}
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

            <InputRow
              label="이동수단"
              value={
                transport === 'car' ? '자동차' : transport ? '대중교통' : ''
              }
              placeholder="무엇을 타고 가시나요?"
              icon={transport === 'car' ? faCar : faBus}
              onPress={onOpenTransportModal}
              isLast
            />

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isFormValid && styles.submitButtonDisabled,
              ]}
              onPress={onCreateItinerary}
              disabled={!isFormValid}
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
        fieldToUpdate={fieldToUpdate}
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
      <SelectionModal
        visible={isTransportModalVisible}
        title="이동수단 선택"
        options={transportOptions}
        currentValue={transport}
        onClose={onCloseTransportModal}
        onSelect={onSelectTransport}
      />

      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={onCloseNotificationModal}
        invitations={pendingRequestList}
        onAccept={onAcceptNotification}
        onReject={onRejectNotification}
      />
    </SafeAreaView>
  );
};
