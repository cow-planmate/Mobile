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
        <View
          style={[styles.textContainer]} // Removed border from here, handling in styles.inputRow
        >
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

  // Data State
  departure: string;
  destination: string;
  transport: string;
  dateText: string;
  paxText: string;

  // Validation
  showErrors: boolean;
  isFormValid: boolean;

  // Modal Visibility
  isSearchModalVisible: boolean;
  isCalendarVisible: boolean;
  isPaxModalVisible: boolean;
  isTransportModalVisible: boolean;

  // Modal Data
  fieldToUpdate: 'departure' | 'destination';
  startDate?: Date | null;
  endDate?: Date | null;
  adults?: number | null;
  children?: number | null;
  transportOptions: OptionType[];

  // Actions
  onNotificationPress: () => void;
  onNavigateProfile: () => void;

  // Form Actions
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
  pendingRequestsCount,
  departure,
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
        <View style={styles.headerTopArea}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerGreeting}>안녕하세요,</Text>
            <Text
              style={[styles.headerGreeting, styles.headerNickname]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {nickname || '여행자'}님!
            </Text>
          </View>

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

        <View style={styles.whiteSection}>
          <View style={styles.inputCard}>
            <InputRow
              label="출발지"
              value={departure}
              placeholder="어디서 떠나시나요?"
              icon={
                <MapPin size={24} color={COLORS.primary} strokeWidth={1.5} />
              }
              onPress={() => onOpenSearchModal('departure')}
              hasError={showErrors && !departure}
            />
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

      <SearchLocationModal
        visible={isSearchModalVisible}
        onClose={onCloseSearchModal}
        fieldToUpdate={fieldToUpdate}
        currentValue={fieldToUpdate === 'departure' ? departure : destination}
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
