import { buildCreatePlanRequest } from '../src/features/community/utils/itineraryToPlan';
import { Itinerary, ItineraryItem } from '../src/features/community/types';

const START_DATE = new Date(2026, 7, 3); // 2026-08-03 (로컬)

const item = (over: Partial<ItineraryItem>): ItineraryItem => ({
  time: '09:00',
  place: '장소',
  ...over,
});

const itinerary = (items: ItineraryItem[]): Itinerary => ({
  plan: {
    destinationId: 1,
    transportationType: 'PUBLIC',
    adultCount: 2,
    childCount: 0,
  },
  days: [{ day: 1, items }],
});

const startTimes = (body: ReturnType<typeof buildCreatePlanRequest>['body']) =>
  body.timetablePlaceBlocks.map(b => b.blockStartTime as string);

describe('buildCreatePlanRequest — 블록 시각', () => {
  it('겹치는 블록을 앞 블록 종료 시각 뒤로 민다', () => {
    const { body, adjustedBlocks } = buildCreatePlanRequest(
      itinerary([
        item({ time: '09:00', endTime: '10:00' }),
        item({ time: '09:30', endTime: '10:00' }),
      ]),
      START_DATE,
    );

    expect(startTimes(body)).toEqual(['09:00:00', '10:00:00']);
    expect(adjustedBlocks).toBe(1);
  });

  it('자정을 넘겨도 시작 시각이 겹치지 않는다', () => {
    // 22:00부터 1시간짜리 블록 6개 → 그대로 밀면 04:00까지 넘어간다.
    // 23:59로 잘라내면 여러 블록의 시작 시각이 23:59로 같아져
    // 서버 validateNoDuplicateBlockTimes에 걸린다.
    const { body } = buildCreatePlanRequest(
      itinerary(
        Array.from({ length: 6 }, () =>
          item({ time: '22:00', endTime: '23:00' }),
        ),
      ),
      START_DATE,
    );

    const starts = startTimes(body);
    expect(new Set(starts).size).toBe(starts.length);
    expect(starts.every(t => t <= '23:59:00')).toBe(true);
  });

  it('블록이 많아도 시작 시각은 모두 다르고 하루를 넘지 않는다', () => {
    const { body } = buildCreatePlanRequest(
      itinerary(
        Array.from({ length: 60 }, () =>
          item({ time: '23:00', endTime: '23:30' }),
        ),
      ),
      START_DATE,
    );

    const starts = startTimes(body);
    expect(new Set(starts).size).toBe(60);
    expect(starts.every(t => t >= '00:00:00' && t <= '23:59:00')).toBe(true);
  });

  it('시작 시각이 종료 시각보다 늦지 않는다', () => {
    const { body } = buildCreatePlanRequest(
      itinerary(
        Array.from({ length: 10 }, () =>
          item({ time: '23:50', endTime: '23:55' }),
        ),
      ),
      START_DATE,
    );

    body.timetablePlaceBlocks.forEach(b => {
      expect(String(b.blockStartTime) <= String(b.blockEndTime)).toBe(true);
    });
  });
});

describe('buildCreatePlanRequest — 장소명', () => {
  it('빈 장소명을 서버 @NotBlank에 걸리지 않는 값으로 바꾼다', () => {
    const { body } = buildCreatePlanRequest(
      itinerary([item({ place: '   ' }), item({ time: '11:00', place: '광안리' })]),
      START_DATE,
    );

    expect(body.timetablePlaceBlocks[0].placeName).toBe('이름 없는 장소');
    expect(body.timetablePlaceBlocks[1].placeName).toBe('광안리');
  });
});
