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
  chipBg: '#EEF2FF',
  chipBorder: '#C7D2FE',
  chipText: '#3B5BDB',
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
    maxHeight: '75%',
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryScroll: {
    maxHeight: 350,
    marginBottom: 16,
  },
  summaryContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    padding: 14,
    gap: 12,
  },
  categoryGroup: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
  },
  themeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 22,
  },
  themeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.chipBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
  },
  themeChipText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.chipText,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
  },
  selectButton: {
    height: normalize(48),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  selectButtonText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  selectButtonTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  confirmFooter: {
    width: '100%',
    marginTop: normalize(8),
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
