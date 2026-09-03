import { StyleSheet } from 'react-native';
import { tokens } from '../../../../theme/tokens';
import { normalize } from '../../../../utils/normalize';

const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
};

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: normalize(16),
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
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textTertiary,
  },
  tabLabelActive: {
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },

  progressBox: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(14),
    paddingBottom: normalize(10),
  },
  syncHint: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(8),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(8),
  },
  progressCaption: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  progressCount: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
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

  // 껍데기의 몸통이 줄어들 때 같이 줄어야 밑줄의 입력칸이 밀려나지 않는다.
  listScroll: {
    flexShrink: 1,
  },
  list: {
    paddingHorizontal: normalize(16),
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
    fontFamily: tokens.fontFamily.regular,
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
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },

  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(36),
    paddingHorizontal: normalize(16),
  },
  stateText: {
    marginTop: normalize(10),
    textAlign: 'center',
    fontSize: normalize(13),
    lineHeight: normalize(20),
    fontFamily: tokens.fontFamily.regular,
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
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.text,
  },

  // 껍데기의 밑줄 자리에 들어간다 — 실선과 좌우 여백은 껍데기가 이미 그린다.
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: normalize(44),
    paddingHorizontal: normalize(14),
    borderRadius: normalize(RADIUS.sm),
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.regular,
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
