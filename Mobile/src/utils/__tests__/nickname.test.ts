import {
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  getNicknameLengthError,
} from '../nickname';

describe('getNicknameLengthError', () => {
  it('서버 @Size 범위 안이면 null', () => {
    expect(getNicknameLengthError('민영')).toBeNull();
    expect(getNicknameLengthError('a'.repeat(NICKNAME_MAX_LENGTH))).toBeNull();
  });

  it('비어 있거나 공백뿐이면 입력 안내', () => {
    expect(getNicknameLengthError('')).toBe('닉네임을 입력해 주세요.');
    expect(getNicknameLengthError('   ')).toBe('닉네임을 입력해 주세요.');
  });

  it('한 글자는 서버 중복 확인을 보내기 전에 걸러 낸다', () => {

    expect(getNicknameLengthError('가')).toBe(
      `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상이어야 해요.`,
    );
  });

  it('최대 길이를 넘으면 초과 안내', () => {
    expect(getNicknameLengthError('a'.repeat(NICKNAME_MAX_LENGTH + 1))).toBe(
      `닉네임은 ${NICKNAME_MAX_LENGTH}자를 넘을 수 없어요.`,
    );
  });

  it('길이는 앞뒤 공백을 뺀 값으로 센다', () => {
    expect(getNicknameLengthError('  가  ')).toBe(
      `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상이어야 해요.`,
    );
    expect(getNicknameLengthError('  민영  ')).toBeNull();
  });
});
