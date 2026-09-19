import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RouteIcon from 'lucide-react-native/dist/esm/icons/route';
import Wand2 from 'lucide-react-native/dist/esm/icons/wand-sparkles';
import ChevronUp from 'lucide-react-native/dist/esm/icons/chevron-up';
import LocateFixed from 'lucide-react-native/dist/esm/icons/locate-fixed';
import KakaoMapView, {
  KakaoMapViewHandle,
  MapPlace,
  MapTransitLane,
} from './KakaoMapView';
import RouteSegmentSheet from './RouteSegmentSheet';
import {
  pointsKey,
  useDirections,
  useSegmentInfo,
  useTransitLane,
} from '../hooks/useRouteQueries';
import {
  fetchRouteTrip,
  isRouteFallback,
  RoutePoint,
} from '../../../api/route';
import { laneColor } from '../constants/transit';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';
import { formatMinutes } from '../utils/formatDuration';
import {
  buildOptimizedOrder,
  hasMapPosition,
  isSameOrder,
} from '../../../utils/routeOptimization';
import { useAlert } from '../../../contexts/AlertContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RouteMapSectionProps {
  places: MapPlace[];

  onApplyOptimizedOrder?: (orderedPlaceIds: string[]) => void;
  style?: object;
  inlineSegments?: boolean;
  dayLabel?: string;
}

export default function RouteMapSection({
  places,
  onApplyOptimizedOrder,
  style,
  inlineSegments = false,
  dayLabel,
}: RouteMapSectionProps) {
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<KakaoMapViewHandle>(null);
  // 지도 조작 단추는 아래쪽 패널(펼침) 또는 요약 바(접힘) 바로 위에 뜬다.
  // 둘 다 높이가 상황에 따라 달라지므로 실제로 잡힌 높이를 받아서 쓴다.
  const [dockHeight, setDockHeight] = useState(0);
  const [isLocating, setLocating] = useState(false);
  const [isOptimizing, setOptimizing] = useState(false);
  const optimizeControllerRef = useRef<AbortController | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      optimizeControllerRef.current?.abort();
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

  const [isSheetVisible, setSheetVisible] = useState(inlineSegments);

  const [isSegmentEnabled, setSegmentEnabled] = useState(inlineSegments);
  const [activeLane, setActiveLane] = useState<{
    key: string;
    mapObj: string;
  } | null>(null);

  useEffect(() => {
    optimizeControllerRef.current?.abort();
    optimizeControllerRef.current = null;
    setOptimizing(false);
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
    setActiveLane(prev =>
      prev?.key === laneKey ? null : { key: laneKey, mapObj },
    );
  }, []);

  const placeNames = useMemo(() => validPlaces.map(p => p.name), [validPlaces]);
  const collapsedSummary = useMemo(() => {
    const parts = [`${Math.max(placeNames.length - 1, 0)}구간`];
    const first = segmentQuery.data?.transit?.[0];
    const best = first?.available ? first.routes?.[0] : null;
    const time = formatMinutes(best?.totalTime);
    if (time) {
      parts.push(`대중교통 ${time}`);
    }
    return parts.join(' · ');
  }, [placeNames.length, segmentQuery.data]);

  const handleLocateResult = useCallback(
    (ok: boolean) => {
      if (!isMountedRef.current) {
        return;
      }
      setLocating(false);
      if (!ok) {
        showAlert({
          title: '현재 위치를 가져오지 못했어요',
          message: '위치 권한을 확인해 주세요.',
          type: 'error',
        });
      }
    },
    [showAlert],
  );

  const handleLocate = useCallback(async () => {
    if (isLocating) {
      return;
    }
    setLocating(true);

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        handleLocateResult(false);
        return;
      }
    }

    mapRef.current?.moveToCurrentLocation();
  }, [isLocating, handleLocateResult]);

  const handleOptimizeOrder = useCallback(async () => {
    if (!onApplyOptimizedOrder || points.length < 3 || isOptimizing) {
      return;
    }
    const controller = new AbortController();
    optimizeControllerRef.current = controller;
    setOptimizing(true);
    try {
      const result = await fetchRouteTrip(
        points,
        'driving',
        false,
        controller.signal,
      );
      if (!isMountedRef.current || controller.signal.aborted) return;

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
      if (!isMountedRef.current || controller.signal.aborted) return;
      console.warn('순서 최적화 실패:', e);
      showAlert({
        title: '순서 최적화 실패',
        message: '경로를 계산하지 못했어요. 잠시 후 다시 시도해 주세요.',
        type: 'error',
      });
    } finally {
      if (optimizeControllerRef.current === controller) {
        optimizeControllerRef.current = null;
        if (isMountedRef.current) setOptimizing(false);
      }
    }
  }, [onApplyOptimizedOrder, places, points, isOptimizing, showAlert]);

  return (
    <View style={[sectionStyles.container, style]}>
      <View style={sectionStyles.mapStage}>
        <KakaoMapView
          ref={mapRef}
          onLocateResult={handleLocateResult}
          fitOnResize={inlineSegments}
          places={places}
          routePath={routePath}
          transitLanes={transitLanes}
          style={inlineSegments ? sectionStyles.edgeMap : undefined}
        />

        {!inlineSegments && points.length >= 2 && (
          <TouchableOpacity
            style={sectionStyles.segmentButton}
            onPress={handleOpenSheet}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="구간 정보 펼치기"
            accessibilityState={{ expanded: isSheetVisible }}
          >
            <RouteIcon size={normalize(16)} color={tokens.colors.primary} />
            <Text style={sectionStyles.segmentButtonText}>구간 정보</Text>
          </TouchableOpacity>
        )}

        {inlineSegments && (
          <View
            style={[
              sectionStyles.mapControls,
              { bottom: dockHeight + normalize(16) },
            ]}
          >
            {onApplyOptimizedOrder && points.length >= 3 && (
              <TouchableOpacity
                style={sectionStyles.mapControl}
                onPress={handleOptimizeOrder}
                disabled={isOptimizing}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="경로 순서 최적화"
                accessibilityState={{ disabled: isOptimizing }}
              >
                {isOptimizing ? (
                  <ActivityIndicator
                    size="small"
                    color={tokens.colors.primary}
                  />
                ) : (
                  <Wand2 size={normalize(20)} color={tokens.colors.primary} />
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={sectionStyles.mapControl}
              onPress={handleLocate}
              disabled={isLocating}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="내 위치로 이동"
              accessibilityState={{ disabled: isLocating }}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color={tokens.colors.primary} />
              ) : (
                <LocateFixed
                  size={normalize(20)}
                  color={tokens.colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        )}

        {inlineSegments && !isSheetVisible && points.length >= 2 && (
          <TouchableOpacity
            style={[
              sectionStyles.summaryBar,
              { paddingBottom: insets.bottom + normalize(16) },
            ]}
            onPress={handleOpenSheet}
            onLayout={event => setDockHeight(event.nativeEvent.layout.height)}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="구간 정보 펼치기"
            accessibilityState={{ expanded: false }}
          >
            <View style={sectionStyles.summaryGrabberRow} pointerEvents="none">
              <View style={sectionStyles.summaryGrabber} />
            </View>
            <View style={sectionStyles.summaryIcon}>
              <RouteIcon size={normalize(16)} color={tokens.colors.primary} />
            </View>
            <View style={sectionStyles.summaryText}>
              <Text style={sectionStyles.summaryTitle}>구간별 이동</Text>
              <Text style={sectionStyles.summaryMeta} numberOfLines={1}>
                {collapsedSummary}
              </Text>
            </View>
            <ChevronUp
              size={normalize(20)}
              color={tokens.colors.textTertiary}
            />
          </TouchableOpacity>
        )}

        {!inlineSegments && onApplyOptimizedOrder && points.length >= 3 && (
          <TouchableOpacity
            style={sectionStyles.optimizeButton}
            onPress={handleOptimizeOrder}
            disabled={isOptimizing}
            activeOpacity={0.85}
            accessibilityLabel="경로 순서 최적화"
            accessibilityState={{ disabled: isOptimizing }}
          >
            <Wand2 size={normalize(13)} color={tokens.colors.primary} />
            <Text style={sectionStyles.segmentButtonText}>
              {isOptimizing ? '계산 중…' : '순서 최적화'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <RouteSegmentSheet
        key={key}
        inline={inlineSegments}
        onPanelLayout={setDockHeight}
        dayLabel={dayLabel}
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        placeNames={placeNames}
        data={segmentQuery.data}
        isLoading={segmentQuery.isFetching}
        isError={segmentQuery.isError}
        onRetry={() => segmentQuery.refetch()}
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
  mapStage: { flex: 1, minHeight: 0 },
  mapControls: {
    position: 'absolute',
    right: normalize(14),
    gap: normalize(10),
  },
  mapControl: {
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(22),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
    ...tokens.shadows.md,
  },
  summaryBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
    paddingTop: normalize(18),
    paddingHorizontal: normalize(16),
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    backgroundColor: tokens.colors.white,
    ...tokens.shadows.md,
  },
  summaryGrabberRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: normalize(9),
    alignItems: 'center',
  },
  summaryGrabber: {
    width: normalize(36),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: tokens.colors.border,
  },
  summaryIcon: {
    width: normalize(36),
    height: normalize(36),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(18),
    backgroundColor: tokens.colors.primarySurface,
  },
  summaryText: { flex: 1, minWidth: 0 },
  summaryTitle: {
    fontSize: normalize(14.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  summaryMeta: {
    marginTop: normalize(2),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textMuted,
  },
  edgeMap: { borderRadius: 0 },
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
