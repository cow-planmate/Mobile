import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  inlinePanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    backgroundColor: COLORS.white,
    ...tokens.shadows.md,
  },
  inlineGrabArea: {
    width: '100%',
    paddingTop: normalize(12),
    paddingBottom: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineGrabber: {
    alignSelf: 'center',
    width: normalize(40),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: COLORS.border,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  inlineHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: normalize(8),
  },
  inlineTitle: {
    fontSize: normalize(14.5),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
  },
  inlineCount: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textTertiary,
  },
  inlineClose: {
    width: normalize(48),
    height: normalize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineScroll: { paddingTop: normalize(16) },
  inlineSegmentCaption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inlineModePanel: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: normalize(12),
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  modeTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingHorizontal: normalize(4),
  },
  modeTab: {
    flex: 1,
    minHeight: normalize(48),
    paddingVertical: normalize(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(5),
  },
  modeTabText: {
    flexShrink: 1,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textMuted,
  },
  modeTabTextActive: { color: COLORS.text, fontFamily: tokens.fontFamily.bold },
  modeTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: normalize(8),
    right: normalize(8),
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.primary,
  },
  modeSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: normalize(6),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    minHeight: normalize(53),
  },
  modeSummaryValue: {
    fontSize: normalize(17),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
  },
  modeSummarySecondary: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textMuted,
  },
  roadOptions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    padding: normalize(12),
    gap: normalize(8),
  },
  roadOptionsTitle: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  roadOption: {
    minHeight: normalize(52),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(9),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.white,
  },
  roadOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryTint,
  },
  roadOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roadOptionTitle: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },
  roadOptionBadge: {
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: tokens.radius.s,
    backgroundColor: COLORS.primary,
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.white,
  },
  roadOptionMeta: {
    marginTop: normalize(3),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  transitEmpty: { padding: normalize(14), gap: normalize(6) },
  transitEmptyTitle: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  transitEmptyHint: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textMuted,
    lineHeight: normalize(17),
  },
  inlineExpandButton: {
    paddingLeft: 0,
    minHeight: normalize(48),
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  inlineRouteDetails: {
    paddingHorizontal: normalize(12),
    paddingBottom: normalize(12),
  },
  inlineRetryButton: {
    backgroundColor: COLORS.primaryTint,
    marginTop: normalize(12),
    marginHorizontal: normalize(16),
  },
  inlineRetryText: { color: COLORS.primary },
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
  mapUnavailable: {
    marginTop: normalize(6),
    color: COLORS.textMuted,
    fontSize: normalize(12),
  },

  lastEndStation: {
    marginTop: normalize(6),
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },
});
