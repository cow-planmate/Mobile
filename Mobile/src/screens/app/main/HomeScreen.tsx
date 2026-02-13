import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '@env';
import { AppStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../contexts/AuthContext';
import { OptionType } from '../../../components/common/SelectionModal';
import { HomeScreenView } from './HomeScreen.view';

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [adults, setAdults] = useState<number | null>(1);
  const [children, setChildren] = useState<number | null>(0);
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

  const fetchPendingRequests = async () => {
    try {
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
      console.log('초대 요청 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

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

  const handleNotificationPress = () => {
    if (pendingRequests.length === 0) {
      Alert.alert('알림', '새로운 알림이 없습니다.');
      return;
    }

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

  const isFormValid =
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
        transportation: transport === '자동차' ? 2 : 1,
      };

      const response = await axios.post(`${API_URL}/api/plan`, payload);
      const { planId } = response.data;

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

  const onSelectLocation = (location: string, id?: number) => {
    if (fieldToUpdate === 'departure') {
      setDeparture(location);
    } else {
      setDestination(location);
      if (id !== undefined) setTravelId(id);
    }
  };

  return (
    <HomeScreenView
      nickname={user?.nickname}
      pendingRequestsCount={pendingRequests.length}
      destination={destination}
      transport={transport}
      dateText={getDateText()}
      paxText={getPaxText()}
      showErrors={showErrors}
      isFormValid={isFormValid}
      isSearchModalVisible={isSearchModalVisible}
      isCalendarVisible={isCalendarVisible}
      isPaxModalVisible={isPaxModalVisible}
      isTransportModalVisible={isTransportModalVisible}
      fieldToUpdate={fieldToUpdate}
      startDate={startDate}
      endDate={endDate}
      adults={adults}
      children={children}
      transportOptions={transportOptions}
      onNotificationPress={handleNotificationPress}
      onNavigateProfile={() => navigation.navigate('Profile')}
      onOpenSearchModal={openSearchModal}
      onCloseSearchModal={() => setSearchModalVisible(false)}
      onSelectLocation={onSelectLocation}
      onOpenCalendar={() => setCalendarVisible(true)}
      onCloseCalendar={() => setCalendarVisible(false)}
      onConfirmCalendar={({ startDate: newStartDate, endDate: newEndDate }) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setCalendarVisible(false);
      }}
      onOpenPaxModal={() => setPaxModalVisible(true)}
      onClosePaxModal={() => setPaxModalVisible(false)}
      onConfirmPax={({ adults: newAdults, children: newChildren }) => {
        setAdults(newAdults);
        setChildren(newChildren);
        setPaxModalVisible(false);
      }}
      onOpenTransportModal={() => setTransportModalVisible(true)}
      onCloseTransportModal={() => setTransportModalVisible(false)}
      onSelectTransport={option => {
        setTransport(option);
        setTransportModalVisible(false);
      }}
      onCreateItinerary={handleCreateItinerary}
    />
  );
}
