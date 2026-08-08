import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme/theme';
import { RADIUS } from '../../../../design/tokens';
import { normalize } from '../../../../utils/normalize';

export const COLORS = theme.colors;

export const styles = StyleSheet.create({
  /* ── 시트 골격 ── */
  keyboardArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: normalize(RADIUS.lg),
    borderTopRightRadius: normalize(RADIUS.lg),
    maxHeight: '85%',
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
  },
  headerTitle: {
    fontSize: normalize(16),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.text,
  },
  closeButton: {
    padding: normalize(4),
  },

  /* ── 탭 ── */
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: normalize(20),
    padding: normalize(4),
    borderRadius: normalize(RADIUS.sm),
    backgroundColor: COLORS.surface,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalize(8),
    borderRadius: normalize(RADIUS.xs),
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
  },
  tabLabel: {
    fontSize: normalize(13),
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.textTertiary,
  },
  tabLabelActive: {
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.text,
  },

  /* ── 진행률 ── */
  progressBox: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(14),
    paddingBottom: normalize(10),
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(8),
  },
  progressCaption: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  progressCount: {
    fontSize: normalize(12),
    fontFamily: theme.typography.fontFamily.semibold,
    color: COLORS.primary,
  },
  progressTrack: {
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: normalize(2),
    backgroundColor: COLORS.primary,
  },

  /* ── 목록 ── */
  list: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(12),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    marginLeft: normalize(10),
    fontSize: normalize(14),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.text,
  },
  itemTextChecked: {
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  itemAction: {
    padding: normalize(6),
    marginLeft: normalize(2),
  },
  itemEditInput: {
    flex: 1,
    marginLeft: normalize(10),
    paddingVertical: normalize(4),
    fontSize: normalize(14),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },

  /* ── 상태 표시 ── */
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(36),
    paddingHorizontal: normalize(20),
  },
  stateText: {
    marginTop: normalize(10),
    textAlign: 'center',
    fontSize: normalize(13),
    lineHeight: normalize(20),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  retryButton: {
    marginTop: normalize(14),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(RADIUS.sm),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  retryLabel: {
    fontSize: normalize(13),
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.text,
  },

  /* ── 입력 ── */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(10),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  input: {
    flex: 1,
    height: normalize(44),
    paddingHorizontal: normalize(14),
    borderRadius: normalize(RADIUS.sm),
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    fontSize: normalize(14),
    fontFamily: theme.typography.fontFamily.regular,
    color: COLORS.text,
  },
  addButton: {
    marginLeft: normalize(8),
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(RADIUS.sm),
    backgroundColor: COLORS.primary,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
});
