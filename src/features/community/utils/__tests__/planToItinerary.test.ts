import { buildFeedPlanSnapshot } from '../planToItinerary';

describe('buildFeedPlanSnapshot', () => {
  it('일정 상세를 피드 일정 스냅샷으로 변환한다', () => {
    const result = buildFeedPlanSnapshot({
      planFrame: {
        planId: 'plan-1',
        planName: '거제 여행',
        destinationId: 25,
        destinationName: '거제',
        adultCount: 2,
        childCount: 1,
      },
      timetables: [
        {
          timeTableId: 2,
          date: '2026-08-11',
          timeTableStartTime: '09:00:00',
          timeTableEndTime: '20:00:00',
        },
      ],
      placeBlocks: [
        {
          timeTableId: 2,
          placeId: 'place-1',
          placeName: '가배량진성',
          placeAddress: '경상남도 거제시',
          placeThumbnailUrl: 'https://example.com/image.jpg',
          latitude: 34.7,
          longitude: 128.5,
          blockStartTime: '09:30:00',
          blockEndTime: '10:30:00',
          blockCategory: 'ATTRACTION',
        },
      ],
    });

    expect(result.thumbnailUrl).toBe('https://example.com/image.jpg');
    expect(result.itinerary.plan).toEqual({
      destinationId: 25,
      destinationName: '거제',
      adultCount: 2,
      childCount: 1,
    });
    expect(result.itinerary.days[0]).toMatchObject({
      day: 1,
      date: '2026-08-11',
      startTime: '09:00',
      endTime: '20:00',
    });
    expect(result.itinerary.days[0].items[0]).toMatchObject({
      time: '09:30',
      endTime: '10:30',
      place: '가배량진성',
      category: 'ATTRACTION',
    });
  });

  it('여행지 또는 일정이 없으면 발행을 거부한다', () => {
    expect(() =>
      buildFeedPlanSnapshot({
        planFrame: {
          planId: 'plan-1',
          planName: '빈 일정',
          destinationId: 0,
          destinationName: '',
          adultCount: 1,
          childCount: 0,
        },
        timetables: [],
        placeBlocks: [],
      }),
    ).toThrow('여행기로 발행할 수 있는 일정 정보가 아니에요.');
  });
});
