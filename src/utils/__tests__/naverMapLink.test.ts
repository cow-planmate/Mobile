import { buildNaverMapUrl } from '../naverMapLink';

describe('buildNaverMapUrl', () => {
  it('장소명과 주소를 검색어로 조합해 공백까지 안전하게 인코딩한다', () => {
    expect(
      buildNaverMapUrl({
        name: ' 전주 콩나물국밥 ',
        address: ' 서울 종로구 자하문로 3 ',
      }),
    ).toBe(
      'https://map.naver.com/p/search/%EC%A0%84%EC%A3%BC%20%EC%BD%A9%EB%82%98%EB%AC%BC%EA%B5%AD%EB%B0%A5%20%EC%84%9C%EC%9A%B8%20%EC%A2%85%EB%A1%9C%EA%B5%AC%20%EC%9E%90%ED%95%98%EB%AC%B8%EB%A1%9C%203',
    );
  });

  it('장소명이 없으면 링크를 만들지 않는다', () => {
    expect(buildNaverMapUrl({ address: '서울 종로구' })).toBeUndefined();
  });
});
