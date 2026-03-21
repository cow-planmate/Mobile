import React, { useState, useEffect, useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { AppStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../contexts/AuthContext';
import { OptionType } from '../../../components/common/SelectionModal';
import { HomeScreenView } from './HomeScreen.view';
import {
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation,
} from '../../../api/trips';
import { useAlert } from '../../../contexts/AlertContext';
import { Bus, Car } from 'lucide-react-native';

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [adults, setAdults] = useState<number | null>(1);
  const [children, setChildren] = useState<number | null>(0);
  const [isPaxModalVisible, setPaxModalVisible] = useState(false);
  const [transport, setTransport] = useState('대중교통');
  const [isTransportModalVisible, setTransportModalVisible] = useState(false);

  const transportOptions: OptionType[] = [
    {
      label: '대중교통',
      icon: <Bus size={40} color="#1344FF" strokeWidth={1.5} />,
    },
    {
      label: '자동차',
      icon: <Car size={40} color="#1344FF" strokeWidth={1.5} />,
    },
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
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);

  const fetchPendingRequests = async () => {
    try {
      const requests = await getPendingInvitations();
      if (requests) {
        setPendingRequests(requests);
      }
    } catch (error) {
      console.log('초대 요청 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // 화면 포커스 시 알림 자동 갱신
  useFocusEffect(
    useCallback(() => {
      fetchPendingRequests();
    }, []),
  );

  const handleAccept = async (requestId: number) => {
    try {
      await acceptInvitation(requestId);
      showAlert({ title: '수락 완료', message: '일정에 참여했습니다.' });
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({ title: '오류', message: '수락 처리에 실패했습니다.' });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectInvitation(requestId);
      showAlert({ title: '거절 완료', message: '초대를 거절했습니다.' });
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      if (pendingRequests.length <= 1) {
        setNotificationModalVisible(false);
      }
    } catch (e) {
      showAlert({ title: '오류', message: '거절 처리에 실패했습니다.' });
    }
  };

  const handleNotificationPress = () => {
    if (pendingRequests.length === 0) {
      showAlert({ title: '알림', message: '새로운 알림이 없습니다.' });
      return;
    }
    setNotificationModalVisible(true);
  };

  const isFormValid =
    destination !== '' &&
    startDate !== null &&
    endDate !== null &&
    adults !== null &&
    transport !== '';

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
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

    if (travelId === undefined || travelId <= 0) {
      showAlert({
        title: '알림',
        message:
          '여행지가 올바르게 선택되지 않았습니다.\n목록에서 다시 선택해주세요.',
      });
      return;
    }

    setShowErrors(false);

    // Navigate to editor without creating plan on server.
    // Plan will only be created when "일정 생성 완료" is clicked.
    navigation.navigate('ItineraryEditor', {
      departure: departure || 'SEOUL',
      destination,
      travelId: travelId || 0,
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
      email={user?.email}
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
      isNotificationModalVisible={isNotificationModalVisible}
      pendingRequestList={pendingRequests}
      onCloseNotificationModal={() => setNotificationModalVisible(false)}
      onAcceptNotification={handleAccept}
      onRejectNotification={handleReject}
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
