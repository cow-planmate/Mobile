/**
 * 닉네임 길이 규칙.
 *
 * 서버 중복 확인(POST /api/auth/register/nickname/verify)은 중복만 본다.
 * 길이는 가입·변경 요청에서야 검증되므로(@Size(min=2, max=20)), 2자 미만을
 * 그대로 보내면 '사용 가능'을 받은 뒤 저장 단계에서 400이 난다. 확인을 보내기
 * 전에 앱이 먼저 걸러야 한다.
 */

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;

/** 길이 규칙 위반 문구. 문제가 없으면 null. 앞뒤 공백은 제외하고 센다. */
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
