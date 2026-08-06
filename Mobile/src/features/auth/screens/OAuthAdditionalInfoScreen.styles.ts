import { StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { RADIUS } from '../authTokens';

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
  success: '#34C759',
  error: '#FF3B30',
  surface: '#F9FAFB',
  border: '#E5E7EB',
};

export const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  flex1: { flex: 1 },

  /* ── 헤더 — 뒤로가기는 항상 왼쪽 ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(56),
    paddingLeft: normalize(4),
    paddingRight: normalize(20),
  },
  headerBackButton: {
    width: normalize(48),
    height: normalize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContainer: {
    paddingHorizontal: normalize(24),
    paddingTop: normalize(16),
    paddingBottom: normalize(32),
  },
  title: {
    fontSize: normalize(32),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(40),
    letterSpacing: 0.2,
    color: COLORS.text,
    marginBottom: normalize(8),
  },
  description: {
    fontSize: normalize(15),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(24),
    letterSpacing: 0.1,
    color: COLORS.textSecondary,
    marginBottom: normalize(32),
  },

  /* ── 입력 ── */
  inputGroup: { marginBottom: normalize(16) },
  /**
   * 테두리 굵기를 상태와 무관하게 1.5로 고정한다. 포커스될 때만 굵어지면
   * 박스 크기가 함께 바뀌어 입력 중에 글자가 흔들린다.
   * 색은 AuthFieldBox가 상태에 따라 전환한다.
   */
  authInputContainer: {
    width: '100%',
    minHeight: normalize(68),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  label: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(16),
    marginBottom: normalize(2),
  },
  authInput: {
    flex: 1,
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(20),
    color: COLORS.text,
    height: normalize(28),
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  authValue: {
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(24),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
  },
  authValuePlaceholder: { color: COLORS.textSecondary },

  /* ── 인라인 오류 ── */
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(6),
    marginTop: normalize(8),
    paddingHorizontal: normalize(2),
  },
  errorIcon: { marginTop: normalize(2) },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(18),
  },

  /* ── 성별 ── */
  /** 박스 밖에 놓이는 그룹 라벨. 입력 칸 안의 라벨과 크기를 맞춘다. */
  groupLabel: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(16),
    paddingHorizontal: normalize(2),
  },
  genderContainer: {
    flexDirection: 'row',
    gap: normalize(12),
    marginTop: normalize(6),
  },
  genderButton: {
    flex: 1,
    minHeight: normalize(44),
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  /** 감싸던 박스를 없앤 자리. 오류는 버튼 테두리가 대신 알린다. */
  genderButtonError: { borderColor: COLORS.error },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: normalize(16),
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    lineHeight: normalize(20),
    color: COLORS.textSecondary,
  },
  genderButtonTextSelected: { color: COLORS.white },

  /* ── 하단 ── */
  footer: {
    paddingHorizontal: normalize(24),
    paddingTop: normalize(12),
    backgroundColor: COLORS.white,
  },
});
