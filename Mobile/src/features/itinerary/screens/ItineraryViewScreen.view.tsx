import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faShareNodes,
  faPencil,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Map as MapOutlineIcon } from 'lucide-react-native';
import KakaoMapView from '../components/KakaoMapView';
import { ShareModal } from '../../../components/common';
import TimelineItem, {
  Place,
} from '../components/TimelineItem';
import { Day } from '../../../contexts/ItineraryContext';
import { SimpleWeatherInfo } from '../../../api/trips';
import WeatherHeader from '../components/weather/WeatherHeader';
import {
  styles,
  COLORS,
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

const formatDate = (date: Date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}.${day}`;
};

const getDayMeta = (places: Place[]) => {
  if (!places || places.length === 0) return '';
  const count = places.length;
  let totalMin = 0;
  places.forEach(p => {
    const s = timeToMinutes(p.startTime);
    const e = timeToMinutes(p.endTime);
    if (e > s) totalMin += e - s;
  });
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const timeStr = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  return `${count}개소 ${timeStr}`;
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

const TimeGridBackground = React.memo(({ hours }: { hours: number[] }) => {
  const hourStr = (h: number) => h.toString().padStart(2, '0');
  const endHour = hours.length > 0 ? hours[hours.length - 1] : -1;

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
          onDelete={() => {}}
          onEditTime={() => {}}
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
  scrollRef: React.RefObject<ScrollView>;
  gridHours: number[];
  offsetMinutes: number;
  handleConfirm: () => void;
  goBack: () => void;
  handleEdit: () => void;
  planId?: number;
  weatherMap: Record<string, SimpleWeatherInfo>;
  tripName: string;
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
  handleConfirm,
  goBack,
  handleEdit,
  planId,
  weatherMap,
  tripName,
}: ItineraryViewScreenViewProps) {
  const selectedDay = days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.dayTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContainer}
          style={styles.dayTabsScroll}
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
                    styles.dayTabLabel,
                    isSelected && styles.dayTabLabelSelected,
                  ]}
                  numberOfLines={1}
                >
                  <Text
                    style={[
                      styles.dayTabDayNumber,
                      isSelected && styles.dayTabDayNumberSelected,
                    ]}
                  >
                    {day.dayNumber}일차{' '}
                  </Text>
                  <Text
                    style={[
                      styles.dayTabDateInline,
                      isSelected && styles.dayTabDateInlineSelected,
                    ]}
                  >
                    {formatDate(day.date)}
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isMapVisible && (
        <View style={styles.mapContainer}>
          <View style={styles.mapInner}>
            <KakaoMapView
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
              {weatherMap[selectedDay.date.toISOString().split('T')[0]] && (
                <View
                  pointerEvents="none"
                  style={styles.timelineWeatherOverlay}
                >
                  <WeatherHeader
                    dayNumber={selectedDay.dayNumber}
                    weather={
                      weatherMap[selectedDay.date.toISOString().split('T')[0]]
                    }
                    appearance="overlay"
                  />
                </View>
              )}
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={[
                  styles.timelineContentContainer,
                  weatherMap[selectedDay.date.toISOString().split('T')[0]]
                    ? { paddingTop: 75 }
                    : {},
                ]}
              >
                <View style={styles.timelineWrapper}>
                  <TimeGridBackground hours={gridHours} />
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
        planId={planId}
      />
    </SafeAreaView>
  );
}
