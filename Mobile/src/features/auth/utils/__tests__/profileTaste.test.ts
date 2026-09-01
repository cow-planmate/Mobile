import { groupPreferredThemes } from '../profileTaste';

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
      { label: '관광지', names: ['미술관'] },
      { label: '숙소', names: ['호텔'] },
      { label: '식당', names: ['퓨전음식', '이자카야'] },
    ]);
  });

  it('비어 있는 갈래는 아예 내보내지 않는다', () => {
    expect(
      groupPreferredThemes([
        { preferredThemeName: '호텔', category: 'ACCOMMODATION' },
      ]),
    ).toEqual([{ label: '숙소', names: ['호텔'] }]);
  });

  it('문자열만 오면 관광지로 보고 앞의 #을 뗀다', () => {
    expect(groupPreferredThemes(['#해수욕장', '한식'])).toEqual([
      { label: '관광지', names: ['해수욕장', '한식'] },
    ]);
  });

  it('모르는 카테고리도 관광지로 떨어뜨린다', () => {
    expect(
      groupPreferredThemes([
        { preferredThemeName: '캠핑', category: 'SOMETHING_NEW' },
      ]),
    ).toEqual([{ label: '관광지', names: ['캠핑'] }]);
  });

  it('이름이 빈 값은 버린다', () => {
    expect(
      groupPreferredThemes([{ preferredThemeName: '  ', category: 'ATTRACTION' }]),
    ).toEqual([]);
  });
});
