import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';
import {
  buildOptimizedOrder,
  hasMapPosition,
  isSameOrder,
} from '../../../utils/routeOptimization';
import { useAlert } from '../../../contexts/AlertContext';

interface RouteMapSectionProps {
  /** 방문 순서대로 정렬된 장소 목록 */
  places: MapPlace[];
  /**
   * 방문 순서 최적화 결과를 적용할 콜백.
   *
   * 서버는 좌표를 재정렬해 주지 않고 **입력 인덱스 순서**만 돌려주므로,
   * 여기서는 그 순서대로 재배치한 장소 ID 목록을 넘긴다.
   * 넘기지 않으면 최적화 버튼이 표시되지 않는다.
   */
  onApplyOptimizedOrder?: (orderedPlaceIds: string[]) => void;
  style?: object;
}

/**
 * 지도 + 구간 정보를 묶은 섹션.
 *
 * 지도만 필요한 화면은 KakaoMapView를 그대로 쓰고, 길찾기(도로 경로 · 구간별
 * 이동 정보 · 대중교통 노선)까지 필요한 화면이 이 컴포넌트를 쓴다.
 * 경로 조회 훅을 여기에 모아 화면 쪽 props가 늘어나지 않게 했다.
 */
export default function RouteMapSection({
  places,
  onApplyOptimizedOrder,
  style,
}: RouteMapSectionProps) {
  const { showAlert } = useAlert();
  const [isOptimizing, setOptimizing] = useState(false);
  // 지도에 표시할 수 있는 좌표를 가진 장소만 남긴다 (KakaoMapView와 동일 기준).
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
  /**
   * 한 번이라도 시트를 열었으면 계속 활성화해 둔다. 시트를 닫는다고 조회를
   * 취소하면 다시 열 때 ODsay를 또 호출하게 된다.
   */
  const [isSegmentEnabled, setSegmentEnabled] = useState(false);
  const [activeLane, setActiveLane] = useState<{
    key: string;
    mapObj: string;
  } | null>(null);

  // 좌표 조합이 바뀌면 이전 경로에 대한 노선 표시는 의미가 없다.
  useEffect(() => {
    setActiveLane(null);
  }, [key]);

  const directionsQuery = useDirections(points);
  const segmentQuery = useSegmentInfo(points, isSegmentEnabled);
  const laneQuery = useTransitLane(activeLane?.mapObj ?? null);

  /** 백엔드가 경로 탐색에 실패하면 직선 폴백을 유지한다. */
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

  /**
   * 방문 순서 최적화.
   * 첫 장소는 출발지로 고정되며, 결과 인덱스로 원본 목록을 재배치해 넘긴다.
   */
  const handleOptimizeOrder = useCallback(async () => {
    if (!onApplyOptimizedOrder || points.length < 3 || isOptimizing) {
      return;
    }
    setOptimizing(true);
    try {
      const result = await fetchRouteTrip(points);
      const orderedIds = buildOptimizedOrder(places, result?.visitOrder);

      if (!orderedIds) {
        showAlert({
          title: '순서 최적화 실패',
          message: '경로를 계산하지 못했습니다. 잠시 후 다시 시도해주세요.',
          type: 'error',
        });
        return;
      }

      if (isSameOrder(places, orderedIds)) {
        showAlert({
          title: '이미 최적 순서예요',
          message: '지금 순서가 가장 짧은 동선입니다.',
          type: 'info',
        });
        return;
      }

      onApplyOptimizedOrder(orderedIds);
    } catch (e) {
      console.warn('순서 최적화 실패:', e);
      showAlert({
        title: '순서 최적화 실패',
        message: '경로를 계산하지 못했습니다. 잠시 후 다시 시도해주세요.',
        type: 'error',
      });
    } finally {
      setOptimizing(false);
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
          <RouteIcon size={normalize(13)} color={theme.colors.primary} />
          <Text style={sectionStyles.segmentButtonText}>구간 정보</Text>
        </TouchableOpacity>
      )}

      {onApplyOptimizedOrder && points.length >= 3 && (
        <TouchableOpacity
          style={sectionStyles.optimizeButton}
          onPress={handleOptimizeOrder}
          disabled={isOptimizing}
          activeOpacity={0.85}
        >
          <Wand2 size={normalize(13)} color={theme.colors.primary} />
          <Text style={sectionStyles.segmentButtonText}>
            {isOptimizing ? '계산 중...' : '순서 최적화'}
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
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentButtonText: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textLabel,
  },
});
