import { isRegionMatch, getRegionBase } from '../src/utils/regionMatcher';

describe('regionMatcher', () => {
  describe('getRegionBase', () => {
    it('should extract base names correctly', () => {
      expect(getRegionBase('제주특별자치도')).toBe('제주');
      expect(getRegionBase('제주도')).toBe('제주');
      expect(getRegionBase('제주시')).toBe('제주');
      expect(getRegionBase('서울특별시')).toBe('서울');
      expect(getRegionBase('서울')).toBe('서울');
      expect(getRegionBase('강릉시')).toBe('강릉');
      expect(getRegionBase('강릉')).toBe('강릉');
    });

    it('should map abbreviations correctly', () => {
      expect(getRegionBase('경상남도')).toBe('경남');
      expect(getRegionBase('경남')).toBe('경남');
      expect(getRegionBase('경상북도')).toBe('경북');
      expect(getRegionBase('경북')).toBe('경북');
      expect(getRegionBase('충청북도')).toBe('충북');
      expect(getRegionBase('충북')).toBe('충북');
      expect(getRegionBase('전라남도')).toBe('전남');
      expect(getRegionBase('전남')).toBe('전남');
    });
  });

  describe('isRegionMatch', () => {
    it('should match equivalent parent regions', () => {
      expect(isRegionMatch('제주특별자치도', '제주도')).toBe(true);
      expect(isRegionMatch('제주도', '제주특별자치도')).toBe(true);
      expect(isRegionMatch('제주', '제주도')).toBe(true);
      expect(isRegionMatch('경상남도', '경남')).toBe(true);
      expect(isRegionMatch('충청북도', '충북')).toBe(true);
    });

    it('should match parent-sub region combinations with base region names', () => {
      expect(isRegionMatch('제주특별자치도 제주시', '제주도')).toBe(true);
      expect(isRegionMatch('제주도', '제주특별자치도 제주시')).toBe(true);
      expect(isRegionMatch('경상북도 경주시', '경주')).toBe(true);
      expect(isRegionMatch('서울특별시 강남구', '서울')).toBe(true);
    });

    it('should not match unrelated regions with substring overlap like 동대문구 and 대구', () => {
      expect(isRegionMatch('서울특별시 강남구', '강릉')).toBe(false);
      expect(isRegionMatch('전라남도 강진군', '강릉')).toBe(false);
      expect(isRegionMatch('제주특별자치도 제주시', '서귀포시')).toBe(false);
      expect(isRegionMatch('동대문구', '대구')).toBe(false);
      expect(isRegionMatch('대구', '동대문구')).toBe(false);
      expect(isRegionMatch('해운대구', '대구')).toBe(false);
    });
  });
});
