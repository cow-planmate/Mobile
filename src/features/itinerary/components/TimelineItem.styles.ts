import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  card: tokens.colors.white,
  text: tokens.colors.text,
  placeholder: tokens.colors.textTertiary,
  border: tokens.colors.border,
  error: tokens.tones.danger.fg,
  surface: tokens.colors.borderLight,
};

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const CATEGORY_COLORS = {
  0: {
    border: '#84cc16',
    bg: '#f7fee7',
    borderTint: '#d9f99d',
    badgeBg: '#ecfccb',
    badgeText: '#3f6212',
    textMain: '#14532d',
    textSub: '#4d7c0f',
  },
  1: {
    border: '#f97316',
    bg: '#fff7ed',
    borderTint: '#fed7aa',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
    textMain: '#7c2d12',
    textSub: '#c2410c',
  },
  2: {
    border: '#3b82f6',
    bg: '#eff6ff',
    borderTint: '#bfdbfe',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
    textMain: '#1e3a8a',
    textSub: '#1d4ed8',
  },
  3: {
    border: '#8b5cf6',
    bg: '#f5f3ff',
    borderTint: '#ddd6fe',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
    textMain: '#4c1d95',
    textSub: '#6d28d9',
  },
  4: {
    border: tokens.colors.textSecondary,
    bg: tokens.colors.surface,
    borderTint: tokens.colors.border,
    badgeBg: '#f1f5f9',
    badgeText: '#475569',
    textMain: tokens.colors.text,
    textSub: tokens.colors.textSecondary,
  },
};

export const styles = StyleSheet.create({
  // 위아래 2px씩 비워 붙어 있는 두 블록 사이에 틈을 만든다. 블록 높이는 머무는 시간 그대로다.
  cardContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 0,
    paddingVertical: 2,
    alignItems: 'stretch',
  },
  // 흰 면 하나로 끝낸다. 테두리·그림자·배지 없이 글자 굵기와 막대 하나로 위계를 만든다.
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: tokens.radius.l,
    paddingLeft: 12,
    paddingRight: 4,
    overflow: 'hidden',
    backgroundColor: tokens.colors.white,
  },
  // 15분 칸처럼 낮은 블록은 한 줄로 가운데에 놓는다.
  cardCompact: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  head: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
    marginTop: 12,
  },
  headCompact: {
    marginTop: 0,
  },
  accentBar: {
    width: 3,
    borderRadius: 999,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    minWidth: 0,
  },
  nameText: {
    fontSize: 14.5,
    fontFamily: FONTS.semibold,
    color: tokens.colors.text,
    letterSpacing: -0.3,
  },
  nameTextCompact: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: tokens.colors.text,
    letterSpacing: -0.2,
  },
  metaText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: tokens.colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  memoText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
    marginTop: 2,
    color: tokens.colors.textMuted,
  },
  actionContainer: {
    marginLeft: 4,
    marginTop: 4,
  },
  actionCompact: {
    marginTop: 0,
  },
  moreButton: {
    width: 32,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
