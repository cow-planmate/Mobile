import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

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
    paddingHorizontal: normalize(16),
    height: normalize(56),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarButton: {
    width: normalize(40),
    height: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },
  submitButton: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.white,
  },

  body: {
    padding: normalize(16),
    gap: normalize(16),
  },

  fieldLabel: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
    marginBottom: normalize(7),
  },

  boardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(7),
  },
  boardChip: {
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(7),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  boardChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  boardChipText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  boardChipTextActive: {
    color: COLORS.white,
  },

  input: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.text,
  },
  contentInput: {
    minHeight: normalize(220),
    textAlignVertical: 'top',
    lineHeight: normalize(21),
  },

  hint: {
    marginTop: normalize(6),
    fontSize: normalize(11),
    lineHeight: normalize(16),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },

  // 작성 팁 — 웹 GuidelineSection 자리
  tipsBox: {
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: tokens.colors.primaryTint,
    borderRadius: tokens.radius.l,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(13),
  },
  tipsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(7),
  },
  tipsTitle: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.primary,
  },
  tipRow: {
    flexDirection: 'row',
    gap: normalize(6),
  },
  tipText: {
    flex: 1,
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.regular,
    color: '#3F5BB5',
    lineHeight: normalize(20),
  },
  tipDot: {
    fontSize: normalize(12.5),
    color: '#3F5BB5',
    lineHeight: normalize(20),
  },
});
