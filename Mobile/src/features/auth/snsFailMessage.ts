
const SNS_FAIL_MESSAGES: Record<string, string> = {
  INVALID_STATE: '인증이 만료되었어요. 처음부터 다시 시도해 주세요.',
  UNSUPPORTED_PROVIDER: '지원하지 않는 소셜 로그인이에요.',
  EMAIL_CONFLICT:
    '이미 같은 이메일로 가입된 계정이 있어요. 이메일과 비밀번호로 로그인해 주세요.',
};

const DEFAULT_SNS_FAIL_MESSAGE = '소셜 로그인 중 오류가 발생했습니다.';

export const resolveSnsFailMessage = (reason?: string | null): string =>
  (reason ? SNS_FAIL_MESSAGES[reason] : undefined) ?? DEFAULT_SNS_FAIL_MESSAGE;
