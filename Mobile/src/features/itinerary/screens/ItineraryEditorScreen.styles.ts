import { Platform, StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

/**
 * 갈래 탭을 채우는 색. 웹 Sidebar가 쓰는 700 계열과 같다.
 * 목록 쪽 TAB_COLORS(500 계열)는 장소 행의 점처럼 작은 표식용이라 흰 글자를 얹지 못한다 -
 * #84cc16 위 흰 글자는 대비가 1.9:1이고 #4D7C0F는 5.9:1이다.
 */
export const TAB_FILL: Record<string, string> = {
  관광지: '#4D7C0F',
  숙소: '#C2410C',
  식당: '#1D4ED8',
  '직접 추가': '#6D28D9',
  검색: '#374151',
};

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

export const HOUR_HEIGHT = normalize(180);
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const MIN_ITEM_HEIGHT = normalize(45);
export const GRID_SNAP_HEIGHT = HOUR_HEIGHT / 4;

export const GRID_TOP_OFFSET = normalize(40);
export const BOTTOM_TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 60;
export const SHEET_HANDLE_HEIGHT = normalize(62);

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
    paddingHorizontal: normalize(16),
    height: normalize(56),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarBackButton: {
    padding: normalize(4),
  },
  topBarHeaderTitle: {
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  topBarSpacer: {
    width: normalize(28),
  },
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    marginTop: 0,
    paddingTop: normalize(4),
    paddingBottom: normalize(6),
    backgroundColor: COLORS.background,
  },
  toolbarLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: normalize(6),
  },
  toolbarRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  toolbarTitleButton: {
    maxWidth: normalize(120),
    minHeight: normalize(30),
    justifyContent: 'center',
  },
  toolbarTitleText: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: normalize(20),
  },
  toolbarTitleInput: {
    minWidth: normalize(120),
    maxWidth: normalize(170),
    minHeight: normalize(28),
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: normalize(20),
  },
  toolbarTitleMeasure: {
    position: 'absolute',
    opacity: 0,
    width: 'auto',
    minWidth: 0,
    maxWidth: undefined,
  },
  toolbarTitleInputSized: {
    minWidth: 0,
    maxWidth: normalize(170),
  },
  toolbarIconButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  toolbarIconButtonPlain: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
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
    width: 'auto',
    minWidth: normalize(44),
    height: 'auto',
    minHeight: normalize(32),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toolbarIconButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toolbarActionText: {
    color: COLORS.white,
    fontSize: normalize(13),
    fontFamily: FONTS.bold,
  },
  toolbarIconButtonDisabled: {
    opacity: 0.55,
  },
  toolbarBadge: {
    position: 'absolute',
    top: normalize(-4),
    right: normalize(-4),
    minWidth: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(3),
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  toolbarBadgeText: {
    color: COLORS.white,
    fontSize: normalize(9),
    fontFamily: FONTS.bold,
    lineHeight: normalize(12),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: normalize(17),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  headerInput: {
    fontSize: normalize(17),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderColor: COLORS.placeholder,
    padding: 0,
    minWidth: normalize(150),
  },
  headerDoneButton: {
    marginRight: normalize(10),
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(8),
    backgroundColor: COLORS.primary,
  },
  headerDoneButtonText: {
    color: COLORS.white,
    fontSize: normalize(16),
    fontFamily: FONTS.semibold,
  },
  dayTabsWrapper: {
    position: 'relative',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: normalize(12),
    paddingTop: normalize(10),
    paddingBottom: normalize(8),
    gap: normalize(8),
  },
  dayTabsContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    paddingLeft: normalize(16),
    paddingRight: normalize(16),
    gap: normalize(8),
  },
  dayTabsScroll: {
    flex: 1,
  },
  dayTab: {
    minWidth: normalize(80),
    minHeight: normalize(36),
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(14),
    borderRadius: normalize(10),
    marginRight: normalize(8),
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: normalize(6),
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
    fontSize: normalize(13),
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    lineHeight: normalize(15),
  },
  dayTabLabelSelected: {
    color: COLORS.white,
  },
  dayTabDayNumber: {
    fontSize: normalize(14),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    lineHeight: normalize(16),
  },
  dayTabDayNumberSelected: {
    color: COLORS.white,
  },
  dayTabDateInline: {
    fontSize: normalize(11),
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    lineHeight: normalize(14),
  },
  dayTabDateInlineSelected: {
    color: COLORS.white,
    opacity: 0.85,
  },
  dayEditButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: normalize(2),
  },
  bottomTabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 0,
    height: Platform.OS === 'ios' ? 85 : 60,
    paddingTop: normalize(8),
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  bottomTabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: normalize(8),
  },
  bottomTabItem: {
    flex: 1,
    minWidth: 0,
    paddingVertical: normalize(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabIcon: {
    marginBottom: 0,
    minHeight: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabLabel: {
    fontFamily: FONTS.semibold,
    fontSize: normalize(11),
    marginTop: normalize(-2),
    lineHeight: normalize(14),
    color: COLORS.placeholder,
  },
  bottomTabLabelActive: {
    color: COLORS.primary,
  },
  tabScene: {
    flex: 1,
    paddingBottom: BOTTOM_TAB_BAR_HEIGHT,
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  timelineStage: {
    flex: 1,
    position: 'relative',
  },
  timelineSceneBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surface,
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
  timelineWrapper: {
    position: 'relative',
    paddingVertical: normalize(20),
  },
  gridContainer: {
    paddingVertical: normalize(20),
  },
  hourBlock: {
    flexDirection: 'row',
  },
  hourLabelContainer: {
    width: normalize(60),
    height: HOUR_HEIGHT,
    position: 'relative',
    alignItems: 'center',
  },
  timeLabelText: {
    position: 'absolute',
    marginTop: normalize(-8),
    color: COLORS.placeholder,
    fontSize: normalize(12),
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
    left: normalize(60),
    right: normalize(15),
  },
  quarterBlock: {
    height: HOUR_HEIGHT / 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  firstQuarterBlock: {
    borderTopColor: COLORS.placeholder,
  },
  lastHourBorder: {
    borderTopWidth: 1,
  },
  hourHeightFull: {
    height: HOUR_HEIGHT,
  },
  hourHeightZero: {
    height: 0,
  },
  addPlaceListContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(15),
    backgroundColor: COLORS.card,
  },
  searchInput: {
    flex: 1,
    height: normalize(40),
    backgroundColor: COLORS.surface,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(15),
    marginRight: normalize(10),
    fontFamily: FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchButton: {
    padding: normalize(10),
  },
  searchButtonIcon: {
    fontSize: normalize(20),
  },
  placeTypeTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: normalize(15),
    paddingTop: normalize(10),
    paddingBottom: normalize(5),
    backgroundColor: COLORS.card,
  },
  placeTypeTab: {
    marginRight: normalize(15),
    paddingVertical: normalize(10),
  },
  placeTypeTabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  placeTypeTabText: {
    fontSize: normalize(16),
    color: COLORS.placeholder,
    fontFamily: FONTS.semibold,
  },
  placeTypeTabTextSelected: {
    color: COLORS.primary,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  resultImage: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(8),
  },
  placeholderImage: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderText: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: COLORS.placeholder,
  },
  resultName: {
    fontSize: normalize(16),
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  resultMeta: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: normalize(2),
  },
  resultAddress: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
    marginTop: normalize(2),
  },

  resizeHandleTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normalize(32),
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: normalize(5),
  },
  resizeHandleBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: normalize(32),
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: normalize(5),
  },
  resizeHandleIndicator: {
    width: normalize(44),
    height: normalize(6),
    borderRadius: normalize(999),
    backgroundColor: 'rgba(156, 163, 175, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.7)',
  },
  emptyContainer: {
    padding: normalize(20),
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.placeholder,
    fontFamily: FONTS.regular,
  },
  resultInfo: {
    flex: 1,
    marginLeft: normalize(10),
  },
  timeLabelTop: {
    top: 0,
  },
  flex1: {
    flex: 1,
  },
  marginTop20: {
    marginTop: normalize(20),
  },

  onlineUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineUsersWrapper: {
    flexDirection: 'row',
    marginRight: normalize(10),
  },
  onlineUserAvatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  moreUsersAvatar: {
    backgroundColor: COLORS.placeholder,
  },
  onlineUserInitials: {
    color: 'white',
    fontSize: normalize(13),
    fontFamily: FONTS.bold,
  },
  moreUsersText: {
    color: 'white',
    fontSize: normalize(11),
    fontFamily: FONTS.medium,
  },

  overflowBanner: {
    position: 'absolute',
    bottom: normalize(16),
    left: normalize(20),
    right: normalize(20),
    backgroundColor: COLORS.text,
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  overflowBannerText: {
    color: COLORS.white,
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
  },

  floatingHistoryContainer: {
    position: 'absolute',
    left: normalize(16),
    bottom: SHEET_HANDLE_HEIGHT + 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 30,
  },
  floatingHistoryButton: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  floatingUndoButton: {
    flexDirection: 'row',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
    gap: normalize(6),
  },
  floatingHistoryLabel: {
    color: COLORS.text,
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
  },
  floatingHistoryButtonDisabled: {
    backgroundColor: COLORS.borderLight,
    opacity: 0.5,
  },

  previewBanner: {
    position: 'absolute',
    left: normalize(60),
    right: normalize(15),
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: normalize(12),
    backgroundColor: 'rgba(19, 68, 255, 0.11)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(12),
    zIndex: 200,
  },
  // 끌어놓는 동안은 손을 떼는 것이 확인이라 버튼이 필요 없다.
  previewBannerDragging: {
    justifyContent: 'flex-start',
  },
  // 비켜설 빈자리조차 없을 때. 붉은 점선으로 놓이지 않음을 알린다.
  previewBannerBlocked: {
    top: normalize(12),
    height: normalize(34),
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(220, 38, 38, 0.07)',
    justifyContent: 'center',
  },
  previewBannerBlockedText: {
    fontSize: normalize(12),
    fontFamily: FONTS.bold,
    color: COLORS.danger,
  },
  previewBannerInfo: {
    flex: 1,
    marginRight: normalize(8),
  },
  previewBannerName: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  previewBannerTime: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
  },
  previewBannerActions: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  previewBannerActionButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBannerCancelButton: {
    backgroundColor: tokens.tones.danger.fg,
  },
  previewBannerConfirmButton: {
    backgroundColor: '#10B981',
  },

  dayTabsFadeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: normalize(24),
    zIndex: 10,
  },
  dayTabsFadeOverlayLeft: {
    left: 0,
  },
  dayTabsFadeOverlayRight: {
    right: normalize(44),
  },

  pendingPlaceBanner: {
    backgroundColor: COLORS.primary,
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingPlaceBannerText: {
    color: COLORS.white,
    fontSize: normalize(13),
    fontWeight: '600',
    flex: 1,
    marginRight: normalize(8),
  },
  pendingPlaceBannerCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(10),
    borderRadius: normalize(6),
  },
  pendingPlaceBannerCancelText: {
    color: COLORS.white,
    fontSize: normalize(12),
    fontWeight: 'bold',
  },

  // ── 시간표 + 장소 한 화면 ──
  // 탭으로 갈라두면 장소를 고르는 동안 시간표가 안 보인다. 아래로 붙여 함께 둔다.
  editorBody: {
    flex: 1,
    minHeight: 0,
  },
  editorTimeline: {
    flex: 1,
    minHeight: 0,
  },
  // 시간표 위에 겹쳐 놓는다. 자리를 차지하면 시트를 접을 때 시간표가
  // 다시 짜이고, 그 틈에 집고 있던 손가락이 끊긴다.
  placeSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    overflow: 'hidden',
    zIndex: 40,
    elevation: 16,
  },
  // 잡는 자리는 막대만. 갈래 줄까지 여기 넣으면 갈래를 누를 때 시트가 여닫힌다.
  sheetGrabArea: {
    height: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  sheetGrabber: {
    width: normalize(40),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: COLORS.border,
  },
  sheetCats: {
    height: normalize(40),
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingHorizontal: normalize(14),
    backgroundColor: COLORS.white,
  },
  sheetCat: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(9),
    paddingVertical: normalize(5),
  },
  sheetCatText: {
    fontSize: normalize(11.5),
    fontFamily: FONTS.semibold,
    color: COLORS.textSecondary,
  },
  sheetCatTextOn: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  sheetHint: {
    paddingHorizontal: normalize(14),
    paddingBottom: normalize(8),
    fontSize: normalize(11),
    color: COLORS.placeholder,
  },
  sheetHintStrong: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
  },
  sheetBody: {
    flex: 1,
    minHeight: 0,
  },
});
