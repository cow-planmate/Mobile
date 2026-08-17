import { StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { tokens } from '../../theme/tokens';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: tokens.colors.primary,
  text: tokens.colors.text,
  placeholder: tokens.colors.textTertiary,
  white: tokens.colors.white,
  border: tokens.colors.border,
  surface: tokens.colors.borderLight,
};

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)', 
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: normalize(20), 
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: normalize(20),
  },
  title: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  closeButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 16,
  },
  genderButtonTextSelected: {
    color: COLORS.white,
  },
  confirmFooter: {
    width: '100%',
    marginTop: normalize(8),
  },
  confirmButton: {
    width: '100%',
    height: normalize(52), 
    borderRadius: normalize(12), 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    fontSize: 16,
  },
});
