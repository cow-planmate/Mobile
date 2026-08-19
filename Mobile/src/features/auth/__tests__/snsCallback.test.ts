import { isTrustedSnsCallbackUrl } from '../snsCallback';

const API = 'https://api.planmate.example';

describe('isTrustedSnsCallbackUrl', () => {
  it('API와 같은 출처의 콜백만 신뢰한다', () => {
    expect(
      isTrustedSnsCallbackUrl(`${API}/api/oauth/callback?status=SUCCESS&code=abc`, API),
    ).toBe(true);
    expect(isTrustedSnsCallbackUrl(`${API}/anything`, `${API}/`)).toBe(true);
  });

  it('다른 호스트가 보낸 code는 받지 않는다', () => {
    expect(
      isTrustedSnsCallbackUrl(
        'https://evil.example/cb?status=SUCCESS&code=stolen',
        API,
      ),
    ).toBe(false);
  });

  it('호스트를 흉내 낸 하위 도메인·접미사도 거른다', () => {
    expect(
      isTrustedSnsCallbackUrl(
        'https://api.planmate.example.evil.com/cb?status=SUCCESS&code=x',
        API,
      ),
    ).toBe(false);
    expect(
      isTrustedSnsCallbackUrl(
        'https://evil.com/?next=https://api.planmate.example&status=SUCCESS&code=x',
        API,
      ),
    ).toBe(false);
  });

  it('스킴이 다르면 신뢰하지 않는다', () => {
    expect(
      isTrustedSnsCallbackUrl('http://api.planmate.example/cb?status=SUCCESS', API),
    ).toBe(false);
  });

  it('출처를 판별할 수 없으면 신뢰하지 않는다', () => {
    expect(isTrustedSnsCallbackUrl('about:blank', API)).toBe(false);
    expect(isTrustedSnsCallbackUrl('/api/oauth/callback', API)).toBe(false);
    expect(isTrustedSnsCallbackUrl(`${API}/cb`, '')).toBe(false);
    expect(isTrustedSnsCallbackUrl(null, API)).toBe(false);
  });
});
