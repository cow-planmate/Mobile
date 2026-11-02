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
  textMuted: tokens.colors.textMuted,
  textLabel: tokens.colors.textLabel,
  placeholder: tokens.colors.textTertiary,
  border: tokens.colors.border,
  borderLight: tokens.colors.borderLight,
  borderStrong: tokens.colors.borderStrong,
  white: tokens.colors.white,
  surface: tokens.colors.surface,
  pageGround: tokens.colors.pageGround,
  danger: tokens.tones.danger.fg,
};

export const FONTS = tokens.fontFamily;

export const HOUR_HEIGHT = normalize(136);
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const GRID_SNAP_HEIGHT = HOUR_HEIGHT / 4;
/** 가장 짧은 블록은 눈금 한 칸(15분)이다. */
export const MIN_ITEM_HEIGHT = GRID_SNAP_HEIGHT;

/** 눈금판 위 여백. timelineWrapper와 gridContainer의 세로 패딩 합과 같아야 한다. */
export const GRID_TOP_OFFSET = normalize(24);
// 워클릿은 UI 스레드에서 도는데 normalize는 JS 스레드에만 있는 함수다.
// 타임라인 블록의 좌우 여백·모서리는 화면 폭이 정해지면 고정이므로 여기서 한 번만 재고,
// useAnimatedStyle 안에서는 이 상수를 읽기만 한다.
export const TIMELINE_BLOCK_LEFT = normalize(60);
export const TIMELINE_BLOCK_RIGHT = normalize(15);
export const TIMELINE_BLOCK_RADIUS = normalize(12);
export const BOTTOM_TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 60;
// 머릿줄(되돌리기·다시 실행·사용법이 들어가는 줄) 44 + 갈래 줄.
export const SHEET_HANDLE_HEIGHT = normalize(80);

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
  // 화면 이름 줄은 없애고 일정 이름이 제목이다. 이름 줄 아래에 도구 줄을 둔다.
  topToolbar: {
    paddingLeft: normalize(4),
    paddingRight: normalize(8),
    backgroundColor: COLORS.background,
  },
  toolbarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: normalize(44),
  },
  toolbarBackButton: {
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarLeftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  // 도구 줄. 왼쪽에는 제목 아래 부제가, 오른쪽 끝에는 도구와 완료가 선다.
  // 제목 줄과 한 묶음으로 읽히도록 두 줄 사이를 좁힌다.
  toolbarToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -normalize(6),
  },
  toolbarSubtitle: {
    flex: 1,
    // 뒤로 가기 단추 폭만큼 들여 제목 글자와 왼쪽 끝을 맞춘다.
    marginLeft: normalize(40),
    marginRight: normalize(8),
    fontSize: normalize(12.5),
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  toolbarRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarTitleButton: {
    flexShrink: 1,
    minHeight: normalize(30),
    justifyContent: 'center',
  },
  toolbarTitleText: {
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.4,
    lineHeight: normalize(24),
  },
  // 이름을 고치는 중에는 제목 아래에 파란 밑줄이 그어진다. 일차 탭 밑줄과 같은 표현이다.
  toolbarTitleInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  toolbarTitleCounter: {
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  toolbarTitleCounterFull: {
    color: COLORS.danger,
  },
  toolbarTitleConfirm: {
    height: normalize(40),
    paddingHorizontal: normalize(12),
    justifyContent: 'center',
  },
  toolbarTitleConfirmText: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  toolbarTitleInput: {
    flex: 1,
    minHeight: normalize(28),
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.4,
    lineHeight: normalize(24),
  },
  // 테두리와 바탕 없이 아이콘만 둔다. 파란색은 완료 버튼에만 쓴다.
  toolbarIconButton: {
    width: normalize(36),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarIconButtonDisabled: {
    opacity: 0.55,
  },
  toolbarBadge: {
    position: 'absolute',
    top: normalize(4),
    right: normalize(0),
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
  doneButton: {
    height: normalize(34),
    marginLeft: normalize(6),
    paddingHorizontal: normalize(14),
    borderRadius: normalize(17),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  doneButtonText: {
    fontSize: normalize(14),
    fontFamily: FONTS.bold,
    color: COLORS.white,
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
  // 일차 탭: 칩 대신 글자 굵기와 파란 밑줄로 선택을 보여 준다.
  dayTabsWrapper: {
    position: 'relative',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: normalize(48),
    paddingRight: normalize(8),
  },
  dayTabsContainer: {
    alignItems: 'stretch',
    paddingLeft: normalize(8),
    paddingRight: normalize(8),
  },
  dayTabsScroll: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  dayTab: {
    minWidth: normalize(64),
    paddingHorizontal: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 선택한 탭 아래로 미끄러지는 밑줄. 자리와 폭은 탭을 잰 값으로 움직인다.
  dayTabIndicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
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
    fontSize: normalize(15),
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    lineHeight: normalize(20),
  },
  dayTabDayNumberSelected: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  dayTabDateInline: {
    fontSize: normalize(11.5),
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: normalize(14),
    fontVariant: ['tabular-nums'],
  },
  dayEditButton: {
    width: normalize(40),
    height: normalize(40),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
  // 일차를 넘길 때 시간표가 밀려 들어오는 틀.
  timelineMotion: {
    flex: 1,
  },
  // 흰 블록이 떠 보이도록 surface보다 한 단계 진한 바탕을 쓴다.
  timelineSceneBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pageGround,
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
  /** 장소를 놓을 수 있는 범위. 안내가 밝힐 자리를 재는 데만 쓴다. */
  timelineDropArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  /** 안내가 쓰는 예시 블록 자리. 진짜 블록과 같은 폭으로 둔다. */
  timelineDemoBlock: {
    position: 'absolute',
    left: TIMELINE_BLOCK_LEFT,
    right: TIMELINE_BLOCK_RIGHT,
  },
  /** 제 차례가 오기 전에는 자리만 잡아 두고 보이지 않는다. */
  timelineDemoHidden: {
    opacity: 0,
  },
  /** 일정이 없는 날, 처음 놓일 한 시간 자리를 점선으로 보여 준다. */
  emptyDaySlot: {
    position: 'absolute',
    left: TIMELINE_BLOCK_LEFT,
    right: TIMELINE_BLOCK_RIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: normalize(20),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.borderStrong,
    borderRadius: TIMELINE_BLOCK_RADIUS,
    // 15분 눈금선이 안내 글자를 가로지르지 않게 시간표 바탕색으로 덮는다.
    backgroundColor: COLORS.pageGround,
  },
  emptyDayTitle: {
    fontSize: normalize(14),
    fontFamily: FONTS.semibold,
    color: COLORS.textLabel,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyDayHint: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // 두 세로 패딩의 합이 GRID_TOP_OFFSET이다. 한쪽만 바꾸면 블록이 눈금에서 어긋난다.
  timelineWrapper: {
    position: 'relative',
    paddingVertical: normalize(12),
  },
  gridContainer: {
    paddingVertical: normalize(12),
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
    color: COLORS.textMuted,
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    fontVariant: ['tabular-nums'],
    width: '100%',
    paddingLeft: normalize(16),
    textAlign: 'left',
  },
  // 15분 글자는 정각보다 한 단계 옅게. 색 토큰에 중간 회색이 없어 투명도로 맞춘다.
  minuteLabel: {
    opacity: 0.7,
  },
  // 정각은 진하고 굵게. 15분 글자(회색)와 한눈에 갈린다.
  timeLabelHour: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
  },
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
    borderTopColor: COLORS.borderStrong,
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

  /**
   * 크기를 잡는 자리는 손잡이 둘레만 차지한다.
   *
   * 가로를 다 덮으면 블록 위쪽 32 안에 들어오는 연필과 X를 통째로 가려
   * 아이콘이 보이는데도 눌리지 않는다. 손잡이는 가운데 하나뿐이니 그
   * 둘레만 잡으면 된다.
   */
  resizeHandleTop: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: normalize(60),
    marginLeft: -normalize(30),
    height: normalize(20),
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: normalize(5),
  },
  resizeHandleBottom: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: normalize(60),
    marginLeft: -normalize(30),
    height: normalize(20),
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: normalize(5),
  },
  resizeHandleBottomCompact: {
    height: normalize(14),
    paddingBottom: normalize(4),
  },
  // 갈래 색은 왼쪽 막대에만 쓰므로 손잡이는 회색이다.
  resizeHandleIndicator: {
    width: normalize(28),
    height: normalize(3),
    borderRadius: normalize(999),
    backgroundColor: COLORS.borderStrong,
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

  // 사용법·AI 도우미는 오른쪽에 위아래로 세운다.
  floatingAssistContainer: {
    position: 'absolute',
    right: normalize(16),
    bottom: SHEET_HANDLE_HEIGHT + 14,
    alignItems: 'center',
    gap: normalize(10),
    zIndex: 30,
  },
  // AI 도우미는 주력 기능이라 완료 버튼과 같은 파란 면 원으로 세운다. 원과
  // 말풍선은 그대로 두고, 작은 "AI" 배지로 무슨 기능인지 글자로 알린다.
  floatingChatButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    ...tokens.shadows.md,
  },
  floatingChatBadge: {
    position: 'absolute',
    top: -normalize(4),
    right: -normalize(6),
    minWidth: normalize(22),
    height: normalize(16),
    paddingHorizontal: normalize(4),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  floatingChatBadgeText: {
    fontSize: normalize(9),
    lineHeight: normalize(11),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  // AI 도우미 창이 서는 자리. 단추 묶음과 바닥을 맞추되 따라 움직이지는
  // 않는다 - 시트 위로 뜨는 창이라 자리가 고정이어야 한다.
  chatbotAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: SHEET_HANDLE_HEIGHT,
    zIndex: 31,
  },
  /**
   * 창이 떠 있는 동안 뒤를 잠그는 겹.
   *
   * 창 옆으로 시간표를 그대로 만질 수 있게 두었더니, 창에 무엇을 시켜 놓고
   * 뒤에서 같은 것을 고치는 일이 생긴다. 옅게 덮어 지금 만지는 곳이 창뿐임을
   * 보이고, 손가락도 여기서 멈춘다.
   */
  chatbotScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.16)',
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
  },
  // 잡는 자리는 막대만. 갈래 줄까지 여기 넣으면 갈래를 누를 때 시트가 여닫힌다.
  sheetGrabArea: {
    height: normalize(44),
    // 머릿줄이 늘어도 막대는 예전 자리(맨 위에서 13dp)에 둔다. 양 끝 단추만
    // 늘어난 줄의 가운데에 선다.
    justifyContent: 'flex-start',
    paddingTop: normalize(11),
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  // 머릿줄 양 끝에 놓는 단추 자리. 막대 잡는 자리 위에 따로 얹어 단추를
  // 눌러도 시트가 끌리지 않게 한다.
  sheetHeaderLeft: {
    position: 'absolute',
    top: 0,
    left: normalize(8),
    height: normalize(44),
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetHeaderRight: {
    position: 'absolute',
    top: 0,
    right: normalize(8),
    height: normalize(44),
    justifyContent: 'center',
  },
  sheetHeaderButton: {
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
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
  // 선택하지 않은 칩은 중립색이고, 선택된 칩만 갈래 색(TAB_FILL)으로 채운다.
  sheetCat: {
    height: normalize(32),
    justifyContent: 'center',
    borderRadius: normalize(16),
    paddingHorizontal: normalize(12),
    backgroundColor: COLORS.pageGround,
  },
  sheetCatText: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    color: COLORS.textLabel,
  },
  sheetCatTextOn: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  sheetHint: {
    // 왼쪽은 칩 줄과 같은 선에 맞추고, 위는 띄워 칩이 아닌 목록의 머리글로 읽히게 한다.
    paddingHorizontal: normalize(14),
    paddingTop: normalize(4),
    paddingBottom: normalize(8),
    fontSize: normalize(12),
    color: COLORS.textMuted,
  },
  sheetHintStrong: {
    color: COLORS.textLabel,
    fontFamily: FONTS.bold,
  },
  sheetBody: {
    flex: 1,
    minHeight: 0,
  },
});
