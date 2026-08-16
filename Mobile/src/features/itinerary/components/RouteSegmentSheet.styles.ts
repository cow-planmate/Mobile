import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

export const COLORS = theme.colors;

export const styles = StyleSheet.create({

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    maxHeight: '80%',
    paddingBottom: normalize(8),
  },
  grabber: {
    alignSelf: 'center',
    width: normalize(36),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: COLORS.borderStrong,
    marginTop: normalize(8),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(12),
    paddingBottom: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: normalize(16),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.text,
  },
  closeButton: {
    width: normalize(28),
    height: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },

  segment: {
    paddingHorizontal: normalize(20),
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
    fontFamily: theme.typography.fontFamily.semibold,
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
    fontFamily: theme.typography.fontFamily.bold,
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
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  modeValue: {
    flex: 1,
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.medium,
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
    fontFamily: theme.typography.fontFamily.medium,
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
    borderRadius: theme.borderRadius.round,
    backgroundColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.text,
  },
  chipText: {
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },

  routeCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: theme.borderRadius.l,
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
    fontFamily: theme.typography.fontFamily.bold,
    color: COLORS.text,
  },
  routePayment: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  routeSubtitle: {
    marginTop: normalize(2),
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textTertiary,
  },

  bar: {
    flexDirection: 'row',
    height: normalize(18),
    borderRadius: theme.borderRadius.round,
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
    fontFamily: theme.typography.fontFamily.medium,
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
    borderRadius: theme.borderRadius.xs,
  },
  stepTagText: {
    fontSize: normalize(10),
    fontFamily: theme.typography.fontFamily.semibold,
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
    borderRadius: theme.borderRadius.xs,
  },
  stepLaneBadgeText: {
    fontSize: normalize(10),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  stepText: {
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  stepTextMuted: {
    fontSize: normalize(10),
    fontFamily: theme.typography.fontFamily.regular,
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
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  passStopsList: {
    paddingLeft: normalize(10),
    paddingTop: normalize(2),
    gap: normalize(2),
  },
  passStopItem: {
    fontSize: normalize(10),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textSecondary,
  },

  mapToggle: {
    marginTop: normalize(10),
    paddingVertical: normalize(7),
    borderRadius: theme.borderRadius.m,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
  },
  mapToggleActive: {
    backgroundColor: COLORS.text,
  },
  mapToggleText: {
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.textSecondary,
  },
  mapToggleTextActive: {
    color: COLORS.white,
  },

  lastEndStation: {
    marginTop: normalize(6),
    fontSize: normalize(10),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textTertiary,
  },
});
