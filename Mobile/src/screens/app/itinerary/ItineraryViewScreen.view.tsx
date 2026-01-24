import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ShareModal from '../../../components/common/ShareModal';
import TimelineItem, {
  Place,
} from '../../../components/itinerary/TimelineItem';
import { Day } from '../../../contexts/ItineraryContext';
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

const formatDate = (date: Date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}.${day}`;
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
  planId?: number;
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
  planId,
}: ItineraryViewScreenViewProps) {
  const selectedDay = days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
      {isMapVisible && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={
              selectedDay && selectedDay.places.length > 0
                ? {
                    latitude: selectedDay.places[0].latitude,
                    longitude: selectedDay.places[0].longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }
                : undefined
            }
          >
            {selectedDay?.places.map(place => (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name}
                description={place.address}
              />
            ))}
          </MapView>
        </View>
      )}

      <View style={styles.flex1}>
        <View style={styles.dayTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayTabsContainer}
          >
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayTab,
                  selectedDayIndex === index && styles.dayTabSelected,
                ]}
                onPress={() => setSelectedDayIndex(index)}
              >
                <Text
                  style={[
                    styles.dayTabText,
                    selectedDayIndex === index && styles.dayTabTextSelected,
                  ]}
                >
                  {day.dayNumber}일차
                </Text>
                <Text
                  style={[
                    styles.dayTabDateText,
                    selectedDayIndex === index && styles.dayTabDateTextSelected,
                  ]}
                >
                  {formatDate(day.date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.mapToggleButton}
            onPress={() => setMapVisible(!isMapVisible)}
          >
            <Text style={styles.mapToggleButtonText}>
              {isMapVisible ? '지도 숨기기' : '지도 보기'}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedDay && (
          <View style={styles.flex1}>
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
          style={styles.footerButton}
          onPress={() => setShareModalVisible(true)}
        >
          <Text style={styles.footerButtonText}>공유</Text>
        </Pressable>
        <Pressable style={styles.footerButton} onPress={goBack}>
          <Text style={styles.footerButtonText}>수정</Text>
        </Pressable>
        <Pressable
          style={[styles.footerButton, styles.confirmButton]}
          onPress={handleConfirm}
        >
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
