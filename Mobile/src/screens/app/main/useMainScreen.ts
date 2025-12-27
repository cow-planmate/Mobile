import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../contexts/AuthContext';
import { OptionType } from '../../../components/common/SelectionModal';

export const useMainScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
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
    navigation.navigate('ItineraryCreation', {
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

  return {
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
    setShowErrors,
    getDateText,
    getPaxText,
    handleCreateItinerary,
    openSearchModal,
  };
};
