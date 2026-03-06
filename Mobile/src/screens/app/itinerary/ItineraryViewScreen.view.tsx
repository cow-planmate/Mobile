import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  MapPin,
  ChevronUp,
  ChevronDown,
  Share2,
  Pencil,
  Check,
} from 'lucide-react-native';
import KakaoMapView from '../../../components/itinerary/KakaoMapView';
import ShareModal from '../../../components/common/ShareModal';
import TimelineItem, {
  Place,
} from '../../../components/itinerary/TimelineItem';
import { Day } from '../../../contexts/ItineraryContext';
import { SimpleWeatherInfo } from '../../../api/trips';
import WeatherHeader from '../../../components/weather/WeatherHeader';
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

const TimeGridBackground = React.memo(({ hours }: { hours: number[] }) => {
  const hourStr = (h: number) => h.toString().padStart(2, '0');

  return (
    <View style={styles.gridContainer}>
      {hours.map(hour => (
        <View key={hour} style={[styles.hourBlock, { height: HOUR_HEIGHT }]}>
          <View style={styles.hourLabelContainer}>
            <Text style={[styles.timeLabelText, styles.timeLabelTop]}>
              {`${hourStr(hour)}:00`}
            </Text>
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
          </View>

          <View style={styles.hourContent}>
            <View style={[styles.quarterBlock, styles.firstQuarterBlock]} />
            <View style={styles.quarterBlock} />
            <View style={styles.quarterBlock} />
            <View style={styles.quarterBlock} />
          </View>
        </View>
      ))}
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
      position: 'absolute',
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
}: ItineraryViewScreenViewProps) {
  const selectedDay = days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.dayTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayTabsContainer}
          >
            {days.map((day, index) => {
              const dateKey = day.date.toISOString().split('T')[0];
              const weather = weatherMap[dateKey];
              const isSelected = selectedDayIndex === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayTab, isSelected && styles.dayTabSelected]}
                  onPress={() => setSelectedDayIndex(index)}
                >
                  <Text
                    style={[
                      styles.dayTabText,
                      isSelected && styles.dayTabTextSelected,
                    ]}
                  >
                    {day.dayNumber}일차
                  </Text>
                  <Text
                    style={[
                      styles.dayTabDateText,
                      isSelected && styles.dayTabDateTextSelected,
                    ]}
                  >
                    {formatDate(day.date)}
                  </Text>
                  {day.places.length > 0 && (
                    <Text
                      style={[
                        styles.dayTabMetaText,
                        isSelected && styles.dayTabMetaTextSelected,
                      ]}
                    >
                      {getDayMeta(day.places)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.mapToggleButton,
              isMapVisible && styles.mapToggleButtonActive,
            ]}
            onPress={() => setMapVisible(!isMapVisible)}
            activeOpacity={0.7}
          >
            <MapPin
              size={14}
              color={isMapVisible ? '#FFFFFF' : COLORS.primary}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.mapToggleButtonText,
                isMapVisible && styles.mapToggleButtonTextActive,
              ]}
            >
              {isMapVisible ? '숨기기' : '지도'}
            </Text>
            {isMapVisible ? (
              <ChevronUp size={12} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <ChevronDown size={12} color={COLORS.primary} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>

        {selectedDay && (
          <View style={styles.flex1}>
            {weatherMap[selectedDay.date.toISOString().split('T')[0]] && (
              <WeatherHeader
                dayNumber={selectedDay.dayNumber}
                weather={
                  weatherMap[selectedDay.date.toISOString().split('T')[0]]
                }
              />
            )}
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.timelineContentContainer}
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
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.footerButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => setShareModalVisible(true)}
        >
          <Share2 size={18} color={COLORS.text} strokeWidth={2} />
          <Text style={styles.footerButtonText}>공유</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.footerButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleEdit}
        >
          <Pencil size={18} color={COLORS.text} strokeWidth={2} />
          <Text style={styles.footerButtonText}>수정</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.footerButton,
            styles.confirmButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleConfirm}
        >
          <Check size={18} color={COLORS.white} strokeWidth={2.5} />
          <Text style={styles.confirmButtonText}>확인</Text>
        </Pressable>
      </View>

      <ShareModal
        visible={isShareModalVisible}
        onClose={() => setShareModalVisible(false)}
        planId={planId}
      />
    </SafeAreaView>
  );
}
