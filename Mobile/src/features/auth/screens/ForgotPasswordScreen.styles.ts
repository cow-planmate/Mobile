import { StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { RADIUS } from '../authTokens';

export const { width } = Dimensions.get('window');
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
  progressSegmentOn: { backgroundColor: COLORS.primary },
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
  /**
   * 라벨이 테두리 위로 올라가면서 입력 칸 위에 라벨 절반만큼 여백이 생겼다.
   * 가운데 정렬이면 옆의 인증요청 버튼과 4dp 어긋나므로 아래를 맞춘다.
   */
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: normalize(8),
  },
  authInputContainer: {
    width: '100%',
    minHeight: normalize(52),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: normalize(16),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  inputLocked: { backgroundColor: COLORS.surface },

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
    height: normalize(24),
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

  /* ── 필드에 붙는 인라인 버튼 ── */
  inlineButton: {
    height: normalize(52),
    paddingHorizontal: normalize(16),
    borderRadius: RADIUS.md,
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

  /* ── 상태 한 줄 ── */
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

  /* ── 2단계: 결과 화면 ──
   * 이 단계는 더 이상 입력을 받지 않는다. 인증이 끝나면 임시 비밀번호 발송을
   * 자동으로 시작하고, 그 결과(발송 중 · 완료 · 실패)만 보여준다.
   */
  resultContainer: {
    alignItems: 'center',
    paddingTop: normalize(24),
  },
  resultIconWrap: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  resultIconWrapSuccess: { backgroundColor: '#E8F8EC' },
  resultIconWrapError: { backgroundColor: '#FEECEB' },
  resultTitle: {
    fontSize: normalize(19),
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: normalize(26),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: normalize(8),
  },
  resultBody: {
    fontSize: normalize(15),
    fontFamily: FONTS.regular,
    fontWeight: '400',
    lineHeight: normalize(23),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultNote: {
    marginTop: normalize(20),
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: normalize(16),
  },
  resultNoteText: {
    fontSize: normalize(13),
    fontFamily: FONTS.medium,
    fontWeight: '500',
    lineHeight: normalize(20),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  /* ── 하단 ── */
  footer: {
    paddingHorizontal: normalize(24),
    paddingTop: normalize(12),
    backgroundColor: COLORS.white,
  },
});
