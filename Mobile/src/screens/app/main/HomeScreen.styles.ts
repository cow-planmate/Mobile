import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';
import { theme } from '../../../theme/theme';
import { normalize } from '../../../utils/normalize';

export const COLORS = theme.colors;

export const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // [NEW] Top Header Area (planMate logo + menu)
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(12),
    marginTop: Platform.OS === 'ios' ? normalize(44) : normalize(24), // 스마트폰 상태바 높이 고려하여 아래로 이동
    backgroundColor: 'transparent', // 배경색을 투명으로 변경하여 일관성 유지
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
  },
  userAvatar: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: '#900',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // [NEW] Hero Section with Background Image
  heroSection: {
    width: '100%',
    height: normalize(185), // 세로 간격 살짝 증가 (160 -> 185)
    backgroundColor: '#E5E7EB',
    justifyContent: 'flex-end',
    paddingBottom: normalize(48), // 텍스트 위치 위로 조정 (32 -> 48)
    paddingHorizontal: normalize(20),
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // Subtle dark overlay for text legibility
  },
  heroTitle: {
    fontSize: normalize(28), // 텍스트 크기 살짝 증가 (24 -> 28)
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: theme.colors.white,
    lineHeight: normalize(36), // 크기 증가에 따른 줄 간격 조정
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // [NEW] Main Action Card (White portion)
  actionContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 0, // 둥근 모서리 삭제
    borderTopRightRadius: 0, // 둥근 모서리 삭제
    marginTop: -normalize(40), // 위로 더 늘림 (-20 -> -40)
    paddingHorizontal: normalize(20),
    paddingTop: normalize(24),
  },
  cardWrapper: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: normalize(20),
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  inputRow: {
    paddingVertical: normalize(16),
    borderBottomWidth: 3, // 구분선 굵기를 3px로 수정
    borderBottomColor: '#EEEEEE',
  },
  inputRowLast: {
    borderBottomWidth: 0,
    paddingBottom: normalize(24),
  },
  label: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    color: '#868B94',
    marginBottom: normalize(8),
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    fontSize: normalize(16),
    fontFamily: FONTS.medium, // bold -> medium으로 변경
    color: theme.colors.text,
  },
  placeholderText: {
    fontSize: normalize(16),
    fontFamily: FONTS.medium, // bold -> medium으로 변경
    color: '#D1D5DB',
  },
  submitButton: {
    backgroundColor: '#1344FF',
    height: normalize(52),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(8),
  },
  submitButtonText: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: theme.colors.white,
  },

  arrowContainer: {
    marginLeft: normalize(8),
  },

  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  submitButtonTextTwo: {
    fontSize: theme.typography.size.m,
    fontFamily: FONTS.semibold,
    color: theme.colors.white,
  },
  submitButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },

  labelError: {
    color: theme.colors.danger,
  },
});
