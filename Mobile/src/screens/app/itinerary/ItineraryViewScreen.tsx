// src/screens/app/itinerary/ItineraryViewScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import TimelineItem from '../../../components/itinerary/TimelineItem';
import MapView, { Marker } from 'react-native-maps'; // 지도 import 추가

const COLORS = {
  primary: '#1344FF', // 기본 색상 #1344FF로 통일
  background: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
  lightGray: '#F5F5F7',
};

type Props = NativeStackScreenProps<AppStackParamList, 'ItineraryView'>;

export default function ItineraryViewScreen({ route, navigation }: Props) {
  const { days = [], tripName = '완성된 일정' } = route.params || {};
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      title: tripName,
      headerBackVisible: false,
    });
  }, [navigation, tripName]);

  const selectedDay = days[selectedDayIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* 지도 영역 추가 */}
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

      {/* 타임라인 영역 (flex: 1로 변경) */}
      <View style={{ flex: 1 }}>
        <View>
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
                  Day {day.dayNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedDay && (
          <FlatList
            data={selectedDay.places}
            renderItem={({ item }) => (
              <TimelineItem
                item={item}
                onDelete={() => {}}
                onEditTime={() => {}}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.timelineContainer}
            ListHeaderComponent={
              <Text style={styles.timelineDateText}>
                {selectedDay.date.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </Text>
            }
          />
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.footerButton}
          onPress={() => alert('공유 기능')}
        >
          <Text style={styles.footerButtonText}>공유</Text>
        </Pressable>
        <Pressable
          style={styles.footerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.footerButtonText}>수정</Text>
        </Pressable>
        <Pressable
          style={[styles.footerButton, styles.confirmButton]}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.confirmButtonText}>확인</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // 지도 스타일 추가
  mapContainer: {
    height: '40%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  dayTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.lightGray,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
  },
  dayTabText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  dayTabTextSelected: {
    color: COLORS.white,
  },
  timelineContainer: {
    padding: 20,
  },
  timelineDateText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 5,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
  },
});
