import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/normalize';
import { tokens } from '../../../theme/tokens';

export const COLORS = {
  text: tokens.colors.text,
  placeholder: tokens.colors.textTertiary,
  border: tokens.colors.border,
  surface: tokens.colors.borderLight,
};

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const styles = StyleSheet.create({
  counterSection: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: normalize(14),
  },
  counterLabelContainer: {
    flexDirection: 'column',
  },
  counterLabel: {
    fontSize: normalize(15),
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: COLORS.text,
  },
  counterSubLabel: {
    fontSize: normalize(11.5),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    color: COLORS.placeholder,
    marginTop: normalize(2),
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 테두리 없는 둥근 회색 면. 못 누르는 단추는 투명도만 낮춰 자리를 남긴다.
  counterButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.pageGround,
  },
  counterButtonDisabled: {
    opacity: 0.55,
  },
  counterGlyph: {
    fontSize: normalize(16),
    lineHeight: normalize(20),
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  counterGlyphDisabled: {
    color: COLORS.placeholder,
  },
  counterValue: {
    fontSize: normalize(18),
    minWidth: normalize(38),
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surface,
    width: '100%',
  },
});
