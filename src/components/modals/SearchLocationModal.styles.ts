import { StyleSheet } from 'react-native';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  text: tokens.colors.text,
  subtext: tokens.colors.textSecondary,
  placeholder: tokens.colors.textTertiary,
  white: tokens.colors.white,
  cell: '#F6F7F9',
  disabled: '#C3C8D0',
};

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    marginHorizontal: normalize(16),
    marginBottom: normalize(10),
    paddingHorizontal: normalize(12),
    height: normalize(42),
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.cell,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontSize: normalize(13.5),
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  chipScroll: {
    flexGrow: 0,
    marginBottom: normalize(8),
  },
  chipRow: {
    paddingHorizontal: normalize(16),
    gap: normalize(6),
  },
  chip: {
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    borderRadius: tokens.radius.round,
    backgroundColor: COLORS.cell,
  },
  chipActive: {
    backgroundColor: tokens.colors.primaryTint,
  },
  chipText: {
    fontSize: normalize(12.5),
    fontFamily: FONTS.medium,
    color: COLORS.subtext,
  },
  chipTextActive: {
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  emptyContainer: {
    paddingVertical: normalize(32),
    alignItems: 'center',
  },
  gridScroll: {
    paddingHorizontal: normalize(13),
    paddingBottom: normalize(4),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // 셀 안쪽 여백으로 간격을 만들어 4열이 정확히 맞아떨어지게 한다.
  gridCell: {
    width: '25%',
    padding: normalize(4),
  },
  // 고른 칸의 테두리가 생겨도 크기가 변하지 않도록 투명 테두리를 미리 둔다.
  cell: {
    backgroundColor: COLORS.cell,
    minHeight: normalize(42),
    paddingHorizontal: normalize(4),
    borderRadius: normalize(12),
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: tokens.colors.primaryTint,
    borderColor: COLORS.primary,
  },
  cellText: {
    fontSize: normalize(13.5),
    fontFamily: FONTS.medium,
    color: COLORS.subtext,
  },
  cellTextSelected: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },

  inlineLoaderContainer: {
    paddingVertical: normalize(40),
    alignItems: 'center',
    gap: normalize(8),
  },
  loaderText: {
    fontSize: normalize(12.5),
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
  },
});
