import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
  lightGray: '#F9FAFB',
  darkGray: '#505050',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.4)',
  lightBlue: '#E0E7FF',
  iconBg: '#F5F7FF',
  surface: '#F3F4F6',
  disabled: '#D1D5DB',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  /* ── Layout ── */
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '100%',
    height: height * 0.95,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },

  /* ── Drag Handle ── */
  handleContainer: {
    alignItems: 'center',
    paddingTop: normalize(12),
    paddingBottom: normalize(4),
  },
  handle: {
    width: normalize(40),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: COLORS.border,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(16),
    paddingBottom: normalize(16),
    backgroundColor: COLORS.white,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: normalize(12),
  },
  headerTitle: {
    fontSize: normalize(22),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: normalize(4),
  },
  headerSubtitle: {
    fontSize: normalize(14),
    color: COLORS.subtext,
    fontFamily: FONTS.regular,
  },
  closeButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Search Bar ── */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: normalize(14),
    marginHorizontal: normalize(24),
    paddingHorizontal: normalize(4),
    height: normalize(52),
    marginBottom: normalize(12),
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  searchIconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(10),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: FONTS.regular,
    color: COLORS.text,
    height: '100%',
  },
  clearButton: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(15),
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(4),
  },

  /* ── Content ── */
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  /* ── Section Headers ── */
  sectionContainer: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
    gap: normalize(6),
  },
  sectionTitle: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },

  /* ── Tags (Recent Searches) ── */
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.iconBg,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: COLORS.lightBlue,
  },
  tagButton: {
    paddingLeft: normalize(14),
    paddingRight: normalize(8),
    paddingVertical: normalize(10),
  },
  tagRemoveButton: {
    paddingRight: normalize(12),
    paddingLeft: normalize(4),
    paddingVertical: normalize(10),
  },
  tagText: {
    fontSize: normalize(13),
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },

  /* ── Departure Results ── */
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: normalize(24),
    paddingTop: normalize(4),
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(14),
    marginBottom: normalize(8),
    backgroundColor: COLORS.surface,
    borderRadius: normalize(14),
  },
  resultIconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  resultInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  resultName: {
    fontSize: normalize(15),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginBottom: normalize(2),
  },
  resultAddress: {
    fontSize: normalize(12),
    color: COLORS.subtext,
    fontFamily: FONTS.regular,
  },

  /* ── Empty / No Result States ── */
  emptyResultContainer: {
    alignItems: 'center',
    paddingTop: normalize(48),
    paddingBottom: normalize(20),
  },
  emptyIconCircle: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(32),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  emptyResultTitle: {
    fontSize: normalize(16),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginBottom: normalize(6),
  },
  emptyResultSubtitle: {
    fontSize: normalize(13),
    fontFamily: FONTS.regular,
    color: COLORS.subtext,
  },

  /* ── Inline Loader ── */
  inlineLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(24),
    gap: normalize(8),
  },
  loaderText: {
    fontSize: normalize(14),
    color: COLORS.subtext,
    fontFamily: FONTS.regular,
  },

  /* ── Destination Layout ── */
  destinationWrapper: {
    flex: 1,
  },
  destinationScrollContainer: {
    paddingHorizontal: normalize(24),
    paddingTop: normalize(4),
    paddingBottom: normalize(20),
  },
  chipSectionContainer: {
    marginBottom: normalize(20),
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6),
  },
  chip: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(7),
    borderRadius: normalize(16),
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  chipTextSelected: {
    color: COLORS.white,
    fontFamily: FONTS.semibold,
  },

  /* ── Confirm Footer ── */
  confirmFooter: {
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(16),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  confirmButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: normalize(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButtonText: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  confirmButtonTextDisabled: {
    color: COLORS.disabled,
  },
});
