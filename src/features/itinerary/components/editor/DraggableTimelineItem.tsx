import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import TimelineItem, { Place } from '../TimelineItem';
import {
  styles,
  COLORS,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_SNAP_HEIGHT,
  GRID_TOP_OFFSET,
  TIMELINE_BLOCK_LEFT,
  TIMELINE_BLOCK_RIGHT,
  TIMELINE_BLOCK_RADIUS,
} from '../../screens/ItineraryEditorScreen.styles';
import { timeToMinutes } from '../../../../utils/timeUtils';
import { useCoachmarkTarget } from '../../coachmark/CoachmarkContext';
import {
  PREVIEW_OUTSET,
  PREVIEW_SPRING_CONFIG,
  AUTO_SCROLL_TICK_MS,
} from './editorConstants';

const DraggableTimelineItem = React.memo(
  ({
    place,
    offsetMinutes,
    maxEndMinutes,
    minStartMinutes,
    onDelete,
    onEditTime,
    onEditPlace,
    onDragEnd,
    onPress,
    onShowDetail,
    onOverflow,
    scrollRef: _scrollRef,
    requestAutoScroll,
    getScrollY,
    onItemDragStart,
    onItemDragEnd,
    disabled = false,
    isTourAnchor = false,
    isTourRunning = false,
  }: {
    place: Place;
    offsetMinutes: number;
    maxEndMinutes: number;
    minStartMinutes: number;
    onDelete: (placeId: string) => void;
    onEditTime?: (
      placeId: string,
      type: 'startTime' | 'endTime',
      time: string,
    ) => void;
    onEditPlace?: (place: Place) => void;
    onDragEnd: (
      placeId: string,
      newStartMinutes: number,
      newEndMinutes: number,
    ) => void;
    onPress?: (place: Place) => void;
    /** 블록의 ⓘ. 열쇠를 모르는 장소에는 주지 않아 단추가 서지 않는다. */
    onShowDetail?: (place: Place) => void;
    onOverflow?: () => void;
    scrollRef?: React.RefObject<ScrollView | null>;
    /** 손끝 자리를 주면 가장자리에서 시간표를 굴려 주고, 시킨 거리를 돌려준다. */
    requestAutoScroll?: (pointY: number) => number;
    /** 지금 얼마나 굴러가 있는지. 실제로 움직인 만큼만 블록에 반영한다. */
    getScrollY?: () => number;
    onItemDragStart?: (placeId: string) => void;
    onItemDragEnd?: () => void;
    disabled?: boolean;
    /** 첫 진입 안내는 그날 첫 블록 하나만 짚는다. */
    isTourAnchor?: boolean;
    isTourRunning?: boolean;
  }) => {
    const blockTarget = useCoachmarkTarget('timelineBlock', isTourAnchor);
    const MIN_TOP_PX =
      GRID_TOP_OFFSET + (minStartMinutes - offsetMinutes) * MINUTE_HEIGHT;
    const MAX_BOTTOM_PX =
      GRID_TOP_OFFSET + (maxEndMinutes - offsetMinutes) * MINUTE_HEIGHT;

    const startMinutes = timeToMinutes(place.startTime);
    const endMinutes = timeToMinutes(place.endTime);
    const durationMinutes = endMinutes - startMinutes;

    const initialTop =
      (startMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
    const calculatedHeight = durationMinutes * MINUTE_HEIGHT;
    const initialHeight = Math.max(calculatedHeight, MIN_ITEM_HEIGHT);

    const top = useSharedValue(initialTop);
    const height = useSharedValue(initialHeight);
    const previewHeight = useSharedValue(initialHeight);

    React.useEffect(() => {
      const newStartMinutes = timeToMinutes(place.startTime);
      const newEndMinutes = timeToMinutes(place.endTime);
      const newDurationMinutes = newEndMinutes - newStartMinutes;

      const newTop =
        (newStartMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
      const newCalculatedHeight = newDurationMinutes * MINUTE_HEIGHT;
      const newHeight = Math.max(newCalculatedHeight, MIN_ITEM_HEIGHT);

      if (top.value !== newTop) {
        top.value = withSpring(newTop);
      }
      if (height.value !== newHeight) {
        height.value = withSpring(newHeight);
      }
      previewHeight.value = newHeight;
    }, [
      place.startTime,
      place.endTime,
      offsetMinutes,
      top,
      height,
      previewHeight,
    ]);

    const startY = useSharedValue(0);
    const startHeight = useSharedValue(0);
    const isResizingTop = useSharedValue(0);
    const isResizingBottom = useSharedValue(0);
    const isDragging = useSharedValue(0);
    const previewTop = useSharedValue(initialTop);
    const indicatorOpacity = useSharedValue(0);
    const indicatorScale = useSharedValue(0.97);

    const exitOpacity = useSharedValue(1);
    const exitScale = useSharedValue(1);
    const exitTranslateY = useSharedValue(0);

    const dragOpacity = useSharedValue(1);
    const dragScale = useSharedValue(1);

    const placeId = place.id;

    // ── 끌고 있는 블록이 가장자리에 닿으면 시간표를 굴린다 ──
    /** 끌고 있는 손끝의 화면 좌표. 워클릿에서 건너온다. */
    const dragPointY = useRef(0);
    const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    /** 지난 번에 본 스크롤 자리. 실제로 움직인 만큼만 블록에 얹는다. */
    const seenScrollY = useRef(0);

    const stopBlockAutoScroll = useCallback(() => {
      if (autoScrollTimer.current === null) return;
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }, []);

    /**
     * 굴러간 만큼 블록도 같이 내려 준다.
     *
     * 블록의 자리는 눈금판 안에서의 거리이고, 굴리면 눈금판이 화면에서 밀린다.
     * 그대로 두면 손가락은 가만히 있는데 블록만 위로 빠져나간다. 끌기 시작한
     * 자리(startY)도 같이 밀어야 다음에 손이 움직일 때 되돌아가지 않는다.
     */
    const shiftByScroll = useCallback(
      (moved: number) => {
        if (!moved) return;
        const maxTop = MAX_BOTTOM_PX - height.value;
        const next = Math.max(MIN_TOP_PX, Math.min(top.value + moved, maxTop));
        const applied = next - top.value;
        if (!applied) return;
        top.value = next;
        startY.value += applied;
        previewTop.value =
          Math.round((next - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
            GRID_SNAP_HEIGHT +
          GRID_TOP_OFFSET;
      },
      [MAX_BOTTOM_PX, MIN_TOP_PX, height, top, startY, previewTop],
    );

    const onDragPointMove = useCallback(
      (pointY: number) => {
        dragPointY.current = pointY;
        if (!requestAutoScroll || !getScrollY) return;
        if (autoScrollTimer.current !== null) return;

        seenScrollY.current = getScrollY();
        autoScrollTimer.current = setInterval(() => {
          const now = getScrollY();
          shiftByScroll(now - seenScrollY.current);
          seenScrollY.current = now;
          if (requestAutoScroll(dragPointY.current) === 0)
            stopBlockAutoScroll();
        }, AUTO_SCROLL_TICK_MS);
      },
      [requestAutoScroll, getScrollY, shiftByScroll, stopBlockAutoScroll],
    );

    useEffect(() => stopBlockAutoScroll, [stopBlockAutoScroll]);
    const isDeletingRef = useRef(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteWithAnim = React.useCallback(() => {
      if (isDeletingRef.current) return;
      isDeletingRef.current = true;
      setIsDeleting(true);

      exitScale.value = withTiming(0.88, {
        duration: 220,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
      exitTranslateY.value = withTiming(8, {
        duration: 220,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
      exitOpacity.value = withTiming(
        0,
        { duration: 200, easing: Easing.out(Easing.cubic) },
        () => {
          runOnJS(onDelete)(placeId);
        },
      );
    }, [onDelete, placeId, exitOpacity, exitScale, exitTranslateY]);

    const handleEditTime = React.useCallback(
      (type: 'startTime' | 'endTime') => {
        if (isDeletingRef.current) return;
        onEditTime?.(
          placeId,
          type,
          type === 'startTime' ? place.startTime : place.endTime,
        );
      },
      [onEditTime, placeId, place.startTime, place.endTime],
    );

    const handleEditPlace = React.useCallback(() => {
      if (isDeletingRef.current) return;
      onEditPlace ? onEditPlace(place) : onPress?.(place);
    }, [onEditPlace, onPress, place]);

    const panGestureMove = Gesture.Pan()
      .enabled(!disabled)
      .activateAfterLongPress(200)
      .onBegin(() => {
        if (isDeletingRef.current) return;
        startY.value = top.value;
        previewTop.value = top.value;
        previewHeight.value = height.value;
      })
      .onStart(() => {
        isDragging.value = 1;
        // 집어도 크기는 그대로 둔다. 블록의 높이가 곧 머무는 시간이라,
        // 줄이거나 키우면 손에 든 것과 놓일 자리의 크기가 어긋난다.
        // 들린 것은 그림자로 알리고, 뒤에 깔린 놓일 자리가 비쳐 보이게
        // 살짝만 투명하게 둔다.
        dragOpacity.value = withSpring(0.88, PREVIEW_SPRING_CONFIG);
        indicatorOpacity.value = withTiming(1, { duration: 150 });
        indicatorScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
        if (onItemDragStart) runOnJS(onItemDragStart)(placeId);
      })
      .onUpdate(event => {
        runOnJS(onDragPointMove)(event.absoluteY);
        const newTop = startY.value + event.translationY;
        const maxTop = MAX_BOTTOM_PX - height.value;
        const clampedTop = Math.max(MIN_TOP_PX, Math.min(newTop, maxTop));
        top.value = clampedTop;

        previewTop.value =
          Math.round((clampedTop - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
            GRID_SNAP_HEIGHT +
          GRID_TOP_OFFSET;
        previewHeight.value = height.value;
      })
      .onEnd(() => {
        runOnJS(stopBlockAutoScroll)();
        isDragging.value = 0;
        dragOpacity.value = withSpring(1);
        dragScale.value = withSpring(1);
        const snappedTop =
          Math.round((top.value - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
            GRID_SNAP_HEIGHT +
          GRID_TOP_OFFSET;

        let newStartMinutes =
          (snappedTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
        let newEndMinutes = newStartMinutes + durationMinutes;

        if (newEndMinutes > maxEndMinutes) {
          newEndMinutes = maxEndMinutes;
          newStartMinutes = maxEndMinutes - durationMinutes;
          if (onOverflow) runOnJS(onOverflow)();
        }

        const finalTop =
          (newStartMinutes - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
        top.value = withSpring(finalTop);
        previewTop.value = finalTop;
        previewHeight.value = height.value;

        indicatorOpacity.value = withDelay(
          80,
          withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
        );
        indicatorScale.value = withDelay(
          80,
          withTiming(0.98, { duration: 220 }),
        );

        runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
        if (onItemDragEnd) runOnJS(onItemDragEnd)();
      })
      .onFinalize((_event, success) => {
        runOnJS(stopBlockAutoScroll)();
        if (!success) {
          isDragging.value = 0;
          dragOpacity.value = withSpring(1);
          dragScale.value = withSpring(1);
          indicatorOpacity.value = withTiming(0, { duration: 150 });
          indicatorScale.value = withTiming(0.97, { duration: 150 });
          if (onItemDragEnd) runOnJS(onItemDragEnd)();
        }
      });

    const panGestureResizeTop = Gesture.Pan()
      .enabled(!disabled)
      .minDistance(4)
      .onBegin(() => {
        if (isDeletingRef.current) return;
        startY.value = top.value;
        startHeight.value = height.value;
        previewTop.value = top.value;
        previewHeight.value = height.value;
      })
      .onStart(() => {
        isDragging.value = 1;
        dragOpacity.value = withSpring(0.82, PREVIEW_SPRING_CONFIG);
        dragScale.value = withSpring(0.96, PREVIEW_SPRING_CONFIG);
        isResizingTop.value = withSpring(1);
        indicatorOpacity.value = withTiming(1, { duration: 150 });
        indicatorScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
        if (onItemDragStart) runOnJS(onItemDragStart)(placeId);
      })
      .onUpdate(event => {
        const newTop = startY.value + event.translationY;
        const newHeight = startHeight.value - (newTop - startY.value);

        if (newHeight >= MIN_ITEM_HEIGHT && newTop >= MIN_TOP_PX) {
          top.value = newTop;
          height.value = newHeight;

          const snappedTop =
            Math.round((newTop - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
              GRID_SNAP_HEIGHT +
            GRID_TOP_OFFSET;
          const bottom = startY.value + startHeight.value;
          let finalTop = Math.max(MIN_TOP_PX, snappedTop);
          let finalHeight = bottom - finalTop;

          if (finalHeight < MIN_ITEM_HEIGHT) {
            finalHeight = MIN_ITEM_HEIGHT;
            finalTop = bottom - MIN_ITEM_HEIGHT;
          }

          previewTop.value = finalTop;
          previewHeight.value = finalHeight;
        }
      })
      .onEnd(() => {
        isDragging.value = 0;
        dragOpacity.value = withSpring(1);
        dragScale.value = withSpring(1);
        const snappedTop =
          Math.round((top.value - GRID_TOP_OFFSET) / GRID_SNAP_HEIGHT) *
            GRID_SNAP_HEIGHT +
          GRID_TOP_OFFSET;

        const bottom = startY.value + startHeight.value;
        let finalTop = Math.max(MIN_TOP_PX, snappedTop);
        let finalHeight =
          Math.round((bottom - finalTop) / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;

        if (finalHeight < MIN_ITEM_HEIGHT) {
          finalHeight = MIN_ITEM_HEIGHT;
          finalTop = Math.max(MIN_TOP_PX, bottom - MIN_ITEM_HEIGHT);
        }

        top.value = withSpring(finalTop);
        height.value = withSpring(finalHeight);
        previewTop.value = finalTop;
        previewHeight.value = finalHeight;

        indicatorOpacity.value = withDelay(
          80,
          withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
        );
        indicatorScale.value = withDelay(
          80,
          withTiming(0.98, { duration: 220 }),
        );

        const newStartMinutes =
          (finalTop - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
        const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

        runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
        if (onItemDragEnd) runOnJS(onItemDragEnd)();
      })
      .onFinalize((_event, success) => {
        isResizingTop.value = withSpring(0);
        if (!success) {
          isDragging.value = 0;
          dragOpacity.value = withSpring(1);
          dragScale.value = withSpring(1);
          indicatorOpacity.value = withTiming(0, { duration: 150 });
          if (onItemDragEnd) runOnJS(onItemDragEnd)();
        }
      });

    const panGestureResizeBottom = Gesture.Pan()
      .enabled(!disabled)
      .minDistance(4)
      .onBegin(() => {
        if (isDeletingRef.current) return;
        startHeight.value = height.value;
        previewTop.value = top.value;
        previewHeight.value = height.value;
      })
      .onStart(() => {
        isDragging.value = 1;
        dragOpacity.value = withSpring(0.82, PREVIEW_SPRING_CONFIG);
        dragScale.value = withSpring(0.96, PREVIEW_SPRING_CONFIG);
        isResizingBottom.value = withSpring(1);
        indicatorOpacity.value = withTiming(1, { duration: 150 });
        indicatorScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
        if (onItemDragStart) runOnJS(onItemDragStart)(placeId);
      })
      .onUpdate(event => {
        const newHeight = startHeight.value + event.translationY;
        const newBottom = top.value + newHeight;

        if (newHeight >= MIN_ITEM_HEIGHT && newBottom <= MAX_BOTTOM_PX) {
          height.value = newHeight;

          const snappedHeight =
            Math.round(newHeight / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
          let finalHeight = Math.max(snappedHeight, MIN_ITEM_HEIGHT);
          if (top.value + finalHeight > MAX_BOTTOM_PX) {
            finalHeight = MAX_BOTTOM_PX - top.value;
          }

          previewHeight.value = finalHeight;
        }
      })
      .onEnd(() => {
        isDragging.value = 0;
        dragOpacity.value = withSpring(1);
        dragScale.value = withSpring(1);
        const snappedHeight =
          Math.round(height.value / GRID_SNAP_HEIGHT) * GRID_SNAP_HEIGHT;
        let finalHeight = Math.max(snappedHeight, MIN_ITEM_HEIGHT);
        if (top.value + finalHeight > MAX_BOTTOM_PX) {
          finalHeight = Math.max(
            Math.floor((MAX_BOTTOM_PX - top.value) / GRID_SNAP_HEIGHT) *
              GRID_SNAP_HEIGHT,
            MIN_ITEM_HEIGHT,
          );
          if (onOverflow) runOnJS(onOverflow)();
        }

        height.value = withSpring(finalHeight);
        previewHeight.value = finalHeight;

        indicatorOpacity.value = withDelay(
          80,
          withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
        );
        indicatorScale.value = withDelay(
          80,
          withTiming(0.98, { duration: 220 }),
        );

        const newStartMinutes =
          (top.value - GRID_TOP_OFFSET) / MINUTE_HEIGHT + offsetMinutes;
        const newEndMinutes = newStartMinutes + finalHeight / MINUTE_HEIGHT;

        runOnJS(onDragEnd)(place.id, newStartMinutes, newEndMinutes);
        if (onItemDragEnd) runOnJS(onItemDragEnd)();
      })
      .onFinalize((_event, success) => {
        isResizingBottom.value = withSpring(0);
        if (!success) {
          isDragging.value = 0;
          dragOpacity.value = withSpring(1);
          dragScale.value = withSpring(1);
          indicatorOpacity.value = withTiming(0, { duration: 150 });
          if (onItemDragEnd) runOnJS(onItemDragEnd)();
        }
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: top.value,
        height: height.value,
        left: TIMELINE_BLOCK_LEFT,
        right: TIMELINE_BLOCK_RIGHT,
        opacity: exitOpacity.value * dragOpacity.value,
        transform: [
          { scale: exitScale.value * dragScale.value },
          { translateY: exitTranslateY.value },
        ],
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: isDragging.value === 1 ? 12 : 0 },
        shadowOpacity: isDragging.value === 1 ? 0.3 : 0,
        shadowRadius: isDragging.value === 1 ? 22 : 0,
        elevation: isDragging.value === 1 ? 14 : 0,
        zIndex: isDragging.value === 1 ? 100 : 1,
      };
    });

    /**
     * 놓일 자리는 블록보다 조금 크게 그린다.
     *
     * 블록이 제 크기 그대로 들리므로 딱 맞게 그리면 블록 밑에 완전히 가린다.
     * 사방으로 조금 넓혀 두면 점선 테두리가 블록 둘레로 드러나, 손에 든 것과
     * 놓일 자리가 같이 보인다.
     */
    const indicatorStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: withSpring(
          previewTop.value - PREVIEW_OUTSET,
          PREVIEW_SPRING_CONFIG,
        ),
        height: withSpring(
          previewHeight.value + PREVIEW_OUTSET * 2,
          PREVIEW_SPRING_CONFIG,
        ),
        left: TIMELINE_BLOCK_LEFT - PREVIEW_OUTSET,
        right: TIMELINE_BLOCK_RIGHT - PREVIEW_OUTSET,
        borderWidth: 2.5,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: TIMELINE_BLOCK_RADIUS + PREVIEW_OUTSET,
        backgroundColor: 'rgba(19, 68, 255, 0.14)',
        opacity: indicatorOpacity.value,
        transform: [{ scale: indicatorScale.value }],
        zIndex: -1,
      };
    });

    const topHandleStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scaleX: 1 + isResizingTop.value * 0.14 },
          { scaleY: 1 + isResizingTop.value * 0.14 },
        ],
      };
    });

    const bottomHandleStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scaleX: 1 + isResizingBottom.value * 0.14 },
          { scaleY: 1 + isResizingBottom.value * 0.14 },
        ],
      };
    });

    return (
      <>
        <Animated.View style={indicatorStyle} pointerEvents="none" />
        <Animated.View
          ref={blockTarget}
          style={animatedStyle}
          pointerEvents={isDeleting ? 'none' : 'auto'}
        >
          <GestureDetector gesture={panGestureMove}>
            <Animated.View style={styles.flex1}>
              <TimelineItem
                item={place}
                onDelete={handleDeleteWithAnim}
                onEditTime={handleEditTime}
                onEditPlace={handleEditPlace}
                onShowDetail={
                  onShowDetail ? () => onShowDetail(place) : undefined
                }
                style={styles.flex1}
                isTourAnchor={isTourAnchor}
                isTourRunning={isTourRunning}
              />
            </Animated.View>
          </GestureDetector>

          <GestureDetector gesture={panGestureResizeTop}>
            <Animated.View style={styles.resizeHandleTop}>
              <Animated.View
                style={[styles.resizeHandleIndicator, topHandleStyle]}
              />
            </Animated.View>
          </GestureDetector>

          <GestureDetector gesture={panGestureResizeBottom}>
            <Animated.View style={styles.resizeHandleBottom}>
              <Animated.View
                style={[styles.resizeHandleIndicator, bottomHandleStyle]}
              />
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </>
    );
  },
);
DraggableTimelineItem.displayName = 'DraggableTimelineItem';

export default DraggableTimelineItem;
