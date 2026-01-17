import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';
import { theme } from '../../../theme/theme';

const { width } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = theme.colors;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? normalize(40) : normalize(20),
    paddingBottom: normalize(40),
  },
  headerTopArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: normalize(12),
    marginBottom: normalize(40),
    paddingHorizontal: normalize(24),
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: normalize(24),
  },
  headerGreeting: {
    fontSize: normalize(28),
    color: theme.colors.text,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: -0.5,
    lineHeight: normalize(34),
  },
  headerNickname: {
    color: theme.colors.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: normalize(12),
    marginTop: normalize(4), // visual alignment with text cap height
  },
  iconButton: {
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Removed old headerSlogan and headerIcon styles
  whiteSection: {
    flex: 1,
    paddingHorizontal: normalize(24),
    backgroundColor: theme.colors.background,
  },
  inputCard: {
    backgroundColor: theme.colors.background,
    marginBottom: normalize(40),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(72), // Adjusted for better spacing
    borderBottomWidth: 1.5,
    borderBottomColor: '#E0E0E0',
  },
  inputRowLast: {
    borderBottomWidth: 0,
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconContainer: {
    width: normalize(24),
    height: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(16),
  },
  iconContainerFilled: {},
  iconContainerError: {},

  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  label: {
    fontSize: normalize(11), // 11pt Semi-bold as requested
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.semibold,
    marginBottom: normalize(4),
    letterSpacing: -0.2,
  },
  valueText: {
    fontSize: normalize(16), // 16pt Medium #1C1C1E
    color: theme.colors.text,
    fontWeight: theme.typography.weight.medium,
    letterSpacing: -0.5,
  },
  placeholderText: {
    fontSize: normalize(16), // 16pt Regular #C7C7CC
    color: theme.colors.textTertiary,
    fontWeight: theme.typography.weight.regular,
    letterSpacing: -0.5,
  },

  arrowContainer: {
    marginLeft: normalize(8),
  },

  submitButton: {
    width: '100%',
    height: normalize(56),
    borderRadius: 16, // More rounded as requested
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1344FF', // Fixed color
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  submitButtonText: {
    fontSize: theme.typography.size.m,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.white,
  },
  submitButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },

  labelError: {
    color: theme.colors.danger,
  },
});
