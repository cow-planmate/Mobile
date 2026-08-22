import React, { useMemo, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MapOutlineIcon from 'lucide-react-native/dist/esm/icons/map';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left';
import ListChecks from 'lucide-react-native/dist/esm/icons/list-checks';
import CheckIcon from 'lucide-react-native/dist/esm/icons/check';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil';
import Share2 from 'lucide-react-native/dist/esm/icons/share-2';
import RouteMapSection from '../components/RouteMapSection';
import ChecklistSheet from '../components/checklist/ChecklistSheet';
import { ShareModal, AirplaneLoading } from '../../../components/common';
import TimelineItem, {
  Place,
} from '../components/TimelineItem';
import { Day } from '../../../contexts/ItineraryContext';
import { SimpleWeatherInfo } from '../../../api/trips';
import {
  timeToMinutes,
  formatDateLocal,
  formatMonthDayDot,
} from '../../../utils/timeUtils';
import WeatherHeader from '../components/weather/WeatherHeader';
import {
  styles,
  HOUR_HEIGHT,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_TOP_OFFSET,
  COLORS,
} from './ItineraryViewScreen.styles';

const formatDate = formatMonthDayDot;

type ToolbarButtonVariant =
  | 'plain'
  | 'info'
  | 'outlineBlue'
  | 'outlineDark'
  | 'filledGray'
  | 'filledBlue';

const ToolbarIconButton = ({
  children,
  onPress,
  active = false,
  disabled = false,
  badgeCount,
  variant = 'info',
}: {
  children: React.ReactNode;
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
      active && styles.toolbarIconButtonActive,
      disabled && styles.toolbarIconButtonDisabled,
    ]}
    accessibilityState={{ disabled: disabled }}
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

const TimeGridBackground = React.memo(
  ({ hours, endHour }: { hours: number[]; endHour: number }) => {
    const hourStr = (h: number) => h.toString().padStart(2, '0');

  return (
    <View style={styles.gridContainer}>
      {hours.map(hour => {
        const isLastHour = hour === endHour;
        return (
          <View
            key={hour}
            style={[styles.hourBlock, isLastHour ? styles.hourHeightZero : styles.hourHeightFull]}
          >
            <View
              style={[
                styles.hourLabelContainer,
                isLastHour ? styles.hourHeightZero : styles.hourHeightFull,
              ]}
            >
              <Text style={[styles.timeLabelText, styles.timeLabelTop]}>
                {`${hourStr(hour)}:00`}
              </Text>
              {!isLastHour && (
                <>
                  <Text
                    style={[
                      styles.timeLabelText,
                      styles.minuteLabel,
                      { top: HOUR_HEIGHT / 4 },
                    ]}
                  >
                    {`${hourStr(hour)}:15`}
                  </Text>
                  <Text
                    style={[
                      styles.timeLabelText,
                      styles.minuteLabel,
                      { top: HOUR_HEIGHT / 2 },
                    ]}
                  >
                    {`${hourStr(hour)}:30`}
                  </Text>
                  <Text
                    style={[
                      styles.timeLabelText,
                      styles.minuteLabel,
                      { top: (HOUR_HEIGHT * 3) / 4 },
                    ]}
                  >
                    {`${hourStr(hour)}:45`}
                  </Text>
                </>
              )}
            </View>

            <View
              style={[
                styles.hourContent,
                isLastHour ? styles.hourHeightZero : styles.hourHeightFull,
              ]}
            >
              <View
                style={[
                  styles.quarterBlock,
                  styles.firstQuarterBlock,
                  isLastHour && styles.lastHourBorder,
                ]}
              />
              {!isLastHour && (
                <>
                  <View style={styles.quarterBlock} />
                  <View style={styles.quarterBlock} />
                  <View style={styles.quarterBlock} />
                </>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
});

const StaticTimelineItem = React.memo(
  ({ place, offsetMinutes }: { place: Place; offsetMinutes: number }) => {
    const startMinutes = timeToMinutes(place.startTime);
    const endMinutes = timeToMinutes(place.endTime);
    const durationMinutes = endMinutes - startMinutes;

    const top =
      (startMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
    const height = durationMinutes * MINUTE_HEIGHT;

    const itemStyle = {
      position: 'absolute' as const,
      top: top,
      height: Math.max(height, MIN_ITEM_HEIGHT),
      left: 60,
      right: 15,
    };

    return (
      <View style={itemStyle}>
        <TimelineItem
          item={place}
          isReadOnly={true}
          style={styles.flex1}
        />
      </View>
    );
  },
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
  gridHours: number[];
  offsetMinutes: number;
  endHour?: number;
  handleConfirm: () => void;
  goBack: () => void;
  handleEdit: () => void;
  planId?: string;
  weatherMap: Record<string, SimpleWeatherInfo>;
  tripName: string;

  isWeatherLoading: boolean;
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
  gridHours,
  offsetMinutes,
  endHour,
  handleConfirm,
  goBack,
  handleEdit,
  planId,
  weatherMap,
  tripName,
  loadError,
  onRetryLoad,
}: ItineraryViewScreenViewProps) {
  const selectedDay = days[selectedDayIndex];
  const [dayScrollContentWidth, setDayScrollContentWidth] = useState(0);
  const [dayScrollLayoutWidth, setDayScrollLayoutWidth] = useState(0);
  const [dayScrollX, setDayScrollX] = useState(0);
  const isDayScrollable = dayScrollContentWidth > dayScrollLayoutWidth;
  const showLeftFade = isDayScrollable && dayScrollX > 5;
  const showRightFade = isDayScrollable && dayScrollX < dayScrollContentWidth - dayScrollLayoutWidth - 5;
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
  const endHourVal = endHour ?? (gridHours.length > 0 ? gridHours[gridHours.length - 1] : 20);

  return (
    <View style={styles.container}>
      <View style={styles.topBarHeader}>
        <TouchableOpacity
          style={styles.topBarBackButton}
          onPress={goBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={8}
        >
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarHeaderTitle}>일정완성</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.topToolbar}>
        <View style={styles.toolbarLeftGroup}>
          <View style={styles.toolbarTitleButton}>
            <Text style={styles.toolbarTitleText} numberOfLines={1}>
              {tripName}
            </Text>
          </View>
        </View>

        <View style={styles.toolbarRightGroup}>
          <ToolbarIconButton
            onPress={() => setMapVisible(!isMapVisible)}
            variant="outlineDark"
          >
            <MapOutlineIcon color={COLORS.text} size={17} strokeWidth={2} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={() => setChecklistVisible(true)}
            variant="outlineDark"
          >
            <ListChecks size={17} color={COLORS.text} strokeWidth={2} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={() => setShareModalVisible(true)}
            variant="outlineDark"
          >
            <Share2 color={COLORS.text} size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={handleEdit} variant="filledGray">
            <Pencil color={COLORS.text} size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={handleConfirm}
            variant="filledBlue"
            active
          >
            <CheckIcon color={COLORS.white} size={18} />
          </ToolbarIconButton>
        </View>
      </View>

      <View style={styles.dayTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContainer}
          style={styles.dayTabsScroll}
          onContentSizeChange={(w) => setDayScrollContentWidth(w)}
          onLayout={(e) => setDayScrollLayoutWidth(e.nativeEvent.layout.width)}
          onScroll={(e) => setDayScrollX(e.nativeEvent.contentOffset.x)}
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
                onPress={() => setSelectedDayIndex(index)}
                activeOpacity={0.85}
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

      {isMapVisible && (
        <View style={styles.mapContainer}>
          <View style={styles.mapInner}>
            <RouteMapSection places={mapPlaces} />
          </View>
        </View>
      )}

      <View style={styles.flex1}>
        {selectedDay && (
          <View style={styles.flex1}>
            <View style={styles.timelineStage}>
              <View pointerEvents="none" style={styles.timelineSceneBackdrop} />
              {weatherMap[formatDateLocal(selectedDay.date)] && (
                <View
                  pointerEvents="none"
                  style={styles.timelineWeatherOverlay}
                >
                  <WeatherHeader
                    dayNumber={selectedDay.dayNumber}
                    weather={
                      weatherMap[formatDateLocal(selectedDay.date)]
                    }
                    appearance="overlay"
                  />
                </View>
              )}
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={[
                  styles.timelineContentContainer,
                  weatherMap[formatDateLocal(selectedDay.date)]
                    ? styles.timelineWeatherPadding
                    : undefined,
                ]}
              >
                <View style={styles.timelineWrapper}>
                  <TimeGridBackground hours={gridHours} endHour={endHourVal} />
                  {selectedDay.places.map(place => (
                    <StaticTimelineItem
                      key={place.id}
                      place={place}
                      offsetMinutes={offsetMinutes}
                    />
                  ))}
                </View>
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
      {/* 로딩이 끝나지 않으면 이 모달이 화면 전체를 덮는다 —
          안드로이드 뒤로가기로 빠져나갈 수 있어야 갇히지 않는다 */}
      <Modal
        visible={days.length === 0}
        transparent={false}
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
