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
    padding: normalize(3),
  },
  cell: {
    backgroundColor: COLORS.cell,
    paddingVertical: normalize(9),
    paddingHorizontal: normalize(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: COLORS.primary,
  },
  cellText: {
    fontSize: normalize(12.5),
    fontFamily: FONTS.medium,
    color: COLORS.subtext,
  },
  cellTextSelected: {
    fontFamily: FONTS.semibold,
    color: COLORS.white,
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
