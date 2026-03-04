import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  text: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
  placeholder: '#9CA3AF',
  overlay: 'rgba(0,0,0,0.45)',
  surface: '#F3F4F6',
  lightBlue: '#E0E7FF',
  iconBg: '#F5F7FF',
  disabled: '#D1D5DB',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const styles = StyleSheet.create({
  /* ── Overlay & Modal ── */
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
  },
  modal: {
    width: '88%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: normalize(20),
    paddingBottom: normalize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: normalize(22),
    paddingTop: normalize(22),
    paddingBottom: normalize(12),
  },
  headerTextArea: {
    flex: 1,
    marginRight: normalize(12),
  },
  title: {
    fontSize: normalize(20),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: normalize(3),
  },
  subtitle: {
    fontSize: normalize(13),
    fontFamily: FONTS.regular,
    color: COLORS.subtext,
  },
  closeButton: {
    width: normalize(34),
    height: normalize(34),
    borderRadius: normalize(17),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Day Counter ── */
  counterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: normalize(22),
    backgroundColor: COLORS.surface,
    borderRadius: normalize(14),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  counterLabel: {
    fontSize: normalize(14),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  counterBtn: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(10),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterBtnDisabled: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    opacity: 0.5,
  },
  counterValue: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    minWidth: normalize(36),
    textAlign: 'center',
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: normalize(22),
    marginVertical: normalize(14),
  },

  /* ── Scroll ── */
  scrollArea: {
    maxHeight: normalize(300),
    paddingHorizontal: normalize(22),
  },

  /* ── Day Card ── */
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: normalize(14),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12),
    marginBottom: normalize(10),
  },
  dayCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(8),
    gap: normalize(10),
  },
  dayBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
  },
  dayBadgeText: {
    fontSize: normalize(12),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: normalize(10),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    gap: normalize(5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateChipText: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  dayOfWeek: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    color: COLORS.subtext,
  },

  /* ── Time Row ── */
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  timeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: normalize(10),
    paddingVertical: normalize(8),
    gap: normalize(6),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipText: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  timeDash: {
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    color: COLORS.subtext,
  },

  /* ── Footer ── */
  footer: {
    paddingHorizontal: normalize(22),
    paddingTop: normalize(14),
  },
  confirmBtn: {
    width: '100%',
    height: normalize(48),
    borderRadius: normalize(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  confirmBtnText: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
