import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  form: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(8),
  },
  intro: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textMuted,
    lineHeight: normalize(19),
    marginBottom: normalize(12),
  },
  input: {
    minHeight: normalize(48),
    paddingHorizontal: normalize(12),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.text,
  },
  inputError: {
    borderColor: tokens.tones.danger.fg,
  },
  error: {
    marginTop: normalize(8),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.tones.danger.fg,
  },
  removeButton: {
    alignSelf: 'flex-start',
    marginTop: normalize(12),
    paddingVertical: normalize(4),
  },
  removeText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.tones.danger.fg,
  },

  footerRow: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(13),
    borderRadius: tokens.radius.l,
  },
  footerCancel: {
    backgroundColor: COLORS.borderLight,
  },
  footerCancelText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.textLabel,
  },
  footerApply: {
    backgroundColor: COLORS.primary,
  },
  footerApplyText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.white,
  },
});
