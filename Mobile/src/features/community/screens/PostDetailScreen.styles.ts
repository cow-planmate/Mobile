import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

export const COLORS = tokens.colors;

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
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: normalize(4),
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
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  stateLink: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.primary,
  },

  header: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(8),
  },
  statusTag: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: tokens.radius.s,
  },
  statusTagText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.bold,
  },
  statusTagAnswered: {
    backgroundColor: '#D1FAE5',
  },
  statusTagPending: {
    backgroundColor: '#FEF3C7',
  },
  statusTagTextAnswered: {
    color: '#059669',
  },
  statusTagTextPending: {
    color: '#D97706',
  },
  title: {
    fontSize: normalize(19),
    lineHeight: normalize(27),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
    marginBottom: normalize(10),
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
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  metaText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  metaViews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },

  authorActions: {
    flexDirection: 'row',
    gap: normalize(6),
    marginTop: normalize(12),
  },
  authorActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.borderLight,
  },
  authorActionText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textSecondary,
  },
  authorActionDanger: {
    backgroundColor: '#FEF2F2',
  },
  authorActionDangerText: {
    color: tokens.tones.danger.fg,
  },
  authorActionAccent: {
    backgroundColor: '#ECFDF5',
  },
  authorActionAccentText: {
    color: '#059669',
  },

  body: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(18),
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
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  reactionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  reactionButtonActiveDislike: {
    backgroundColor: COLORS.textSecondary,
    borderColor: COLORS.textSecondary,
  },
  reactionText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textSecondary,
  },
  reactionTextActive: {
    color: COLORS.white,
  },

  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(16),
  },
});
