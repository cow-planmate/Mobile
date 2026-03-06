import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  white: '#FFFFFF',
  surface: '#F9FAFB',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const HOUR_HEIGHT = 180;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const MIN_ITEM_HEIGHT = 45;
export const GRID_TOP_OFFSET = 40;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 30,
  },
  mapContainer: {
    height: '40%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: COLORS.background,
  },
  mapInner: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  dayTabsWrapper: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
  },
  dayTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#E8EDFF',
    borderRadius: 20,
    marginLeft: 5,
  },
  mapToggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  mapToggleButtonText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  mapToggleButtonTextActive: {
    color: COLORS.white,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabText: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },
  dayTabTextSelected: {
    color: COLORS.white,
  },
  dayTabDateText: {
    color: COLORS.placeholder,
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  dayTabDateTextSelected: {
    color: COLORS.white,
    opacity: 0.8,
  },
  dayTabMetaText: {
    color: COLORS.placeholder,
    fontFamily: FONTS.regular,
    fontSize: 10,
    marginTop: 2,
  },
  dayTabMetaTextSelected: {
    color: COLORS.white,
    opacity: 0.7,
  },
  timelineContentContainer: {
    paddingBottom: 0,
  },
  timelineWrapper: {
    position: 'relative',
    paddingVertical: 20,
  },
  gridContainer: {
    paddingVertical: 20,
  },
  hourBlock: {
    flexDirection: 'row',
  },
  hourLabelContainer: {
    width: 60,
    height: HOUR_HEIGHT,
    position: 'relative',
    alignItems: 'center',
  },
  timeLabelText: {
    position: 'absolute',
    marginTop: -8,
    color: COLORS.placeholder,
    fontSize: 12,
    fontFamily: FONTS.medium,
    width: '100%',
    textAlign: 'center',
  },
  minuteLabel: {},
  hourContent: {
    flex: 1,
    marginLeft: 0,
    height: HOUR_HEIGHT,
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingLeft: 60,
  },
  quarterBlock: {
    height: HOUR_HEIGHT / 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  firstQuarterBlock: {
    borderTopColor: COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  timeLabelTop: {
    top: 0,
  },
  flex1: {
    flex: 1,
  },
});
