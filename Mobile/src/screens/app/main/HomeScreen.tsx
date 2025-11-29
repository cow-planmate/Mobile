import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

import CalendarModal from '../../../components/common/CalendarModal';
import PaxModal from '../../../components/common/PaxModal';
import SelectionModal, {
  OptionType,
} from '../../../components/common/SelectionModal';
import SearchLocationModal from '../../../components/common/SearchLocationModal';

const COLORS = {
  primary: '#1344FF',
  background: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
};

const IMAGE_URIS = [
  'https://picsum.photos/id/10/800/600',
  'https://picsum.photos/id/20/800/600',
  'https://picsum.photos/id/30/800/600',
  'https://picsum.photos/id/40/800/600',
  'https://picsum.photos/id/50/800/600',
];

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

type InputFieldProps = {
  label: string;
  value: string;
  placeholder?: string; // [추가] 값이 없을 때 보여줄 텍스트
  icon: string;
  isLast?: boolean;
  onPress?: () => void;
};

const InputField = ({
  label,
  value,
  placeholder,
  icon,
  isLast = false,
  onPress,
}: InputFieldProps) => (
  <>
    <TouchableOpacity style={styles.inputSection} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {/* [수정] 값이 있으면 valueText, 없으면 placeholderText 스타일 적용 */}
        {value ? (
          <Text style={styles.valueText}>{value}</Text>
        ) : (
          <Text style={styles.placeholderText}>{placeholder}</Text>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
    {!isLast && <View style={styles.separator} />}
  </>
);

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isPaxModalVisible, setPaxModalVisible] = useState(false);
  const [transport, setTransport] = useState('대중교통');
  const [isTransportModalVisible, setTransportModalVisible] = useState(false);

  const transportOptions: OptionType[] = [
    { label: '대중교통', icon: '🚌' },
    { label: '자동차', icon: '🚗' },
  ];

  // [수정] 초기값을 빈 문자열로 설정하여 '선택 안 됨' 상태로 시작
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [fieldToUpdate, setFieldToUpdate] = useState<
    'departure' | 'destination'
  >('departure');

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % IMAGE_URIS.length);
        fadeAnim.setValue(1);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  const getPaxText = () => {
    let text = `성인 ${adults}명`;
    if (children > 0) {
      text += `, 어린이 ${children}명`;
    }
    return text;
  };

  const handleCreateItinerary = () => {
    // 유효성 검사 (필요 시 추가)
    if (!departure || !destination) {
      // Alert.alert('알림', '출발지와 여행지를 선택해주세요.');
      // return;
    }

    navigation.navigate('ItineraryEditor', {
      departure,
      destination,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      adults,
      children,
      transport,
    });
  };

  const openSearchModal = (field: 'departure' | 'destination') => {
    setFieldToUpdate(field);
    setSearchModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View>
          <View style={styles.headerImage}>
            <AnimatedImageBackground
              source={{ uri: IMAGE_URIS[currentImageIndex] }}
              style={[styles.image, { opacity: fadeAnim }]}
              imageStyle={styles.headerImageStyle}
            />
            <ImageBackground
              source={{
                uri: IMAGE_URIS[(currentImageIndex + 1) % IMAGE_URIS.length],
              }}
              style={styles.image}
              imageStyle={styles.headerImageStyle}
            />
            <View style={styles.overlay} />
            <Text style={styles.title}>{'나다운, 우리다운\n여행의 시작'}</Text>
          </View>

          <View style={styles.card}>
            {/* [수정] placeholder prop 전달 */}
            <InputField
              label="출발지"
              value={departure}
              placeholder="출발지 입력"
              icon="📍"
              onPress={() => openSearchModal('departure')}
            />
            <InputField
              label="여행지"
              value={destination}
              placeholder="여행지 입력"
              icon="🌍"
              onPress={() => openSearchModal('destination')}
            />
            <InputField
              label="기간"
              value={`${formatDate(startDate)} ~ ${formatDate(endDate)}`}
              icon="🗓️"
              onPress={() => setCalendarVisible(true)}
            />
            <InputField
              label="인원수"
              value={getPaxText()}
              icon="👥"
              onPress={() => setPaxModalVisible(true)}
            />
            <InputField
              label="이동수단"
              value={transport}
              icon="🚗"
              isLast={true}
              onPress={() => setTransportModalVisible(true)}
            />
          </View>

          <Pressable
            style={styles.submitButton}
            onPress={handleCreateItinerary}
          >
            <Text style={styles.submitButtonText}>일정 생성하기</Text>
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
        onConfirm={({ startDate, endDate }) => {
          setStartDate(startDate);
          setEndDate(endDate);
          setCalendarVisible(false);
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
      <PaxModal
        visible={isPaxModalVisible}
        onClose={() => setPaxModalVisible(false)}
        onConfirm={({ adults, children }) => {
          setAdults(adults);
          setChildren(children);
          setPaxModalVisible(false);
        }}
        initialAdults={adults}
        initialChildren={children}
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
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerImage: {
    height: 220,
    justifyContent: 'flex-end',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerImageStyle: {},
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  icon: {
    fontSize: 24,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
  },
  // [추가] Placeholder 스타일 (회색)
  placeholderText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.placeholder,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.placeholder,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 55,
  },
  submitButton: {
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 30,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
