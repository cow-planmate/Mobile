import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Bus from 'lucide-react-native/dist/esm/icons/bus';
import Car from 'lucide-react-native/dist/esm/icons/car';
import ChevronDown from 'lucide-react-native/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react-native/dist/esm/icons/chevron-up';
import Footprints from 'lucide-react-native/dist/esm/icons/footprints';
import SheetModal from '../../../components/common/SheetModal';
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
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles, COLORS } from './RouteSegmentSheet.styles';
import { normalize } from '../../../utils/normalize';
import { formatMinutes } from '../utils/formatDuration';


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
  failed = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  isLoading: boolean;
  failed?: boolean;
}) => (
  <View style={styles.modeRow}>
    {icon}
    <Text style={styles.modeLabel}>{label}</Text>
    <Text
      style={[styles.modeValue, !value && styles.modeValueMuted]}
      numberOfLines={1}
    >
      {isLoading ? '불러오는 중…' : failed ? '조회 실패' : value ?? '정보 없음'}
    </Text>
  </View>
);

const ModeSummary = ({
  value,
  secondary,
  isLoading,
  failed,
}: {
  value: string | null;
  secondary?: string | null;
  isLoading: boolean;
  failed?: boolean;
}) => (
  <View style={styles.modeSummary} accessibilityLiveRegion="polite">
    <Text style={styles.modeSummaryValue}>
      {isLoading ? '불러오는 중…' : failed ? '조회 실패' : value ?? '정보 없음'}
    </Text>
    {!isLoading && !failed && value && secondary ? (
      <Text style={styles.modeSummarySecondary}>{secondary}</Text>
    ) : null}
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
              {(step.busType != null && BUS_TYPE_LABELS[step.busType]) ||
                '버스'}
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
        <Text style={styles.lastEndStation}>○ 하차 {route.lastEndStation}</Text>
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
            {isLaneActive ? '지도에서 숨기기' : '지도에서 보기'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const TransitInfo = ({
  transit,
  isLoading,
  failed,
  segmentIndex,
  activeLaneKey,
  onToggleLane,
  compact = false,
}: {
  transit: SegmentInfo['transit'][number];
  isLoading: boolean;
  failed?: boolean;
  segmentIndex: number;
  activeLaneKey: string | null;
  onToggleLane: (mapObj: string, key: string) => void;
  compact?: boolean;
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
      {compact ? (
        !isLoading && !failed && !available ? (
          <View style={styles.transitEmpty}>
            <Text style={styles.transitEmptyTitle}>
              이 구간은 대중교통 경로가 없어요
            </Text>
            <Text style={styles.transitEmptyHint}>
              자동차 또는 도보 탭에서 다른 이동 방법을 확인해 보세요.
            </Text>
          </View>
        ) : (
          <ModeSummary
            value={best ? formatMinutes(best.totalTime) : null}
            secondary={
              best
                ? joinParts(
                    formatPayment(best.payment),
                    transferCount > 0 ? `환승 ${transferCount}회` : null,
                  )
                : null
            }
            isLoading={isLoading}
            failed={failed}
          />
        )
      ) : (
        <ModeRow
          icon={<Bus size={normalize(14)} color={COLORS.primary} />}
          label="대중교통"
          isLoading={isLoading}
          failed={failed}
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
      )}

      {available && (
        <>
          <TouchableOpacity
            style={[styles.expandButton, compact && styles.inlineExpandButton]}
            onPress={() => setExpanded(prev => !prev)}
            activeOpacity={0.7}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
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
            <View style={compact ? styles.inlineRouteDetails : undefined}>
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
  inline?: boolean;
  dayLabel?: string;
  /** 인라인 패널이 실제로 차지한 높이 — 지도 조작 단추를 그 위에 띄우는 데 쓴다 */
  onPanelLayout?: (height: number) => void;

  placeNames: string[];
  data?: SegmentInfo;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;

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
  onRetry,
  activeLaneKey,
  onToggleLane,
  inline = false,
  dayLabel,
  onPanelLayout,
}: RouteSegmentSheetProps) {
  const segmentCount = Math.max(placeNames.length - 1, 0);
  // 인라인 패널은 지도 위에 겹쳐 뜬다. 지도를 밀어 올리지 않고 그 자리에서
  // 미끄러져 들어오고 나가도록 레이아웃 대신 transform만 움직인다.
  const insets = useSafeAreaInsets();
  const [isMounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);
  const panelHeight = useSharedValue(normalize(340));

  useEffect(() => {
    if (!inline) {
      return;
    }
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }
    progress.value = withTiming(
      0,
      { duration: 160, easing: Easing.in(Easing.cubic) },
      finished => {
        if (finished) runOnJS(setMounted)(false);
      },
    );
  }, [inline, visible, progress]);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * panelHeight.value }],
  }));

  const [modes, setModes] = useState<
    Record<number, 'transit' | 'driving' | 'foot'>
  >({});
  const showRowLoading = isLoading && !data;
  const retry =
    (isError ||
      data?.failures ||
      data?.transit.some(route => route && !route.available)) &&
    onRetry ? (
      <TouchableOpacity
        onPress={onRetry}
        disabled={isLoading}
        style={[styles.retryButton, inline && styles.inlineRetryButton]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading }}
      >
        <Text style={[styles.retryText, inline && styles.inlineRetryText]}>
          {isLoading ? '불러오는 중…' : '다시 시도'}
        </Text>
      </TouchableOpacity>
    ) : undefined;

  const content = (
    <>
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
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.scroll, inline && styles.inlineScroll]}
          nestedScrollEnabled
        >
          {!inline && (
            <Text style={styles.summary}>
              {placeNames.length}곳 · {segmentCount}구간
            </Text>
          )}
          {data?.failures && (
            <Text style={styles.partialError}>
              일부 이동 정보를 불러오지 못했어요. 다시 시도해 주세요.
            </Text>
          )}
          {Array.from({ length: segmentCount }).map((_, i) => (
            <View key={i} style={styles.segment}>
              <View style={styles.timelineRail}>
                <NumberBadge number={i + 1} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.segmentBody}>
                <View style={styles.segmentHeader}>
                  <Text style={styles.segmentPlaceName} numberOfLines={2}>
                    {placeNames[i]}
                  </Text>
                </View>
                <View style={inline ? styles.inlineSegmentCaption : undefined}>
                  <Text style={styles.segmentCaption}>
                    {i + 1} → {i + 2} 구간
                  </Text>
                  {inline && dayLabel && (
                    <Text style={styles.segmentCaption}>{dayLabel}</Text>
                  )}
                </View>
                <View
                  style={inline ? styles.inlineModePanel : styles.modePanel}
                >
                  {inline && (
                    <View style={styles.modeTabs} accessibilityRole="tablist">
                      {(
                        [
                          { key: 'transit', label: '대중교통', Icon: Bus },
                          { key: 'driving', label: '자동차', Icon: Car },
                          { key: 'foot', label: '도보', Icon: Footprints },
                        ] as const
                      ).map(({ key, label, Icon }) => {
                        const selected = (modes[i] ?? 'transit') === key;
                        return (
                          <TouchableOpacity
                            key={key}
                            style={styles.modeTab}
                            onPress={() =>
                              setModes(current => ({ ...current, [i]: key }))
                            }
                            accessibilityRole="tab"
                            accessibilityLabel={`${i + 1}구간 ${label}`}
                            accessibilityState={{ selected }}
                          >
                            <Icon
                              size={normalize(14)}
                              color={selected ? COLORS.text : COLORS.textMuted}
                            />
                            <Text
                              style={[
                                styles.modeTabText,
                                selected && styles.modeTabTextActive,
                              ]}
                            >
                              {label}
                            </Text>
                            {selected && (
                              <View style={styles.modeTabUnderline} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                  {inline &&
                    (modes[i] === 'driving' || modes[i] === 'foot') && (
                      <ModeSummary
                        value={formatSeconds(
                          data?.[modes[i] as 'driving' | 'foot']?.durations?.[
                            i
                          ]?.[i + 1],
                        )}
                        secondary={formatMeters(
                          data?.[modes[i] as 'driving' | 'foot']?.distances?.[
                            i
                          ]?.[i + 1],
                        )}
                        failed={
                          data?.failures?.[modes[i] as 'driving' | 'foot']
                        }
                        isLoading={showRowLoading}
                      />
                    )}
                  {!inline && (
                    <>
                      <ModeRow
                        icon={
                          <Car size={normalize(14)} color={COLORS.primary} />
                        }
                        label="자동차"
                        failed={data?.failures?.driving}
                        isLoading={showRowLoading}
                        value={joinParts(
                          formatSeconds(data?.driving?.durations?.[i]?.[i + 1]),
                          formatMeters(data?.driving?.distances?.[i]?.[i + 1]),
                        )}
                      />
                      <ModeRow
                        icon={
                          <Footprints
                            size={normalize(14)}
                            color={COLORS.primary}
                          />
                        }
                        label="도보"
                        failed={data?.failures?.foot}
                        isLoading={showRowLoading}
                        value={joinParts(
                          formatSeconds(data?.foot?.durations?.[i]?.[i + 1]),
                          formatMeters(data?.foot?.distances?.[i]?.[i + 1]),
                        )}
                      />
                    </>
                  )}
                  {(!inline || (modes[i] ?? 'transit') === 'transit') && (
                    <TransitInfo
                      compact={inline}
                      failed={data?.failures?.transit[i]}
                      transit={data?.transit?.[i] ?? null}
                      isLoading={showRowLoading}
                      segmentIndex={i}
                      activeLaneKey={activeLaneKey}
                      onToggleLane={onToggleLane}
                    />
                  )}
                </View>
              </View>
            </View>
          ))}
          <View style={styles.destination}>
            <NumberBadge number={placeNames.length} />
            <Text style={styles.segmentPlaceName} numberOfLines={2}>
              {placeNames[placeNames.length - 1]}
            </Text>
          </View>
          {inline && retry}
        </ScrollView>
      )}
      {inline && (isError || segmentCount === 0 || showRowLoading) && retry}
    </>
  );

  if (inline) {
    if (!isMounted) return null;
    return (
      <Animated.View
        style={[
          styles.inlinePanel,
          { paddingBottom: insets.bottom },
          panelStyle,
        ]}
        onLayout={event => {
          const { height } = event.nativeEvent.layout;
          panelHeight.value = height;
          onPanelLayout?.(height);
        }}
      >
        <View style={styles.inlineGrabber} />
        <View style={styles.inlineHeader}>
          <View style={styles.inlineHeading}>
            <Text style={styles.inlineTitle}>구간별 이동</Text>
            <Text style={styles.inlineCount}>{segmentCount}구간</Text>
          </View>
          <TouchableOpacity
            style={styles.inlineClose}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="구간 정보 접기"
          >
            <ChevronDown size={normalize(20)} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        {content}
      </Animated.View>
    );
  }

  return (
    <SheetModal
      visible={visible}
      title="구간별 이동"
      onClose={onClose}
      maxHeightRatio={0.8}
      footer={retry}
    >
      {content}
    </SheetModal>
  );
}
