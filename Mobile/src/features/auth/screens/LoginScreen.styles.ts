import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sf(24),
    paddingTop: sf(32),
    paddingBottom: sf(24),
  },

  title: {
    fontSize: sp(TYPO.display.fontSize),
    fontFamily: TYPO.display.fontFamily,
    lineHeight: sp(TYPO.display.lineHeight),
    letterSpacing: TYPO.display.letterSpacing,
    marginBottom: sf(28),
    color: COLORS.text,
  },
  inputGroup: {
    width: '100%',
    marginBottom: sf(14),
  },

  inputContainer: {
    width: '100%',
    minHeight: sf(52),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: sf(16),
    backgroundColor: COLORS.surfaceRaised,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
    height: sf(24),
  },
  passwordContainer: {
    width: '100%',
    minHeight: sf(52),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingLeft: sf(16),
    paddingRight: sf(4),
    backgroundColor: COLORS.surfaceRaised,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordContent: {
    flex: 1,
    justifyContent: 'center',
  },
  passwordInput: {
    width: '100%',
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
    height: sf(24),
  },

  eyeButton: {
    width: sf(48),
    height: sf(48),
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sf(6),
    marginTop: sf(8),
    paddingHorizontal: sf(2),
  },
  errorIcon: {
    marginTop: sf(2),
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
  },

  fieldAssistRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: sf(2),
    marginRight: sf(-8),
  },

  submitButtonSpacing: {
    marginTop: sf(16),
  },

  lastUsedHint: {
    marginTop: sf(10),
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: sf(24),
  },
  linkButton: {
    paddingVertical: sf(13),
    paddingHorizontal: sf(8),
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: sp(TYPO.body.fontSize),
    fontFamily: TYPO.body.fontFamily,
    lineHeight: sp(TYPO.body.lineHeight),
  },
  linkTextStrong: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },

  socialContainer: {
    width: '100%',
    marginTop: sf(12),
    alignItems: 'center',
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: sf(14),
  },
  socialDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  socialDividerText: {
    marginHorizontal: sf(12),
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
    color: COLORS.textSecondary,
  },
  socialButtons: {
    width: '100%',
    gap: sf(10),
  },

  socialButton: {
    width: '100%',
    minHeight: sf(52),
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: sf(16),
    gap: sf(10),
  },
  socialButtonText: {
    fontSize: sp(TYPO.button.fontSize),
    fontFamily: TYPO.button.fontFamily,
    lineHeight: sp(TYPO.button.lineHeight),
    color: COLORS.text,
  },

  lastUsedBadge: {
    position: 'absolute',
    right: sf(12),
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: sf(8),
    paddingVertical: sf(3),
  },
  lastUsedBadgeText: {
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
    color: COLORS.primary,
  },

  footer: {
    paddingTop: sf(4),
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  privacyLinkButton: {
    alignSelf: 'center',
    paddingVertical: sf(10),
    paddingHorizontal: sf(12),
  },
  privacyLinkText: {
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  snsContainer: {
    flex: 1,
    backgroundColor: COLORS.surfaceRaised,
  },
  snsHeader: {
    height: sf(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: sf(8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  snsCloseButton: {
    width: sf(48),
    height: sf(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  snsLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
