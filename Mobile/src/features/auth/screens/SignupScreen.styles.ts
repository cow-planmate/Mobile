import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

export const { width, height } = Dimensions.get('window');
export const normalize = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / 360)));

export const COLORS = {
  primary: '#1344FF',
  primaryDark: '#0F36D6',
  lightGray: '#F3F4F6',
  gray: '#E5E7EB',
  darkGray: '#9CA3AF',
  text: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  success: '#34C759',
  error: '#FF3B30',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
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
    gap: normalize(12),
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
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  progressSegment: {
    flex: 1,
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: COLORS.border,
  },
  progressSegmentOn: {
    backgroundColor: COLORS.primary,
  },
  progressCount: {
    fontSize: normalize(13),
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    lineHeight: normalize(18),
    color: COLORS.textSecondary,
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
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
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  inputLocked: { backgroundColor: COLORS.surface },

  label: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(16),
    marginBottom: normalize(2),
  },
  authInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
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
  authInputPlaceholder: { color: COLORS.textSecondary },
  authValue: {
    fontSize: normalize(16),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(24),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
  },

  /** 아이콘 전용 버튼은 48dp를 채운다 */
  eyeButton: {
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(-10),
  },

  /* ── 필드에 붙는 인라인 버튼 ── */
  inlineButton: {
    height: normalize(52),
    paddingHorizontal: normalize(16),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minWidth: normalize(84),
  },
  inlineButtonDisabled: { backgroundColor: COLORS.gray },
  inlineButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    fontSize: normalize(14),
    lineHeight: normalize(18),
  },
  editButton: {
    height: normalize(52),
    paddingHorizontal: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: normalize(52),
  },
  editButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    fontSize: normalize(14),
    lineHeight: normalize(18),
  },

  /* ── 타이머 · 재전송 ── */
  timerText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    fontSize: normalize(14),
    lineHeight: normalize(18),
  },
  timerTextExpired: { color: COLORS.error },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(4),
  },
  resendHint: {
    fontSize: normalize(13),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: normalize(18),
  },
  resendButton: {
    paddingVertical: normalize(13),
    paddingHorizontal: normalize(8),
  },
  resendButtonText: {
    fontSize: normalize(13),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(18),
    color: COLORS.primary,
  },
  resendButtonTextDisabled: { color: COLORS.textSecondary },

  /* ── 상태 한 줄 (닉네임 · 인증 완료) ── */
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginTop: normalize(8),
    paddingHorizontal: normalize(2),
  },
  statusTextOk: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(18),
    color: COLORS.success,
  },
  statusTextError: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(18),
    color: COLORS.error,
  },
  statusTextMuted: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(18),
    color: COLORS.textSecondary,
  },

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

  /* ── 비밀번호 조건 ── */
  requirementsContainer: {
    marginTop: normalize(12),
    paddingHorizontal: normalize(2),
    gap: normalize(6),
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  requirementText: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(18),
  },

  /* ── 성별 ── */
  genderInputContainer: { justifyContent: 'flex-start' },
  genderContainer: {
    flexDirection: 'row',
    gap: normalize(12),
    marginTop: normalize(6),
  },
  genderButton: {
    flex: 1,
    minHeight: normalize(44),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
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

  /* ── 약관 동의 — 체크박스와 보기 링크를 분리한다 ── */
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(12),
  },
  checkboxHit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    minHeight: normalize(48),
    paddingRight: normalize(8),
  },
  checkbox: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  agreementText: {
    flex: 1,
    fontSize: normalize(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: normalize(20),
  },
  requiredText: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  agreementViewButton: {
    minHeight: normalize(48),
    paddingHorizontal: normalize(10),
    justifyContent: 'center',
  },
  agreementViewText: {
    fontSize: normalize(14),
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    lineHeight: normalize(20),
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },

  /* ── 하단 ── */
  footer: {
    paddingHorizontal: normalize(24),
    paddingTop: normalize(12),
    backgroundColor: COLORS.white,
  },
  /* ── Privacy Policy Modal ── */
  privacyOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalBackground,
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
  privacyScroll: { marginBottom: normalize(16) },
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
});
