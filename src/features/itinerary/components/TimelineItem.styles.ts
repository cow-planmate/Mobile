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
  cardContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 0,
    alignItems: 'stretch',
  },
  // 시안 D: 플로팅 인디케이터 & 개별 소프트 버튼
  card: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    paddingLeft: 8,
    paddingRight: 9,
    paddingVertical: 8,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardCompact: {
    paddingVertical: 2,
    paddingLeft: 7,
    paddingRight: 8,
  },
  floatingAccentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
    marginRight: 9,
    marginVertical: 1,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
    minWidth: 0,
  },
  compactSingleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  nameText: {
    fontSize: 14.5,
    fontFamily: FONTS.semibold,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  nameTextCompact: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 2,
  },
  miniTagText: {
    fontSize: 10.5,
    fontFamily: FONTS.semibold,
  },
  metaText: {
    fontSize: 11.5,
    fontFamily: FONTS.medium,
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
  metaTextCompact: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
  memoText: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    lineHeight: 15.5,
    marginTop: 2,
    color: '#64748B',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 6,
  },
  actionButton: {
    width: 25,
    height: 25,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonCompact: {
    width: 25,
    height: 25,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
  },
  actionButtonDisabled: {
    opacity: 0.35,
  },
});
