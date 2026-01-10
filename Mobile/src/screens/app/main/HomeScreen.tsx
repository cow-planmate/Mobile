import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '@env';
import { AppStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../contexts/AuthContext';

import CalendarModal from '../../../components/common/CalendarModal';
import PaxModal from '../../../components/common/PaxModal';
import SelectionModal, {
  OptionType,
} from '../../../components/common/SelectionModal';
import SearchLocationModal from '../../../components/common/SearchLocationModal';

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
  const [travelId, setTravelId] = useState<number>(0);

  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [fieldToUpdate, setFieldToUpdate] = useState<
    'departure' | 'destination'
  >('departure');
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // DTO Interfaces for Invitations
  // interface PendingRequestVO {
  //   requestId: number;
  //   senderId: number;
  //   senderNickname: string;
  //   planId: number;
  //   planName: string;
  //   type: string; // 'INVITE', etc.
  // }

  const fetchPendingRequests = async () => {
    try {
      // GET /api/collaboration-requests/pending
      // axiosConfig에 의해 baseURL이 설정되어 있으므로 상대 경로 사용
      const response = await axios.get('/api/collaboration-requests/pending');
      
      const { pendingRequests } = response.data;
      if (pendingRequests) {
        setPendingRequests(pendingRequests);
        if (pendingRequests.length > 0) {
          Alert.alert(
            '알림',
            `${pendingRequests.length}개의 초대 요청이 있습니다.`,
          );
        }
      }
    } catch (error) {
      // 에러 로그는 axiosConfig에서 찍히므로 여기서는 조용히 처리하거나 필요시 추가 로깅
      console.log('초대 요청 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleNotificationPress = () => {
    if (pendingRequests.length === 0) {
      Alert.alert('알림', '새로운 알림이 없습니다.');
      return;
    }

    // Simple handling: Loop alerts or show first one. For better UX, use a Modal.
    // Here we show the first one for demonstration or list them.
    // Ideally, navigate to a 'NotificationsScreen'.
    // For now, let's just show an alert with actions for the first request.
    const req = pendingRequests[0];
    Alert.alert(
      '초대 요청',
      `${req.senderNickname}님이 '${req.planName}' 일정에 초대했습니다.`,
      [
        {
          text: '거절',
          onPress: () => handleReject(req.requestId),
          style: 'destructive',
        },
        { text: '수락', onPress: () => handleAccept(req.requestId) },
        { text: '닫기', style: 'cancel' },
      ],
    );
  };

  const handleAccept = async (requestId: number) => {
    try {
      await axios.post(`${API_URL}/api/invite/${requestId}/accept`);
      Alert.alert('수락 완료', '일정에 참여했습니다.');
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (e) {
      Alert.alert('오류', '수락 처리에 실패했습니다.');
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await axios.post(`${API_URL}/api/invite/${requestId}/reject`);
      Alert.alert('거절 완료', '초대를 거절했습니다.');
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (e) {
      Alert.alert('오류', '거절 처리에 실패했습니다.');
    }
  };

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

  const handleCreateItinerary = async () => {
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }

    if (travelId === undefined || travelId <= 0) {
      Alert.alert(
        '알림',
        '여행지가 올바르게 선택되지 않았습니다.\n목록에서 다시 선택해주세요.',
      );
      return;
    }

    setShowErrors(false);

    try {
      setLoading(true);

      const dates = [];
      let currentDate = new Date(startDate!);
      const end = new Date(endDate!);

      while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const payload = {
        departure,
        travelId: travelId || 0,
        dates,
        adultCount: adults || 1,
        childCount: children || 0,
        transportation: transport === '자동차' ? 2 : 1, // 1: Public, 2: Car
      };

      const response = await axios.post(`${API_URL}/api/plan`, payload);
      const { planId } = response.data;
      // const { message } = response.data;

      navigation.navigate('ItineraryEditor', {
        planId,
        departure,
        destination,
        travelId: travelId || 0,
        startDate: startDate?.toISOString() ?? new Date().toISOString(),
        endDate: endDate?.toISOString() ?? new Date().toISOString(),
        adults: adults ?? 1,
        children: children ?? 0,
        transport: transport || '대중교통',
      });
    } catch (error: any) {
      console.error('Plan creation failed:', error);
      Alert.alert('오류', '일정 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
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
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleNotificationPress}
            >
              <Text style={styles.headerIcon}>🔔</Text>
              {pendingRequests.length > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'red',
                  }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
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
        onSelect={(location, id) => {
          if (fieldToUpdate === 'departure') {
            setDeparture(location);
          } else {
            setDestination(location);
            if (id !== undefined) setTravelId(id);
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
