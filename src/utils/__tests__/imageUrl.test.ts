import { toSecureImageUrl } from '../imageUrl';

describe('toSecureImageUrl', () => {
  it('http로 온 주소를 https로 올린다', () => {
    expect(
      toSecureImageUrl('http://tong.visitkorea.or.kr/cms/resource/69/a.jpg'),
    ).toBe('https://tong.visitkorea.or.kr/cms/resource/69/a.jpg');
  });

  it('이미 https면 그대로 둔다', () => {
    const url = 'https://tong.visitkorea.or.kr/cms/resource/10/b.jpg';
    expect(toSecureImageUrl(url)).toBe(url);
  });

  it('주소 안쪽의 http는 건드리지 않는다', () => {
    expect(toSecureImageUrl('https://cdn.io/p?next=http://a.io/x.jpg')).toBe(
      'https://cdn.io/p?next=http://a.io/x.jpg',
    );
  });

  it('앞뒤 공백을 털어낸다', () => {
    expect(toSecureImageUrl('  http://a.io/x.jpg  ')).toBe(
      'https://a.io/x.jpg',
    );
  });

  it('빈 값은 빈 문자열로 돌려준다', () => {
    expect(toSecureImageUrl(undefined)).toBe('');
    expect(toSecureImageUrl(null)).toBe('');
    expect(toSecureImageUrl('   ')).toBe('');
  });
});
