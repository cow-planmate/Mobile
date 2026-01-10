import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

export const { width } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  secondary: '#5AC8FA',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  success: '#34C759',
  error: '#FF3B30',
  lightBlue: '#e6f0ff',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(20),
    paddingBottom: normalize(10),
    marginTop: normalize(10),
  },
  stepIndicator: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  stepText: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scrollContent: {
    padding: normalize(24),
    paddingBottom: normalize(100),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: normalize(8),
    textAlign: 'left',
  },
  description: {
    fontSize: normalize(15),
    color: COLORS.darkGray,
    marginBottom: normalize(32),
    textAlign: 'left',
    lineHeight: normalize(22),
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(24),
  },
  label: {
    fontSize: normalize(14),
    color: COLORS.text,
    marginBottom: normalize(8),
    fontWeight: 'bold',
    marginLeft: normalize(4),
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  flex1: { flex: 1 },
  input: {
    height: normalize(52),
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    fontSize: normalize(16),
    backgroundColor: COLORS.white,
    color: COLORS.text,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 0,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.darkGray,
  },
  inlineButton: {
    height: normalize(52),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minWidth: normalize(80),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: { backgroundColor: COLORS.darkGray },
  inlineButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  codeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  innerInput: {
    flex: 1,
    fontSize: normalize(16),
    color: COLORS.text,
    height: '100%',
    padding: 0,
  },
  timerText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: normalize(14),
  },

  tempPasswordContainer: {
    marginTop: normalize(20),
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: COLORS.white,
    padding: normalize(20),
    borderRadius: normalize(12),
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  infoBoxText: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  infoBoxSubText: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: normalize(20),
  },

  footer: {
    padding: normalize(24),
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'flex-end',
  },
  submitButton: {
    width: '100%',
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,

    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  submitButtonText: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  retryButton: {
    alignItems: 'center',
    padding: normalize(12),
    marginTop: normalize(8),
  },
  retryButtonText: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    padding: normalize(12),
    marginTop: normalize(12),
  },
  backButtonText: {
    fontSize: normalize(14),
    color: COLORS.darkGray,
    textDecorationLine: 'underline',
  },
});
