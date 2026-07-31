jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: jest.fn(),
    subscribeToMessages: jest.fn(),
    unsubscribeFromMessages: jest.fn(),
  }),
}));

import {
  countPlaces,
  isFetchAtLeastAsComplete,
  Day,
} from '../src/contexts/ItineraryContext';

const place = (id: string) => ({
  id,
  placeRefId: 'ref-' + id,
  name: '장소' + id,
  type: '관광지' as const,
  startTime: '09:00',
  endTime: '10:00',
  address: '',
  latitude: 0,
  longitude: 0,
  imageUrl: '',
  categoryId: 0,
});

const day = (timetableId: number, placeIds: string[]): Day => ({
  timetableId,
  date: new Date(2026, 7, 1),
  dayNumber: 1,
  places: placeIds.map(place) as any,
});

describe('countPlaces', () => {
  it('모든 날짜의 place 개수를 합산한다', () => {
    const days = [day(1, ['a', 'b']), day(2, ['c'])];
    expect(countPlaces(days)).toBe(3);
  });

  it('빈 배열은 0을 반환한다', () => {
    expect(countPlaces([])).toBe(0);
  });
});

describe('isFetchAtLeastAsComplete (생성 직후 조회 싱크 불일치 방지)', () => {
  it('fetch 결과가 로컬보다 place가 적으면 신뢰하지 않는다', () => {
    // 방금 추가한 블록이 아직 DB에 flush되지 않아 GET 응답에서 빠진 상황
    const current = [day(1, ['a', 'b', 'c'])];
    const fetched = [day(1, ['a', 'b'])]; // 방금 추가한 'c'가 stale 응답에는 없음
    expect(isFetchAtLeastAsComplete(fetched, current)).toBe(false);
  });

  it('fetch 결과가 로컬과 같거나 많으면 신뢰한다', () => {
    const current = [day(1, ['a'])];
    const sameCount = [day(1, ['a'])];
    const moreCount = [day(1, ['a', 'b'])];
    expect(isFetchAtLeastAsComplete(sameCount, current)).toBe(true);
    expect(isFetchAtLeastAsComplete(moreCount, current)).toBe(true);
  });

  it('최초 진입(로컬이 비어있음)은 항상 fetch 결과를 받아들인다', () => {
    const current: Day[] = [];
    const fetched = [day(1, [])]; // 장소가 아예 없는 신규 일정도 허용
    expect(isFetchAtLeastAsComplete(fetched, current)).toBe(true);
  });

  it('여러 날짜에 걸쳐 일부만 stale해도 총합으로 판단한다', () => {
    // 1일차는 이미 DB에 반영됐지만 2일차 방금 추가분은 아직 반영 전
    const current = [day(1, ['a']), day(2, ['b', 'c'])];
    const fetched = [day(1, ['a']), day(2, ['b'])];
    expect(isFetchAtLeastAsComplete(fetched, current)).toBe(false);
  });
});
