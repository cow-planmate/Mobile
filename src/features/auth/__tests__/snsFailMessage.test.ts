import { resolveSnsFailMessage } from '../snsFailMessage';

describe('resolveSnsFailMessage', () => {
  it('재시도로 풀리는 사유는 다시 시도하라고 안내한다', () => {
    expect(resolveSnsFailMessage('INVALID_STATE')).toContain('다시 시도');
  });

  it('이메일 충돌은 이메일 로그인으로 안내한다', () => {
    const message = resolveSnsFailMessage('EMAIL_CONFLICT');
    expect(message).toContain('이미');
    expect(message).toContain('이메일');
    expect(message).not.toBe(resolveSnsFailMessage('UNKNOWN'));
  });

  it('지원하지 않는 제공자는 재시도를 권하지 않는다', () => {
    expect(resolveSnsFailMessage('UNSUPPORTED_PROVIDER')).not.toContain(
      '다시 시도',
    );
  });

  it('UNKNOWN·미정의·빈 값은 기본 문구로 흡수한다', () => {
    const fallback = resolveSnsFailMessage('UNKNOWN');
    expect(resolveSnsFailMessage('NOT_A_REASON')).toBe(fallback);
    expect(resolveSnsFailMessage(null)).toBe(fallback);
    expect(resolveSnsFailMessage(undefined)).toBe(fallback);
    expect(resolveSnsFailMessage('')).toBe(fallback);
  });
});
