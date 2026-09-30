import { buildFeedRegionOptions } from '../feedRegions';

describe('buildFeedRegionOptions', () => {
  it('서버 집계에서 유효한 지역과 건수를 구성한다', () => {
    expect(
      buildFeedRegionOptions([
        { region: '거제', count: 4 },
        { region: ' 서울 ', count: 2 },
        { region: '거제', count: 1 },
        { region: '', count: 3 },
        { region: '광주', count: 0 },
      ]),
    ).toEqual([
      { region: '거제', count: 5 },
      { region: '서울', count: 2 },
    ]);
  });
});
