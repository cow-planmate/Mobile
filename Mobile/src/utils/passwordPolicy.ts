/**
 * 비밀번호 정책.
 *
 * 서버가 강제하는 것은 길이(8~64자)뿐이다(@Size). 문자 조합은 앱이 정한
 * 기준이라 서버가 검사하지 않으므로, 가입·변경 화면이 서로 다른 기준을 쓰지
 * 않도록 한곳에 모은다.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

/** 영문·숫자·특수문자를 각각 하나 이상 포함해야 한다. */
const COMBINATION_PATTERN = /(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

export interface PasswordRequirements {
  hasMinLength: boolean;
  hasCombination: boolean;
}

export const getPasswordRequirements = (
  password: string,
): PasswordRequirements => ({
  hasMinLength: password.length >= PASSWORD_MIN_LENGTH,
  hasCombination: COMBINATION_PATTERN.test(password),
});

/** 정책을 모두 만족하는지. 최대 길이는 입력칸의 maxLength가 막는다. */
export const isPasswordPolicyMet = (password: string): boolean => {
  const { hasMinLength, hasCombination } = getPasswordRequirements(password);
  return hasMinLength && hasCombination;
};
