import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  lightGray: '#F0F0F0',
  gray: '#E5E5EA',
  darkGray: '#8E8E93',
  text: '#1C1C1E',
  white: '#FFFFFF',
  lightBlue: '#e6f0ff',
  shadow: '#1344FF',
  iconBg: '#F5F7FF',
  success: '#34C759',
  placeholderLight: '#C7C7CC',
  error: '#FF3B30',
  errorLight: '#FFE5E5',
  disabled: '#A8B5D1',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: normalize(30),
    paddingBottom: 0,
  },
  headerTopArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: normalize(24),
    marginTop: normalize(10),
    paddingHorizontal: normalize(20),
  },
  headerSlogan: {
    fontSize: normalize(12),
    color: COLORS.darkGray,
    fontWeight: '500',
    marginTop: normalize(20),
    marginBottom: normalize(4),
  },
  headerGreeting: {
    fontSize: normalize(18),
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerNickname: {
    color: COLORS.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  iconButton: {
    width: normalize(36),
    height: normalize(36),
    padding: normalize(6),
    backgroundColor: COLORS.white,
    borderRadius: normalize(18),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: normalize(18),
    textAlign: 'center',
  },
  whiteSection: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: normalize(32),
    borderTopRightRadius: normalize(32),
    paddingHorizontal: normalize(20),
    paddingTop: normalize(32),
    paddingBottom: normalize(40),
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },

  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: normalize(20),
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(16),

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: normalize(24),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(78),
    paddingVertical: normalize(4),
  },
  inputRowLast: {
    paddingBottom: normalize(4),
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
    backgroundColor: COLORS.iconBg,
    borderRadius: normalize(12),
  },
  iconContainerFilled: {
    backgroundColor: COLORS.lightBlue,
  },
  icon: {
    fontSize: normalize(22),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  textContainerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  label: {
    fontSize: normalize(12),
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  valueText: {
    fontSize: normalize(15),
    color: COLORS.text,
    fontWeight: '700',
    lineHeight: normalize(20),
  },
  placeholderText: {
    fontSize: normalize(15),
    color: COLORS.placeholderLight,
    fontWeight: '400',
    lineHeight: normalize(20),
  },
  arrowContainer: {
    height: '100%',
    paddingLeft: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: normalize(22),
    color: COLORS.gray,
    fontWeight: '300',
  },
  checkIcon: {
    fontSize: normalize(16),
    color: COLORS.success,
    fontWeight: 'bold',
  },
  submitButton: {
    width: '100%',
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  submitButtonTextDisabled: {
    color: COLORS.white,
    opacity: 0.8,
  },

  iconContainerError: {
    backgroundColor: COLORS.errorLight,
  },
  labelError: {
    color: COLORS.error,
  },
});
