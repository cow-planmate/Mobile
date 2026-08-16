import { buildCreatePlanRequest } from '../src/features/community/utils/itineraryToPlan';
import { Itinerary, ItineraryItem } from '../src/features/community/types';

const START_DATE = new Date(2026, 7, 3); 

const item = (over: Partial<ItineraryItem>): ItineraryItem => ({
  time: '09:00',
  place: '장소',
  ...over,
});

const itinerary = (items: ItineraryItem[]): Itinerary => ({
  plan: {
    destinationId: 1,
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

describe('buildCreatePlanRequest — 블록 카테고리', () => {
  it('서버 enum 값은 그대로 보낸다', () => {
    const { body } = buildCreatePlanRequest(
      itinerary([item({ category: 'ACCOMMODATION' })]),
      START_DATE,
    );

    expect(body.timetablePlaceBlocks[0].blockCategory).toBe('ACCOMMODATION');
  });

  it('enum 밖의 값과 빈 값은 FREE로 떨어뜨린다', () => {

    const { body } = buildCreatePlanRequest(
      itinerary([
        item({ category: '관광지' }),
        item({ time: '11:00', category: null }),
      ]),
      START_DATE,
    );

    expect(body.timetablePlaceBlocks[0].blockCategory).toBe('FREE');
    expect(body.timetablePlaceBlocks[1].blockCategory).toBe('FREE');
  });
});

describe('buildCreatePlanRequest — 일차 시각', () => {
  const timetable = (day: { startTime?: string | null; endTime?: string | null }) =>
    buildCreatePlanRequest(
      { plan: { destinationId: 1, adultCount: 1, childCount: 0 }, days: [{ day: 1, items: [], ...day }] },
      START_DATE,
    ).body.timetables[0];

  it("'HH:mm'과 'HH:mm:ss'를 모두 LocalTime 형식으로 맞춘다", () => {
    expect(timetable({ startTime: '08:30', endTime: '21:00' })).toMatchObject({
      timeTableStartTime: '08:30:00',
      timeTableEndTime: '21:00:00',
    });
    expect(
      timetable({ startTime: '08:30:00', endTime: '21:00:00' }),
    ).toMatchObject({
      timeTableStartTime: '08:30:00',
      timeTableEndTime: '21:00:00',
    });
  });

  it('값이 없으면 기본 시각을 쓴다', () => {
    expect(timetable({ startTime: null, endTime: undefined })).toMatchObject({
      timeTableStartTime: '09:00:00',
      timeTableEndTime: '20:00:00',
    });
  });

  it('종료가 시작보다 이르면 하루 끝으로 늘린다', () => {

    expect(timetable({ startTime: '22:00', endTime: '02:00' })).toMatchObject({
      timeTableStartTime: '22:00:00',
      timeTableEndTime: '23:59:00',
    });
  });
});
