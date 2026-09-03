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
  topBarActions: {
    flexDirection: 'row',
    gap: normalize(4),
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(8),
  },
  statusTag: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: tokens.radius.s,
  },
  statusTagText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.bold,
  },
  statusTagAnswered: {
    backgroundColor: tokens.tones.success.bg,
  },
  statusTagPending: {
    backgroundColor: tokens.tones.warning.bg,
  },
  statusTagTextAnswered: {
    color: tokens.tones.success.fg,
  },
  statusTagTextPending: {
    color: tokens.tones.warning.fg,
  },
  title: {
    fontSize: normalize(19),
    lineHeight: normalize(27),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
    marginBottom: normalize(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
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
  metaViews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },

  authorActions: {
    flexDirection: 'row',
    gap: normalize(6),
    marginTop: normalize(12),
  },
  authorActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.borderLight,
  },
  authorActionText: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textSecondary,
  },
  authorActionDanger: {
    backgroundColor: tokens.tones.danger.bg,
  },
  authorActionDangerText: {
    color: tokens.tones.danger.fg,
  },
  authorActionAccent: {
    backgroundColor: tokens.tones.success.bg,
  },
  authorActionAccentText: {
    color: tokens.tones.success.fg,
  },

  body: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(18),
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

  otherHeading: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(10),
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  // 마지막 줄의 밑선이 이 줄의 윗선을 대신한다 — 겹쳐 긋지 않는다.
  otherMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(4),
    paddingVertical: normalize(15),
  },
  otherMoreText: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textSecondary,
  },

});
