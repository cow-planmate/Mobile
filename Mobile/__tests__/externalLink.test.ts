import { isSafeExternalUrl } from '../src/utils/externalLink';

describe('isSafeExternalUrl', () => {
  it('웹 링크는 통과시킨다', () => {
    expect(isSafeExternalUrl('https://example.com')).toBe(true);
    expect(isSafeExternalUrl('http://example.com/path?q=1')).toBe(true);
    expect(isSafeExternalUrl('HTTPS://EXAMPLE.COM')).toBe(true);
    expect(isSafeExternalUrl('  https://example.com  ')).toBe(true);
  });

  it('웹이 아닌 스킴은 막는다', () => {

    expect(isSafeExternalUrl('intent://scan/#Intent;scheme=zxing;end')).toBe(
      false,
    );
    expect(isSafeExternalUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeExternalUrl('tel:01012345678')).toBe(false);
    expect(isSafeExternalUrl('content://media/external/images/1')).toBe(false);
  });

  it('스킴을 감춘 형태도 막는다', () => {
    expect(isSafeExternalUrl('//example.com')).toBe(false);
    expect(isSafeExternalUrl('/relative/path')).toBe(false);
    expect(isSafeExternalUrl('example.com')).toBe(false);
    expect(isSafeExternalUrl('\tjavascript:alert(1)')).toBe(false);
  });

  it('값이 없거나 빈 문자열이면 막는다', () => {
    expect(isSafeExternalUrl(undefined)).toBe(false);
    expect(isSafeExternalUrl(null)).toBe(false);
    expect(isSafeExternalUrl('')).toBe(false);
    expect(isSafeExternalUrl('   ')).toBe(false);
    expect(isSafeExternalUrl('https://')).toBe(false);
    expect(isSafeExternalUrl(123)).toBe(false);
  });
});
