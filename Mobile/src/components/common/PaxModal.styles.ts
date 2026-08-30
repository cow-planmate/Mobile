import { StyleSheet } from 'react-native';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

export const COLORS = {
  primary: tokens.colors.primary,
  text: tokens.colors.text,
  placeholder: tokens.colors.textTertiary,
  white: tokens.colors.white,
  border: tokens.colors.border,
  surface: tokens.colors.borderLight,
  overlay: 'rgba(12, 15, 20, 0.28)',
};

export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const styles = StyleSheet.create({
  // 여행지 시트와 동일한 틀을 쓴다.
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.white,
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
