import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  white: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111827',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
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
    paddingHorizontal: normalize(20),
    paddingTop: normalize(24),
    paddingBottom: normalize(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: normalize(16),
    paddingHorizontal: normalize(4),
  },
  headerTitle: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: normalize(4),
  },
  headerSubtitle: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  closeButtonContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: normalize(20),
    width: '100%',
    justifyContent: 'space-between',
    gap: normalize(10),
  },
  button: {
    flex: 1,
    borderRadius: normalize(12),
    paddingVertical: normalize(14),
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonText: {
    fontSize: normalize(15),
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: normalize(15),
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
});
