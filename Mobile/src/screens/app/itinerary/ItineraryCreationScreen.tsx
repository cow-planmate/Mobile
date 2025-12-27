import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useItineraryCreationScreen } from './useItineraryCreationScreen';
import {
  styles,
  COLORS,
  MINUTE_HEIGHT,
} from './ItineraryCreationScreen.styles';
import Header from '../../../components/common/Header';
import SearchLocationModal from '../../../components/common/SearchLocationModal';
import TimePickerModal from '../../../components/common/TimePickerModal';
import TimelineItem from '../../../components/itinerary/TimelineItem';

const ItineraryCreationScreen = () => {
  const {
    days,
    selectedDayIndex,
    tripName,
    isEditingTripName,
    isTimePickerVisible,
    editingTime,
    timelineScrollRef,
    selectedDay,
    route,
    navigation,
    setTripName,
    setIsEditingTripName,
    setSelectedDayIndex,
    setTimePickerVisible,
    setEditingTime,
    formatDate,
    timeToDate,
    dateToTime,
    timeToMinutes,
    handleEditTime,
    handleUpdatePlaceTimes,
    handleDeletePlace,
    handleAddPlace,
  } = useItineraryCreationScreen();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={tripName}
        showBack
        rightComponent={
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ItineraryCompletion', {
                tripName,
                startDate: route.params.startDate,
                endDate: route.params.endDate,
              })
            }
          >
            <Text style={styles.completeButtonText}>완료</Text>
          </TouchableOpacity>
        }
        onTitlePress={() => setIsEditingTripName(true)}
      />

      {/* Trip Name Edit Modal/Input Overlay could be implemented here if needed, 
          but for now we are using the Header title press or just inline editing if we change the Header component.
          The original code had a TextInput replacing the title in the header or similar. 
          Let's assume Header handles it or we add a modal. 
          For this refactor, I'll stick to the structure. 
          If the original code had inline editing in the header, we might need to adjust Header component or pass a custom title component.
      */}
      {isEditingTripName && (
        <View style={styles.tripNameEditContainer}>
          <TextInput
            style={styles.tripNameInput}
            value={tripName}
            onChangeText={setTripName}
            onBlur={() => setIsEditingTripName(false)}
            autoFocus
          />
        </View>
      )}

      <View style={styles.daysContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScrollContent}
        >
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDayIndex === index && styles.selectedDayButton,
              ]}
              onPress={() => setSelectedDayIndex(index)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDayIndex === index && styles.selectedDayButtonText,
                ]}
              >
                Day {day.dayNumber}
              </Text>
              <Text
                style={[
                  styles.dayDateText,
                  selectedDayIndex === index && styles.selectedDayDateText,
                ]}
              >
                {formatDate(day.date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.timelineContainer}>
          <ScrollView
            ref={timelineScrollRef}
            contentContainerStyle={styles.timelineContent}
            showsVerticalScrollIndicator={false}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={styles.timeSlot}>
                <Text style={styles.timeText}>
                  {i.toString().padStart(2, '0')}:00
                </Text>
                <View style={styles.timeLine} />
              </View>
            ))}

            {selectedDay?.places.map(place => (
              <TimelineItem
                key={place.id}
                place={place}
                onEditTime={handleEditTime}
                onUpdateTimes={handleUpdatePlaceTimes}
                onDelete={handleDeletePlace}
                minuteHeight={MINUTE_HEIGHT}
                timeToMinutes={timeToMinutes}
              />
            ))}
          </ScrollView>
        </View>

        <SearchLocationModal onSelectLocation={handleAddPlace} />
      </View>

      <TimePickerModal
        visible={isTimePickerVisible}
        onClose={() => {
          setTimePickerVisible(false);
          setEditingTime(null);
        }}
        date={editingTime ? timeToDate(editingTime.time) : new Date()}
        onConfirm={date => {
          if (editingTime) {
            const newTime = dateToTime(date);
            const place = selectedDay?.places.find(
              p => p.id === editingTime.placeId,
            );
            if (place) {
              let newStart =
                editingTime.type === 'startTime'
                  ? timeToMinutes(newTime)
                  : timeToMinutes(place.startTime);
              let newEnd =
                editingTime.type === 'endTime'
                  ? timeToMinutes(newTime)
                  : timeToMinutes(place.endTime);

              if (newStart >= newEnd) {
                if (editingTime.type === 'startTime') {
                  newEnd = newStart + 60; // Default 1 hour duration
                } else {
                  newStart = newEnd - 60;
                }
              }
              handleUpdatePlaceTimes(editingTime.placeId, newStart, newEnd);
            }
          }
          setTimePickerVisible(false);
          setEditingTime(null);
        }}
      />
    </SafeAreaView>
  );
};

export default ItineraryCreationScreen;
