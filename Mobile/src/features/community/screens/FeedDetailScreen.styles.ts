import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  // 흰 덩어리는 화면 폭을 그대로 쓴다 — 모서리도 좌우 테두리도 두지 않는다.
  block: {
    backgroundColor: COLORS.white,
  },
  // 회색이 보이는 유일한 자리. 덩어리 사이를 벌려 글이 위에 붙지 않게 한다.
  band: {
    height: normalize(10),
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
  metaDivider: {
    fontSize: normalize(11),
    color: COLORS.border,
  },
  metaRegion: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.primary,
  },
  metaDuration: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textSecondary,
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

  forkBar: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderBottomWidth: normalize(6),
    borderBottomColor: COLORS.surface,
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
  forkHint: {
    marginTop: normalize(7),
    fontSize: normalize(11),
    lineHeight: normalize(16),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
    textAlign: 'center',
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
  dayTab: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayTabText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
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
    paddingBottom: normalize(20),
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
  reactionTextActive: {
    color: COLORS.white,
  },
});
