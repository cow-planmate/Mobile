import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export const COLORS = tokens.colors;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    height: normalize(56),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarButton: {
    width: normalize(40),
    height: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.text,
  },
  submitButton: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.white,
  },

  body: {
    padding: normalize(16),
    gap: normalize(16),
  },

  fieldLabel: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.semibold,
    color: COLORS.textLabel,
    marginBottom: normalize(7),
  },

  boardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(7),
  },
  boardChip: {
    paddingHorizontal: normalize(13),
    paddingVertical: normalize(7),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  boardChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  boardChipText: {
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.textSecondary,
  },
  boardChipTextActive: {
    color: COLORS.white,
  },

  input: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.text,
  },
  contentInput: {
    minHeight: normalize(220),
    textAlignVertical: 'top',
    lineHeight: normalize(21),
  },

  suggestionList: {
    marginTop: normalize(6),
    borderRadius: tokens.radius.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(9),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  suggestionName: {
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    color: COLORS.text,
  },
  suggestionAddress: {
    marginTop: normalize(2),
    fontSize: normalize(11),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },

  hint: {
    marginTop: normalize(6),
    fontSize: normalize(11),
    lineHeight: normalize(16),
    fontFamily: tokens.fontFamily.regular,
    color: COLORS.textTertiary,
  },

  // 평점 — 별은 노랑으로 채운다. 목록의 평점 배지가 이미 금색 별이라
  // 입력에서 회색을 쓰면 같은 값이 두 화면에서 다른 색이 된다.
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(2),
  },
  // 숫자는 별과 같은 노랑으로 두되 흰 바탕 위에서는 안 읽힌다(1.6:1).
  // 목록의 평점 배지와 같은 연노랑 알약에 얹어 4.9:1을 지킨다.
  ratingPill: {
    marginLeft: normalize(8),
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(2),
    borderRadius: tokens.radius.s,
    backgroundColor: tokens.tones.rating.bg,
  },
  ratingPillText: {
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.tones.rating.fg,
  },

  // 작성 팁 — 웹 GuidelineSection 자리
  tipsBox: {
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: tokens.colors.primaryTint,
    borderRadius: tokens.radius.l,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(13),
  },
  tipsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(7),
  },
  tipsTitle: {
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.bold,
    color: COLORS.primary,
  },
  tipRow: {
    flexDirection: 'row',
    gap: normalize(6),
  },
  tipText: {
    flex: 1,
    fontSize: normalize(12.5),
    fontFamily: tokens.fontFamily.regular,
    color: '#3F5BB5',
    lineHeight: normalize(20),
  },
  tipDot: {
    fontSize: normalize(12.5),
    color: '#3F5BB5',
    lineHeight: normalize(20),
  },
});

/** 채운 별과 빈 별. tokens.tones.rating(#FEFCE8 · #A16207) 계단에 밝은 한 칸을 더한 값이다. */
export const STAR_ON = '#FACC15';
export const STAR_OFF = '#D1D5DB';
