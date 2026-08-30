import { StyleSheet } from 'react-native';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  background: tokens.colors.white,
  text: tokens.colors.text,
  subtext: tokens.colors.textSecondary,
  placeholder: tokens.colors.textTertiary,
  border: tokens.colors.border,
  white: tokens.colors.white,
  overlay: 'rgba(12, 15, 20, 0.28)',
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
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },

  // 28곳이 스크롤 없이 들어가므로 시트는 내용 높이만큼만 차지한다.
  sheet: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: '82%',
    paddingBottom: normalize(10),
  },
  grabber: {
    width: normalize(36),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: normalize(9),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(10),
    paddingBottom: normalize(8),
  },
  sheetTitle: {
    fontSize: normalize(14.5),
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sheetDone: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
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
