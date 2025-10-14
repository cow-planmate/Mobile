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
  primary: '#1344FF', // ⭐️ 1. primary 색상 코드를 변경했습니다.
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

          <Pressable
            style={styles.submitButton}
            onPress={handleCreateItinerary}
          >
            <Text style={styles.submitButtonText}>일정 생성하기</Text>
          </Pressable>
        </View>
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
  // ⭐️ 2. scrollContainer 스타일을 수정하여 UI 비율을 조정합니다.
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
