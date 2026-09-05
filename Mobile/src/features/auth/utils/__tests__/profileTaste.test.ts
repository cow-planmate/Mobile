import {
  countPreferredThemes,
  groupPreferredThemes,
} from '../profileTaste';

const EMPTY = [
  { label: '장소', hint: '즐길 곳', names: [] },
  { label: '숙소', hint: '머무는 방식', names: [] },
  { label: '식당', hint: '미식 취향', names: [] },
];

describe('groupPreferredThemes', () => {
  it('카테고리대로 세 갈래로 묶는다', () => {
    expect(
      groupPreferredThemes([
        { preferredThemeName: '미술관', category: 'ATTRACTION' },
        { preferredThemeName: '호텔', category: 'ACCOMMODATION' },
        { preferredThemeName: '퓨전음식', category: 'RESTAURANT' },
        { preferredThemeName: '이자카야', category: 'RESTAURANT' },
      ]),
    ).toEqual([
      { label: '장소', hint: '즐길 곳', names: ['미술관'] },
      { label: '숙소', hint: '머무는 방식', names: ['호텔'] },
      { label: '식당', hint: '미식 취향', names: ['퓨전음식', '이자카야'] },
    ]);
  });

  // 웹처럼 카드 세 장이 늘 같은 자리에 있어야 무엇을 고르지 않았는지 보인다.
  it('비어 있는 갈래도 자리를 지킨다', () => {
    expect(
      groupPreferredThemes([
        { preferredThemeName: '호텔', category: 'ACCOMMODATION' },
      ]),
    ).toEqual([
      { label: '장소', hint: '즐길 곳', names: [] },
      { label: '숙소', hint: '머무는 방식', names: ['호텔'] },
      { label: '식당', hint: '미식 취향', names: [] },
    ]);
  });

  it('문자열만 오면 장소로 보고 앞의 #을 뗀다', () => {
    expect(groupPreferredThemes(['#해수욕장', '한식'])[0]).toEqual({
      label: '장소',
      hint: '즐길 곳',
      names: ['해수욕장', '한식'],
    });
  });

  it('모르는 카테고리도 장소로 떨어뜨린다', () => {
    expect(
      groupPreferredThemes([
        { preferredThemeName: '캠핑', category: 'SOMETHING_NEW' },
      ])[0].names,
    ).toEqual(['캠핑']);
  });

  it('이름이 빈 값은 버린다', () => {
    expect(
      groupPreferredThemes([
        { preferredThemeName: '  ', category: 'ATTRACTION' },
      ]),
    ).toEqual(EMPTY);
  });
});

describe('countPreferredThemes', () => {
  it('갈래에 흩어진 취향 수를 모두 더한다', () => {
    expect(
      countPreferredThemes(
        groupPreferredThemes([
          { preferredThemeName: '미술관', category: 'ATTRACTION' },
          { preferredThemeName: '호텔', category: 'ACCOMMODATION' },
          { preferredThemeName: '퓨전음식', category: 'RESTAURANT' },
          { preferredThemeName: '이자카야', category: 'RESTAURANT' },
        ]),
      ),
    ).toBe(4);
  });

  it('고른 것이 없으면 0이다', () => {
    expect(countPreferredThemes(EMPTY)).toBe(0);
  });
});
