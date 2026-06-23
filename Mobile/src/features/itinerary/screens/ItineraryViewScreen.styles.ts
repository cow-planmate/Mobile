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
    paddingTop: 0,
  },
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 4,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  toolbarLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 6,
  },
  toolbarRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarTitleButton: {
    maxWidth: 160,
    minHeight: 30,
    justifyContent: 'center',
  },
  toolbarTitleText: {
    fontSize: 19,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: 22,
  },
  toolbarIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  toolbarIconButtonPlain: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  toolbarIconButtonInfo: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  toolbarIconButtonOutlineBlue: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  toolbarIconButtonOutlineDark: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1.5,
  },
  toolbarIconButtonFilledGray: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  toolbarIconButtonFilledBlue: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toolbarIconButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toolbarIconButtonDisabled: {
    opacity: 0.55,
  },
  toolbarBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  toolbarBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontFamily: FONTS.bold,
    lineHeight: 12,
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  dayTabsContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    paddingRight: 4,
    gap: 8,
  },
  dayTabsScroll: {
    flex: 1,
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
    minWidth: 112,
    minHeight: 42,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 11,
    marginRight: 8,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabUnselected: {
    backgroundColor: '#FFFFFF',
  },
  dayTabLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    lineHeight: 18,
  },
  dayTabLabelSelected: {
    color: COLORS.white,
  },
  dayTabDayNumber: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: 18,
  },
  dayTabDayNumberSelected: {
    color: COLORS.white,
  },
  dayTabDateInline: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.placeholder,
    lineHeight: 16,
  },
  dayTabDateInlineSelected: {
    color: COLORS.white,
    opacity: 0.8,
  },
  timelineStage: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.surface, // timelineSceneBackdrop
  },
  timelineSceneBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surface,
    zIndex: 0,
  },
  timelineWeatherOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
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
