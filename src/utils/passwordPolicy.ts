
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

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

export const isPasswordPolicyMet = (password: string): boolean => {
  const { hasMinLength, hasCombination } = getPasswordRequirements(password);
  return hasMinLength && hasCombination;
};
