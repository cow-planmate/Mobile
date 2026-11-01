import React, { useContext, useLayoutEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import WeatherHeader from '../weather/WeatherHeader';
import { styles } from '../../screens/ItineraryEditorScreen.styles';
import { formatDateLocal } from '../../../../utils/timeUtils';
import TimelineComponent from './TimelineComponent';
import { EditorStateContext } from './EditorStateContext';
import { WEATHER_BAND_HEIGHT } from './editorConstants';
import {
  DAY_SWITCH_DURATION,
  DAY_SWITCH_SHIFT,
  getDaySwitchDirection,
} from './daySwitch';

const TimelineTabScreen = React.memo(() => {
  const state = useContext(EditorStateContext);

  // 일차를 넘기면 시간표가 넘어간 방향에서 살짝 밀려 들어오며 나타난다.
  // 날씨 띠는 같이 밀리면 가장자리가 흔들려 보여 나타나기만 한다.
  const dayNumber = state?.selectedDay?.dayNumber;
  const shownDay = useRef(dayNumber);
  const enter = useSharedValue(1);
  const direction = useSharedValue(0);
  useLayoutEffect(() => {
    const next = getDaySwitchDirection(shownDay.current, dayNumber);
    shownDay.current = dayNumber;
    if (next === 0) return;
    direction.value = next;
    enter.value = 0;
    enter.value = withTiming(1, {
      duration: DAY_SWITCH_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [dayNumber, direction, enter]);
  const motionStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateX: (1 - enter.value) * direction.value * DAY_SWITCH_SHIFT },
    ],
  }));
  const bandStyle = useAnimatedStyle(() => ({ opacity: enter.value }));

  if (!state) return null;
  const {
    timelineScrollRef,
    selectedDay,
    handleDeletePlace,
    handleUpdatePlaceTimes,
    onOpenDetail,
    onShowPlaceDetail,
    weatherMap,
    pendingPlace,
    previewStartTime,
    previewEndTime,
    setPreviewStartTime,
    setPreviewEndTime,
    onConfirmPlacement,
    onCancelPreview,
    isDragging,
    dropBlocked,
    gridRef,
    onTimelineScrollY,
    requestAutoScroll,
    getTimelineScrollY,
    sheetInset,
    onItemDragStart,
    onItemDragEnd,
  } = state;

  const localDateStr = selectedDay ? formatDateLocal(selectedDay.date) : '';
  const currentWeather = selectedDay ? weatherMap[localDateStr] : undefined;

  return (
    <View style={styles.timelineStage}>
      <View pointerEvents="none" style={styles.timelineSceneBackdrop} />
      {selectedDay && currentWeather && (
        <Animated.View
          pointerEvents="none"
          style={[styles.timelineWeatherOverlay, bandStyle]}
        >
          <WeatherHeader
            dayNumber={selectedDay.dayNumber}
            weather={currentWeather}
            appearance="band"
          />
        </Animated.View>
      )}
      <Animated.View style={[styles.timelineMotion, motionStyle]}>
        <TimelineComponent
          ref={timelineScrollRef}
          selectedDay={selectedDay}
          onDeletePlace={handleDeletePlace}
          onUpdatePlaceTimes={handleUpdatePlaceTimes}
          onPressPlace={onOpenDetail}
          onShowBlockDetail={
            onShowPlaceDetail
              ? place =>
                  onShowPlaceDetail({
                    contentId: place.placeRefId ? String(place.placeRefId) : '',
                    name: place.name,
                    address: place.address,
                  })
              : undefined
          }
          topPadding={selectedDay && currentWeather ? WEATHER_BAND_HEIGHT : 0}
          bottomPadding={sheetInset}
          pendingPlace={pendingPlace}
          previewStartTime={previewStartTime}
          previewEndTime={previewEndTime}
          setPreviewStartTime={setPreviewStartTime}
          setPreviewEndTime={setPreviewEndTime}
          onConfirmPlacement={onConfirmPlacement}
          onCancelPreview={onCancelPreview}
          isDragging={isDragging}
          dropBlocked={dropBlocked}
          gridRef={gridRef}
          onScrollY={onTimelineScrollY}
          requestAutoScroll={requestAutoScroll}
          getScrollY={getTimelineScrollY}
          onItemDragStart={onItemDragStart}
          onItemDragEnd={onItemDragEnd}
        />
      </Animated.View>
    </View>
  );
});

export default TimelineTabScreen;
