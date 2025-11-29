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
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

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
  lightBlue: '#e6f0ff', // 공통 배경색
  shadow: '#1344FF', // 그림자 색상 (primary)
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
  placeholder?: string;
  icon: string;
  onPress?: () => void;
};

// [수정] 로그인/회원가입 화면의 Input 스타일과 동일하게 변경
const InputField = ({
  label,
  value,
  placeholder,
  icon,
  onPress,
}: InputFieldProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity
      style={styles.inputButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.inputTextContainer}>
        <Text style={styles.icon}>{icon}</Text>
        {value ? (
          <Text style={styles.valueText}>{value}</Text>
        ) : (
          <Text style={styles.placeholderText}>{placeholder}</Text>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  </View>
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerImageContainer}>
          <AnimatedImageBackground
            source={{ uri: IMAGE_URIS[currentImageIndex] }}
            style={[styles.image, { opacity: fadeAnim }]}
          />
          <ImageBackground
            source={{
              uri: IMAGE_URIS[(currentImageIndex + 1) % IMAGE_URIS.length],
            }}
            style={styles.image}
          />
          <View style={styles.overlay} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{'나다운, 우리다운\n여행의 시작'}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <InputField
            label="출발지"
            value={departure}
            placeholder="출발지를 선택하세요"
            icon="📍"
            onPress={() => openSearchModal('departure')}
          />
          <InputField
            label="여행지"
            value={destination}
            placeholder="여행지를 선택하세요"
            icon="🌍"
            onPress={() => openSearchModal('destination')}
          />
          <InputField
            label="여행 기간"
            value={`${formatDate(startDate)} ~ ${formatDate(endDate)}`}
            placeholder="날짜를 선택하세요"
            icon="🗓️"
            onPress={() => setCalendarVisible(true)}
          />
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <InputField
                label="인원"
                value={getPaxText()}
                placeholder="인원 선택"
                icon="👥"
                onPress={() => setPaxModalVisible(true)}
              />
            </View>
            <View style={styles.halfInput}>
              <InputField
                label="이동수단"
                value={transport}
                placeholder="이동수단"
                icon="🚗"
                onPress={() => setTransportModalVisible(true)}
              />
            </View>
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
    backgroundColor: COLORS.lightBlue, // 배경색 통일
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: normalize(24),
    paddingTop: normalize(20),
    paddingBottom: normalize(40),
  },
  headerImageContainer: {
    height: normalize(200),
    borderRadius: normalize(16),
    overflow: 'hidden',
    marginBottom: normalize(32),
    // 그림자 효과 추가
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    lineHeight: normalize(38),
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
  },
  // 입력 필드 스타일 그룹
  inputGroup: {
    marginBottom: normalize(20),
  },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(8),
    fontWeight: 'bold',
    marginLeft: normalize(4),
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: normalize(56),
    backgroundColor: COLORS.white,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    borderWidth: 1,
    borderColor: COLORS.gray,
    // 그림자 효과 (로그인 화면과 동일)
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: normalize(20),
    marginRight: normalize(12),
  },
  valueText: {
    fontSize: normalize(16),
    color: COLORS.text,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: normalize(16),
    color: COLORS.darkGray,
  },
  arrow: {
    fontSize: normalize(20),
    color: COLORS.darkGray,
    fontWeight: 'bold',
  },
  // 반반 나누기 위한 스타일
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalize(12),
  },
  halfInput: {
    flex: 1,
  },
  // 제출 버튼 스타일
  submitButton: {
    width: '100%',
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: normalize(24),
    // 그림자 효과
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
