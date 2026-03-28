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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'android' ? normalize(48) : normalize(10), // 갤럭시 등 안드로이드 상단바 높이 고려
    paddingBottom: normalize(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logo: {
    fontSize: normalize(22),
    fontFamily: FONTS.bold,
    fontWeight: '800',
    color: '#0047FF',
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  headerIconBtn: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(6),
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userNickname: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    color: '#374151',
    marginLeft: normalize(4),
  },
  // [NEW] Hero Section with Background Image
  heroSection: {
    width: '100%',
    height: normalize(180), // 높이를 280에서 180으로 대폭 축소
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: normalize(24),
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroTitle: {
    fontSize: normalize(28),
    fontFamily: FONTS.bold,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: normalize(38),
    marginTop: normalize(10), // 높이 축소에 맞춰 마진도 소폭 조정
  },

  // [NEW] Main Action Card (White portion)
  actionContainer: {
    backgroundColor: 'transparent',
    marginTop: normalize(16), // -normalize(40)에서 양수 값으로 변경하여 겹침 제거 및 간격 추가
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(40),
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: normalize(20),
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  inputRow: {
    paddingVertical: normalize(12),
  },
  inputRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  label: {
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    color: '#9CA3AF',
    marginBottom: normalize(6),
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: normalize(10),
  },
  valueText: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: FONTS.medium,
    color: '#1F2937',
  },
  placeholderText: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: FONTS.medium,
    color: '#D1D5DB',
  },
  rowIcon: {
    marginLeft: normalize(8),
  },
  submitButton: {
    backgroundColor: '#1B52FF',
    height: normalize(48),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(20),
  },
  submitButtonText: {
    fontSize: normalize(16),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  labelError: {
    color: theme.colors.danger,
  },
});
