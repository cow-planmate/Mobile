import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
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
  AccessibilityInfo,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
import { CalendarModal, Header, Invitation, NotificationModal, PaxModal, SearchLocationModal } from '../../../components/common';
import { normalize } from '../../../utils/normalize';
import { styles } from './HomeScreen.styles';
import { getRegionSpots } from '../constants/regionSpots';

// 명소 순환 주기와, 손이 닿은 뒤 다시 돌기까지 기다리는 시간.
const HERO_ROTATE_MS = 4000;
const HERO_RESUME_DELAY_MS = 6000;


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
  onDoneSearchModal?: () => void;
  onSelectLocation: (location: string, id?: number) => void;
  onOpenCalendar: () => void;
  onCloseCalendar: () => void;
  onDoneCalendar?: () => void;
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
  onDoneSearchModal,
  onSelectLocation,
  onOpenCalendar,
  onCloseCalendar,
  onDoneCalendar,
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
  const heroIndexRef = useRef(0);
  const heroPausedUntilRef = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - normalize(16) * 2;
  const cardGap = normalize(6);
  const step = cardWidth + cardGap;
  const sidePadding = (screenWidth - cardWidth) / 2;
  const scrollX = useRef(new Animated.Value(0)).current;

  const spots = useMemo(() => getRegionSpots(destination), [destination]);
  const spotCount = spots.length;

  // 진행바는 사진 개수에 맞춰 썸 너비와 이동 거리가 달라진다.
  const trackWidth = normalize(50);
  const thumbWidth = spotCount > 1 ? trackWidth / spotCount : trackWidth;
  const thumbRange = trackWidth - thumbWidth;

  const thumbTranslateX = useMemo(() => {
    if (spotCount < 2) return new Animated.Value(0);
    return scrollX.interpolate({
      inputRange: spots.map((_, i) => i * step),
      outputRange: spots.map((_, i) => (i / (spotCount - 1)) * thumbRange),
      extrapolate: 'clamp',
    });
  }, [scrollX, spots, spotCount, step, thumbRange]);

  // 여행지가 바뀌면 캐러셀을 첫 장으로 되돌린다.
  useEffect(() => {
    scrollX.setValue(0);
    heroIndexRef.current = 0;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [destination, scrollX]);

  // 손이 닿은 뒤에는 잠시 멈춘다. 사용자가 보고 있는 사진을 뺏지 않기 위해서다.
  const pauseHeroRotation = useCallback(() => {
    heroPausedUntilRef.current = Date.now() + HERO_RESUME_DELAY_MS;
  }, []);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  // 사진이 두 장 이상일 때만 일정 간격으로 다음 명소를 보여준다.
  useEffect(() => {
    if (spotCount < 2 || reduceMotion) return;

    const timer = setInterval(() => {
      if (Date.now() < heroPausedUntilRef.current) return;
      const next = (heroIndexRef.current + 1) % spotCount;
      heroIndexRef.current = next;
      flatListRef.current?.scrollToOffset({
        offset: next * step,
        animated: true,
      });
    }, HERO_ROTATE_MS);

    return () => clearInterval(timer);
  }, [spotCount, step, reduceMotion]);

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
          {spotCount === 0 ? (
            <View style={styles.heroEmpty}>
              <Text style={styles.heroEmptyTitle}>
                {destination ? `${destination}의 명소 사진을 준비하고 있어요` : '여행지를 고르면'}
              </Text>
              {!destination && (
                <Text style={styles.heroEmptyDesc}>
                  그 지역의 대표 명소를 사진으로 보여드려요
                </Text>
              )}
            </View>
          ) : (
            <>
              <Animated.FlatList
                ref={flatListRef}
                data={spots}
                keyExtractor={item => item.place}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={step}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: sidePadding }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                onScrollBeginDrag={pauseHeroRotation}
                onScrollEndDrag={pauseHeroRotation}
                onMomentumScrollEnd={event => {
                  heroIndexRef.current = Math.round(
                    event.nativeEvent.contentOffset.x / step,
                  );
                }}
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
                          marginRight: index === spotCount - 1 ? 0 : cardGap,
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

              <Text style={styles.relationLabel}>
                <Text style={styles.relationRegion}>{destination}</Text>
                {`의 대표 명소 ${spotCount}곳`}
              </Text>

              {spotCount > 1 && (
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressTrack, { width: trackWidth }]}>
                    <Animated.View
                      style={[
                        styles.progressThumb,
                        {
                          width: thumbWidth,
                          transform: [{ translateX: thumbTranslateX }],
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </>
          )}
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
        onDone={onDoneSearchModal}
      />
      <CalendarModal
        visible={isCalendarVisible}
        onClose={onCloseCalendar}
        onConfirm={onConfirmCalendar}
        initialStartDate={startDate ?? undefined}
        initialEndDate={endDate ?? undefined}
        onDone={onDoneCalendar}
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
