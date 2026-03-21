import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

export const { width } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

const COLORS = {
  primary: '#1344FF', // Planmate Primary Blue
  text: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB',
  gray: '#F9FAFB',
};

const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: normalize(20),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: normalize(40),
    alignItems: 'center',
  },
  title: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: normalize(12),
    textAlign: 'center',
  },
  description: {
    fontSize: normalize(15),
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: normalize(22),
    textAlign: 'center',
  },
  footer: {
    paddingBottom: normalize(34), // Safe area bottom
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: normalize(52),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: normalize(17),
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  loginPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: normalize(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  loginActionText: {
    fontSize: normalize(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginLeft: normalize(4),
  },
});
