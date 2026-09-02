import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  card: tokens.colors.white,
  text: tokens.colors.text,
  placeholder: tokens.colors.textTertiary,
  border: tokens.colors.border,
  error: '#FF3B30',
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
    textMain: '#064e3b',
    textSub: '#4d7c0f',
  }, 
  1: {
    border: '#f97316',
    bg: '#fff7ed',
    textMain: '#7c2d12',
    textSub: '#c2410c',
  }, 
  2: {
    border: '#3b82f6',
    bg: '#eff6ff',
    textMain: '#1e3a8a',
    textSub: '#1d4ed8',
  }, 
  3: {
    border: '#8b5cf6',
    bg: '#f5f3ff',
    textMain: '#4c1d95',
    textSub: '#6d28d9',
  }, 
  4: {
    border: tokens.colors.textSecondary,
    bg: tokens.colors.surface,
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
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 4,
    padding: 16,
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderWidth: 0,
  },
  cardCompact: {
    paddingVertical: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 0,
    justifyContent: 'center',
    gap: 2,
  },
  nameText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: '#064e3b', 
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#4d7c0f', 
  },
  memoText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 17,
    marginTop: 4,
    opacity: 0.85,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // 누르는 자리를 넓히되 좌우로는 넘기지 않는다. 서로 겹치면 어느 쪽이
  // 눌렸는지 알 수 없어, 지우려다 시간 수정이 열린다.
  actionButton: {
    width: 44,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonCompact: {
    height: 26,
  },
});
