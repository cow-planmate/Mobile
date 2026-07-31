jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: jest.fn(),
    subscribeToMessages: jest.fn(),
    unsubscribeFromMessages: jest.fn(),
  }),
}));

import { categoryMapping } from '../src/contexts/ItineraryContext';

describe('categoryMapping (N-4)', () => {
  // api/trips.ts categoryEnumMap: ATTRACTION→0, ACCOMMODATION→1, RESTAURANT→2
  it('서버 카테고리 enum 순서와 일치한다', () => {
    expect(categoryMapping(0)).toBe('관광지');
    expect(categoryMapping(1)).toBe('숙소');
    expect(categoryMapping(2)).toBe('식당');
    expect(categoryMapping(3)).toBe('직접 추가');
    expect(categoryMapping(4)).toBe('검색');
  });

  it('TourAPI contentTypeId도 같은 라벨로 접는다', () => {
    [12, 14, 15, 28].forEach(id => expect(categoryMapping(id)).toBe('관광지'));
    expect(categoryMapping(32)).toBe('숙소');
    expect(categoryMapping(39)).toBe('식당');
  });

  it('알 수 없는 값은 기타로 떨어진다', () => {
    expect(categoryMapping(99)).toBe('기타');
  });
});
