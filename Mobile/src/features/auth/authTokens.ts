import { tokens } from '../../theme/tokens';
export const COLORS = {
  bg: tokens.colors.white,
  surface: tokens.colors.surface,
  surfaceRaised: tokens.colors.white,
  border: tokens.colors.border,
  borderStrong: '#D1D5DB',
  text: tokens.colors.text,
  textSecondary: tokens.colors.textSecondary,
  textDisabled: tokens.colors.textTertiary,
  primary: tokens.colors.primary,
  primaryPressed: tokens.colors.primaryPressed,
  onPrimary: tokens.colors.white,
  error: '#D92D20',
  errorBorder: '#F04438',
  errorSurface: '#FEF3F2',
  success: '#067647',
  scrim: 'rgba(16,20,27,0.45)',
} as const;

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  full: 9999,
} as const;

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export const TYPO = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.56,
    fontFamily: FONTS.bold,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.4,
    fontFamily: FONTS.bold,
  },
  headline: {
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.22,
    fontFamily: FONTS.semibold,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontFamily: FONTS.regular,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
    fontFamily: FONTS.regular,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontFamily: FONTS.medium,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.24,
    fontFamily: FONTS.medium,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontFamily: FONTS.semibold,
  },
} as const;
