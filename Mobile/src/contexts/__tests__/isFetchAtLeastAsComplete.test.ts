jest.mock('../WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: jest.fn(),
    subscribeToMessages: jest.fn(),
    unsubscribeFromMessages: jest.fn(),
  }),
}));

import { isFetchAtLeastAsComplete } from '../ItineraryContext';
import type { Day } from '../ItineraryContext';

const place = (id: string) =>
  ({
    id,
    name: '장소',
    address: '주소',
    memo: '',
    categoryId: 0,
    startTime: '10:00',
    endTime: '11:00',
  } as any);

const day = (
  timetableId: number,
  year: number,
  month: number,
  date: number,
  places: Day['places'] = [],
  startTime = '09:00:00',
  endTime = '20:00:00',
): Day => ({
  timetableId,
  date: new Date(year, month - 1, date),
  dayNumber: 1,
  startTime,
  endTime,
  places,
});

describe('isFetchAtLeastAsComplete', () => {
  it('로컬이 비어 있으면 항상 수용한다', () => {
    expect(isFetchAtLeastAsComplete([], [])).toBe(true);
  });

  it('장소 수가 줄어든 응답은 거부한다', () => {
    const current = [day(100, 2026, 8, 10, [place('1'), place('2')])];
    const fetched = [day(100, 2026, 8, 10, [place('1')])];

    expect(isFetchAtLeastAsComplete(fetched, current)).toBe(false);
  });

  it('timetableId는 같지만 날짜가 다른 응답은 거부한다', () => {
    // 방금 날짜를 8/10 -> 8/15로 바꾼 직후, 그 변경이 서버 캐시에 아직 반영되기 전에
    // 도착한 재조회 응답. 장소·시간이 모두 일치해도 날짜가 다르면 되돌리면 안 된다.
    const current = [day(100, 2026, 8, 15, [place('1')])];
    const fetched = [day(100, 2026, 8, 10, [place('1')])];

    expect(isFetchAtLeastAsComplete(fetched, current)).toBe(false);
  });

  it('날짜·시간·장소가 모두 일치하면 수용한다', () => {
    const current = [day(100, 2026, 8, 15, [place('1')])];
    const fetched = [day(100, 2026, 8, 15, [place('1')])];

    expect(isFetchAtLeastAsComplete(fetched, current)).toBe(true);
  });

  it('운영시간이 다르면 거부한다', () => {
    const current = [day(100, 2026, 8, 10, [], '09:00:00', '20:00:00')];
    const fetched = [day(100, 2026, 8, 10, [], '10:00:00', '20:00:00')];

    expect(isFetchAtLeastAsComplete(fetched, current)).toBe(false);
  });
});
