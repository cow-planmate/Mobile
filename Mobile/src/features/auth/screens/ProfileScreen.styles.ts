import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  primaryTint: tokens.colors.primaryTint,
  sub: tokens.colors.sub,
  background: tokens.colors.background,
  card: tokens.colors.white,
  text: tokens.colors.text,
  textSecondary: tokens.colors.textSecondary,
  placeholder: tokens.colors.textTertiary,
  border: tokens.colors.border,
  borderLight: tokens.colors.borderLight,
  white: tokens.colors.white,
  error: tokens.tones.danger.fg,
  surface: tokens.colors.surface,
};

export const FONTS = tokens.fontFamily;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  loadErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: normalize(32),
  },
  loadErrorText: {
    fontFamily: FONTS.medium,
    fontSize: normalize(15),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: normalize(16),
  },
  loadErrorButton: {
    backgroundColor: COLORS.borderLight,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(24),
    height: normalize(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadErrorButtonText: {
    fontFamily: FONTS.semibold,
    fontSize: normalize(14),
    color: COLORS.textSecondary,
  },
  // 바탕은 회색이고 덩어리만 흰색이다. 덩어리 사이 20px 띠가 이 회색을
  // 드러내 선을 긋지 않고도 나뉜다.
  scrollContainer: {
    paddingBottom: normalize(40),
    backgroundColor: COLORS.surface,
  },

  avatarImage: {
    width: normalize(76),
    height: normalize(76),
    borderRadius: normalize(38),
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(12),
    gap: normalize(3),
  },
  levelBadgeText: {
    fontSize: normalize(10),
    color: COLORS.white,
    fontWeight: 'bold',
  },
  experienceSection: {
    marginBottom: normalize(16),
  },
  experienceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(6),
  },
  experienceTitle: {
    fontSize: normalize(12),
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  experienceValue: {
    fontSize: normalize(11),
    color: COLORS.placeholder,
  },
  progressBarTrack: {
    height: normalize(6),
    backgroundColor: COLORS.border,
    borderRadius: normalize(3),
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: normalize(3),
  },
  statBlock: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
  },

  achievementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: normalize(16),
    padding: normalize(20),
    marginHorizontal: normalize(16),
    marginTop: normalize(16),
    borderWidth: 1,
    borderColor: COLORS.placeholder,
    borderStyle: 'dashed',
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  achievementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  achievementTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  achievementProgressBadge: {
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(12),
  },
  achievementProgressText: {
    fontSize: normalize(10),
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  badgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
    gap: normalize(4),
  },
  badgeText: {
    fontSize: normalize(11),
    fontWeight: 'bold',
  },

  avatarEditImage: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarEditPlaceholder: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: normalize(16),
  },
  inputLabel: {
    fontSize: normalize(13),
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: normalize(8),
  },
  // 다른 팝업의 입력칸과 같은 모양. 채운 회색 대신 실선 테두리로 둘렀다.
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    height: normalize(46),
    fontSize: normalize(14),
    color: COLORS.text,
  },
  visibilityDescription: {
    flex: 1,
    fontSize: normalize(12),
    color: COLORS.textSecondary,
  },

  pickerField: {
    justifyContent: 'center',
  },
  pickerFieldText: {
    fontSize: normalize(14),
    color: COLORS.text,
  },
  pickerFieldPlaceholder: {
    color: COLORS.placeholder,
  },
  textInputDisabled: {
    backgroundColor: COLORS.surface,
    color: COLORS.placeholder,
    borderColor: COLORS.borderLight,
  },
  rowInputWrap: {
    flexDirection: 'row',
    gap: normalize(10),
  },
  checkButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(14),
    height: normalize(46),
  },
  checkButtonText: {
    fontSize: normalize(13),
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  twoColumnRow: {
    flexDirection: 'row',
    marginBottom: normalize(16),
  },
  genderSelectTrack: {
    flexDirection: 'row',
    gap: normalize(8),
    height: normalize(46),
    width: '100%',
  },
  genderOptionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: normalize(8),
  },
  genderOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: normalize(13),
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  genderOptionActiveText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: normalize(14),
    height: normalize(48),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    fontSize: normalize(15),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  resignLinkButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(10),
    marginTop: normalize(10),
    marginBottom: normalize(16),
  },
  resignLinkText: {
    fontSize: normalize(13),
    color: COLORS.error,
    fontWeight: '600',
  },
  keyboardAvoidingWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  noPlanText: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: normalize(10),
  },
  createPlanLink: {
    fontSize: normalize(13),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  noPastRecordText: {
    fontSize: normalize(12),
    color: COLORS.placeholder,
    textAlign: 'center',
    paddingVertical: normalize(16),
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  addTaskButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: normalize(8),
    paddingVertical: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(8),
    backgroundColor: COLORS.white,
  },
  addTaskButtonText: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sectionSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
    gap: normalize(4),
  },
  sectionSubtitleText: {
    fontSize: normalize(13),
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },

  editModeHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  editActionSelectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
  },
  selectAllCheckSquare: {
    width: normalize(12),
    height: normalize(12),
    borderWidth: 1,
    borderColor: COLORS.placeholder,
    borderRadius: normalize(3),
    marginRight: normalize(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectAllCheckSquareChecked: {
    backgroundColor: COLORS.textSecondary,
    borderColor: COLORS.textSecondary,
  },
  editActionSelectAllText: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  editActionDeleteSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
  },
  editActionDeleteSelectedText: {
    fontSize: normalize(11),
    color: COLORS.error,
    fontWeight: 'bold',
  },
  editActionCancel: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
  },
  editActionCancelText: {
    fontSize: normalize(11),
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  cardCheckboxWrap: {
    marginRight: normalize(6),
  },
  cardCheckboxSquare: {
    width: normalize(16),
    height: normalize(16),
    borderWidth: 1,
    borderColor: COLORS.placeholder,
    borderRadius: normalize(4),
    alignItems: 'center',
    justifyContent: 'center',    backgroundColor: COLORS.white,
  },
  editSubToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    height: normalize(52),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: normalize(4),
  },
  headerTitle: {
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // 탭은 상자가 아니라 밑줄이 맡는다. 여행기·커뮤니티와 같은 규칙이다.
  sectionTabsWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  editButton: {
    paddingVertical: normalize(2),
  },
  // 탭 하나가 가로 12를 이미 쓰므로 4만 더해 본문과 같은 16에 맞춘다.
  tabsInset: {
    paddingHorizontal: normalize(4),
    borderBottomColor: COLORS.borderLight,
  },
  tripTabs: {
    marginTop: normalize(11),
    paddingHorizontal: normalize(4),
    borderBottomColor: COLORS.borderLight,
  },

  headerSpacer: {
    width: 28,
  },
  achievementCardDisabled: {
    opacity: 0.6,
  },
  flex1: {
    flex: 1,
  },
  flex1MarginRight12: {
    flex: 1,
    marginRight: 12,
  },

  // ── 마이페이지 재설계: S2 틀 ──
  // 카드와 그림자를 걷어내고 흰 바탕 위에 1px 선과 8px 띠로만 나눈다.
  profileHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: normalize(16),
    paddingTop: normalize(18),
    paddingBottom: normalize(15),
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  profileAvatar: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: COLORS.borderLight,
  },
  profileAvatarFallback: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileNameBlock: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: normalize(21),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  profileMeta: {
    fontSize: normalize(11.5),
    color: COLORS.placeholder,
    marginTop: normalize(3),
  },
  profileEditText: {
    fontSize: normalize(12.5),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  profileVisibility: {
    marginTop: normalize(11),
    fontSize: normalize(11.5),
    color: COLORS.placeholder,
  },
  profileVisibilityStrong: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  profileStatRow: {
    flexDirection: 'row',
    marginTop: normalize(13),
    gap: normalize(22),
  },
  profileStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  profileStatNumber: {
    fontSize: normalize(17),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginRight: normalize(5),
    letterSpacing: -0.3,
  },
  profileStatLabel: {
    fontSize: normalize(11.5),
    color: COLORS.placeholder,
  },
  tasteRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    backgroundColor: COLORS.white,
  },
  tasteHeading: {
    fontSize: normalize(11),
    fontFamily: FONTS.bold,
    color: COLORS.placeholder,
    marginBottom: normalize(5),
  },
  tasteText: {
    fontSize: normalize(12),
    color: COLORS.text,
    lineHeight: normalize(20),
  },
  tasteLabel: {
    fontSize: normalize(11),
    fontFamily: FONTS.bold,
    color: COLORS.placeholder,
  },
  tasteDivider: {
    color: COLORS.border,
  },
  // 회색 바탕이 비쳐 보이는 자리. 여행기 상세·커뮤니티 상세와 같은 규칙으로,
  // 8px 띠에 흐린 선을 얹던 예전 방식은 흰 바탕과 구별되지 않았다.
  sectionBand: {
    height: normalize(20),
  },
  sectionBlock: {
    backgroundColor: COLORS.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: normalize(12),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(17),
  },
  sectionHeaderTitle: {
    fontSize: normalize(16.5),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  sectionHeaderAction: {
    fontSize: normalize(12.5),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },

  // ── 마이페이지 재설계: 일정 행(R3) ──
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(14),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  planRowSelected: {
    backgroundColor: COLORS.borderLight,
  },
  planRail: {
    width: normalize(46),
    alignItems: 'center',
    paddingTop: normalize(1),
  },
  planRailValue: {
    fontSize: normalize(17),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: -0.4,
  },
  planRailValuePast: {
    color: COLORS.placeholder,
  },
  planRailCaption: {
    fontSize: normalize(10),
    color: COLORS.placeholder,
    marginTop: normalize(1),
  },
  planBody: {
    flex: 1,
    minWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.borderLight,
    paddingLeft: normalize(14),
  },
  planTitle: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  planMeta: {
    fontSize: normalize(11.5),
    color: COLORS.placeholder,
    marginTop: normalize(4),
  },
  planMetaStrong: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
  },
  // 준비물은 막대 하나로만 말한다(C1). 항목을 펼치면 일정보다 준비물이 커진다.
  planChecklist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    marginTop: normalize(7),
    paddingVertical: normalize(4),
  },
  planChecklistLabel: {
    fontSize: normalize(10.5),
    color: COLORS.placeholder,
  },
  planChecklistTrack: {
    flex: 1,
    height: normalize(3),
    borderRadius: normalize(2),
    backgroundColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  planChecklistFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  // 파랑은 이 화면에서 '누를 수 있다'는 뜻이다. 편집·일정 관리와 같은 신호다.
  planChecklistCount: {
    fontSize: normalize(11),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  planRowMenu: {
    paddingTop: normalize(2),
    paddingLeft: normalize(2),
  },
  planEmpty: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(30),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  // ---- 프로필 수정 팝업 ----
  editBody: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  avatarBlock: {
    alignItems: 'center',
    gap: normalize(8),
    paddingBottom: normalize(18),
  },
  avatarChangeText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  checkButtonTextOff: {
    color: tokens.colors.textTertiary,
  },
  // 여는 줄들을 한 묶음으로 세워 단추가 여럿 개 떠 있는 모양을 없앨다.
  linkList: {
    marginTop: normalize(4),
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(12),
    paddingVertical: normalize(13),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  linkLabel: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.text,
  },
  linkValue: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.primary,
  },
  linkValueOff: {
    color: tokens.colors.textTertiary,
  },
  visibilityText: {
    flex: 1,
    minWidth: 0,
  },
  disabledOpacity: {
    opacity: 0.5,
  },
  iconSpacingSmall: {
    marginRight: normalize(4),
  },
});
