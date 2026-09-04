import {
  ALL_DAYS,
  countPlaces,
  itineraryEntries,
} from '../itineraryEntries';
import { ItineraryDay } from '../../types';

const days: ItineraryDay[] = [
  {
    day: 1,
    items: [
      {
        time: '09:15',
        endTime: '10:00',
        place: '집',
        category: 'FREE',
        memo: '  짐 챙기기  ',
      },
      {
        time: '10:30',
        endTime: '11:30',
        place: '다대포해수욕장',
        category: 'ATTRACTION',
        placeAddress: '부산광역시 사하구 몰운대1길 14',
        description: '설명',
        photoUrl: 'http://tong.visitkorea.or.kr/a.jpg',
      },
    ],
  },
  {
    day: 2,
    items: [
      {
        time: '12:00',
        place: '그랜드 조선 부산',
        category: 'ACCOMMODATION',
      },
    ],
  },
  { day: 3, items: [] },
];

describe('countPlaces', () => {
  it('모든 날의 장소를 더한다', () => {
    expect(countPlaces(days)).toBe(3);
  });

  it('빈 일정은 0이다', () => {
    expect(countPlaces([])).toBe(0);
  });
});

describe('itineraryEntries', () => {
  it('고른 날의 장소만 돌려준다', () => {
    const entries = itineraryEntries(days, 1);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('그랜드 조선 부산');
  });

  it('갈래 이름을 붙인다', () => {
    const [home, beach] = itineraryEntries(days, 0);
    expect(home.categoryName).toBe('직접 추가');
    expect(beach.categoryName).toBe('관광');
    expect(itineraryEntries(days, 1)[0].categoryName).toBe('숙소');
  });

  it('주소가 있으면 설명보다 주소를 앞세운다', () => {
    expect(itineraryEntries(days, 0)[1].subtitle).toBe(
      '부산광역시 사하구 몰운대1길 14',
    );
  });

  it('주소가 없으면 설명을 쓴다', () => {
    const only = itineraryEntries(
      [{ day: 1, items: [{ time: '09:00', place: 'x', description: '설명' }] }],
      0,
    );
    expect(only[0].subtitle).toBe('설명');
  });

  it('전체를 고르면 모든 날을 잇고 며칠차인지 붙인다', () => {
    const entries = itineraryEntries(days, ALL_DAYS);
    expect(entries).toHaveLength(3);
    expect(entries.map(e => e.badge)).toEqual(['Day 1', 'Day 1', 'Day 2']);
  });

  it('하루만 볼 때는 며칠차 꼬리표를 달지 않는다', () => {
    expect(itineraryEntries(days, 0).every(e => !e.badge)).toBe(true);
  });

  it('줄마다 다른 열쇠를 준다', () => {
    const keys = itineraryEntries(days, ALL_DAYS).map(e => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('없는 날을 고르면 빈 목록이다', () => {
    expect(itineraryEntries(days, 9)).toEqual([]);
    expect(itineraryEntries(days, 2)).toEqual([]);
  });
});
