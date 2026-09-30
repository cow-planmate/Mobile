import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Place } from '../TimelineItem';
import {
  styles,
  COLORS,
  MINUTE_HEIGHT,
  MIN_ITEM_HEIGHT,
  GRID_TOP_OFFSET,
} from '../../screens/ItineraryEditorScreen.styles';
import { timeToMinutes } from '../../../../utils/timeUtils';
import CheckIcon from 'lucide-react-native/dist/esm/icons/check';
import XIcon from 'lucide-react-native/dist/esm/icons/x';
import { PREVIEW_SPRING_CONFIG } from './editorConstants';

interface AnimatedPlacementPreviewProps {
  pendingPlace?: Omit<Place, 'startTime' | 'endTime'> | null;
  previewStartTime?: string | null;
  previewEndTime?: string | null;
  offsetMinutes: number;
  isDragging?: boolean;
  dropBlocked?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const AnimatedPlacementPreview: React.FC<AnimatedPlacementPreviewProps> =
  React.memo(
    ({
      pendingPlace,
      previewStartTime,
      previewEndTime,
      offsetMinutes,
      isDragging = false,
      dropBlocked = false,
      onCancel,
      onConfirm,
    }) => {
      const startMin = previewStartTime
        ? timeToMinutes(previewStartTime)
        : null;
      const endMin = previewEndTime ? timeToMinutes(previewEndTime) : null;

      const targetTop = useMemo(() => {
        if (startMin === null) return null;
        return (startMin - offsetMinutes) * MINUTE_HEIGHT + GRID_TOP_OFFSET;
      }, [startMin, offsetMinutes]);

      const targetHeight = useMemo(() => {
        if (startMin === null || endMin === null) return MIN_ITEM_HEIGHT;
        return Math.max((endMin - startMin) * MINUTE_HEIGHT, MIN_ITEM_HEIGHT);
      }, [startMin, endMin]);

      const lastTopRef = useRef<number>(targetTop ?? GRID_TOP_OFFSET);
      if (targetTop !== null) {
        lastTopRef.current = targetTop;
      }
      const lastHeightRef = useRef<number>(targetHeight);
      if (startMin !== null && endMin !== null) {
        lastHeightRef.current = targetHeight;
      }

      const animTop = useSharedValue(targetTop ?? GRID_TOP_OFFSET);
      const animHeight = useSharedValue(targetHeight);
      const animOpacity = useSharedValue(0);
      const animScale = useSharedValue(0.96);
      const prevPlaceRef = useRef(pendingPlace);

      useEffect(() => {
        if (!pendingPlace) {
          animOpacity.value = withTiming(0, { duration: 120 });
          animScale.value = withTiming(0.96, { duration: 120 });
          return;
        }

        const isNewPlace = prevPlaceRef.current !== pendingPlace;
        prevPlaceRef.current = pendingPlace;

        if (targetTop !== null) {
          if (isNewPlace || animOpacity.value === 0) {
            animTop.value = targetTop;
            animHeight.value = targetHeight;
            animOpacity.value = withTiming(1, {
              duration: 160,
              easing: Easing.out(Easing.cubic),
            });
            animScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
          } else {
            animTop.value = withSpring(targetTop, PREVIEW_SPRING_CONFIG);
            animHeight.value = withSpring(targetHeight, PREVIEW_SPRING_CONFIG);
            animOpacity.value = withTiming(1, { duration: 120 });
            animScale.value = withSpring(1, PREVIEW_SPRING_CONFIG);
          }
        } else if (dropBlocked) {
          animTop.value = withSpring(lastTopRef.current, PREVIEW_SPRING_CONFIG);
          animHeight.value = withSpring(
            lastHeightRef.current,
            PREVIEW_SPRING_CONFIG,
          );
          animOpacity.value = withTiming(1, { duration: 150 });
          animScale.value = withSequence(
            withTiming(0.97, { duration: 80 }),
            withSpring(1, PREVIEW_SPRING_CONFIG),
          );
        } else {
          animOpacity.value = withTiming(0, { duration: 120 });
          animScale.value = withTiming(0.96, { duration: 120 });
        }
      }, [
        pendingPlace,
        targetTop,
        targetHeight,
        dropBlocked,
        animTop,
        animHeight,
        animOpacity,
        animScale,
      ]);

      const animatedStyle = useAnimatedStyle(() => ({
        top: animTop.value,
        height: animHeight.value,
        opacity: animOpacity.value,
        transform: [{ scale: animScale.value }],
      }));

      if (!pendingPlace) return null;
      if (targetTop === null && !dropBlocked) return null;

      if (dropBlocked) {
        return (
          <Animated.View
            style={[
              styles.previewBanner,
              styles.previewBannerBlocked,
              animatedStyle,
            ]}
            pointerEvents="none"
          >
            <Text style={styles.previewBannerBlockedText}>공간 부족</Text>
          </Animated.View>
        );
      }

      return (
        <Animated.View
          style={[
            styles.previewBanner,
            isDragging && styles.previewBannerDragging,
            animatedStyle,
          ]}
          pointerEvents={isDragging ? 'none' : 'box-none'}
        >
          <View style={styles.previewBannerInfo}>
            <Text style={styles.previewBannerName} numberOfLines={1}>
              {pendingPlace.name}
            </Text>
            <Text style={styles.previewBannerTime}>
              {previewStartTime} - {previewEndTime} ({pendingPlace.type})
            </Text>
          </View>
          {!isDragging && (
            <View style={styles.previewBannerActions}>
              <TouchableOpacity
                onPress={onCancel}
                style={[
                  styles.previewBannerActionButton,
                  styles.previewBannerCancelButton,
                ]}
                accessibilityRole="button"
                accessibilityLabel="장소 배치 취소"
                hitSlop={8}
              >
                <XIcon color={COLORS.white} size={14} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                style={[
                  styles.previewBannerActionButton,
                  styles.previewBannerConfirmButton,
                ]}
                accessibilityRole="button"
                accessibilityLabel="장소 배치 확정"
                hitSlop={8}
              >
                <CheckIcon color={COLORS.white} size={14} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      );
    },
  );
AnimatedPlacementPreview.displayName = 'AnimatedPlacementPreview';

export default AnimatedPlacementPreview;
