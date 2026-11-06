import React, { useCallback, useMemo, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import MapOutlineIcon from 'lucide-react-native/dist/esm/icons/map';
import ListChecks from 'lucide-react-native/dist/esm/icons/list-checks';
import Share2 from 'lucide-react-native/dist/esm/icons/share-2';
import PlanMapModal from '../components/PlanMapModal';
import ChecklistSheet from '../components/checklist/ChecklistSheet';
import {
  ShareModal,
  AirplaneLoading,
} from '../../../components/common';
import PlanScheduleList, {
  formatFullDate,
} from '../components/PlanScheduleList';
import PlaceDetailSheet, {
  type PlaceDetailTarget,
} from '../components/PlaceDetailSheet';
import { Day } from '../contexts/ItineraryContext';
import { SimpleWeatherInfo } from '../../../api/trips';
import { formatDateLocal, formatMonthDayDot } from '../../../utils/timeUtils';
import WeatherHeader from '../components/weather/WeatherHeader';
import { useScreenInsets } from '../../../hooks/useScreenInsets';
import { styles, COLORS } from './ItineraryViewScreen.styles';

const formatDate = formatMonthDayDot;

type ToolbarButtonVariant =
  | 'plain'
  | 'info'
  | 'outlineBlue'
  | 'outlineDark'
  | 'filledGray'
  | 'filledBlue'
  | 'bare'
  | 'editText';

const ToolbarIconButton = ({
  label,
  children,
  onPress,
  active = false,
  disabled = false,
  badgeCount,
  variant = 'info',
}: {
  children: React.ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  badgeCount?: number;
  variant?: ToolbarButtonVariant;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    hitSlop={8}
    style={[
      styles.toolbarIconButton,
      variant === 'plain' && styles.toolbarIconButtonPlain,
      variant === 'info' && styles.toolbarIconButtonInfo,
      variant === 'outlineBlue' && styles.toolbarIconButtonOutlineBlue,
      variant === 'outlineDark' && styles.toolbarIconButtonOutlineDark,
      variant === 'filledGray' && styles.toolbarIconButtonFilledGray,
      variant === 'filledBlue' && styles.toolbarIconButtonFilledBlue,
      variant === 'bare' && styles.toolbarIconButtonBare,
      variant === 'editText' && styles.toolbarIconButtonEditText,
      active && styles.toolbarIconButtonActive,
      disabled && styles.toolbarIconButtonDisabled,
    ]}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
  >
    {children}
    {typeof badgeCount === 'number' && badgeCount > 0 && (
      <View style={styles.toolbarBadge}>
        <Text style={styles.toolbarBadgeText}>
          {badgeCount > 9 ? '9+' : badgeCount}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

export interface ItineraryViewScreenViewProps {
  days: Day[];
  selectedDayIndex: number;
  setSelectedDayIndex: (idx: number) => void;
  isMapVisible: boolean;
  setMapVisible: (visible: boolean) => void;
  isShareModalVisible: boolean;
  setShareModalVisible: (visible: boolean) => void;
  isChecklistVisible: boolean;
  setChecklistVisible: (visible: boolean) => void;

  isPlanOwner: boolean;
  scrollRef: React.RefObject<ScrollView | null>;
  goBack: () => void;
  handleEdit: () => void;
  planId?: string;
  weatherMap: Record<string, SimpleWeatherInfo>;
  tripName: string;
  destination?: string;

  isWeatherLoading: boolean;
  /** 일정은 준비됐지만 날씨를 잠깐 더 기다리는 동안 로딩을 유지한다. */
  isWaitingWeather: boolean;
  loadError: boolean;
  onRetryLoad: () => void;
}

export default function ItineraryViewScreenView({
  days,
  selectedDayIndex,
  setSelectedDayIndex,
  isMapVisible,
  setMapVisible,
  isShareModalVisible,
  setShareModalVisible,
  isChecklistVisible,
  setChecklistVisible,
  isPlanOwner,
  scrollRef,
  goBack,
  handleEdit,
  planId,
  weatherMap,
  tripName,
  destination,
  isWaitingWeather,
  loadError,
  onRetryLoad,
}: ItineraryViewScreenViewProps) {
  const selectedDay = days[selectedDayIndex];
  const [placeDetail, setPlaceDetail] = useState<PlaceDetailTarget | null>(
    null,
  );
  const [dayScrollContentWidth, setDayScrollContentWidth] = useState(0);
  const [dayScrollLayoutWidth, setDayScrollLayoutWidth] = useState(0);
  const [dayScrollX, setDayScrollX] = useState(0);
  const dayTabsScrollRef = useRef<ScrollView>(null);
  const dayTabLayoutsRef = useRef<
    Record<number, { x: number; width: number }>
  >({});
  const isDayScrollable = dayScrollContentWidth > dayScrollLayoutWidth;
  const showLeftFade = isDayScrollable && dayScrollX > 5;
  const showRightFade =
    isDayScrollable &&
    dayScrollX < dayScrollContentWidth - dayScrollLayoutWidth - 5;
  const handleDaySelect = useCallback(
    (index: number) => {
      setSelectedDayIndex(index);

      const layout = dayTabLayoutsRef.current[index];
      if (!layout || dayScrollLayoutWidth <= 0) return;

      const edgePadding = 8;
      const visibleStart = dayScrollX;
      const visibleEnd = visibleStart + dayScrollLayoutWidth;
      let nextX = dayScrollX;

      if (layout.x < visibleStart + edgePadding) {
        nextX = layout.x - edgePadding;
      } else if (layout.x + layout.width > visibleEnd - edgePadding) {
        nextX = layout.x + layout.width - dayScrollLayoutWidth + edgePadding;
      }

      const maxScrollX = Math.max(
        0,
        dayScrollContentWidth - dayScrollLayoutWidth,
      );
      nextX = Math.max(0, Math.min(nextX, maxScrollX));

      if (Math.abs(nextX - dayScrollX) > 1) {
        dayTabsScrollRef.current?.scrollTo({ x: nextX, animated: true });
      }
    },
    [
      dayScrollContentWidth,
      dayScrollLayoutWidth,
      dayScrollX,
      setSelectedDayIndex,
    ],
  );
  const screenInsets = useScreenInsets(true);
  // 편집 화면 제목 아래 부제와 같은 규칙. 날짜는 일차 탭에 이미 있어 적지 않는다.
  const tripSubtitle = [
    destination,
    days.length > 1 ? `${days.length - 1}박 ${days.length}일` : '당일',
  ]
    .filter(Boolean)
    .join(' · ');
  const mapPlaces = useMemo(
    () =>
      selectedDay?.places.map(place => ({
        id: place.id,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        placeRefId: place.placeRefId,
        place_url: place.place_url,
      })) ?? [],
    [selectedDay],
  );
  return (
    <View style={[styles.container, screenInsets]}>
      {/* 편집 화면과 같은 머리줄. 위 줄은 뒤로 가기와 일정 이름, 아래 줄은
          부제와 도구다. 편집만 이 화면의 주된 동작이라 글자 단추로 둔다. */}
      <View style={styles.topToolbar}>
        <View style={styles.toolbarTitleRow}>
          <TouchableOpacity
            style={styles.toolbarBackButton}
            onPress={goBack}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
          >
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.toolbarLeftGroup}>
            <View style={styles.toolbarTitleButton}>
              <Text style={styles.toolbarTitleText} numberOfLines={1}>
                {tripName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.toolbarToolsRow}>
          <Text style={styles.toolbarSubtitle} numberOfLines={1}>
            {tripSubtitle}
          </Text>
          <View style={styles.toolbarRightGroup}>
            <ToolbarIconButton
              onPress={() => setMapVisible(!isMapVisible)}
              label="여행 동선"
              variant="bare"
            >
              <MapOutlineIcon
                color={COLORS.textLabel}
                size={22}
                strokeWidth={1.75}
              />
            </ToolbarIconButton>
            <ToolbarIconButton
              onPress={() => setChecklistVisible(true)}
              label="체크리스트"
              variant="bare"
            >
              <ListChecks size={22} color={COLORS.textLabel} strokeWidth={1.75} />
            </ToolbarIconButton>
            <ToolbarIconButton
              onPress={() => setShareModalVisible(true)}
              label="공유 및 초대"
              variant="bare"
            >
              <Share2 color={COLORS.textLabel} size={22} strokeWidth={1.75} />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="일정 수정"
              onPress={handleEdit}
              variant="editText"
            >
              <Text style={styles.toolbarEditText}>편집</Text>
            </ToolbarIconButton>
          </View>
        </View>
      </View>

      <View style={styles.dayTabsWrapper}>
        <ScrollView
          ref={dayTabsScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContainer}
          style={styles.dayTabsScroll}
          onContentSizeChange={w => setDayScrollContentWidth(w)}
          onLayout={e => setDayScrollLayoutWidth(e.nativeEvent.layout.width)}
          onScroll={e => setDayScrollX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          {days.map((day, index) => {
            const isSelected = selectedDayIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayTab,
                  isSelected && styles.dayTabSelected,
                  !isSelected && styles.dayTabUnselected,
                ]}
                onPress={() => handleDaySelect(index)}
                onLayout={event => {
                  const { x, width } = event.nativeEvent.layout;
                  dayTabLayoutsRef.current[index] = { x, width };
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`${day.dayNumber}일차 ${formatDate(
                  day.date,
                )}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.dayTabDayNumber,
                    isSelected && styles.dayTabDayNumberSelected,
                  ]}
                >
                  {day.dayNumber}일차
                </Text>
                <Text
                  style={[
                    styles.dayTabDateInline,
                    isSelected && styles.dayTabDateInlineSelected,
                  ]}
                >
                  {formatDate(day.date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {showLeftFade && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dayTabsFadeOverlay, styles.dayTabsFadeOverlayLeft]}
            pointerEvents="none"
          />
        )}

        {showRightFade && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dayTabsFadeOverlay, styles.dayTabsFadeOverlayRight]}
            pointerEvents="none"
          />
        )}
      </View>

      <PlanMapModal
        inlineSegments
        visible={isMapVisible}
        onClose={() => setMapVisible(false)}
        places={mapPlaces}
        dayLabel={selectedDay ? `${selectedDay.dayNumber}일차` : undefined}
      />

      <View style={styles.flex1}>
        {selectedDay && (
          <View style={styles.flex1}>
            <View style={styles.timelineStage}>
              <View pointerEvents="none" style={styles.timelineSceneBackdrop} />
              {weatherMap[formatDateLocal(selectedDay.date)] && (
                <WeatherHeader
                  dayNumber={selectedDay.dayNumber}
                  weather={weatherMap[formatDateLocal(selectedDay.date)]}
                  appearance="band"
                />
              )}
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.timelineContentContainer}
              >
                <PlanScheduleList
                  places={selectedDay.places}
                  dateLabel={formatFullDate(selectedDay.date)}
                  onShowDetail={place => {
                    if (!place.placeRefId) return;
                    setPlaceDetail({
                      contentId: place.placeRefId,
                      name: place.name,
                      address: place.address,
                    });
                  }}
                />
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      <ShareModal
        visible={isShareModalVisible}
        onClose={() => setShareModalVisible(false)}
        planId={planId ?? ''}
        isOwner={isPlanOwner}
      />

      {isChecklistVisible && (
        <ChecklistSheet
          visible
          onClose={() => setChecklistVisible(false)}
          planId={planId}
        />
      )}
      <PlaceDetailSheet
        visible={!!placeDetail}
        contentId={placeDetail?.contentId ?? null}
        fallbackName={placeDetail?.name}
        fallbackAddress={placeDetail?.address}
        onClose={() => setPlaceDetail(null)}
      />
      {/* 로딩이 끝나지 않으면 이 모달이 화면 전체를 덮는다 —
          안드로이드 뒤로가기로 빠져나갈 수 있어야 갇히지 않는다 */}
      <Modal
        visible={days.length === 0 || isWaitingWeather}
        transparent={false}
        statusBarTranslucent
        navigationBarTranslucent
        animationType="fade"
        onRequestClose={goBack}
      >
        {loadError ? (
          <View style={styles.loadErrorContainer}>
            <Text style={styles.loadErrorText}>일정을 불러오지 못했어요.</Text>
            <TouchableOpacity
              style={styles.loadErrorRetryButton}
              onPress={onRetryLoad}
              accessibilityRole="button"
            >
              <Text style={styles.loadErrorRetryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <AirplaneLoading />
        )}
      </Modal>
    </View>
  );
}
