import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({

  // 껍데기의 몸통이 줄어들 때 같이 줄어야 목록이 잘리지 않고 굴러간다.
  scrollArea: {
    flexShrink: 1,
  },
  scroll: {
    paddingBottom: normalize(16),
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
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(10),
    gap: normalize(5),
  },
  segmentPlaceName: {
    flexShrink: 1,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },
  segmentArrow: {
    fontSize: normalize(13),
    color: COLORS.textTertiary,
  },
  numberBadge: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.primary,
  },

  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    paddingVertical: normalize(3),
  },
  modeLabel: {
    width: normalize(52),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  modeValue: {
    flex: 1,
    fontSize: normalize(12),
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
    paddingVertical: normalize(4),
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
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.text,
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
    marginTop: normalize(10),
    paddingVertical: normalize(7),
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
  },
  mapToggleActive: {
    backgroundColor: COLORS.text,
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
