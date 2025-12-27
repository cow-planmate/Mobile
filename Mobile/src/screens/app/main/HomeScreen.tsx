import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import CalendarModal from '../../../components/common/CalendarModal';
import PaxModal from '../../../components/common/PaxModal';
import SelectionModal from '../../../components/common/SelectionModal';
import SearchLocationModal from '../../../components/common/SearchLocationModal';
import { useHomeScreen } from './useHomeScreen';
import { styles } from './HomeScreen.styles';

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

export default function HomeScreen() {
  const {
    user,
    startDate,
    endDate,
    isCalendarVisible,
    adults,
    children,
    isPaxModalVisible,
    transport,
    isTransportModalVisible,
    transportOptions,
    departure,
    destination,
    isSearchModalVisible,
    fieldToUpdate,
    showErrors,
    isFormValid,
    setStartDate,
    setEndDate,
    setCalendarVisible,
    setAdults,
    setChildren,
    setPaxModalVisible,
    setTransport,
    setTransportModalVisible,
    setDeparture,
    setDestination,
    setSearchModalVisible,
    setFieldToUpdate,
    getDateText,
    getPaxText,
    handleCreateItinerary,
    openSearchModal,
  } = useHomeScreen();

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
