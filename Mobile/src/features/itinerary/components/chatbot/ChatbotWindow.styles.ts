import { StyleSheet } from 'react-native';
import { tokens } from '../../../../theme/tokens';
import { normalize } from '../../../../utils/normalize';

export const COLORS = tokens.colors;

/**
 * 진입 단추 한 칸 위.
 *
 * 단추 묶음과 같은 닻 안에 들어가므로 여기서는 단추 높이만 비우면 된다.
 * 닻이 추천 장소 시트를 따라 움직여 창도 같이 따라간다.
 */
export const WINDOW_BOTTOM = normalize(44) + normalize(10);
export const WINDOW_MAX_HEIGHT = normalize(335);

export const styles = StyleSheet.create({
  // 창은 화면을 덮지 않는다. 바깥은 비어 있어 시간표가 그대로 눌린다.
  // 진입 단추와 같은 상자 안에 놓아 둘의 자리가 같이 움직인다.
  window: {
    position: 'absolute',
    left: normalize(12),
    right: normalize(12),
    zIndex: 41,
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
    overflow: 'hidden',
  },

  // 머릿줄 — 웹과 같이 아바타·부제를 두고, 닫기는 진입 단추가 맡는다.
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(10),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.white,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  avatar: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(13),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primarySurface,
  },
  avatarDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: normalize(11),
    height: normalize(11),
    borderRadius: normalize(6),
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: tokens.colors.white,
  },
  headTitle: {
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  headSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    marginTop: normalize(2),
  },
  headSubtitleText: {
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  headActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(2),
  },
  headClose: {
    width: normalize(30),
    height: normalize(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.m,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.m,
  },
  headerActionText: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },

  scroll: { flex: 1, backgroundColor: tokens.colors.surface },
  body: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(14),
    gap: normalize(10),
  },

  // 말풍선 — 내가 한 말은 오른쪽 파랑, AI가 한 말은 왼쪽 흰 카드.
  row: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(10),
    borderRadius: normalize(16),
  },
  bubbleMine: {
    backgroundColor: tokens.colors.primary,
    borderBottomRightRadius: normalize(5),
  },
  bubbleBot: {
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderBottomLeftRadius: normalize(5),
  },
  bubbleText: {
    fontSize: normalize(13),
    lineHeight: normalize(19),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textLabel,
  },
  bubbleTextMine: {
    color: tokens.colors.white,
    fontFamily: tokens.fontFamily.medium,
  },
  // 웹은 모든 말풍선에 "방금"을 붙이지만, 지난 대화에도 방금이라 적히면
  // 거짓이 된다. 자리는 웹과 같게 두고 값만 실제 시각으로 찍는다.
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    marginTop: normalize(4),
  },
  stampText: {
    fontSize: normalize(9.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  stampTextMine: { color: '#C7D2FE' },

  // 첫 화면에서 권하는 세 마디. 무엇을 물어도 되는지 예를 보여 준다.
  prompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(8),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(11),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  promptText: {
    flex: 1,
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textSecondary,
  },

  pending: {
    alignSelf: 'flex-start',
    maxWidth: '84%',
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(11),
    borderRadius: normalize(16),
    borderBottomLeftRadius: normalize(5),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  pendingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  pendingText: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textSecondary,
  },
  pendingSub: {
    marginTop: normalize(3),
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(8),
    padding: normalize(11),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: normalize(12),
    lineHeight: normalize(17),
    fontFamily: tokens.fontFamily.medium,
  },

  // 추천 장소 가로 줄
  section: {
    padding: normalize(12),
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
    gap: normalize(10),
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  sectionBadge: {
    width: normalize(26),
    height: normalize(26),
    borderRadius: tokens.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
  },
  sectionTitle: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  sectionHint: {
    marginTop: normalize(2),
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  placeStrip: { gap: normalize(8) },
  placeCard: {
    width: normalize(160),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    overflow: 'hidden',
    backgroundColor: tokens.colors.white,
  },
  placeThumb: { width: '100%', height: normalize(72) },
  placeThumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface,
  },
  placeBody: { padding: normalize(9), gap: normalize(2) },
  placeCategory: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  placeTitle: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  placeAddr: {
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },

  // 아직 반영하지 않은 제안
  preview: {
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: tokens.colors.sub,
    backgroundColor: tokens.colors.white,
    overflow: 'hidden',
  },
  previewHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: normalize(10),
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(11),
    backgroundColor: tokens.colors.primaryTint,
  },
  previewEyebrow: {
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  previewTitle: {
    marginTop: normalize(3),
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  previewBadge: {
    paddingHorizontal: normalize(9),
    paddingVertical: normalize(4),
    borderRadius: tokens.radius.round,
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.sub,
  },
  previewBadgeText: {
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  previewBody: {
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(11),
    gap: normalize(9),
  },
  previewCounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  previewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  previewCountText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  previewBlocks: {
    gap: normalize(5),
    paddingTop: normalize(9),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  previewBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  previewBlockTime: {
    width: normalize(78),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textTertiary,
  },
  previewBlockName: {
    flex: 1,
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textLabel,
  },
  previewMore: {
    paddingLeft: normalize(86),
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  previewHint: {
    paddingHorizontal: normalize(11),
    paddingVertical: normalize(8),
    borderRadius: tokens.radius.m,
    backgroundColor: tokens.colors.surface,
    fontSize: normalize(10.5),
    lineHeight: normalize(16),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  previewFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    padding: normalize(11),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  previewDiscard: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(11),
    borderRadius: tokens.radius.l,
  },
  previewDiscardText: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
  },
  previewApply: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(6),
    paddingVertical: normalize(11),
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.primary,
  },
  previewApplyText: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  previewBusy: { opacity: 0.6 },

  // 일정을 저장하기 전에는 쓸 수 없다
  empty: {
    margin: normalize(14),
    alignItems: 'center',
    gap: normalize(8),
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(32),
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  emptyIcon: {
    width: normalize(46),
    height: normalize(46),
    borderRadius: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primarySurface,
  },
  emptyTitle: {
    marginTop: normalize(4),
    fontSize: normalize(13.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  emptyBody: {
    fontSize: normalize(12),
    lineHeight: normalize(18),
    textAlign: 'center',
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },

  // 밑줄 입력칸
  foot: {
    padding: normalize(12),
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    backgroundColor: tokens.colors.white,
  },
  carry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    marginBottom: normalize(8),
    paddingHorizontal: normalize(4),
  },
  carryText: {
    fontSize: normalize(10.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.primary,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: normalize(8),
  },
  input: {
    flex: 1,
    minHeight: normalize(40),
    maxHeight: normalize(110),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
    textAlignVertical: 'top',
  },
  send: {
    width: normalize(40),
    height: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.primary,
  },
  sendOff: { backgroundColor: tokens.colors.disabled },
  disclaimer: {
    marginTop: normalize(8),
    textAlign: 'center',
    fontSize: normalize(10),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
});
