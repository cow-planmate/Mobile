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
    paddingBottom: normalize(40),
  },

  // [변경] 상단 버튼 네비게이션 영역
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // 오른쪽 정렬
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? normalize(16) : normalize(8),
    paddingHorizontal: normalize(24),
    marginBottom: normalize(12), // 인사말과의 간격
  },

  // [변경] 버튼 그룹
  headerButtons: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  iconButton: {
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
  },

  // [변경] 인사말 영역 (단독 배치)
  greetingSection: {
    paddingHorizontal: normalize(24),
    marginBottom: normalize(32), // 입력 카드와의 간격 확장 (시원한 느낌)
  },
  headerGreeting: {
    fontSize: normalize(28),
    color: theme.colors.text,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: -0.5,
    lineHeight: normalize(36), // 줄간격 살짝 여유 있게
  },
  headerNickname: {
    color: theme.colors.primary,
  },

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
    height: normalize(68), // 높이를 살짝 줄여서(72->68) 밀도감 조정
    borderBottomWidth: 3, // 테두리 두께
    borderBottomColor: theme.colors.border, // 더 연한 색상 사용
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
    fontSize: normalize(11),
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.semibold,
    marginBottom: normalize(4),
    letterSpacing: -0.2,
  },
  valueText: {
    fontSize: normalize(16),
    color: theme.colors.text,
    fontWeight: theme.typography.weight.medium,
    letterSpacing: -0.5,
  },
  placeholderText: {
    fontSize: normalize(16),
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
    borderRadius: 12, // [변경] 16 -> 12 (조금 더 단정한 느낌)
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
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
