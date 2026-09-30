import { DESTINATIONS_28, REGION_GROUPS } from '../src/constants/regions';
import { isRegionMatch } from '../src/utils/regionMatcher';

describe('SearchLocationModal Selection Logic UX', () => {
  it('should contain exactly 28 destinations matching Backend-v2 DB', () => {
    expect(DESTINATIONS_28.length).toBe(28);
  });

  it('should cover all specified region groups', () => {
    expect(REGION_GROUPS).toEqual(['전체', '수도권', '강원', '충청', '전라', '경상', '제주']);
  });

  it('should match 서울 to DB destination ID 1 (서울)', () => {
    const matched = DESTINATIONS_28.find(d => isRegionMatch(d.name, '서울'));
    expect(matched).toBeDefined();
    expect(matched?.id).toBe(1);
  });

  it('should match 수원 to DB destination ID 3 (수원)', () => {
    const matched = DESTINATIONS_28.find(d => isRegionMatch(d.name, '수원'));
    expect(matched).toBeDefined();
    expect(matched?.id).toBe(3);
  });

  it('should filter destinations correctly by region group', () => {
    const gangwonDestinations = DESTINATIONS_28.filter(d => d.region === '강원');
    expect(gangwonDestinations.length).toBe(5);
    expect(gangwonDestinations.map(d => d.name)).toEqual(['강릉', '속초', '춘천', '평창', '양양']);
  });
});
