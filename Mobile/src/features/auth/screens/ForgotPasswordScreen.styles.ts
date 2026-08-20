import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flex1: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sf(12),
    height: sf(56),
    paddingLeft: sf(4),
    paddingRight: sf(20),
  },
  headerBackButton: {
    width: sf(48),
    height: sf(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCount: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
    color: COLORS.textSecondary,
  },

  scrollContainer: {
    paddingHorizontal: sf(24),
    paddingTop: sf(16),
    paddingBottom: sf(32),
  },
  title: {
    fontSize: sp(TYPO.display.fontSize),
    fontFamily: TYPO.display.fontFamily,
    lineHeight: sp(TYPO.display.lineHeight),
    letterSpacing: TYPO.display.letterSpacing,
    color: COLORS.text,
    marginBottom: sf(8),
  },
  description: {
    fontSize: sp(TYPO.body.fontSize),
    fontFamily: TYPO.body.fontFamily,
    lineHeight: sp(TYPO.body.lineHeight),
    letterSpacing: TYPO.body.letterSpacing,
    color: COLORS.textSecondary,
    marginBottom: sf(32),
  },

  inputGroup: { marginBottom: sf(16) },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: sf(8),
  },
  authInputContainer: {
    width: '100%',
    minHeight: sf(52),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: sf(16),
    backgroundColor: COLORS.surfaceRaised,
    justifyContent: 'center',
  },
  inputLocked: { backgroundColor: COLORS.surface },

  authInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sf(8),
  },
  authInput: {
    flex: 1,
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.text,
    height: sf(24),
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  authValue: {
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
  },

  inlineButton: {
    height: sf(52),
    paddingHorizontal: sf(16),
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minWidth: sf(84),
  },
  inlineButtonDisabled: { backgroundColor: COLORS.border },
  inlineButtonText: {
    color: COLORS.onPrimary,
    fontFamily: FONTS.bold,
    fontSize: sp(TYPO.body.fontSize),
    lineHeight: sp(TYPO.body.lineHeight),
  },
  editButton: {
    height: sf(52),
    paddingHorizontal: sf(12),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: sf(52),
  },
  editButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontSize: sp(TYPO.body.fontSize),
    lineHeight: sp(TYPO.body.lineHeight),
  },

  timerText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.semibold,
    fontSize: sp(TYPO.body.fontSize),
    lineHeight: sp(TYPO.body.lineHeight),
  },
  timerTextExpired: { color: COLORS.error },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sf(4),
  },
  resendHint: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    color: COLORS.textSecondary,
    lineHeight: sp(TYPO.label.lineHeight),
  },
  resendButton: {
    paddingVertical: sf(13),
    paddingHorizontal: sf(8),
  },
  resendButtonText: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
    color: COLORS.primary,
  },
  resendButtonTextDisabled: { color: COLORS.textSecondary },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sf(6),
    marginTop: sf(8),
    paddingHorizontal: sf(2),
  },
  statusTextOk: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
    color: COLORS.success,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sf(6),
    marginTop: sf(8),
    paddingHorizontal: sf(2),
  },
  errorIcon: { marginTop: sf(2) },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
  },

  resultContainer: {
    alignItems: 'center',
    paddingTop: sf(24),
  },
  resultIconWrap: {
    width: sf(72),
    height: sf(72),
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sf(20),
  },
  resultIconWrapSuccess: { backgroundColor: COLORS.successSurface },
  resultIconWrapError: { backgroundColor: COLORS.errorSurface },
  resultTitle: {
    fontSize: sp(TYPO.headline.fontSize),
    fontFamily: TYPO.headline.fontFamily,
    lineHeight: sp(TYPO.headline.lineHeight),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: sf(8),
  },
  resultBody: {
    fontSize: sp(TYPO.body.fontSize),
    fontFamily: TYPO.body.fontFamily,
    lineHeight: sp(TYPO.body.lineHeight),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultNote: {
    marginTop: sf(20),
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: sf(16),
  },
  resultNoteText: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  footer: {
    paddingHorizontal: sf(24),
    paddingTop: sf(12),
    backgroundColor: COLORS.surfaceRaised,
  },
});
