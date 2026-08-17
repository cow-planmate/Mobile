import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

export const COLORS = theme.colors;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  topBarButton: {
    width: normalize(32),
    height: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: normalize(15),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.text,
  },

  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(10),
    padding: normalize(24),
  },
  stateText: {
    fontSize: normalize(13),
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  stateLink: {
    fontSize: normalize(13),
    fontFamily: theme.typography.fontFamily.bold,
    color: COLORS.primary,
  },

  hero: {
    width: '100%',
    height: normalize(190),
    backgroundColor: COLORS.borderLight,
  },

  header: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: normalize(19),
    lineHeight: normalize(27),
    fontFamily: theme.typography.fontFamily.bold,
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6),
    marginBottom: normalize(10),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(9),
    paddingVertical: normalize(4),
    borderRadius: theme.borderRadius.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  tagChip: {
    backgroundColor: COLORS.sub,
    borderColor: COLORS.sub,
  },
  tagChipText: {
    color: COLORS.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },

  authorTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  metaAuthor: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  metaText: {
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  metaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },

  forkBar: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderBottomWidth: normalize(6),
    borderBottomColor: COLORS.surface,
  },
  forkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(6),
    paddingVertical: normalize(12),
    borderRadius: theme.borderRadius.l,
    backgroundColor: COLORS.primary,
  },
  forkButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  forkButtonText: {
    fontSize: normalize(13),
    fontFamily: theme.typography.fontFamily.bold,
    color: COLORS.white,
  },
  forkHint: {
    marginTop: normalize(7),
    fontSize: normalize(11),
    lineHeight: normalize(16),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(8),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(10),
  },
  sectionTitle: {
    fontSize: normalize(14),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.text,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: normalize(6),
    marginBottom: normalize(12),
  },
  dayTab: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: theme.borderRadius.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabText: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  dayTabTextActive: {
    color: COLORS.white,
  },

  place: {
    flexDirection: 'row',
    gap: normalize(10),
    paddingVertical: normalize(9),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  placeTime: {
    width: normalize(44),
    fontSize: normalize(11),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.primary,
    paddingTop: normalize(2),
  },
  placeBody: {
    flex: 1,
  },
  placeName: {
    fontSize: normalize(13),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.text,
  },
  placeSub: {
    marginTop: normalize(2),
    fontSize: normalize(11),
    lineHeight: normalize(16),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  placeMemo: {
    marginTop: normalize(4),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(5),
    borderRadius: theme.borderRadius.s,
    backgroundColor: COLORS.surface,
    fontSize: normalize(11),
    lineHeight: normalize(16),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  emptyDay: {
    paddingVertical: normalize(20),
    textAlign: 'center',
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textTertiary,
  },

  body: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    borderTopWidth: normalize(6),
    borderTopColor: COLORS.surface,
  },

  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: normalize(10),
    paddingBottom: normalize(20),
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(9),
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  reactionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  reactionButtonActiveDislike: {
    backgroundColor: tokens.colors.textSecondary,
    borderColor: tokens.colors.textSecondary,
  },
  reactionText: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.textSecondary,
  },
  reactionTextActive: {
    color: COLORS.white,
  },
});
