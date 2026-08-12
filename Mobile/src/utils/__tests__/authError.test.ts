import { AxiosError } from 'axios';
import { isTokenAuthFailure } from '../authError';

const makeError = (status: number, code?: string): AxiosError =>
  ({
    response: {
      status,
      data: code ? { code, message: '' } : undefined,
    },
  } as AxiosError);

describe('isTokenAuthFailure', () => {
  it('토큰 만료·무효는 재발급 대상', () => {
    expect(isTokenAuthFailure(makeError(401, 'AUTH_001'))).toBe(true);
    expect(isTokenAuthFailure(makeError(401, 'AUTH_002'))).toBe(true);
    expect(isTokenAuthFailure(makeError(401, 'COMMON_002'))).toBe(true);
  });

  it('토큰과 무관한 401은 재발급 대상이 아니다', () => {
    // 로그인 자격 증명 · 인증번호 · 현재 비밀번호 확인 실패
    expect(isTokenAuthFailure(makeError(401, 'AUTH_003'))).toBe(false);
    expect(isTokenAuthFailure(makeError(401, 'AUTH_006'))).toBe(false);
    expect(isTokenAuthFailure(makeError(401, 'AUTH_007'))).toBe(false);
    expect(isTokenAuthFailure(makeError(401, 'AUTH_008'))).toBe(false);
  });

  it('본문이나 코드가 없는 401은 토큰 문제로 본다', () => {
    expect(isTokenAuthFailure(makeError(401))).toBe(true);
  });

  it('401이 아닌 응답은 대상이 아니다', () => {
    expect(isTokenAuthFailure(makeError(403, 'COMMON_003'))).toBe(false);
    expect(isTokenAuthFailure(makeError(404, 'USER_001'))).toBe(false);
    expect(isTokenAuthFailure({} as AxiosError)).toBe(false);
  });
});
