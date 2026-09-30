import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: sf(24),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: sf(44),
  },
  logoContainer: {
    marginBottom: sf(40),
    alignItems: 'center',
  },
  logoImage: {
    width: sf(112),
    height: sf(112),
    resizeMode: 'contain',
  },
  title: {
    fontSize: sp(24),
    fontFamily: FONTS.bold,
    lineHeight: sp(32),
    letterSpacing: -0.4,
    color: COLORS.text,
    marginBottom: sf(12),
    textAlign: 'center',
  },
  description: {
    fontSize: sp(15),
    fontFamily: FONTS.regular,
    lineHeight: sp(24),
    letterSpacing: -0.2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: sf(24),
  },
  loginPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sf(16),
  },
  loginActionButton: {
    minHeight: sf(48),
    justifyContent: 'center',
    paddingHorizontal: sf(8),
  },
  loginPromptText: {
    fontSize: sp(14),
    fontFamily: FONTS.regular,
    lineHeight: sp(20),
    color: COLORS.textSecondary,
  },
  loginActionText: {
    fontSize: sp(14),
    fontFamily: FONTS.bold,
    lineHeight: sp(20),
    color: COLORS.primary,
  },
});
