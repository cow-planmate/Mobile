import { StyleSheet } from 'react-native';
import { tokens } from '../../../../theme/tokens';
import { normalize } from '../../../../utils/normalize';

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  body: {
    paddingHorizontal: normalize(16),
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(11),
    borderRadius: normalize(16),
    borderBottomLeftRadius: normalize(5),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
  },
  pendingText: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textSecondary,
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
    alignItems: 'center',
    gap: normalize(8),
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(40),
  },
  emptyTitle: {
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
});
