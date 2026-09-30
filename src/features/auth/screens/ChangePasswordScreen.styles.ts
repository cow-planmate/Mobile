import { StyleSheet } from 'react-native';
import { tokens } from '../../../theme/tokens';
import { normalize } from '../../../utils/normalize';

/**
 * 이 화면만 인증 계통이 아니라 앱 계통 토큰을 쓴다.
 * authTokens는 로그인 전 화면(Intro·로그인·회원가입·찾기·소셜 추가정보)의 것이고,
 * 비밀번호 변경은 로그인 뒤 마이페이지 > 계정 설정에서 열린다.
 * 앱 한복판에서 열리므로 상단바와 글자 크기를 마이페이지에 맞춘다.
 */
export const COLORS = {
  text: tokens.colors.text,
  textSecondary: tokens.colors.textSecondary,
  textDisabled: tokens.colors.textTertiary,
  error: tokens.tones.danger.fg,
  success: tokens.tones.success.fg,
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.white },
  flex1: { flex: 1 },

  // 마이페이지 header와 같은 값(높이 56 · 좌우 16 · 아래 보더 1).
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    height: normalize(56),
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  headerBackButton: {
    padding: normalize(4),
  },
  headerTitle: {
    fontSize: normalize(18),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  // 뒤로가기 버튼과 같은 폭을 오른쪽에 둬서 제목이 가운데 온다.
  headerSpacer: {
    width: 28,
  },

  scrollContainer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(20),
    paddingBottom: normalize(32),
  },
  description: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.regular,
    lineHeight: normalize(21),
    color: tokens.colors.textSecondary,
    marginBottom: normalize(24),
  },

  inputGroup: { marginBottom: normalize(16) },

  inputContainer: {
    width: '100%',
    minHeight: normalize(52),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.l,
    paddingHorizontal: normalize(16),
    backgroundColor: tokens.colors.white,
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  input: {
    flex: 1,
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.regular,
    lineHeight: normalize(24),
    color: tokens.colors.text,
    height: normalize(24),
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  eyeButton: {
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(-10),
  },

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
    color: tokens.tones.danger.fg,
    fontSize: normalize(13),
    fontFamily: tokens.fontFamily.medium,
    lineHeight: normalize(18),
  },

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
    fontFamily: tokens.fontFamily.medium,
    lineHeight: normalize(18),
  },

  footer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(16),
    backgroundColor: tokens.colors.white,
  },
});
