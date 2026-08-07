import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../design/scale';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flex1: { flex: 1 },

  /* ── 헤더 — 뒤로가기는 항상 왼쪽 ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sf(12),
    height: sf(56),
    paddingLeft: sf(4),
    paddingRight: sf(20),
  },
  headerBackButton: {
    width: sf(48),
    height: sf(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sf(5),
  },
  progressSegment: {
    flex: 1,
    height: sf(4),
    borderRadius: sf(2),
    backgroundColor: COLORS.border,
  },
  progressSegmentOn: { backgroundColor: COLORS.primary },
  progressCount: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
    color: COLORS.textSecondary,
  },

  scrollContainer: {
    paddingHorizontal: sf(24),
    paddingTop: sf(16),
    paddingBottom: sf(32),
  },
  title: {
    fontSize: sp(TYPO.display.fontSize),
    fontFamily: TYPO.display.fontFamily,
    lineHeight: sp(TYPO.display.lineHeight),
    letterSpacing: TYPO.display.letterSpacing,
    color: COLORS.text,
    marginBottom: sf(8),
  },
  description: {
    fontSize: sp(TYPO.body.fontSize),
    fontFamily: TYPO.body.fontFamily,
    lineHeight: sp(TYPO.body.lineHeight),
    letterSpacing: TYPO.body.letterSpacing,
    color: COLORS.textSecondary,
    marginBottom: sf(32),
  },

  /* ── 입력 ── */
  inputGroup: { marginBottom: sf(16) },
  /**
   * 라벨이 테두리 위로 올라가면서 입력 칸 위에 라벨 절반만큼 여백이 생겼다.
   * 가운데 정렬이면 옆의 인증요청 버튼과 4dp 어긋나므로 아래를 맞춘다.
   */
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: sf(8),
  },
  authInputContainer: {
    width: '100%',
    minHeight: sf(52),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: sf(16),
    backgroundColor: COLORS.surfaceRaised,
    justifyContent: 'center',
  },
  inputLocked: { backgroundColor: COLORS.surface },

  authInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sf(8),
  },
  authInput: {
    flex: 1,
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.text,
    height: sf(24),
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  authValue: {
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
  },

  /* ── 필드에 붙는 인라인 버튼 ── */
  inlineButton: {
    height: sf(52),
    paddingHorizontal: sf(16),
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minWidth: sf(84),
  },
  inlineButtonDisabled: { backgroundColor: COLORS.border },
  inlineButtonText: {
    color: COLORS.onPrimary,
    fontFamily: FONTS.bold,
    fontSize: sp(TYPO.body.fontSize),
    lineHeight: sp(TYPO.body.lineHeight),
  },
  editButton: {
    height: sf(52),
    paddingHorizontal: sf(12),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: sf(52),
  },
  editButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontSize: sp(TYPO.body.fontSize),
    lineHeight: sp(TYPO.body.lineHeight),
  },

  /* ── 타이머 · 재전송 ── */
  timerText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.semibold,
    fontSize: sp(TYPO.body.fontSize),
    lineHeight: sp(TYPO.body.lineHeight),
  },
  timerTextExpired: { color: COLORS.error },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sf(4),
  },
  resendHint: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    color: COLORS.textSecondary,
    lineHeight: sp(TYPO.label.lineHeight),
  },
  resendButton: {
    paddingVertical: sf(13),
    paddingHorizontal: sf(8),
  },
  resendButtonText: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
    color: COLORS.primary,
  },
  resendButtonTextDisabled: { color: COLORS.textSecondary },

  /* ── 상태 한 줄 ── */
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sf(6),
    marginTop: sf(8),
    paddingHorizontal: sf(2),
  },
  statusTextOk: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
    color: COLORS.success,
  },

  /* ── 인라인 오류 ── */
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sf(6),
    marginTop: sf(8),
    paddingHorizontal: sf(2),
  },
  errorIcon: { marginTop: sf(2) },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
  },

  /* ── 2단계: 결과 화면 ──
   * 이 단계는 더 이상 입력을 받지 않는다. 인증이 끝나면 임시 비밀번호 발송을
   * 자동으로 시작하고, 그 결과(발송 중 · 완료 · 실패)만 보여준다.
   */
  resultContainer: {
    alignItems: 'center',
    paddingTop: sf(24),
  },
  resultIconWrap: {
    width: sf(72),
    height: sf(72),
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sf(20),
  },
  resultIconWrapSuccess: { backgroundColor: '#E8F8EC' },
  resultIconWrapError: { backgroundColor: '#FEECEB' },
  resultTitle: {
    fontSize: sp(TYPO.headline.fontSize),
    fontFamily: TYPO.headline.fontFamily,
    lineHeight: sp(TYPO.headline.lineHeight),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: sf(8),
  },
  resultBody: {
    fontSize: sp(TYPO.body.fontSize),
    fontFamily: TYPO.body.fontFamily,
    lineHeight: sp(TYPO.body.lineHeight),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultNote: {
    marginTop: sf(20),
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: sf(16),
  },
  resultNoteText: {
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  /* ── 하단 ── */
  footer: {
    paddingHorizontal: sf(24),
    paddingTop: sf(12),
    backgroundColor: COLORS.surfaceRaised,
  },
});
