import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  getPasswordRequirements,
  isPasswordPolicyMet,
} from '../passwordPolicy';

describe('getPasswordRequirements', () => {
  it('길이와 조합을 따로 알려준다', () => {
    expect(getPasswordRequirements('abcd123!')).toEqual({
      hasMinLength: true,
      hasCombination: true,
    });
    expect(getPasswordRequirements('abc1!')).toEqual({
      hasMinLength: false,
      hasCombination: true,
    });
    expect(getPasswordRequirements('abcdefghij')).toEqual({
      hasMinLength: true,
      hasCombination: false,
    });
  });

  it(`${PASSWORD_MIN_LENGTH}자가 경계값이다`, () => {
    expect(getPasswordRequirements('abcde1!').hasMinLength).toBe(false);
    expect(getPasswordRequirements('abcdef1!').hasMinLength).toBe(true);
  });

  it('영문·숫자·특수문자 중 하나라도 빠지면 조합 불충족', () => {
    expect(getPasswordRequirements('abcdefg!').hasCombination).toBe(false);
    expect(getPasswordRequirements('1234567!').hasCombination).toBe(false);
    expect(getPasswordRequirements('abcd1234').hasCombination).toBe(false);
  });
});

describe('isPasswordPolicyMet', () => {
  it('두 조건을 모두 만족해야 true', () => {
    expect(isPasswordPolicyMet('abcdef1!')).toBe(true);
    expect(isPasswordPolicyMet('abcdefgh')).toBe(false);
    expect(isPasswordPolicyMet('ab1!')).toBe(false);
  });

  it('최대 길이 이내면 길이 자체는 문제 삼지 않는다', () => {
    // 초과 입력은 입력칸 maxLength가 막는다.
    expect(isPasswordPolicyMet(`${'a'.repeat(PASSWORD_MAX_LENGTH - 2)}1!`)).toBe(
      true,
    );
  });
});
