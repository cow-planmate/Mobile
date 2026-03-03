import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  placeholder: '#9CA3AF',
  white: '#FFFFFF',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  lightBlue: '#E0E7FF',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: normalize(20),
    backgroundColor: COLORS.white,
    borderRadius: normalize(20),
    paddingHorizontal: normalize(24),
    paddingTop: normalize(24),
    paddingBottom: normalize(28),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: normalize(20),
  },
  headerTitle: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  closeButtonContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterSection: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: normalize(16),
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(4),
    marginBottom: normalize(24),
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: normalize(16),
  },
  counterLabelContainer: {
    flexDirection: 'column',
  },
  counterLabel: {
    fontSize: normalize(16),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  counterSubLabel: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: normalize(2),
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(12),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterButtonDisabled: {
    opacity: 0.4,
  },
  counterValue: {
    fontSize: normalize(20),
    minWidth: normalize(40),
    textAlign: 'center',
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
  },
  confirmButton: {
    width: '100%',
    borderRadius: normalize(12),
    paddingVertical: normalize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: normalize(15),
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
});
