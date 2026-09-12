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
  pageGround: tokens.colors.pageGround,
};

export const FONTS = tokens.fontFamily;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageGround,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.pageGround,
  },
  loadErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.pageGround,
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
    backgroundColor: COLORS.pageGround,
  },

  avatarImage: {
    width: normalize(76),
    height: normalize(76),
    borderRadius: normalize(38),
    borderWidth: 2,
    borderColor: COLORS.primary,
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
    width: normalize(68),
    height: normalize(68),
    borderRadius: normalize(34),
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarEditPlaceholder: {
    width: normalize(68),
    height: normalize(68),
    borderRadius: normalize(34),
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadgeBox: {
    position: 'relative',
    width: normalize(68),
    height: normalize(68),
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    backgroundColor: tokens.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarUploadingText: {
    fontSize: normalize(11),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: normalize(4),
  },
  inputGroup: {
    marginBottom: normalize(12),
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(6),
  },
  inputLabel: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: normalize(6),
  },
  inputLabelHint: {
    fontSize: normalize(11),
    fontWeight: '400',
    color: COLORS.placeholder,
  },
  readOnlyEmailWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: normalize(40),
    borderRadius: normalize(8),
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: normalize(12),
  },
  readOnlyEmailText: {
    fontSize: normalize(13),
    color: tokens.colors.textSecondary,
    flex: 1,
    marginRight: normalize(8),
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    height: normalize(40),
    fontSize: normalize(13.5),
    color: COLORS.text,
  },

  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: normalize(40),
  },
  pickerFieldText: {
    fontSize: normalize(13),
    color: COLORS.text,
  },
  pickerFieldPlaceholder: {
    color: COLORS.placeholder,
  },
  textInputDisabled: {
    backgroundColor: COLORS.surface,
    color: COLORS.placeholder,
    borderColor: COLORS.border,
  },
  rowInputWrap: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  checkButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    height: normalize(40),
    backgroundColor: tokens.colors.surface,
  },
  checkButtonText: {
    fontSize: normalize(12),
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  twoColumnRow: {
    flexDirection: 'row',
    marginBottom: normalize(8),
  },
  genderSelectTrack: {
    flexDirection: 'row',
    gap: normalize(4),
    height: normalize(40),
    width: '100%',
    backgroundColor: tokens.colors.borderLight,
    borderRadius: normalize(8),
    padding: normalize(3),
  },
  genderOptionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(6),
  },
  genderOptionActive: {
    backgroundColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: normalize(12.5),
    color: tokens.colors.textSecondary,
    fontWeight: '600',
  },
  genderOptionActiveText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: normalize(10),
    height: normalize(42),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    fontSize: normalize(14.5),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editFooterWrap: {
    width: '100%',
    alignItems: 'center',
  },
  editPasswordLink: {
    paddingTop: normalize(10),
    paddingBottom: normalize(2),
    alignItems: 'center',
  },
  editPasswordLinkText: {
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    color: tokens.colors.textSecondary,
  },
  resignLinkButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: tokens.tones.danger.bg,
    borderWidth: 1,
    borderColor: tokens.tones.danger.fg,
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
    justifyContent: 'center',
    backgroundColor: COLORS.white,
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
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    height: normalize(56),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(40),
    backgroundColor: tokens.colors.borderLight,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: normalize(10),
    marginTop: normalize(14),
  },
  editButtonIcon: {
    marginRight: normalize(6),
  },
  // 탭 하나가 가로 12를 이미 쓰므로 4만 더해 본문과 같은 16에 맞춘다.
  tabsInset: {
    paddingHorizontal: normalize(4),
    borderBottomColor: COLORS.border,
  },
  // 세 칸으로 똑같이 나누므로 바깥 여백을 두지 않는다.
  sectionTabs: {
    borderBottomColor: COLORS.border,
  },
  tripTabs: {
    marginTop: normalize(11),
    paddingHorizontal: normalize(4),
    borderBottomColor: COLORS.border,
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
    fontSize: normalize(19),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  profileEmail: {
    fontSize: normalize(12.5),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: normalize(2),
  },
  profileMetaChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginTop: normalize(6),
  },
  profileMetaChip: {
    backgroundColor: COLORS.pageGround,
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
  },
  profileMetaChipText: {
    fontSize: normalize(11),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  profileMeta: {
    fontSize: normalize(11.5),
    color: COLORS.placeholder,
    marginTop: normalize(3),
  },
  profileEditText: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    color: '#374151',
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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
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
  manageButton: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4.5),
    borderRadius: normalize(8),
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
  },
  manageButtonText: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  manageCancelButton: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4.5),
    borderRadius: normalize(8),
    backgroundColor: tokens.colors.primaryTint,
    borderWidth: 1,
    borderColor: tokens.colors.primary,
  },
  manageCancelButtonText: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
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
  planOwnership: {
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    marginBottom: normalize(7),
    borderRadius: normalize(6),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.bold,
    backgroundColor: tokens.colors.primaryTint,
    color: tokens.colors.primary,
  },
  planOwnershipInvited: {
    backgroundColor: tokens.tones.place.bg,
    color: tokens.tones.place.fg,
  },
  planRowSelected: {
    backgroundColor: COLORS.borderLight,
  },
  planRail: {
    width: normalize(52),
    alignItems: 'center',
    paddingTop: normalize(2),
  },
  planRailValue: {
    fontSize: normalize(17),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: -0.4,
  },
  planRailValuePast: {
    color: tokens.colors.text,
    fontSize: normalize(15.5),
    fontFamily: FONTS.bold,
    letterSpacing: -0.3,
  },
  planRailCaption: {
    fontSize: normalize(10),
    color: COLORS.placeholder,
    marginTop: normalize(1),
  },
  planRailCaptionPast: {
    fontSize: normalize(10),
    fontFamily: FONTS.regular,
    color: tokens.colors.textTertiary,
    marginTop: normalize(1.5),
  },
  planBody: {
    flex: 1,
    minWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
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
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: normalize(6),
  },
  noPlanTitle: {
    fontSize: normalize(14.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    marginTop: normalize(4),
  },
  noPlanDescription: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
    textAlign: 'center',
    marginBottom: normalize(4),
  },
  createPlanCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(6),
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(9.5),
    borderRadius: normalize(10),
    marginTop: normalize(4),
  },
  createPlanCardButtonText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
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
  disabledOpacity: {
    opacity: 0.5,
  },
  iconSpacingSmall: {
    marginRight: normalize(4),
  },

  // ── 하단 계정 관리 영역 ──
  accountSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: normalize(16),
  },
  accountItem: {
    paddingVertical: normalize(14),
    justifyContent: 'center',
  },
  accountItemDivider: {
    height: 1,
    backgroundColor: tokens.colors.borderLight,
  },
  accountItemText: {
    fontSize: normalize(13.5),
    fontFamily: FONTS.medium,
    color: tokens.colors.textSecondary,
  },
  accountResignText: {
    fontSize: normalize(13.5),
    fontFamily: FONTS.medium,
    color: tokens.tones.danger.fg,
  },

  // ── 프로필 수정 팝업: 비밀번호 설정 행 ──
  passwordSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
  },
  passwordSettingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  passwordSettingText: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.text,
  },
});
