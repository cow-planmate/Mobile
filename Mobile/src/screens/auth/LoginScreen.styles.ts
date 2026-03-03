import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

export const { width } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  primaryDark: '#0F36D6',
  gray: '#E5E7EB',
  darkGray: '#9CA3AF',
  text: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  error: '#FF3B30',
  surface: '#F9FAFB',
  border: '#E5E7EB',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: normalize(24),
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: normalize(32),
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: normalize(32),
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    padding: normalize(12),
    borderRadius: 8,
    marginBottom: normalize(18),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.semibold,
    fontSize: normalize(14),
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(14),
  },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(8),
    fontFamily: FONTS.semibold,
    marginLeft: normalize(4),
  },
  input: {
    width: '100%',
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    paddingVertical: 0,
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  passwordContainer: {
    width: '100%',
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  passwordToggleText: {
    color: COLORS.textSecondary,
    fontSize: normalize(14),
    fontFamily: FONTS.semibold,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  submitButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: normalize(24),
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  submitButtonText: {
    fontSize: normalize(17),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: normalize(28),
    gap: normalize(24),
  },
  separatorWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  separator: {
    color: COLORS.darkGray,
    fontSize: normalize(14),
    fontFamily: FONTS.regular,
  },
  linkButton: {
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    borderRadius: 8,
  },
  linkText: {
    color: COLORS.darkGray,
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
  },

  /* ── Social Login ── */
  socialContainer: {
    width: '100%',
    marginTop: normalize(20),
    marginBottom: normalize(12),
    alignItems: 'center',
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: normalize(14),
  },
  socialDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  socialDividerText: {
    marginHorizontal: normalize(12),
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: normalize(20),
  },
  socialButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },

  /* ── Privacy Policy Link ── */
  privacyLinkText: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginBottom: normalize(4),
  },

  /* ── Privacy Policy Modal ── */
  privacyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(16),
  },
  privacyModal: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: normalize(20),
  },
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  privacyTitle: {
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  privacyScroll: {
    marginBottom: normalize(16),
  },
  privacySectionTitle: {
    fontSize: normalize(13),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: normalize(12),
    marginBottom: normalize(6),
  },
  privacyBullet: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: normalize(18),
    marginBottom: normalize(3),
    paddingLeft: normalize(4),
  },
  privacyCloseButton: {
    width: '100%',
    paddingVertical: normalize(12),
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  privacyCloseButtonText: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
