import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RouteIcon from 'lucide-react-native/dist/esm/icons/route';
import Wand2 from 'lucide-react-native/dist/esm/icons/wand-sparkles';
import KakaoMapView, { MapPlace, MapTransitLane } from './KakaoMapView';
import RouteSegmentSheet from './RouteSegmentSheet';
import {
  pointsKey,
  useDirections,
  useSegmentInfo,
  useTransitLane,
} from '../hooks/useRouteQueries';
import { fetchRouteTrip, isRouteFallback, RoutePoint } from '../../../api/route';
import { laneColor } from '../constants/transit';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import {
  buildOptimizedOrder,
  hasMapPosition,
  isSameOrder,
} from '../../../utils/routeOptimization';
import { useAlert } from '../../../contexts/AlertContext';

interface RouteMapSectionProps {

  places: MapPlace[];

  onApplyOptimizedOrder?: (orderedPlaceIds: string[]) => void;
  style?: object;
}

export default function RouteMapSection({
  places,
  onApplyOptimizedOrder,
  style,
}: RouteMapSectionProps) {
  const { showAlert } = useAlert();
  const [isOptimizing, setOptimizing] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const validPlaces = useMemo(() => places.filter(hasMapPosition), [places]);

  const points: RoutePoint[] = useMemo(
    () =>
      validPlaces.map(place => {
        const placeId = place.placeRefId?.trim();

        return {
          lat: place.latitude,
          lng: place.longitude,
          ...(placeId && !placeId.startsWith('custom_') ? { placeId } : {}),
        };
      }),
    [validPlaces],
  );
  const key = pointsKey(points);

  const [isSheetVisible, setSheetVisible] = useState(false);

  const [isSegmentEnabled, setSegmentEnabled] = useState(false);
  const [activeLane, setActiveLane] = useState<{
    key: string;
    mapObj: string;
  } | null>(null);

  useEffect(() => {
    setActiveLane(null);
  }, [key]);

  const directionsQuery = useDirections(points);
  const segmentQuery = useSegmentInfo(points, isSegmentEnabled);
  const laneQuery = useTransitLane(activeLane?.mapObj ?? null);

  const routePath = useMemo(() => {
    if (isRouteFallback(directionsQuery.data)) {
      return undefined;
    }
    return directionsQuery.data?.path;
  }, [directionsQuery.data]);

  const transitLanes: MapTransitLane[] = useMemo(() => {
    const lanes = laneQuery.data?.lanes ?? [];
    return lanes.map(lane => ({
      color: laneColor(lane.trafficClass, lane.type),
      path: lane.path ?? [],
    }));
  }, [laneQuery.data]);

  const handleOpenSheet = useCallback(() => {
    setSegmentEnabled(true);
    setSheetVisible(true);
  }, []);

  const handleToggleLane = useCallback((mapObj: string, laneKey: string) => {
    setActiveLane(prev => (prev?.key === laneKey ? null : { key: laneKey, mapObj }));
  }, []);

  const placeNames = useMemo(
    () => validPlaces.map(p => p.name),
    [validPlaces],
  );

  const handleOptimizeOrder = useCallback(async () => {
    if (!onApplyOptimizedOrder || points.length < 3 || isOptimizing) {
      return;
    }
    setOptimizing(true);
    try {
      const result = await fetchRouteTrip(points);
      if (!isMountedRef.current) return;

      const orderedIds = buildOptimizedOrder(places, result?.visitOrder);

      if (!orderedIds) {
        showAlert({
          title: '순서 최적화 실패',
          message: '경로를 계산하지 못했어요. 잠시 후 다시 시도해 주세요.',
          type: 'error',
        });
        return;
      }

      if (isSameOrder(places, orderedIds)) {
        showAlert({
          title: '이미 최적 순서예요',
          message: '지금 순서가 가장 짧은 동선이에요.',
          type: 'info',
        });
        return;
      }

      onApplyOptimizedOrder(orderedIds);
    } catch (e) {
      if (!isMountedRef.current) return;
      console.warn('순서 최적화 실패:', e);
      showAlert({
        title: '순서 최적화 실패',
        message: '경로를 계산하지 못했어요. 잠시 후 다시 시도해 주세요.',
        type: 'error',
      });
    } finally {
      if (isMountedRef.current) setOptimizing(false);
    }
  }, [onApplyOptimizedOrder, places, points, isOptimizing, showAlert]);

  return (
    <View style={[sectionStyles.container, style]}>
      <KakaoMapView
        places={places}
        routePath={routePath}
        transitLanes={transitLanes}
      />

      {points.length >= 2 && (
        <TouchableOpacity
          style={sectionStyles.segmentButton}
          onPress={handleOpenSheet}
          activeOpacity={0.85}
        >
          <RouteIcon size={normalize(13)} color={tokens.colors.primary} />
          <Text style={sectionStyles.segmentButtonText}>구간 정보</Text>
        </TouchableOpacity>
      )}

      {onApplyOptimizedOrder && points.length >= 3 && (
        <TouchableOpacity
          style={sectionStyles.optimizeButton}
          onPress={handleOptimizeOrder}
          disabled={isOptimizing}
          activeOpacity={0.85}
          accessibilityState={{ disabled: isOptimizing }}
        >
          <Wand2 size={normalize(13)} color={tokens.colors.primary} />
          <Text style={sectionStyles.segmentButtonText}>
            {isOptimizing ? '계산 중…' : '순서 최적화'}
          </Text>
        </TouchableOpacity>
      )}

      <RouteSegmentSheet
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        placeNames={placeNames}
        data={segmentQuery.data}
        isLoading={segmentQuery.isFetching}
        isError={segmentQuery.isError}
        activeLaneKey={activeLane?.key ?? null}
        onToggleLane={handleToggleLane}
      />
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentButton: {
    position: 'absolute',
    top: normalize(12),
    left: normalize(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(7),
    borderRadius: tokens.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optimizeButton: {
    position: 'absolute',
    top: normalize(12),
    right: normalize(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(7),
    borderRadius: tokens.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentButtonText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textLabel,
  },
});
