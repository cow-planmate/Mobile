import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  MapPin,
  Map,
  Calendar,
  Users,
  Car,
  ChevronRight,
  Check,
  Bell,
  Settings,
} from 'lucide-react-native';
import CalendarModal from '../../../components/common/CalendarModal';
import PaxModal from '../../../components/common/PaxModal';
import SelectionModal, {
  OptionType,
} from '../../../components/common/SelectionModal';
import SearchLocationModal from '../../../components/common/SearchLocationModal';
import { styles, COLORS } from './HomeScreen.styles';

// InputRow 컴포넌트는 기존과 동일하게 유지하거나 필요 시 분리 가능
type InputRowProps = {
  label: string;
  value: string;
  placeholder?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  hasError?: boolean;
};

const InputRow = ({
  label,
  value,
  placeholder,
  icon,
  onPress,
  isLast,
  hasError,
}: InputRowProps) => {
  const hasValue = Boolean(value);
  return (
    <TouchableOpacity
      style={[styles.inputRow, isLast && styles.inputRowLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          hasValue && styles.iconContainerFilled,
          hasError && styles.iconContainerError,
        ]}
      >
        {icon}
      </View>
      <View style={styles.rowContent}>
        <View style={[styles.textContainer]}>
          <Text style={[styles.label, hasError && styles.labelError]}>
            {label}
          </Text>
          {hasValue ? (
            <Text style={styles.valueText} numberOfLines={1}>
              {value}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
        </View>
        <View style={[styles.arrowContainer]}>
          {hasValue ? (
            <Check size={20} color={COLORS.primary} strokeWidth={2.5} />
          ) : (
            <ChevronRight size={20} color={COLORS.disabled} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export interface HomeScreenViewProps {
  nickname?: string;
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
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* [변경] 상단 네비게이션 영역 (버튼만 배치하여 겹침 방지) */}
        <View style={styles.topNavigation}>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNotificationPress}
            >
              <Bell size={24} color="#000000" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNavigateProfile}
            >
              <Settings size={24} color="#000000" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* [변경] 인사말 영역 (버튼 아래 독립적으로 배치) */}
        <View style={styles.greetingSection}>
          <Text style={styles.headerGreeting}>안녕하세요,</Text>
          <Text
            style={[styles.headerGreeting, styles.headerNickname]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {nickname || '여행자'}님!
          </Text>
        </View>

        <View style={styles.whiteSection}>
          <View style={styles.inputCard}>
            <InputRow
              label="여행지"
              value={destination}
              placeholder="어디로 갈까요?"
              icon={<Map size={24} color={COLORS.primary} strokeWidth={1.5} />}
              onPress={() => onOpenSearchModal('destination')}
              hasError={showErrors && !destination}
            />
            <InputRow
              label="여행 기간"
              value={dateText}
              placeholder="언제 떠나시나요?"
              icon={
                <Calendar size={24} color={COLORS.primary} strokeWidth={1.5} />
              }
              onPress={onOpenCalendar}
              hasError={showErrors && !dateText}
            />
            <InputRow
              label="인원"
              value={paxText}
              placeholder="몇 명이서 떠나시나요?"
              icon={
                <Users size={24} color={COLORS.primary} strokeWidth={1.5} />
              }
              onPress={onOpenPaxModal}
              hasError={showErrors && adults === null}
            />
            <InputRow
              label="이동수단"
              value={transport}
              placeholder="어떤 교통수단을 이용하시나요?"
              icon={<Car size={24} color={COLORS.primary} strokeWidth={1.5} />}
              onPress={onOpenTransportModal}
              isLast={true}
              hasError={showErrors && !transport}
            />
          </View>

          <Pressable
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={onCreateItinerary}
          >
            <Text
              style={[
                styles.submitButtonText,
                !isFormValid && styles.submitButtonTextDisabled,
              ]}
            >
              일정 생성하기
            </Text>
          </Pressable>
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
    </SafeAreaView>
  );
};
