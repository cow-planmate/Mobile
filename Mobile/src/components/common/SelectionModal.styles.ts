import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  white: '#FFFFFF',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  placeholder: '#9CA3AF',
  lightBlue: '#E0E7FF',
  iconBg: '#F5F7FF',
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
    width: '85%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: normalize(24),
  },
  title: {
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: normalize(12),
  },
  optionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: normalize(16),
    paddingVertical: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.iconBg,
  },
  optionIconContainer: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(16),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  optionIconContainerSelected: {
    backgroundColor: COLORS.lightBlue,
  },
  optionLabel: {
    fontSize: normalize(15),
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  checkBadge: {
    position: 'absolute',
    top: normalize(8),
    right: normalize(8),
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
