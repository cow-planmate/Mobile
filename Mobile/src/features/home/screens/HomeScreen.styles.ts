import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

export const COLORS = tokens.colors;

export const FONTS = tokens.fontFamily;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  heroSection: {
    width: '100%',
    height: normalize(200),
    backgroundColor: tokens.colors.border,
    justifyContent: 'flex-end',
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(28),
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 40, 0.38)',
  },
  heroTitle: {
    fontSize: normalize(tokens.fontSize.xl),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
    lineHeight: normalize(34),
  },

  actionContainer: {
    marginTop: normalize(-20),
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(40),
  },
  cardWrapper: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radius.xl,
    padding: normalize(20),
    ...tokens.shadows.md,
  },
  inputRow: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    paddingVertical: normalize(12),
    marginBottom: normalize(12),
  },
  inputRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },

  label: {
    fontSize: normalize(tokens.fontSize.xs),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.textSecondary,
    marginBottom: normalize(6),
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    flex: 1,
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  placeholderText: {
    flex: 1,
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textTertiary,
  },
  rowIcon: {
    marginLeft: normalize(8),
  },
  submitButton: {
    backgroundColor: tokens.colors.primary,
    height: normalize(52),
    borderRadius: tokens.radius.l,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(24),
  },
  submitButtonText: {
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
  submitButtonDisabled: {
    backgroundColor: tokens.colors.borderLight,
  },
  submitButtonTextDisabled: {
    color: tokens.colors.textTertiary,
  },
});
