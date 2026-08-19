import React, { useEffect, useState } from 'react';
import CalendarIcon from 'lucide-react-native/dist/esm/icons/calendar';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import UserIcon from 'lucide-react-native/dist/esm/icons/user';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { CalendarModal, Header, Invitation, NotificationModal, PaxModal, SearchLocationModal } from '../../../components/common';
import { normalize } from '../../../utils/normalize';
import { styles } from './HomeScreen.styles';
import { tokens } from '../../../theme/tokens';

// 외부 URL 핫링크 대신 지역별 랜드마크 사진을 로컬로 번들한다 —
// 네트워크 요청이 실패하면 히어로 전체가 깨지는 문제를 없앤다.
const HERO_IMAGES = [
  require('../../../assets/images/home/seoul-gyeongbokgung.jpg'),
  require('../../../assets/images/home/busan-haeundae.jpg'),
  require('../../../assets/images/home/jeju-seongsan-ilchulbong.jpg'),
  require('../../../assets/images/home/gyeongju-cheomseongdae.jpg'),
  require('../../../assets/images/home/jeonju-hanok-village.jpg'),
];

type InputRowProps = {
  label: string;
  value: string;
  placeholder?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
  isLast?: boolean;
};

const InputRow = ({
  label,
  value,
  placeholder,
  icon: Icon,
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
          <Icon color={tokens.colors.textSecondary} size={18} />
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
  isCreating?: boolean;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  nickname,
  email,
  pendingRequestsCount, 
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
  isCreating = false,
  isNotificationModalVisible,
  pendingRequestList,
  onCloseNotificationModal,
  onAcceptNotification,
  onRejectNotification,
}: HomeScreenViewProps) => {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: normalize(24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.heroSection}>
          <FastImage
            source={HERO_IMAGES[heroIndex]}
            style={styles.heroImage}
            resizeMode={FastImage.resizeMode.cover}
            accessible={false}
          />
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle} accessibilityRole="header">
            {'나다운, 우리다운\n여행의 시작'}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <View style={styles.cardWrapper}>
            <InputRow
              label="여행지"
              value={destination}
              placeholder="여행지 입력" 
              icon={MapPin}
              onPress={onOpenSearchModal}
            />

            <InputRow
              label="기간"
              value={dateText}
              placeholder="언제 떠나시나요?"
              icon={CalendarIcon}
              onPress={onOpenCalendar}
            />

            <InputRow
              label="인원수"
              value={paxText}
              placeholder="누구와 함께하시나요?"
              icon={UserIcon}
              onPress={onOpenPaxModal}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid || isCreating) && styles.submitButtonDisabled,
              ]}
              onPress={onCreateItinerary}
              disabled={!isFormValid || isCreating}
              accessibilityRole="button"
              accessibilityLabel="일정생성"
              accessibilityState={{ disabled: !isFormValid || isCreating }}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  (!isFormValid || isCreating) && styles.submitButtonTextDisabled,
                ]}
              >
                {isCreating ? '일정 만드는 중…' : '일정생성'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
