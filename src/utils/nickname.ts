
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;

export const getNicknameLengthError = (nickname: string): string | null => {
  const trimmed = nickname.trim();

  if (!trimmed) return '닉네임을 입력해 주세요.';
  if (trimmed.length < NICKNAME_MIN_LENGTH) {
    return `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상이어야 해요.`;
  }
  if (trimmed.length > NICKNAME_MAX_LENGTH) {
    return `닉네임은 ${NICKNAME_MAX_LENGTH}자를 넘을 수 없어요.`;
  }
  return null;
};
