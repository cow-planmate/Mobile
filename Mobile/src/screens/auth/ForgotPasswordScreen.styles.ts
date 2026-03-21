import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

export const { width } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  primaryDark: '#0F36D6',
  lightGray: '#F3F4F6',
  gray: '#E5E7EB',
  darkGray: '#9CA3AF',
  text: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  success: '#34C759',
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
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: normalize(24),
    paddingTop: normalize(20),
    paddingBottom: normalize(10),
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(12),
  },
  stepDot: {
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: COLORS.gray,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    fontSize: normalize(12),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: normalize(4),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: normalize(24),
    paddingBottom: normalize(100),
  },
  title: {
    fontSize: normalize(32),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: normalize(8),
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: normalize(15),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: normalize(32),
    textAlign: 'left',
    lineHeight: normalize(22),
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(24),
  },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(8),
    fontFamily: FONTS.semibold,
    marginLeft: normalize(4),
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  flex1: { flex: 1 },
  input: {
    height: normalize(60),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    marginBottom: 0,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.darkGray,
  },
  inlineButton: {
    height: normalize(60),
    paddingHorizontal: normalize(10),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minWidth: normalize(72),
    flexShrink: 0,
  },
  buttonDisabled: { backgroundColor: COLORS.darkGray },
  inlineButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: normalize(14),
  },
  codeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  innerInput: {
    flex: 1,
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    color: COLORS.text,
    height: '100%',
    padding: 0,
  },
  timerText: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
    fontSize: normalize(14),
  },

  tempPasswordContainer: {
    marginTop: normalize(20),
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    padding: normalize(20),
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  infoBoxText: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  infoBoxSubText: {
    fontSize: normalize(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(20),
  },

  footer: {
    padding: normalize(24),
    backgroundColor: COLORS.white,
    justifyContent: 'flex-end',
  },
  submitButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
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
  retryButton: {
    alignItems: 'center',
    padding: normalize(12),
    marginTop: normalize(8),
  },
  retryButtonText: {
    fontSize: normalize(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    padding: normalize(12),
    marginTop: normalize(12),
  },
  backButtonText: {
    fontSize: normalize(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
