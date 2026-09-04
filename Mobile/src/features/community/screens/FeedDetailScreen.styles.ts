import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  // 글이 짧아도 마지막 덩어리가 바닥까지 내려와 회색 꼬리를 남기지 않는다.
  scrollBody: {
    flexGrow: 1,
  },
  // 흰 덩어리는 화면 폭을 그대로 쓴다 — 모서리도 좌우 테두리도 두지 않는다.
  block: {
    backgroundColor: COLORS.white,
  },
  blockFill: {
    flexGrow: 1,
  },
  // 회색이 보이는 유일한 자리. 덩어리 사이를 벌려 글이 위에 붙지 않게 한다.
  band: {
    height: normalize(20),
  },

  topBar: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  topBarButton: {
    width: normalize(32),
    height: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },

  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(10),
    padding: normalize(24),
  },
  stateText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  stateLink: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.primary,
  },


  header: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: normalize(19),
    lineHeight: normalize(27),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: normalize(6),
    marginBottom: normalize(6),
  },
  // 작성자와 여행 정보를 끊는 세로선. 가운뎃점보다 두 덩이임이 분명하다.
  metaRule: {
    width: 1,
    height: normalize(11),
    marginHorizontal: normalize(2),
    backgroundColor: COLORS.border,
  },
  metaDivider: {
    fontSize: normalize(11),
    color: COLORS.borderStrong,
  },
  metaFact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },
  metaRegion: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.primary,
  },
  metaDuration: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  tagLine: {
    marginTop: normalize(8),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textTertiary,
  },

  authorTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  metaAuthor: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
  },
  metaText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  metaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },

  // 일정 목록 끝에 붙는 줄들. 좌우 여백은 감싸는 덩어리가 이미 준다.
  actionBar: {
    marginTop: normalize(6),
    paddingTop: normalize(14),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  forkBar: {
    paddingTop: normalize(10),
    paddingBottom: normalize(4),
  },
  // 일정이 없어 홀로 설 때는 위에 실선을 그을 것이 없다.
  loneActionBar: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
  },
  forkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(6),
    paddingVertical: normalize(12),
    borderRadius: tokens.radius.l,
    backgroundColor: COLORS.primary,
  },
  forkButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  forkButtonText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.white,
  },
  // 회색 바탕에 흰 글자는 읽히지 않는다. 잠겼을 때는 글자도 함께 낮춘다.
  forkButtonTextOff: {
    color: COLORS.textTertiary,
  },

  section: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(4),
    paddingBottom: normalize(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(14),
  },
  sectionTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  sectionSubtitle: {
    marginTop: normalize(3),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textTertiary,
  },
  sectionTitle: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: normalize(6),
    marginBottom: normalize(12),
  },
  // 웹과 같은 라운드 8 사각형. 알약이 아니라 각진 칸이라 아래 목록과 결이 맞는다.
  dayTab: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(7),
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.textSecondary,
  },
  dayTabTextActive: {
    color: COLORS.white,
  },


  body: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(20),
  },

  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: normalize(10),
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(9),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  reactionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  reactionButtonActiveDislike: {
    backgroundColor: COLORS.textSecondary,
    borderColor: COLORS.textSecondary,
  },
  reactionText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textSecondary,
  },
  similarHeading: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  similarSubtitle: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(3),
    paddingBottom: normalize(10),
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  similarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
  },
  similarThumb: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(8),
  },
  similarThumbEmpty: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarBody: {
    flex: 1,
    minWidth: 0,
  },
  similarTitle: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
  },
  similarMeta: {
    marginTop: normalize(2),
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  similarCounts: {
    marginTop: normalize(3),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },

  reactionTextActive: {
    color: COLORS.white,
  },
});
