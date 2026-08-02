import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faShareNodes,
  faPencil,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Map as MapOutlineIcon, ChevronLeft } from 'lucide-react-native';
import RouteMapSection from '../components/RouteMapSection';
import { ShareModal, AirplaneLoading, LoadingSpinner } from '../../../components/common';
import TimelineItem, {
  Place,
} from '../components/TimelineItem';
import { Day } from '../../../contexts/ItineraryContext';
import { SimpleWeatherInfo } from '../../../api/trips';
import WeatherHeader from '../components/weather/WeatherHeader';
import {
  styles,
  HOUR_HEIGHT,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_TOP_OFFSET,
} from './ItineraryViewScreen.styles';

const timeToMinutes = (time: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date: Date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}.${day}`;
};

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
            style={[styles.hourBlock, { height: isLastHour ? 0 : HOUR_HEIGHT }]}
          >
            <View
              style={[
                styles.hourLabelContainer,
                { height: isLastHour ? 0 : HOUR_HEIGHT },
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
                { height: isLastHour ? 0 : HOUR_HEIGHT },
              ]}
            >
              <View
                style={[
                  styles.quarterBlock,
                  styles.firstQuarterBlock,
                  isLastHour && { borderTopWidth: 1 },
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
  isBacking: boolean;
  isWeatherLoading: boolean;
}

export default function ItineraryViewScreenView({
  days,
  selectedDayIndex,
  setSelectedDayIndex,
  isMapVisible,
  setMapVisible,
  isShareModalVisible,
  setShareModalVisible,
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
  isBacking,
  isWeatherLoading,
}: ItineraryViewScreenViewProps) {
  const insets = useSafeAreaInsets();
  const selectedDay = days[selectedDayIndex];
  const [dayScrollContentWidth, setDayScrollContentWidth] = useState(0);
  const [dayScrollLayoutWidth, setDayScrollLayoutWidth] = useState(0);
  const [dayScrollX, setDayScrollX] = useState(0);
  const isDayScrollable = dayScrollContentWidth > dayScrollLayoutWidth;
  const showLeftFade = isDayScrollable && dayScrollX > 5;
  const showRightFade = isDayScrollable && dayScrollX < dayScrollContentWidth - dayScrollLayoutWidth - 5;
  const endHourVal = endHour ?? (gridHours.length > 0 ? gridHours[gridHours.length - 1] : 20);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBarHeader}>
        <TouchableOpacity
          style={styles.topBarBackButton}
          onPress={goBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarHeaderTitle}>일정완성</Text>
        <View style={{ width: 28 }} />
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
            <MapOutlineIcon color="#111827" size={17} strokeWidth={2} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={() => setShareModalVisible(true)}
            variant="outlineDark"
          >
            <FontAwesomeIcon icon={faShareNodes} color="#111827" size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton onPress={handleEdit} variant="filledGray">
            <FontAwesomeIcon icon={faPencil} color="#111827" size={17} />
          </ToolbarIconButton>
          <ToolbarIconButton
            onPress={handleConfirm}
            variant="filledBlue"
            active
          >
            <FontAwesomeIcon icon={faCheck} color="#FFFFFF" size={18} />
          </ToolbarIconButton>
        </View>
      </View>

      <View style={[styles.dayTabsWrapper, { position: 'relative' }]}>
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

        {/* 좌측 페이드 */}
        {showLeftFade && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 24,
              zIndex: 10,
            }}
            pointerEvents="none"
          />
        )}

        {/* 우측 페이드 */}
        {showRightFade && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              right: 0, // dayEditButton이 없으므로 0
              top: 0,
              bottom: 0,
              width: 24,
              zIndex: 10,
            }}
            pointerEvents="none"
          />
        )}
      </View>

      {isMapVisible && (
        <View style={styles.mapContainer}>
          <View style={styles.mapInner}>
            <RouteMapSection
              places={
                selectedDay?.places.map(place => ({
                  id: place.id,
                  name: place.name,
                  address: place.address,
                  latitude: place.latitude,
                  longitude: place.longitude,
                  place_url: place.place_url,
                })) || []
              }
            />
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
                    ? { paddingTop: 62 }
                    : {},
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
      />
      <Modal
        visible={days.length === 0 || isBacking}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {}}
      >
        {days.length === 0 ? (
          <AirplaneLoading />
        ) : (
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
            <LoadingSpinner color="#1344FF" />
          </View>
        )}
      </Modal>
    </View>
  );
}
