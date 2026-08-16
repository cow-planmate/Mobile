import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Bus from 'lucide-react-native/dist/esm/icons/bus';
import Car from 'lucide-react-native/dist/esm/icons/car';
import ChevronDown from 'lucide-react-native/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react-native/dist/esm/icons/chevron-up';
import Footprints from 'lucide-react-native/dist/esm/icons/footprints';
import X from 'lucide-react-native/dist/esm/icons/x';
import { TransitRouteOption, TransitStep } from '../../../api/route';
import { SegmentInfo } from '../hooks/useRouteQueries';
import {
  BUS_TYPE_LABELS,
  DEFAULT_SUBWAY_COLOR,
  PATH_TYPE,
  TRAFFIC_TYPE,
  WALK_COLOR,
  stepColor,
} from '../constants/transit';
import { styles, COLORS } from './RouteSegmentSheet.styles';
import { normalize } from '../../../utils/normalize';

const formatMinutes = (minutes?: number | null): string | null => {
  if (minutes == null || Number.isNaN(minutes)) return null;
  const rounded = Math.round(minutes);
  if (rounded >= 60) {
    const hours = Math.floor(rounded / 60);
    const rest = rounded % 60;
    return rest > 0 ? `${hours}시간 ${rest}분` : `${hours}시간`;
  }
  return `${rounded}분`;
};

const formatSeconds = (seconds?: number | null): string | null => {
  if (seconds == null || Number.isNaN(seconds)) return null;
  return formatMinutes(Math.max(1, Math.round(seconds / 60)));
};

const formatMeters = (meters?: number | null): string | null => {
  if (meters == null || Number.isNaN(meters)) return null;
  return meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;
};

const formatPayment = (payment?: number | null): string | null => {
  if (payment == null || Number.isNaN(payment)) return null;
  const grouped = String(Math.round(payment)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  );
  return `${grouped}원`;
};

const joinParts = (...parts: (string | null | undefined)[]): string | null => {
  const filtered = parts.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' · ') : null;
};

const NumberBadge = ({ number }: { number: number }) => (
  <View style={styles.numberBadge}>
    <Text style={styles.numberBadgeText}>{number}</Text>
  </View>
);

const ModeRow = ({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  isLoading: boolean;
}) => (
  <View style={styles.modeRow}>
    {icon}
    <Text style={styles.modeLabel}>{label}</Text>
    <Text
      style={[styles.modeValue, !value && styles.modeValueMuted]}
      numberOfLines={1}
    >
      {isLoading ? '불러오는 중…' : value ?? '—'}
    </Text>
  </View>
);

const RouteBar = ({ steps }: { steps: TransitStep[] }) => (
  <View style={styles.bar}>
    {steps.map((step, i) => {
      const isWalk = step.trafficType === TRAFFIC_TYPE.WALK;
      const color = stepColor(step.trafficType, step.subwayCode) ?? WALK_COLOR;
      return (
        <View
          key={i}
          style={[
            styles.barSegment,
            { flexGrow: step.sectionTime || 1, backgroundColor: color },
          ]}
        >
          {step.sectionTime != null && (
            <Text
              style={[
                styles.barSegmentText,
                isWalk && styles.barSegmentTextWalk,
              ]}
              numberOfLines={1}
            >
              {step.sectionTime}
            </Text>
          )}
        </View>
      );
    })}
  </View>
);

const PassStopsToggle = ({ step }: { step: TransitStep }) => {
  const [open, setOpen] = useState(false);
  const passStops = step.passStops;

  if (!passStops || passStops.length === 0) return null;

  return (
    <View>
      <TouchableOpacity
        style={styles.passStopsButton}
        onPress={() => setOpen(prev => !prev)}
        activeOpacity={0.7}
        hitSlop={6}
      >
        <Text style={styles.passStopsButtonText}>
          경유 정류장 {passStops.length}개
        </Text>
        {open ? (
          <ChevronUp size={normalize(11)} color={COLORS.textTertiary} />
        ) : (
          <ChevronDown size={normalize(11)} color={COLORS.textTertiary} />
        )}
      </TouchableOpacity>
      {open && (
        <View style={styles.passStopsList}>
          {passStops.map((stop, i) => (
            <Text key={i} style={styles.passStopItem}>
              {stop.stationName ?? '-'}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const StepDetailRow = ({ step }: { step: TransitStep }) => {
  if (step.trafficType === TRAFFIC_TYPE.BUS) {
    return (
      <View style={styles.stepRow}>
        <View style={styles.stepLine}>
          <View style={[styles.stepTag, styles.stepBusTag]}>
            <Text style={[styles.stepTagText, styles.stepBusTagText]}>
              {(step.busType != null && BUS_TYPE_LABELS[step.busType]) || '버스'}
            </Text>
          </View>
          {!!step.startName && (
            <Text style={styles.stepText}>{step.startName}</Text>
          )}
          {!!step.laneName && (
            <View style={styles.stepLaneBadge}>
              <Text style={styles.stepLaneBadgeText}>{step.laneName}</Text>
            </View>
          )}
          {step.intervalTime != null && (
            <Text style={styles.stepTextMuted}>배차 {step.intervalTime}분</Text>
          )}
        </View>
        <PassStopsToggle step={step} />
      </View>
    );
  }

  if (step.trafficType === TRAFFIC_TYPE.SUBWAY) {
    const color =
      stepColor(step.trafficType, step.subwayCode) ?? DEFAULT_SUBWAY_COLOR;
    return (
      <View style={styles.stepRow}>
        <View style={styles.stepLine}>
          <View style={[styles.stepTag, { backgroundColor: color }]}>
            <Text style={styles.stepTagText}>{step.laneName || '지하철'}</Text>
          </View>
          <Text style={styles.stepText}>
            {step.startName}역 승차 ~ {step.endName}역 하차
          </Text>
          {!!step.startExitNo && (
            <Text style={styles.stepTextMuted}>{step.startExitNo}번 출구</Text>
          )}
          {step.intervalTime != null && (
            <Text style={styles.stepTextMuted}>배차 {step.intervalTime}분</Text>
          )}
        </View>
        <PassStopsToggle step={step} />
      </View>
    );
  }

  return null;
};

const TransitRouteCard = ({
  route,
  laneKey,
  isLaneActive,
  onToggleLane,
}: {
  route: TransitRouteOption;
  laneKey: string;
  isLaneActive: boolean;
  onToggleLane: (mapObj: string, key: string) => void;
}) => {
  const transferCount =
    (route.busTransitCount ?? 0) + (route.subwayTransitCount ?? 0);
  const subtitle = joinParts(
    transferCount > 0 ? `환승 ${transferCount}회` : null,
    route.totalWalk ? `도보 ${route.totalWalk}m` : null,
  );

  return (
    <View style={styles.routeCard}>
      <View style={styles.routeCardTop}>
        <Text style={styles.routeTotalTime}>
          {formatMinutes(route.totalTime) ?? '—'}
        </Text>
        <Text style={styles.routePayment}>
          {formatPayment(route.payment) ?? ''}
        </Text>
      </View>
      {!!subtitle && <Text style={styles.routeSubtitle}>{subtitle}</Text>}

      <RouteBar steps={route.steps} />

      {route.steps.map((step, i) => (
        <StepDetailRow key={i} step={step} />
      ))}

      {!!route.lastEndStation && (
        <Text style={styles.lastEndStation}>
          ○ 하차 {route.lastEndStation}
        </Text>
      )}

      {!!route.mapObj && (
        <TouchableOpacity
          style={[styles.mapToggle, isLaneActive && styles.mapToggleActive]}
          onPress={() => onToggleLane(route.mapObj as string, laneKey)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.mapToggleText,
              isLaneActive && styles.mapToggleTextActive,
            ]}
          >
            {isLaneActive ? '지도에서 숨기기' : '지도에 보기'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const TransitInfo = ({
  transit,
  isLoading,
  segmentIndex,
  activeLaneKey,
  onToggleLane,
}: {
  transit: SegmentInfo['transit'][number];
  isLoading: boolean;
  segmentIndex: number;
  activeLaneKey: string | null;
  onToggleLane: (mapObj: string, key: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<number | 'all'>('all');

  const routes = transit?.routes ?? [];
  const available = !!transit?.available && routes.length > 0;
  const best = available ? routes[0] : null;
  const transferCount = best
    ? (best.busTransitCount ?? 0) + (best.subwayTransitCount ?? 0)
    : 0;

  const chips: { key: number | 'all'; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: PATH_TYPE.BUS, label: `버스 ${transit?.busCount ?? 0}` },
    { key: PATH_TYPE.SUBWAY, label: `지하철 ${transit?.subwayCount ?? 0}` },
    {
      key: PATH_TYPE.SUBWAY_BUS,
      label: `버스+지하철 ${transit?.subwayBusCount ?? 0}`,
    },
  ];

  const filtered =
    filter === 'all' ? routes : routes.filter(r => r.pathType === filter);

  return (
    <View>
      <ModeRow
        icon={<Bus size={normalize(14)} color={COLORS.primary} />}
        label="대중교통"
        isLoading={isLoading}
        value={
          available && best
            ? joinParts(
                formatMinutes(best.totalTime),
                formatPayment(best.payment),
                transferCount > 0 ? `환승 ${transferCount}회` : null,
              )
            : transit?.message ?? null
        }
      />

      {available && (
        <>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpanded(prev => !prev)}
            activeOpacity={0.7}
            hitSlop={6}
          >
            <Text style={styles.expandButtonText}>
              {expanded ? '접기' : `경로 ${routes.length}개 보기`}
            </Text>
            {expanded ? (
              <ChevronUp size={normalize(11)} color={COLORS.primary} />
            ) : (
              <ChevronDown size={normalize(11)} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          {expanded && (
            <View>
              <View style={styles.chipRow}>
                {chips.map(chip => {
                  const isActive = filter === chip.key;
                  return (
                    <TouchableOpacity
                      key={String(chip.key)}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setFilter(chip.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && styles.chipTextActive,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {filtered.map((route, ri) => {
                const laneKey = `${segmentIndex}-${ri}`;
                return (
                  <TransitRouteCard
                    key={laneKey}
                    route={route}
                    laneKey={laneKey}
                    isLaneActive={activeLaneKey === laneKey}
                    onToggleLane={onToggleLane}
                  />
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
};

export interface RouteSegmentSheetProps {
  visible: boolean;
  onClose: () => void;

  placeNames: string[];
  data?: SegmentInfo;
  isLoading: boolean;
  isError: boolean;

  activeLaneKey: string | null;
  onToggleLane: (mapObj: string, key: string) => void;
}

export default function RouteSegmentSheet({
  visible,
  onClose,
  placeNames,
  data,
  isLoading,
  isError,
  activeLaneKey,
  onToggleLane,
}: RouteSegmentSheetProps) {
  const segmentCount = Math.max(placeNames.length - 1, 0);

  const showRowLoading = isLoading && !data;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>구간 정보</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <X size={normalize(18)} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>

          {isError ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>
                구간 정보를 불러오지 못했어요.{'\n'}
                잠시 후 다시 시도해 주세요.
              </Text>
            </View>
          ) : segmentCount === 0 ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>
                장소를 2개 이상 추가하면 구간 정보를 볼 수 있어요.
              </Text>
            </View>
          ) : isLoading && !data ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.stateText}>구간 정보를 불러오는 중…</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scroll}>
              {Array.from({ length: segmentCount }).map((_, i) => (
                <View key={i} style={styles.segment}>
                  <View style={styles.segmentHeader}>
                    <NumberBadge number={i + 1} />
                    <Text style={styles.segmentPlaceName} numberOfLines={1}>
                      {placeNames[i]}
                    </Text>
                    <Text style={styles.segmentArrow}>→</Text>
                    <NumberBadge number={i + 2} />
                    <Text style={styles.segmentPlaceName} numberOfLines={1}>
                      {placeNames[i + 1]}
                    </Text>
                  </View>

                  <ModeRow
                    icon={<Car size={normalize(14)} color={COLORS.primary} />}
                    label="차량"
                    isLoading={showRowLoading}
                    value={joinParts(
                      formatSeconds(data?.driving?.durations?.[i]?.[i + 1]),
                      formatMeters(data?.driving?.distances?.[i]?.[i + 1]),
                    )}
                  />
                  <ModeRow
                    icon={
                      <Footprints size={normalize(14)} color={COLORS.primary} />
                    }
                    label="도보"
                    isLoading={showRowLoading}
                    value={joinParts(
                      formatSeconds(data?.foot?.durations?.[i]?.[i + 1]),
                      formatMeters(data?.foot?.distances?.[i]?.[i + 1]),
                    )}
                  />
                  <TransitInfo
                    transit={data?.transit?.[i] ?? null}
                    isLoading={showRowLoading}
                    segmentIndex={i}
                    activeLaneKey={activeLaneKey}
                    onToggleLane={onToggleLane}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
