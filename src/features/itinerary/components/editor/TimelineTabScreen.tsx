import React, { useContext } from 'react';
import { View } from 'react-native';
import WeatherHeader from '../weather/WeatherHeader';
import { styles } from '../../screens/ItineraryEditorScreen.styles';
import { formatDateLocal } from '../../../../utils/timeUtils';
import TimelineComponent from './TimelineComponent';
import { EditorStateContext } from './EditorStateContext';

const TimelineTabScreen = React.memo(() => {
  const state = useContext(EditorStateContext);
  if (!state) return null;
  const {
    timelineScrollRef,
    selectedDay,
    handleDeletePlace,
    handleEditTime,
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
        <View pointerEvents="none" style={styles.timelineWeatherOverlay}>
          <WeatherHeader
            dayNumber={selectedDay.dayNumber}
            weather={currentWeather}
            appearance="overlay"
          />
        </View>
      )}
      <TimelineComponent
        ref={timelineScrollRef}
        selectedDay={selectedDay}
        onDeletePlace={handleDeletePlace}
        onEditPlaceTime={handleEditTime}
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
        topPadding={selectedDay && currentWeather ? 62 : 0}
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
    </View>
  );
});

export default TimelineTabScreen;
