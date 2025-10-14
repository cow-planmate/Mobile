// src/screens/app/main/HomeScreen.tsx
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

const COLORS = {
  primary: '#007AFF',
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

// ⭐️ 1. 애니메이션을 적용할 ImageBackground 컴포넌트를 새로 만듭니다.
const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

type InputFieldProps = {
  label: string;
  value: string;
  icon: string;
  isLast?: boolean;
  onPress?: () => void;
};

const InputField = ({
  label,
  value,
  icon,
  isLast = false,
  onPress,
}: InputFieldProps) => (
  <>
    <TouchableOpacity style={styles.inputSection} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
    {!isLast && <View style={styles.separator} />}
  </>
);

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 3)),
  );
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
  const [departure, setDeparture] = useState('서울');
  const [destination, setDestination] = useState('부산');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ⭐️ 2. 크로스페이드 애니메이션 로직을 수정합니다.
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1500, // 사라지는 시간
        useNativeDriver: true,
      }).start(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % IMAGE_URIS.length);
        fadeAnim.setValue(1); // 애니메이션 값 즉시 1로 리셋
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ⭐️ 3. UI 구조를 변경하여 애니메이션과 텍스트를 분리합니다. */}
        <View style={styles.headerImage}>
          {/* 현재 이미지 (서서히 사라짐) */}
          <AnimatedImageBackground
            source={{ uri: IMAGE_URIS[currentImageIndex] }}
            style={[styles.image, { opacity: fadeAnim }]}
            imageStyle={styles.headerImageStyle}
          />
          {/* 다음 이미지 (뒤에서 대기) */}
          <ImageBackground
            source={{
              uri: IMAGE_URIS[(currentImageIndex + 1) % IMAGE_URIS.length],
            }}
            style={styles.image}
            imageStyle={styles.headerImageStyle}
          />
          {/* 텍스트 가독성을 위한 어두운 오버레이 */}
          <View style={styles.overlay} />
          {/* 고정된 텍스트 */}
          <Text style={styles.title}>{'나다운, 우리다운\n여행의 시작'}</Text>
        </View>

        <View style={styles.card}>
          <InputField label="출발지" value={departure} icon="📍" />
          <InputField label="여행지" value={destination} icon="🌍" />
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

        <Pressable style={styles.submitButton} onPress={handleCreateItinerary}>
          <Text style={styles.submitButtonText}>일정 생성하기</Text>
        </Pressable>
      </ScrollView>
      {/* ... (모달 부분은 그대로 유지) ... */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 20,
  },
  headerImage: {
    height: 220,
    justifyContent: 'flex-end',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12, // 컨테이너에도 borderRadius 적용
    overflow: 'hidden', // 자식 요소들이 모서리를 벗어나지 않도록
  },
  // ⭐️ 4. 새로운 스타일들을 추가합니다.
  image: {
    ...StyleSheet.absoluteFillObject, // 부모 뷰를 꽉 채우도록 설정
    width: undefined,
    height: undefined,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 어두운 반투명 오버레이
  },
  headerImageStyle: {
    // borderRadius는 이제 컨테이너에서 관리하므로 제거해도 됩니다.
  },
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
