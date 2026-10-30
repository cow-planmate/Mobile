import { normalizeLinkUrl } from '../linkUrl';

describe('normalizeLinkUrl', () => {
  it.each([
    ['https://planmate.site', 'https://planmate.site'],
    ['  http://a.com/path?x=1  ', 'http://a.com/path?x=1'],
    ['mailto:planmate@planmate.site', 'mailto:planmate@planmate.site'],
  ])('주소로 쓸 수 있는 값은 그대로 둔다: %s', (input, expected) => {
    expect(normalizeLinkUrl(input)).toBe(expected);
  });

  it.each([
    ['naver.com', 'https://naver.com'],
    ['blog.example.co.kr/post/1', 'https://blog.example.co.kr/post/1'],
  ])('주소창에 치는 꼴이면 https를 붙인다: %s', (input, expected) => {
    expect(normalizeLinkUrl(input)).toBe(expected);
  });

  // 스크립트 주소를 일부러 거절하는지 확인하는 값이라 린트 경고를 끈다.
  // eslint-disable-next-line no-script-url
  const scriptUrl = 'javascript:alert(1)';

  it.each(['', '   ', '링크', 'planmate', scriptUrl, 'ftp://a.com', 'https://', 'a b.com', 'mailto:abc'])(
    '쓸 수 없는 값은 거절한다: %p',
    input => {
      expect(normalizeLinkUrl(input)).toBeNull();
    },
  );
});
