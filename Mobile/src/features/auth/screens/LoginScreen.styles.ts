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

export const FONTS = {
  regular: 'Pretendard Variable',
  medium: 'Pretendard Variable',
  semibold: 'Pretendard Variable',
  bold: 'Pretendard Variable',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  /**
   * 키보드가 뜨면 화면이 줄어든다. 스크롤이 없으면 아래쪽(소셜 로그인·회원가입
   * 링크)에 손이 닿지 않으므로 스크롤 안에 담고, 여유가 있을 때만 세로 가운데
   * 정렬이 되도록 flexGrow로 늘린다.
   */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(24),
  },
  title: {
    fontSize: normalize(32),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(40),
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: normalize(32),
    color: COLORS.text,
  },
  inputGroup: {
    width: '100%',
    marginBottom: normalize(14),
  },
  /**
   * 테두리 굵기를 상태와 무관하게 1.5로 고정한다. 포커스될 때만 굵어지면
   * 박스 크기가 함께 바뀌어 입력 중에 글자가 흔들린다.
   */
  inputContainer: {
    width: '100%',
    minHeight: normalize(68),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  label: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    marginBottom: normalize(2),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(16),
  },
  input: {
    width: '100%',
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(20),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
    height: normalize(28),
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  passwordContainer: {
    width: '100%',
    minHeight: normalize(68),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingLeft: normalize(16),
    paddingRight: normalize(4),
    paddingVertical: normalize(10),
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordContent: {
    flex: 1,
    justifyContent: 'center',
  },
  passwordInput: {
    width: '100%',
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(20),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
    height: normalize(28),
  },
  /** 아이콘 전용 버튼은 48dp를 채운다 (Material / One UI 최소 터치 영역) */
  eyeButton: {
    width: normalize(48),
    height: normalize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── 인라인 오류 ── */
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(6),
    marginTop: normalize(8),
    paddingHorizontal: normalize(2),
  },
  errorIcon: {
    marginTop: normalize(2),
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(18),
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
  submitButtonPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.99 }],
  },
  submitButtonLoading: {
    backgroundColor: COLORS.primaryDark,
  },
  submitButtonText: {
    fontSize: normalize(17),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(22),
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: normalize(20),
  },
  linkButton: {
    paddingVertical: normalize(13),
    paddingHorizontal: normalize(8),
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: normalize(14),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(18),
  },
  linkTextStrong: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },

  /* ── Social Login ── */
  socialContainer: {
    width: '100%',
    marginTop: normalize(12),
    alignItems: 'center',
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: normalize(14),
  },
  socialDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  socialDividerText: {
    marginHorizontal: normalize(12),
    fontSize: normalize(12),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(16),
    color: COLORS.textSecondary,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: normalize(20),
  },
  socialButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  socialButtonPressed: {
    backgroundColor: COLORS.surface,
    transform: [{ scale: 0.96 }],
  },

  /* ── Privacy Policy Link ── */
  privacyLinkButton: {
    alignSelf: 'center',
    marginTop: normalize(20),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(12),
  },
  privacyLinkText: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(16),
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  /* ── Privacy Policy Modal ── */
  privacyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(16),
  },
  privacyModal: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: normalize(20),
  },
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  privacyTitle: {
    fontSize: normalize(18),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(24),
    color: COLORS.text,
  },
  privacyCloseIcon: {
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(-10),
  },
  privacyScroll: {
    marginBottom: normalize(16),
  },
  privacySectionTitle: {
    fontSize: normalize(13),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(18),
    color: COLORS.text,
    marginTop: normalize(12),
    marginBottom: normalize(6),
  },
  privacyBullet: {
    fontSize: normalize(12),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: normalize(18),
    marginBottom: normalize(4),
    paddingLeft: normalize(4),
  },
  privacyCloseButton: {
    height: normalize(52),
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCloseButtonText: {
    fontSize: normalize(15),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(20),
    color: COLORS.white,
  },

  /* ── SNS WebView ── */
  snsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  snsHeader: {
    height: normalize(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: normalize(8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  snsCloseButton: {
    width: normalize(48),
    height: normalize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  snsLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
