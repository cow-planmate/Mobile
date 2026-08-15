/**
 * SNS 로그인 실패 리다이렉트(status=FAIL)의 reason별 안내.
 *
 * 서버는 두 곳에서 reason을 붙인다.
 * - OAuthController.buildFailRedirect: UNSUPPORTED_PROVIDER · INVALID_STATE · UNKNOWN
 * - OAuthLoginService.buildFailRedirect: EMAIL_CONFLICT
 *
 * 재시도로 풀리는 경우와 다른 수단으로 옮겨야 하는 경우를 나눠 안내한다.
 * EMAIL_CONFLICT는 몇 번을 다시 눌러도 같은 결과라, 이메일 로그인으로 가야
 * 한다는 사실을 알려 주지 않으면 사용자가 빠져나올 방법이 없다.
 */
const SNS_FAIL_MESSAGES: Record<string, string> = {
  INVALID_STATE: '인증이 만료되었어요. 처음부터 다시 시도해 주세요.',
  UNSUPPORTED_PROVIDER: '지원하지 않는 소셜 로그인이에요.',
  EMAIL_CONFLICT:
    '이미 같은 이메일로 가입된 계정이 있어요. 이메일과 비밀번호로 로그인해 주세요.',
};

/** 서버가 사유를 주지 않거나(UNKNOWN 포함) 모르는 값일 때 쓰는 문구 */
const DEFAULT_SNS_FAIL_MESSAGE = '소셜 로그인 중 오류가 발생했습니다.';

export const resolveSnsFailMessage = (reason?: string | null): string =>
  (reason ? SNS_FAIL_MESSAGES[reason] : undefined) ?? DEFAULT_SNS_FAIL_MESSAGE;
