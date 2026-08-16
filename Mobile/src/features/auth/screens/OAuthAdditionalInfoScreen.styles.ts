import { StyleSheet } from 'react-native';
import { COLORS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../utils/normalize';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flex1: { flex: 1 },

  /* ── 헤더 — 뒤로가기는 항상 왼쪽 ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
   * 테두리 굵기를 상태와 무관하게 1.5로 고정한다. 포커스될 때만 굵어지면
   * 박스 크기가 함께 바뀌어 입력 중에 글자가 흔들린다.
   * 색은 AuthFieldBox가 상태에 따라 전환한다.
   */
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
  authValuePlaceholder: { color: COLORS.textSecondary },

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

  /* ── 성별 ── */
  /** 박스 밖에 놓이는 그룹 라벨. 입력 칸 안의 라벨과 크기를 맞춘다. */
  groupLabel: {
    fontSize: sp(TYPO.caption.fontSize),
    color: COLORS.textSecondary,
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
    paddingHorizontal: sf(2),
  },
  genderContainer: {
    flexDirection: 'row',
    gap: sf(12),
    marginTop: sf(6),
  },
  genderButton: {
    flex: 1,
    minHeight: sf(44),
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceRaised,
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
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.textSecondary,
  },
  genderButtonTextSelected: { color: COLORS.onPrimary },

  /* ── 하단 ── */
  footer: {
    paddingHorizontal: sf(24),
    paddingTop: sf(12),
    backgroundColor: COLORS.surfaceRaised,
  },
});
