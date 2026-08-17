import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

export const { width } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB',
  gray: '#F9FAFB',
};

const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
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
  logoImage: {
    width: normalize(112),
    height: normalize(112),
    resizeMode: 'contain',
  },
  title: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(28),
    letterSpacing: 0.2,
    color: COLORS.text,
    marginBottom: normalize(12),
    textAlign: 'center',
  },
  description: {
    fontSize: normalize(15),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(24),
    letterSpacing: 0.1,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: normalize(20),
  },
  loginPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(8),
  },
  loginActionButton: {
    minHeight: normalize(48),
    justifyContent: 'center',
    paddingHorizontal: normalize(8),
  },
  loginPromptText: {
    fontSize: normalize(14),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(20),
    color: COLORS.textSecondary,
  },
  loginActionText: {
    fontSize: normalize(14),
    fontFamily: FONTS.bold,
    fontWeight: '600',
    lineHeight: normalize(20),
    color: COLORS.primary,
  },
});
