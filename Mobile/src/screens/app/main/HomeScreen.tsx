import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../contexts/AuthContext';

import CalendarModal from '../../../components/common/CalendarModal';
import PaxModal from '../../../components/common/PaxModal';
import SelectionModal, {
  OptionType,
} from '../../../components/common/SelectionModal';
import SearchLocationModal from '../../../components/common/SearchLocationModal';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

const COLORS = {
  primary: '#1344FF',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  lightBlue: '#e6f0ff',
  shadow: '#1344FF',
  iconBg: '#F5F7FF',
  success: '#34C759',
  placeholderLight: '#C7C7CC',
  error: '#FF3B30',
  errorLight: '#FFE5E5',
  disabled: '#A8B5D1',
};

type InputRowProps = {
  label: string;
  value: string;
  placeholder?: string;
  icon: string;
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
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.rowContent}>
        <View
          style={[styles.textContainer, !isLast && styles.textContainerBorder]}
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
        <View
          style={[styles.arrowContainer, !isLast && styles.textContainerBorder]}
        >
          {hasValue ? (
            <Text style={styles.checkIcon}>✓</Text>
          ) : (
            <Text style={styles.arrow}>›</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [adults, setAdults] = useState<number | null>(null);
  const [children, setChildren] = useState<number | null>(null);
  const [isPaxModalVisible, setPaxModalVisible] = useState(false);
  const [transport, setTransport] = useState('');
  const [isTransportModalVisible, setTransportModalVisible] = useState(false);

  const transportOptions: OptionType[] = [
    { label: '대중교통', icon: '🚌' },
    { label: '자동차', icon: '🚗' },
  ];

  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');

  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [fieldToUpdate, setFieldToUpdate] = useState<
    'departure' | 'destination'
  >('departure');
  const [showErrors, setShowErrors] = useState(false);

  const isFormValid =
    departure !== '' &&
    destination !== '' &&
    startDate !== null &&
    endDate !== null &&
    adults !== null &&
    transport !== '';

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  const getPaxText = () => {
    if (adults === null) return '';
    let text = `성인 ${adults}명`;
    if (children && children > 0) {
      text += `, 어린이 ${children}명`;
    }
    return text;
  };

  const getDateText = () => {
    if (!startDate || !endDate) return '';
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const handleCreateItinerary = () => {
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    navigation.navigate('ItineraryEditor', {
      departure,
      destination,
      startDate: startDate?.toISOString() ?? new Date().toISOString(),
      endDate: endDate?.toISOString() ?? new Date().toISOString(),
      adults: adults ?? 1,
      children: children ?? 0,
      transport: transport || '대중교통',
    });
  };

  const openSearchModal = (field: 'departure' | 'destination') => {
    setFieldToUpdate(field);
    setSearchModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerTopArea}>
          <View>
            <Text style={styles.headerSlogan}>
              나다운, 우리다운 여행의 시작
            </Text>
            <Text style={styles.headerGreeting}>
              안녕하세요,{' '}
              <Text style={styles.headerNickname}>
                {user?.nickname || '여행자'}
              </Text>
              님!
            </Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
              <Text style={styles.headerIcon}>🔔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
              <Text style={styles.headerIcon}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.whiteSection}>
          <View style={styles.inputCard}>
            <InputRow
              label="출발지"
              value={departure}
              placeholder="어디서 떠나시나요?"
              icon="📍"
              onPress={() => openSearchModal('departure')}
              hasError={showErrors && !departure}
            />
            <InputRow
              label="여행지"
              value={destination}
              placeholder="어디로 갈까요?"
              icon="🌍"
              onPress={() => openSearchModal('destination')}
              hasError={showErrors && !destination}
            />
            <InputRow
              label="여행 기간"
              value={getDateText()}
              placeholder="언제 떠나시나요?"
              icon="🗓️"
              onPress={() => setCalendarVisible(true)}
              hasError={showErrors && (!startDate || !endDate)}
            />
            <InputRow
              label="인원"
              value={getPaxText()}
              placeholder="몇 명이서 떠나시나요?"
              icon="👥"
              onPress={() => setPaxModalVisible(true)}
              hasError={showErrors && adults === null}
            />
            <InputRow
              label="이동수단"
              value={transport}
              placeholder="어떤 교통수단을 이용하시나요?"
              icon="🚗"
              onPress={() => setTransportModalVisible(true)}
              isLast={true}
              hasError={showErrors && !transport}
            />
          </View>

          <Pressable
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleCreateItinerary}
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
        onClose={() => setSearchModalVisible(false)}
        fieldToUpdate={fieldToUpdate}
        currentValue={fieldToUpdate === 'departure' ? departure : destination}
        onSelect={location => {
          if (fieldToUpdate === 'departure') {
            setDeparture(location);
          } else {
            setDestination(location);
          }
        }}
      />
      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
        onConfirm={({ startDate: newStartDate, endDate: newEndDate }) => {
          setStartDate(newStartDate);
          setEndDate(newEndDate);
          setCalendarVisible(false);
        }}
        initialStartDate={startDate ?? undefined}
        initialEndDate={endDate ?? undefined}
      />
      <PaxModal
        visible={isPaxModalVisible}
        onClose={() => setPaxModalVisible(false)}
        onConfirm={({ adults: newAdults, children: newChildren }) => {
          setAdults(newAdults);
          setChildren(newChildren);
          setPaxModalVisible(false);
        }}
        initialAdults={adults ?? 1}
        initialChildren={children ?? 0}
      />
      <SelectionModal
        visible={isTransportModalVisible}
        title="이동수단 선택"
        options={transportOptions}
        currentValue={transport}
        onClose={() => setTransportModalVisible(false)}
        onSelect={option => {
          setTransport(option);
          setTransportModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: normalize(30),
    paddingBottom: 0,
  },
  headerTopArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: normalize(24),
    marginTop: normalize(10),
    paddingHorizontal: normalize(20),
  },
  headerSlogan: {
    fontSize: normalize(12),
    color: COLORS.darkGray,
    fontWeight: '500',
    marginTop: normalize(20),
    marginBottom: normalize(4),
  },
  headerGreeting: {
    fontSize: normalize(18),
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerNickname: {
    color: COLORS.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  iconButton: {
    width: normalize(36),
    height: normalize(36),
    padding: normalize(6),
    backgroundColor: COLORS.white,
    borderRadius: normalize(18),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: normalize(18),
    textAlign: 'center',
  },
  whiteSection: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: normalize(32),
    borderTopRightRadius: normalize(32),
    paddingHorizontal: normalize(20),
    paddingTop: normalize(32),
    paddingBottom: normalize(40),
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },

  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(20),
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(16),

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: normalize(24),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(78),
    paddingVertical: normalize(4),
  },
  inputRowLast: {
    paddingBottom: normalize(4),
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
    backgroundColor: COLORS.iconBg,
    borderRadius: normalize(12),
  },
  iconContainerFilled: {
    backgroundColor: COLORS.lightBlue,
  },
  icon: {
    fontSize: normalize(22),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  textContainerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  label: {
    fontSize: normalize(12),
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  valueText: {
    fontSize: normalize(15),
    color: COLORS.text,
    fontWeight: '700',
    lineHeight: normalize(20),
  },
  placeholderText: {
    fontSize: normalize(15),
    color: COLORS.placeholderLight,
    fontWeight: '400',
    lineHeight: normalize(20),
  },
  arrowContainer: {
    height: '100%',
    paddingLeft: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: normalize(22),
    color: COLORS.gray,
    fontWeight: '300',
  },
  checkIcon: {
    fontSize: normalize(16),
    color: COLORS.success,
    fontWeight: 'bold',
  },
  submitButton: {
    width: '100%',
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  submitButtonTextDisabled: {
    color: COLORS.white,
    opacity: 0.8,
  },

  iconContainerError: {
    backgroundColor: COLORS.errorLight,
  },
  labelError: {
    color: COLORS.error,
  },
});
