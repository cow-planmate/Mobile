import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  retryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.l,
    backgroundColor: COLORS.primary,
  },
  retryText: { color: COLORS.white, fontFamily: tokens.fontFamily.semibold },
  partialError: {
    color: COLORS.textSecondary,
    marginBottom: normalize(16),
    fontSize: normalize(13),
  },
  // 껍데기의 몸통이 줄어들 때 같이 줄어야 목록이 잘리지 않고 굴러간다.
  scrollArea: {
    flexShrink: 1,
  },
  scroll: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(16),
  },
  summary: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textSecondary,
    marginBottom: normalize(20),
  },
  timelineRail: {
    alignItems: 'center',
    width: normalize(26),
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: COLORS.borderStrong,
    marginVertical: normalize(5),
  },
  segmentBody: {
    flex: 1,
    minWidth: 0,
    paddingBottom: normalize(22),
  },
  segmentCaption: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textSecondary,
    marginBottom: normalize(8),
  },
  modePanel: {
    backgroundColor: COLORS.surface,
    borderRadius: normalize(12),
    padding: normalize(12),
  },
  destination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
  },

  stateBox: {
    paddingVertical: normalize(40),
    alignItems: 'center',
    gap: normalize(8),
  },
  stateText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },

  segment: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: normalize(26),
    marginBottom: normalize(8),
    gap: normalize(5),
  },
  segmentPlaceName: {
    flexShrink: 1,
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },
  numberBadge: {
    minWidth: normalize(26),
    height: normalize(26),
    paddingHorizontal: normalize(4),
    borderRadius: normalize(13),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.white,
  },

  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    paddingVertical: normalize(8),
  },
  modeLabel: {
    width: normalize(52),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  modeValue: {
    flex: 1,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textLabel,
  },
  modeValueMuted: {
    color: COLORS.textTertiary,
  },

  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingLeft: normalize(28),
    minHeight: normalize(44),
  },
  expandButtonText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.primary,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6),
    marginTop: normalize(8),
    marginBottom: normalize(4),
  },
  chip: {
    minHeight: normalize(44),
    justifyContent: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },

  routeCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: tokens.radius.l,
    padding: normalize(12),
    marginTop: normalize(8),
  },
  routeCardTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  routeTotalTime: {
    fontSize: normalize(16),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
  },
  routePayment: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  routeSubtitle: {
    marginTop: normalize(2),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },

  bar: {
    flexDirection: 'row',
    height: normalize(18),
    borderRadius: tokens.radius.round,
    overflow: 'hidden',
    marginTop: normalize(8),
    marginBottom: normalize(8),
  },
  barSegment: {
    minWidth: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  barSegmentText: {
    fontSize: normalize(9),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.white,
  },
  barSegmentTextWalk: {
    color: COLORS.textSecondary,
  },

  stepRow: {
    marginTop: normalize(4),
  },
  stepLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: normalize(4),
  },
  stepTag: {
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(1),
    borderRadius: tokens.radius.xs,
  },
  stepTagText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.white,
  },
  stepBusTag: {
    backgroundColor: '#ECFDF3',
  },
  stepBusTagText: {
    color: '#15803D',
  },
  stepLaneBadge: {
    paddingHorizontal: normalize(5),
    paddingVertical: normalize(1),
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: tokens.radius.xs,
  },
  stepLaneBadgeText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  stepText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  stepTextMuted: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },

  passStopsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
    paddingVertical: normalize(3),
  },
  passStopsButtonText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  passStopsList: {
    paddingLeft: normalize(10),
    paddingTop: normalize(2),
    gap: normalize(2),
  },
  passStopItem: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textSecondary,
  },

  mapToggle: {
    minHeight: normalize(44),
    justifyContent: 'center',
    marginTop: normalize(10),
    paddingVertical: normalize(7),
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
  },
  mapToggleActive: {
    backgroundColor: COLORS.primary,
  },
  mapToggleText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textSecondary,
  },
  mapToggleTextActive: {
    color: COLORS.white,
  },

  lastEndStation: {
    marginTop: normalize(6),
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },
});
