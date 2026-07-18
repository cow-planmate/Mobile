import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  white: '#FFFFFF',
  border: '#E5E7EB',
  surface: '#F3F4F6',
};

export const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)', // 0.45 백드롭 투명도 통일
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: normalize(20), // 20 둥글기 통일
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
    marginBottom: 16,
  },
  label: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
    marginBottom: normalize(2),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(16),
  },
  passwordContainer: {
    width: '100%',
    minHeight: normalize(68),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordContent: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(20),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
    height: normalize(28),
  },
  eyeIcon: {
    padding: 12,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2.5,
  },
  confirmFooter: {
    width: '100%',
    marginTop: normalize(16),
  },
  confirmButton: {
    width: '100%',
    height: normalize(52), // 높이 52 통일
    borderRadius: normalize(12), // 둥글기 12 통일
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
