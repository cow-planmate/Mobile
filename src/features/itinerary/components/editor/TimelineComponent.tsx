import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Place } from '../TimelineItem';
import { Day } from '../../contexts/ItineraryContext';
import {
  styles,
  MINUTE_HEIGHT,
  GRID_TOP_OFFSET,
} from '../../screens/ItineraryEditorScreen.styles';
import {
  timeToMinutes,
  minutesToTime,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
} from '../../../../utils/timeUtils';
import {
  useCoachmarkTarget,
  useCoachmarkTour,
} from '../../coachmark/CoachmarkContext';
import TimeGridBackground from './TimeGridBackground';
import DraggableTimelineItem from './DraggableTimelineItem';
import AnimatedPlacementPreview from './AnimatedPlacementPreview';
import DemoTimelineBlock from './DemoTimelineBlock';

const TimelineComponent = React.memo(
  React.forwardRef<
    ScrollView,
    {
      selectedDay: Day;
      onDeletePlace: (placeId: string) => void;
      onEditPlaceTime: (
        placeId: string,
        type: 'startTime' | 'endTime',
        time: string,
      ) => void;
      onUpdatePlaceTimes: (
        placeId: string,
        newStartMinutes: number,
        newEndMinutes: number,
      ) => void;
      onPressPlace?: (place: Place) => void;
      /** 블록의 ⓘ를 눌렀을 때. 시간표를 그리는 쪽은 열쇠만 넘긴다. */
      onShowBlockDetail?: (place: Place) => void;
      topPadding?: number;
      /** 시트에 가려지는 만큼. 마지막 시간대도 시트 위로 올려 볼 수 있게. */
      bottomPadding?: number;
      pendingPlace?: Omit<Place, 'startTime' | 'endTime'> | null;
      previewStartTime?: string | null;
      previewEndTime?: string | null;
      setPreviewStartTime?: (time: string | null) => void;
      setPreviewEndTime?: (time: string | null) => void;
      onConfirmPlacement?: () => void;
      onCancelPreview?: () => void;
      /** 눈금판 자체의 화면 좌표를 재기 위한 ref. 여백·스크롤을 추측하지 않는다 */
      gridRef?: React.RefObject<View | null>;
      /**
       * 지금 얼마나 굴러가 있는지. 장소를 끌 때 가장자리에서 저절로 굴리려면
       * 바깥에서 지금 자리를 알아야 다음 자리를 시킬 수 있다.
       */
      onScrollY?: (offsetY: number) => void;
      /** 블록을 끌 때도 가장자리에서 저절로 굴린다. 시간표와 같은 자를 쓴다. */
      requestAutoScroll?: (pointY: number) => number;
      getScrollY?: () => number;
      /** 끌어놓는 중이면 확인·취소 버튼 없이 점선만 그린다 */
      isDragging?: boolean;
      /** 비켜설 빈자리조차 없을 때 */
      dropBlocked?: boolean;
      onItemDragStart?: () => void;
      onItemDragEnd?: () => void;
    }
  >(
    (
      {
        selectedDay,
        onDeletePlace,
        onEditPlaceTime,
        onUpdatePlaceTimes,
        onPressPlace,
        onShowBlockDetail,
        topPadding = 0,
        bottomPadding = 0,
        pendingPlace,
        previewStartTime,
        previewEndTime,
        setPreviewStartTime,
        setPreviewEndTime,
        onConfirmPlacement,
        onCancelPreview,
        gridRef,
        onScrollY,
        requestAutoScroll,
        getScrollY,
        isDragging = false,
        dropBlocked = false,
        onItemDragStart,
        onItemDragEnd,
      },
      ref,
    ) => {
      const bannerOpacity = useSharedValue(0);
      const bannerTranslateY = useSharedValue(20);
      const bannerAnimStyle = useAnimatedStyle(() => ({
        opacity: bannerOpacity.value,
        transform: [{ translateY: bannerTranslateY.value }],
      }));

      const showOverflowBanner = useCallback(() => {
        bannerOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 1800 }),
          withTiming(0, { duration: 400 }),
        );
        bannerTranslateY.value = withSequence(
          withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 1800 }),
          withTiming(20, { duration: 400 }),
        );
      }, [bannerOpacity, bannerTranslateY]);

      const {
        gridHours,
        offsetMinutes,
        maxEndMinutes,
        minStartMinutes,
        endHour,
      } = React.useMemo(() => {
        const startTimeStr = selectedDay?.startTime || DEFAULT_DAY_START;
        const endTimeStr = selectedDay?.endTime || DEFAULT_DAY_END;
        const startMin = timeToMinutes(startTimeStr);
        const minHour = Math.floor(startMin / 60);
        const endMin = timeToMinutes(endTimeStr);
        const maxHour = Math.ceil(endMin / 60);

        const hours = Array.from(
          { length: maxHour - minHour + 1 },
          (_, i) => i + minHour,
        );
        const offset = minHour * 60;
        return {
          gridHours: hours,
          offsetMinutes: offset,
          maxEndMinutes: endMin,

          minStartMinutes: startMin,
          endHour: maxHour,
        };
      }, [selectedDay?.startTime, selectedDay?.endTime]);

      const timelineTarget = useCoachmarkTarget('timeline');

      const tour = useCoachmarkTour();
      const isTourRunning = !!tour?.isRunning;
      const activeTarget = tour?.activeTarget ?? null;

      /**
       * 시간표가 빈 채로 안내를 열면 짚을 블록이 없다. 눈에만 있는 예시 블록을
       * 하나 놓아 시간 조절과 수정·삭제를 그 위에서 보여 준다.
       *
       * 안내가 열려 있는 동안 내내 달려 있다 - 순서를 정할 때 잴 수 있어야
       * 그 두 단계가 목록에 남는다. 다만 제 차례가 오기 전에는 보이지 않는다.
       * 담지도 않은 장소가 이미 놓인 것처럼 보이면 안내가 거짓말이 된다.
       */
      const hasPlaces = !!selectedDay?.places?.length;
      const showDemoBlock = isTourRunning && !hasPlaces;
      const isDemoBlockVisible =
        activeTarget === 'timelineBlock' || activeTarget === 'blockActions';

      /**
       * 예시 블록을 놓을 시각. 안내를 열 때 지금 보고 있는 자리에서 정한다.
       *
       * 하루 시작에 못 박아 두면 시간표를 내려 둔 채로 안내를 열었을 때 화면
       * 밖에 놓인다. 그러면 잴 수 없어 시간 조절·수정 단계가 목록에서 통째로
       * 빠졌다 - 실제로 '5 / 10'이 되어 그 둘을 건너뛰었다.
       *
       * 안내 중에는 시간표를 굴릴 수 없으니 열 때 한 번만 정하면 된다.
       */
      const demoStartRef = useRef<number | null>(null);
      if (!showDemoBlock) {
        demoStartRef.current = null;
      } else if (demoStartRef.current === null) {
        const scrolled =
          offsetMinutes +
          ((getScrollY?.() ?? 0) - GRID_TOP_OFFSET) / MINUTE_HEIGHT;
        // 눈금에 맞춰 올림한다 - 내림하면 날씨 카드 뒤로 반쯤 숨는다.
        const snapped = Math.ceil(scrolled / 15) * 15;
        demoStartRef.current = Math.max(
          minStartMinutes,
          Math.min(snapped, maxEndMinutes - 60),
        );
      }
      const demoStartMinutes = demoStartRef.current;

      const demoPlace = React.useMemo<Place>(
        () => ({
          id: 'coachmark-demo',
          name: '예시 장소',
          type: '관광지',
          categoryId: 0,
          startTime: minutesToTime(demoStartMinutes ?? minStartMinutes),
          endTime: minutesToTime((demoStartMinutes ?? minStartMinutes) + 60),
          address: '',
          imageUrl: '',
          latitude: 0,
          longitude: 0,
        }),
        [demoStartMinutes, minStartMinutes],
      );

      const [draggingPlaceId, setDraggingPlaceId] = useState<string | null>(
        null,
      );
      const isItemDragging = draggingPlaceId !== null;
      const handleItemDragStart = useCallback(
        (placeId?: string) => {
          setDraggingPlaceId(placeId || 'active');
          onItemDragStart?.();
        },
        [onItemDragStart],
      );
      const handleItemDragEnd = useCallback(() => {
        setDraggingPlaceId(null);
        onItemDragEnd?.();
      }, [onItemDragEnd]);

      return (
        <View style={styles.tabContentContainer}>
          {/* 안내가 '여기에 놓으라'고 밝힐 자리. 날씨 카드가 떠 있는 만큼은
              빼고 잡는다 - 장소를 놓을 수 있는 곳이 아니라 밝혀 봐야 헷갈린다. */}
          <View
            ref={timelineTarget}
            pointerEvents="none"
            style={[styles.timelineDropArea, { top: topPadding }]}
          />
          <ScrollView
            ref={ref}
            scrollEnabled={!isItemDragging && !isDragging}
            onScroll={e => onScrollY?.(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            contentContainerStyle={[
              styles.timelineContentContainer,
              { paddingTop: topPadding, paddingBottom: bottomPadding },
            ]}
          >
            <Pressable
              onPress={evt => {
                if (!pendingPlace || !setPreviewStartTime || !setPreviewEndTime)
                  return;
                const clickY = evt.nativeEvent.locationY;
                const minutes =
                  (clickY - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
                const snappedMinutes = Math.floor(minutes / 15) * 15;
                const clampedMinutes = Math.max(
                  minStartMinutes,
                  Math.min(snappedMinutes, maxEndMinutes - 60),
                );

                const startTimeStr = minutesToTime(clampedMinutes);
                const endTimeStr = minutesToTime(clampedMinutes + 60);

                setPreviewStartTime(startTimeStr);
                setPreviewEndTime(endTimeStr);
              }}
            >
              <View
                ref={gridRef}
                style={styles.timelineWrapper}
                pointerEvents="box-none"
              >
                <TimeGridBackground hours={gridHours} endHour={endHour} />
                {showDemoBlock && (
                  <DemoTimelineBlock
                    place={demoPlace}
                    offsetMinutes={offsetMinutes}
                    visible={isDemoBlockVisible}
                    onEditTime={type =>
                      onEditPlaceTime(demoPlace.id, type, demoPlace[type])
                    }
                    onEditPlace={
                      onPressPlace ? () => onPressPlace(demoPlace) : undefined
                    }
                    onShowDetail={
                      onShowBlockDetail
                        ? () => onShowBlockDetail(demoPlace)
                        : undefined
                    }
                  />
                )}
                {selectedDay?.places.map((place, placeIndex) => (
                  <DraggableTimelineItem
                    key={place.id}
                    place={place}
                    isTourAnchor={placeIndex === 0}
                    isTourRunning={isTourRunning}
                    offsetMinutes={offsetMinutes}
                    maxEndMinutes={maxEndMinutes}
                    minStartMinutes={minStartMinutes}
                    onDelete={onDeletePlace}
                    onEditTime={onEditPlaceTime}
                    onEditPlace={onPressPlace}
                    onDragEnd={onUpdatePlaceTimes}
                    onPress={onPressPlace}
                    onShowDetail={onShowBlockDetail}
                    onOverflow={showOverflowBanner}
                    scrollRef={ref as React.RefObject<ScrollView | null>}
                    requestAutoScroll={requestAutoScroll}
                    getScrollY={getScrollY}
                    onItemDragStart={handleItemDragStart}
                    onItemDragEnd={handleItemDragEnd}
                    disabled={
                      isDragging ||
                      (isItemDragging && draggingPlaceId !== place.id)
                    }
                  />
                ))}

                <AnimatedPlacementPreview
                  pendingPlace={pendingPlace}
                  previewStartTime={previewStartTime}
                  previewEndTime={previewEndTime}
                  offsetMinutes={offsetMinutes}
                  isDragging={isDragging}
                  dropBlocked={dropBlocked}
                  onCancel={onCancelPreview}
                  onConfirm={onConfirmPlacement}
                />
              </View>
            </Pressable>
          </ScrollView>

          <Animated.View style={[styles.overflowBanner, bannerAnimStyle]}>
            <Text style={styles.overflowBannerText}>
              설정된 타임라인 시간을 초과할 수 없어요
            </Text>
          </Animated.View>
        </View>
      );
    },
  ),
);

export default TimelineComponent;
