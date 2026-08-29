import React, { useRef, useCallback } from 'react';
import CalendarIcon from 'lucide-react-native/dist/esm/icons/calendar';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin';
import UserIcon from 'lucide-react-native/dist/esm/icons/user';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
import { CalendarModal, Header, Invitation, NotificationModal, PaxModal, SearchLocationModal } from '../../../components/common';
import { normalize } from '../../../utils/normalize';
import { styles } from './HomeScreen.styles';

const HERO_ITEMS = [
  {
    id: '1',
    image: require('../../../assets/images/home/seoul-gyeongbokgung.jpg'),
    region: '서울',
    place: '경복궁',
    roman: 'Gyeongbokgung',
  },
  {
    id: '2',
    image: require('../../../assets/images/home/busan-haeundae.jpg'),
    region: '부산',
    place: '해운대',
    roman: 'Haeundae',
  },
  {
    id: '3',
    image: require('../../../assets/images/home/jeju-seongsan-ilchulbong.jpg'),
    region: '제주',
    place: '성산일출봉',
    roman: 'Seongsan Ilchulbong',
  },
  {
    id: '4',
    image: require('../../../assets/images/home/gyeongju-cheomseongdae.jpg'),
    region: '경주',
    place: '첨성대',
    roman: 'Cheomseongdae',
  },
  {
    id: '5',
    image: require('../../../assets/images/home/jeonju-hanok-village.jpg'),
    region: '전주',
    place: '한옥마을',
    roman: 'Hanok Village',
  },
];

const LOOP_SETS = 20;
const INFINITE_HERO_ITEMS = Array.from({ length: LOOP_SETS }).flatMap((_, setIndex) =>
  HERO_ITEMS.map(item => ({
    ...item,
    uniqueId: `${item.id}-${setIndex}`,
  }))
);
const INITIAL_LOOP_SET = Math.floor(LOOP_SETS / 2);
const INITIAL_INDEX = INITIAL_LOOP_SET * HERO_ITEMS.length;

type InputRowProps = {
  stepNumber: number;
  label: string;
  value: string;
  placeholder?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
  isLast?: boolean;
};

const InputRow = ({
  stepNumber,
  label,
  value,
  placeholder,
  icon: Icon,
  onPress,
  isLast,
}: InputRowProps) => {
  const hasValue = Boolean(value);
  return (
    <TouchableOpacity
      style={[styles.timelineRow, isLast && styles.timelineRowLast]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        hasValue
          ? `${label}, ${value}`
          : `${label}, ${placeholder ?? '미입력'}`
      }
    >
      <View
        style={[
          styles.timelineDot,
          hasValue && styles.timelineDotFilled,
        ]}
      >
        <Text
          style={[
            styles.timelineDotText,
            hasValue && styles.timelineDotTextFilled,
          ]}
        >
          {stepNumber}
        </Text>
      </View>
      <View
        style={[
          styles.timelineContent,
          isLast && styles.timelineContentLast,
        ]}
      >
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          {hasValue ? (
            <Text style={styles.valueText} numberOfLines={1}>
              {value}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
          <View style={styles.rowIcon}>
            <Icon color="#94A3B8" size={18} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export interface HomeScreenViewProps {
  nickname?: string;
  email?: string;
  pendingRequestsCount: number;
  destination: string;
  dateText: string;
  paxText: string;
  isFormValid: boolean;
  isSearchModalVisible: boolean;
  isCalendarVisible: boolean;
  isPaxModalVisible: boolean;
  isNotificationModalVisible: boolean;
  pendingRequestList: Invitation[];
  onCloseNotificationModal: () => void;
  onAcceptNotification: (requestId: number) => void;
  onRejectNotification: (requestId: number) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  adults?: number | null;
  children?: number | null;
  onNotificationPress: () => void;
  onNavigateProfile: () => void;
  onOpenSearchModal: () => void;
  onCloseSearchModal: () => void;
  onSelectLocation: (location: string, id?: number) => void;
  onOpenCalendar: () => void;
  onCloseCalendar: () => void;
  onConfirmCalendar: (dates: { startDate: Date; endDate: Date }) => void;
  onOpenPaxModal: () => void;
  onClosePaxModal: () => void;
  onConfirmPax: (pax: { adults: number; children: number }) => void;
  onCreateItinerary: () => void;
  isCreating?: boolean;
  variant?: 'option1' | 'option2' | 'option3' | 'option4';
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  nickname,
  email,
  pendingRequestsCount, 
  destination,
  dateText,
  paxText,
  isFormValid,
  isSearchModalVisible,
  isCalendarVisible,
  isPaxModalVisible,
  startDate,
  endDate,
  adults,
  children,
  onNotificationPress,
  onNavigateProfile,
  onOpenSearchModal,
  onCloseSearchModal,
  onSelectLocation,
  onOpenCalendar,
  onCloseCalendar,
  onConfirmCalendar,
  onOpenPaxModal,
  onClosePaxModal,
  onConfirmPax,
  onCreateItinerary,
  isCreating = false,
  isNotificationModalVisible,
  pendingRequestList,
  onCloseNotificationModal,
  onAcceptNotification,
  onRejectNotification,
}: HomeScreenViewProps) => {
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - normalize(16) * 2;
  const cardGap = normalize(6);
  const step = cardWidth + cardGap;
  const sidePadding = (screenWidth - cardWidth) / 2;
  const scrollX = useRef(new Animated.Value(INITIAL_INDEX * step)).current;

  const thumbTranslateX = scrollX.interpolate({
    inputRange: INFINITE_HERO_ITEMS.map((_, i) => i * step),
    outputRange: INFINITE_HERO_ITEMS.map(
      (_, i) => ((i % HERO_ITEMS.length) / (HERO_ITEMS.length - 1)) * normalize(40)
    ),
    extrapolate: 'clamp',
  });

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const currentIndex = Math.round(offsetX / step);
      const minThreshold = HERO_ITEMS.length * 2;
      const maxThreshold = HERO_ITEMS.length * (LOOP_SETS - 2);

      if (currentIndex < minThreshold || currentIndex > maxThreshold) {
        const itemIndex = currentIndex % HERO_ITEMS.length;
        const resetIndex = INITIAL_INDEX + itemIndex;
        flatListRef.current?.scrollToOffset({
          offset: resetIndex * step,
          animated: false,
        });
      }
    },
    [step]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header
        nickname={nickname}
        email={email}
        pendingRequestsCount={pendingRequestsCount}
        onNotificationPress={onNotificationPress}
        onNavigateProfile={onNavigateProfile}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: normalize(24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.heroCarouselSection}>
          <Animated.FlatList
            ref={flatListRef}
            data={INFINITE_HERO_ITEMS}
            keyExtractor={item => item.uniqueId}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={step}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: sidePadding }}
            initialScrollIndex={INITIAL_INDEX}
            getItemLayout={(_, index) => ({
              length: step,
              offset: step * index,
              index,
            })}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * step,
                index * step,
                (index + 1) * step,
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.96, 1, 0.96],
                extrapolate: 'clamp',
              });

              const cardTranslateX = scrollX.interpolate({
                inputRange,
                outputRange: [normalize(6), 0, -normalize(6)],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.55, 1, 0.55],
                extrapolate: 'clamp',
              });

              const imageTranslateX = scrollX.interpolate({
                inputRange,
                outputRange: [normalize(12), 0, -normalize(12)],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  style={[
                    styles.heroCard,
                    {
                      width: cardWidth,
                      marginRight:
                        index === INFINITE_HERO_ITEMS.length - 1 ? 0 : cardGap,
                      transform: [{ translateX: cardTranslateX }, { scale }],
                      opacity,
                    },
                  ]}
                >
                  <View style={styles.heroImageWrapper}>
                    <AnimatedFastImage
                      source={item.image}
                      style={[
                        styles.heroImage,
                        { transform: [{ translateX: imageTranslateX }] },
                      ]}
                      resizeMode={FastImage.resizeMode.cover}
                      accessible={false}
                    />
                  </View>
                  <LinearGradient
                    colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)']}
                    locations={[0.62, 1]}
                    style={styles.heroOverlay}
                  />
                  <View style={styles.heroInfo}>
                    <Text style={styles.placeTitle}>{item.place}</Text>
                    <Text style={styles.placeRoman}>{item.roman}</Text>
                  </View>
                </Animated.View>
              );
            }}
          />
          <View style={styles.progressBarContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressThumb,
                  { transform: [{ translateX: thumbTranslateX }] },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.timelineTrack} />

            <InputRow
              stepNumber={1}
              label="여행지"
              value={destination}
              placeholder="여행지 선택"
              icon={MapPin}
              onPress={onOpenSearchModal}
            />

            <InputRow
              stepNumber={2}
              label="기간"
              value={dateText}
              placeholder="날짜 선택"
              icon={CalendarIcon}
              onPress={onOpenCalendar}
            />

            <InputRow
              stepNumber={3}
              label="인원수"
              value={paxText}
              placeholder="인원 선택"
              icon={UserIcon}
              onPress={onOpenPaxModal}
              isLast
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || isCreating) && styles.submitButtonDisabled,
            ]}
            onPress={onCreateItinerary}
            disabled={!isFormValid || isCreating}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="일정생성"
            accessibilityState={{ disabled: !isFormValid || isCreating }}
          >
            <Text
              style={[
                styles.submitButtonText,
                (!isFormValid || isCreating) && styles.submitButtonTextDisabled,
              ]}
            >
              {isCreating ? '일정 만드는 중…' : '일정생성'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SearchLocationModal
        visible={isSearchModalVisible}
        onClose={onCloseSearchModal}
        currentValue={destination}
        onSelect={onSelectLocation}
      />
      <CalendarModal
        visible={isCalendarVisible}
        onClose={onCloseCalendar}
        onConfirm={onConfirmCalendar}
        initialStartDate={startDate ?? undefined}
        initialEndDate={endDate ?? undefined}
      />
      <PaxModal
        visible={isPaxModalVisible}
        onClose={onClosePaxModal}
        onConfirm={onConfirmPax}
        initialAdults={adults ?? 1}
        initialChildren={children ?? 0}
      />
      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={onCloseNotificationModal}
        invitations={pendingRequestList}
        onAccept={onAcceptNotification}
        onReject={onRejectNotification}
      />
    </View>
  );
};
