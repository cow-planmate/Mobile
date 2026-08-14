import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, TYPO } from '../authTokens';
import { sf, sp } from '../../../design/scale';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  /**
   * 키보드가 뜨면 화면이 줄어든다. 스크롤이 없으면 아래쪽(소셜 로그인·회원가입
   * 링크)에 손이 닿지 않으므로 스크롤 안에 담고, 여유가 있을 때만 세로 가운데
   * 정렬이 되도록 flexGrow로 늘린다.
   */
  scroll: {
    flex: 1,
  },
  /**
   * 위에서부터 쌓는다. 세로 가운데 정렬은 오류 배너가 나타나거나 키보드가
   * 오르내릴 때마다 폼 전체가 위아래로 밀려, 방금 보던 칸이 움직인다.
   */
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sf(24),
    paddingTop: sf(32),
    paddingBottom: sf(24),
  },
  /**
   * 제목도 폼과 같은 축에서 시작한다. 가운데 정렬이던 제목은 왼쪽 정렬인
   * 입력 라벨과 축이 어긋나 시선 출발점이 두 개가 된다.
   */
  title: {
    fontSize: sp(TYPO.display.fontSize),
    fontFamily: TYPO.display.fontFamily,
    lineHeight: sp(TYPO.display.lineHeight),
    letterSpacing: TYPO.display.letterSpacing,
    marginBottom: sf(28),
    color: COLORS.text,
  },
  inputGroup: {
    width: '100%',
    marginBottom: sf(14),
  },
  /**
   * 테두리 굵기를 상태와 무관하게 1.5로 고정한다. 포커스될 때만 굵어지면
   * 박스 크기가 함께 바뀌어 입력 중에 글자가 흔들린다.
   */
  inputContainer: {
    width: '100%',
    minHeight: sf(52),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: sf(16),
    backgroundColor: COLORS.surfaceRaised,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
    height: sf(24),
  },
  passwordContainer: {
    width: '100%',
    minHeight: sf(52),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingLeft: sf(16),
    paddingRight: sf(4),
    backgroundColor: COLORS.surfaceRaised,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordContent: {
    flex: 1,
    justifyContent: 'center',
  },
  passwordInput: {
    width: '100%',
    fontSize: sp(TYPO.bodyLg.fontSize),
    fontFamily: TYPO.bodyLg.fontFamily,
    lineHeight: sp(TYPO.bodyLg.lineHeight),
    color: COLORS.text,
    padding: 0,
    includeFontPadding: false,
    height: sf(24),
  },
  /** 아이콘 전용 버튼은 48dp를 채운다 (Material / One UI 최소 터치 영역) */
  eyeButton: {
    width: sf(48),
    height: sf(48),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── 인라인 오류 ── */
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sf(6),
    marginTop: sf(8),
    paddingHorizontal: sf(2),
  },
  errorIcon: {
    marginTop: sf(2),
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: sp(TYPO.label.fontSize),
    fontFamily: TYPO.label.fontFamily,
    lineHeight: sp(TYPO.label.lineHeight),
  },

  /**
   * 비밀번호 칸에 딸린 보조 동선. 칸 오른쪽 끝에 맞춰 두면 입력 흐름을
   * 끊지 않으면서도 눈에 들어온다.
   */
  fieldAssistRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: sf(2),
    marginRight: sf(-8),
  },
  /** 버튼 자체는 AuthSubmitButton이 그린다. 여기서는 간격만 준다. */
  submitButtonSpacing: {
    marginTop: sf(16),
  },
  /** 마지막 사용 수단이 이메일일 때. 소셜 배지와 같은 역할을 폼 쪽에서 한다. */
  lastUsedHint: {
    marginTop: sf(10),
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
  },
  /** 로그인 수단들과 같은 층위의 선택지. 꼬리 문구와 묶지 않는다. */
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: sf(24),
  },
  linkButton: {
    paddingVertical: sf(13),
    paddingHorizontal: sf(8),
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: sp(TYPO.body.fontSize),
    fontFamily: TYPO.body.fontFamily,
    lineHeight: sp(TYPO.body.lineHeight),
  },
  linkTextStrong: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },

  /* ── Social Login ── */
  socialContainer: {
    width: '100%',
    marginTop: sf(12),
    alignItems: 'center',
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: sf(14),
  },
  socialDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  socialDividerText: {
    marginHorizontal: sf(12),
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
    color: COLORS.textSecondary,
  },
  socialButtons: {
    width: '100%',
    gap: sf(10),
  },
  /** One UI 최소 터치 높이(48dp)보다 여유를 둬 라벨과 배지가 눌리기 편하게 한다 */
  socialButton: {
    width: '100%',
    minHeight: sf(52),
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: sf(16),
    gap: sf(10),
  },
  socialButtonText: {
    fontSize: sp(TYPO.button.fontSize),
    fontFamily: TYPO.button.fontFamily,
    lineHeight: sp(TYPO.button.lineHeight),
    color: COLORS.text,
  },
  /** 라벨 중앙 정렬을 깨지 않도록 버튼 오른쪽에 절대 위치로 얹는다 */
  lastUsedBadge: {
    position: 'absolute',
    right: sf(12),
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: sf(8),
    paddingVertical: sf(3),
  },
  lastUsedBadgeText: {
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
    color: COLORS.primary,
  },

  /**
   * ── 화면 바닥 고지 ──
   * 스크롤과 함께 움직이지 않도록 컨테이너 바닥에 붙인다. 선택지 사이에
   * 끼어 있으면 조작으로 오인되고, 스크롤 끝까지 내려야만 보였다.
   */
  footer: {
    paddingTop: sf(4),
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  privacyLinkButton: {
    alignSelf: 'center',
    paddingVertical: sf(10),
    paddingHorizontal: sf(12),
  },
  privacyLinkText: {
    fontSize: sp(TYPO.caption.fontSize),
    fontFamily: TYPO.caption.fontFamily,
    lineHeight: sp(TYPO.caption.lineHeight),
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  /* ── SNS WebView ── */
  snsContainer: {
    flex: 1,
    backgroundColor: COLORS.surfaceRaised,
  },
  snsHeader: {
    height: sf(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: sf(8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  snsCloseButton: {
    width: sf(48),
    height: sf(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  snsLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
