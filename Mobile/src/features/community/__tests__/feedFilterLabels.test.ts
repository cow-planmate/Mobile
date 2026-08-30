import { orderLabelsFor, formatDuration } from '../services/communityApi';

describe('피드 필터 라벨', () => {
  it('최신순은 오름차순을 오래된순으로 부른다', () => {
    expect(orderLabelsFor('최신순')).toEqual({
      desc: '최신순',
      asc: '오래된순',
    });
  });

  it('나머지 기준은 높은순과 낮은순을 쓴다', () => {
    ['인기순', '좋아요순', '가져가기순'].forEach(sort => {
      expect(orderLabelsFor(sort)).toEqual({ desc: '높은순', asc: '낮은순' });
    });
  });

  it('모르는 기준도 기본 라벨로 떨어진다', () => {
    expect(orderLabelsFor('없는기준')).toEqual({
      desc: '높은순',
      asc: '낮은순',
    });
  });

  it('기간 표기는 1일만 당일이 아니라 1일로 쓴다', () => {
    expect(formatDuration(1)).toBe('1일');
    expect(formatDuration(3)).toBe('2박 3일');
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(undefined)).toBe('');
  });
});
