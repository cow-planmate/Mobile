import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  primaryTint: tokens.colors.primaryTint,
  background: tokens.colors.background,
  card: tokens.colors.white,
  text: tokens.colors.text,
  textSecondary: tokens.colors.textSecondary,
  placeholder: tokens.colors.textTertiary,
  border: tokens.colors.border,
  borderLight: tokens.colors.borderLight,
  white: tokens.colors.white,
  surface: tokens.colors.surface,
  danger: tokens.tones.danger.fg,
};

export const FONTS = tokens.fontFamily;

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
  topBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  topBarBackButton: {
    padding: 4,
  },
  topBarHeaderTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  topBarSpacer: {
    width: 28,
  },
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 0,
    paddingTop: 4,
    paddingBottom: 6,
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
    maxWidth: 120,
    minHeight: 30,
    justifyContent: 'center',
  },
  toolbarTitleText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: 20,
  },
  toolbarIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  toolbarIconButtonPlain: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  toolbarIconButtonInfo: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
  },
  toolbarIconButtonOutlineBlue: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  toolbarIconButtonOutlineDark: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.placeholder,
    borderWidth: 1.5,
  },
  toolbarIconButtonFilledGray: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.danger,
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
    position: 'relative',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  dayTabsContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    paddingLeft: 16,
    paddingRight: 16,
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
    backgroundColor: COLORS.primaryTint,
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
    minWidth: 80,
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabUnselected: {
    backgroundColor: COLORS.white,
  },
  dayTabLabel: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    lineHeight: 15,
  },
  dayTabLabelSelected: {
    color: COLORS.white,
  },
  dayTabDayNumber: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: 16,
  },
  dayTabDayNumberSelected: {
    color: COLORS.white,
  },
  dayTabDateInline: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    lineHeight: 14,
  },
  dayTabDateInlineSelected: {
    color: COLORS.white,
    opacity: 0.85,
  },
  timelineStage: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.surface, 
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
    backgroundColor: 'transparent',
  },
  timelineWeatherPadding: {
    paddingTop: 62,
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
    left: 60,
    right: 15,
  },
  quarterBlock: {
    height: HOUR_HEIGHT / 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border, 
  },
  firstQuarterBlock: {
    borderTopColor: COLORS.placeholder, 
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
  hourHeightFull: {
    height: HOUR_HEIGHT,
  },
  hourHeightZero: {
    height: 0,
  },
  lastHourBorder: {
    borderTopWidth: 1,
  },
  dayTabsFadeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 24,
    zIndex: 10,
  },
  dayTabsFadeOverlayLeft: {
    left: 0,
  },
  dayTabsFadeOverlayRight: {
    right: 0,
  },
  loadErrorContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  loadErrorText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadErrorRetryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  loadErrorRetryText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
