import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

export const { width } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  primaryDark: '#0F36D6',
  gray: '#E5E7EB',
  darkGray: '#9CA3AF',
  text: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  error: '#FF3B30',
  surface: '#F9FAFB',
  border: '#E5E7EB',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: normalize(24),
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: normalize(32),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: normalize(32),
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    padding: normalize(12),
    borderRadius: 8,
    marginBottom: normalize(18),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: normalize(14),
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(14),
  },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(8),
    fontWeight: '600',
    marginLeft: normalize(4),
  },
  input: {
    width: '100%',
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  passwordContainer: {
    width: '100%',
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: normalize(16),
    color: COLORS.text,
  },
  passwordToggleText: {
    color: COLORS.textSecondary,
    fontSize: normalize(14),
    fontWeight: '600',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  submitButton: {
    width: '100%',
    height: normalize(52),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: normalize(24),
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  submitButtonText: {
    fontSize: normalize(17),
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: normalize(28),
    gap: normalize(24),
  },
  separatorWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  separator: {
    color: COLORS.darkGray,
    fontSize: normalize(14),
    fontWeight: '400',
  },
  linkButton: {
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    borderRadius: 8,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: normalize(15),
    fontWeight: '500',
  },
});
