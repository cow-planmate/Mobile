import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  // 상세 화면의 삭제 단추와 같은 규격·같은 색이다. 삭제는 작성자에게만, 신고는
  // 작성자가 아닌 사람에게만 보여서 한 화면에 같이 나오지 않는다.
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.m,
    backgroundColor: tokens.tones.danger.bg,
  },
  triggerText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.tones.danger.fg,
  },

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
  reasonList: {
    gap: normalize(8),
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
    padding: normalize(12),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  reasonItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryTint,
  },
  radio: {
    width: normalize(18),
    height: normalize(18),
    borderRadius: tokens.radius.round,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.primary,
  },
  reasonTexts: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },
  reasonDescription: {
    marginTop: normalize(2),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textMuted,
  },

  detailsLabel: {
    marginTop: normalize(16),
    marginBottom: normalize(8),
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },
  detailsHint: {
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textMuted,
  },
  detailsInput: {
    minHeight: normalize(84),
    padding: normalize(12),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  detailsCounter: {
    marginTop: normalize(4),
    textAlign: 'right',
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  error: {
    marginTop: normalize(12),
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.tones.danger.fg,
  },

  done: {
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(24),
    gap: normalize(8),
  },
  doneTitle: {
    fontSize: normalize(16),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
  },
  doneText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textMuted,
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
  footerSubmit: {
    backgroundColor: COLORS.primary,
  },
  footerSubmitText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.white,
  },
  footerDisabled: {
    opacity: 0.4,
  },
});
