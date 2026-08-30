import { StyleSheet } from 'react-native';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

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
  counterButton: {
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterButtonDisabled: {
    borderColor: COLORS.surface,
  },
  counterGlyph: {
    fontSize: normalize(16),
    lineHeight: normalize(20),
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  counterGlyphDisabled: {
    color: COLORS.border,
  },
  counterValue: {
    fontSize: normalize(18),
    minWidth: normalize(38),
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surface,
    width: '100%',
  },
});
