import { getJwtExpiryMs, isTokenExpiringSoon } from '../jwt';

/** 서명은 검증하지 않으므로 헤더·서명 자리는 아무 값이나 채워도 된다. */
const makeToken = (payload: object): string => {
  const base64Url = (value: string) =>
    Buffer.from(value, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  return [
    base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
    base64Url(JSON.stringify(payload)),
    'signature',
  ].join('.');
};

describe('getJwtExpiryMs', () => {
  it('exp 클레임을 밀리초로 변환한다', () => {
    const expSeconds = 1893456000; // 2030-01-01T00:00:00Z
    expect(getJwtExpiryMs(makeToken({ exp: expSeconds }))).toBe(
      expSeconds * 1000,
    );
  });

  it('페이로드에 한글이 섞여 있어도 exp를 읽는다', () => {
    const expSeconds = 1893456000;
    const token = makeToken({ exp: expSeconds, nickname: '민영이' });
    expect(getJwtExpiryMs(token)).toBe(expSeconds * 1000);
  });

  it('패딩이 필요한 길이의 페이로드도 처리한다', () => {
    // base64 길이가 4의 배수가 아니면 '=' 패딩이 생략된다.
    const expSeconds = 1893456000;
    const token = makeToken({ exp: expSeconds, a: 'bc' });
    expect(getJwtExpiryMs(token)).toBe(expSeconds * 1000);
  });

  it('exp가 없으면 null', () => {
    expect(getJwtExpiryMs(makeToken({ sub: 'user-1' }))).toBeNull();
  });

  it('exp가 숫자가 아니면 null', () => {
    expect(getJwtExpiryMs(makeToken({ exp: 'soon' }))).toBeNull();
  });

  it('JWT 형식이 아니면 null', () => {
    expect(getJwtExpiryMs('not-a-jwt')).toBeNull();
    expect(getJwtExpiryMs('only.two')).toBeNull();
  });

  it('페이로드가 JSON이 아니면 null', () => {
    expect(getJwtExpiryMs('header.bm90LWpzb24.signature')).toBeNull();
  });

  it('빈 값이면 null', () => {
    expect(getJwtExpiryMs(null)).toBeNull();
    expect(getJwtExpiryMs(undefined)).toBeNull();
    expect(getJwtExpiryMs('')).toBeNull();
  });
});

describe('isTokenExpiringSoon', () => {
  const nowSeconds = () => Math.floor(Date.now() / 1000);

  it('여유 시간 안에 만료되면 true', () => {
    const token = makeToken({ exp: nowSeconds() + 30 });
    expect(isTokenExpiringSoon(token, 60_000)).toBe(true);
  });

  it('여유 시간 밖이면 false', () => {
    const token = makeToken({ exp: nowSeconds() + 600 });
    expect(isTokenExpiringSoon(token, 60_000)).toBe(false);
  });

  it('이미 만료됐으면 true', () => {
    const token = makeToken({ exp: nowSeconds() - 10 });
    expect(isTokenExpiringSoon(token, 60_000)).toBe(true);
  });

  it('exp를 읽을 수 없으면 갱신을 유발하지 않는다', () => {
    expect(isTokenExpiringSoon('not-a-jwt', 60_000)).toBe(false);
    expect(isTokenExpiringSoon(null, 60_000)).toBe(false);
  });
});
