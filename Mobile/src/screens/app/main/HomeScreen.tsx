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
import { useAuth } from '../../../contexts/AuthContext'; // [추가] 닉네임 가져오기 위해 AuthContext 사용

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
};

const IMAGE_URIS = [
  'https://picsum.photos/id/10/800/600',
  'https://picsum.photos/id/11/800/600',
  'https://picsum.photos/id/12/800/600',
  'https://picsum.photos/id/13/800/600',
  'https://picsum.photos/id/14/800/600',
];

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

// [수정] 통합된 카드 내부의 입력 행 컴포넌트
type InputRowProps = {
  label: string;
  value: string;
  placeholder?: string;
  icon: string;
  onPress?: () => void;
  isLast?: boolean; // 마지막 항목인지 여부 (구분선 제거용)
};

const InputRow = ({
  label,
  value,
  placeholder,
  icon,
  onPress,
  isLast,
}: InputRowProps) => (
  <TouchableOpacity
    style={[styles.inputRow, !isLast && styles.inputRowBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      {value ? (
        <Text style={styles.valueText} numberOfLines={1}>
          {value}
        </Text>
      ) : (
        <Text style={styles.placeholderText}>{placeholder}</Text>
      )}
    </View>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth(); // [추가] 로그인한 사용자 정보 가져오기

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
        {/* [수정 2, 3, 4] 상단 알림 영역 및 텍스트 (이미지 위 텍스트 제거됨) */}
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
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              /* 알림 화면 이동 등 */ console.log('알림 클릭');
            }}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

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
          {/* [수정 3] 이미지 위 텍스트 제거됨 */}
          <View style={styles.overlay} />
        </View>

        {/* [수정] 하나의 통합된 카드 형태 (Input Card) */}
        <View style={styles.inputCard}>
          <InputRow
            label="출발지"
            value={departure}
            placeholder="어디서 떠나시나요?"
            icon="📍"
            onPress={() => openSearchModal('departure')}
          />
          <InputRow
            label="여행지"
            value={destination}
            placeholder="어디로 갈까요?"
            icon="🌍"
            onPress={() => openSearchModal('destination')}
          />
          <InputRow
            label="여행 기간"
            value={`${formatDate(startDate)} ~ ${formatDate(endDate)}`}
            placeholder="언제 떠나나요?"
            icon="🗓️"
            onPress={() => setCalendarVisible(true)}
          />
          <InputRow
            label="인원"
            value={getPaxText()}
            placeholder="누구와 함께하나요?"
            icon="👥"
            onPress={() => setPaxModalVisible(true)}
          />
          <InputRow
            label="이동수단"
            value={transport}
            placeholder="어떻게 이동하나요?"
            icon="🚗"
            onPress={() => setTransportModalVisible(true)}
            isLast={true} // 마지막 항목 (구분선 없음)
          />
        </View>

        <Pressable style={styles.submitButton} onPress={handleCreateItinerary}>
          <Text style={styles.submitButtonText}>일정 생성하기</Text>
        </Pressable>
      </ScrollView>

      {/* Modals ... (기존과 동일) */}
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
    backgroundColor: COLORS.lightBlue,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: normalize(20),
    // [수정 1] 상단 여백을 대폭 늘려서 전체 UI를 아래로 이동
    paddingTop: normalize(60),
    paddingBottom: normalize(40),
  },
  // [수정 2, 4] 상단 헤더 영역 스타일 (텍스트 + 알림 버튼)
  headerTopArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: normalize(24),
    marginTop: normalize(10),
  },
  headerSlogan: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    fontWeight: '500',
    marginBottom: normalize(4),
  },
  headerGreeting: {
    fontSize: normalize(22),
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerNickname: {
    color: COLORS.primary, // 닉네임 강조 색상
  },
  notificationButton: {
    padding: normalize(8),
    backgroundColor: COLORS.white,
    borderRadius: normalize(20),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIcon: {
    fontSize: normalize(20),
  },
  headerImageContainer: {
    // [수정] 높이 조정 (조금 더 시원하게)
    height: normalize(200),
    borderRadius: normalize(16),
    overflow: 'hidden',
    marginBottom: normalize(24),
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
    // [수정] 텍스트가 사라졌으므로 오버레이 투명도 조절 (밝게)
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  // [삭제] headerTextContainer, title 스타일 제거 (상단으로 이동됨)

  // [수정] 통합된 입력 카드 스타일
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(16),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(16),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: normalize(24),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(64),
  },
  inputRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  iconContainer: {
    width: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(8),
  },
  icon: {
    fontSize: normalize(22),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: normalize(12),
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: normalize(2),
  },
  valueText: {
    fontSize: normalize(16),
    color: COLORS.text,
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: normalize(16),
    color: COLORS.gray,
    fontWeight: '500',
  },
  arrow: {
    fontSize: normalize(20),
    color: COLORS.gray,
    fontWeight: 'bold',
    marginLeft: normalize(8),
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
  submitButtonText: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
