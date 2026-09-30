import {
  getJwtExpiryMs,
  getJwtIssuedAtMs,
  isTokenExpiringSoon,
} from '../jwt';

const makeToken = (payload: object): string => {
  const base64Url = (value: string) =>
    Buffer.from(value, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/[=]+$/, '');

  return [
    base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
    base64Url(JSON.stringify(payload)),
    'signature',
  ].join('.');
};

describe('getJwtExpiryMs', () => {
  it('exp 클레임을 밀리초로 변환한다', () => {
    const expSeconds = 1893456000;
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

  const HOUR_MS = 60 * 60 * 1000;
  const ACCESS_TOKEN_LIFETIME_SECONDS = 900;

  it('시계가 앞선 기기에서도 갓 발급된 토큰은 만료로 보지 않는다', () => {
    const serverNowSeconds = nowSeconds() - HOUR_MS / 1000;
    const token = makeToken({
      iat: serverNowSeconds,
      exp: serverNowSeconds + ACCESS_TOKEN_LIFETIME_SECONDS,
    });

    expect(isTokenExpiringSoon(token, 60_000)).toBe(true);
    expect(isTokenExpiringSoon(token, 60_000, HOUR_MS)).toBe(false);
  });

  it('시계가 뒤처진 기기에서도 임박한 만료를 놓치지 않는다', () => {
    const serverNowSeconds = nowSeconds() + HOUR_MS / 1000;
    const token = makeToken({
      iat: serverNowSeconds - ACCESS_TOKEN_LIFETIME_SECONDS,
      exp: serverNowSeconds + 30,
    });

    expect(isTokenExpiringSoon(token, 60_000)).toBe(false);
    expect(isTokenExpiringSoon(token, 60_000, -HOUR_MS)).toBe(true);
  });

  it('보정값을 줘도 실제로 만료된 토큰은 true', () => {
    const serverNowSeconds = nowSeconds() - HOUR_MS / 1000;
    const token = makeToken({
      iat: serverNowSeconds - ACCESS_TOKEN_LIFETIME_SECONDS,
      exp: serverNowSeconds - 10,
    });

    expect(isTokenExpiringSoon(token, 60_000, HOUR_MS)).toBe(true);
  });
});

describe('getJwtIssuedAtMs', () => {
  it('iat 클레임을 밀리초로 변환한다', () => {
    const iatSeconds = 1893456000;
    expect(getJwtIssuedAtMs(makeToken({ iat: iatSeconds }))).toBe(
      iatSeconds * 1000,
    );
  });

  it('iat가 없거나 숫자가 아니면 null', () => {
    expect(getJwtIssuedAtMs(makeToken({ exp: 1893456000 }))).toBeNull();
    expect(getJwtIssuedAtMs(makeToken({ iat: 'now' }))).toBeNull();
    expect(getJwtIssuedAtMs(null)).toBeNull();
  });
});
