import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockHandlers: Array<(msg: any) => void> = [];
const mockSendMessage = jest.fn();

jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: mockSendMessage,
    subscribeToMessages: (cb: (msg: any) => void) => {
      mockHandlers.push(cb);
    },
    unsubscribeFromMessages: (cb: (msg: any) => void) => {
      const i = mockHandlers.indexOf(cb);
      if (i !== -1) mockHandlers.splice(i, 1);
    },
  }),
}));

import {
  ItineraryProvider,
  useItinerary,
  Day,
} from '../src/contexts/ItineraryContext';

let ctx: ReturnType<typeof useItinerary>;

const Probe = () => {
  ctx = useItinerary();
  return null;
};

const seedDays = (): Day[] => [
  {
    timetableId: 101,
    date: new Date(2026, 7, 1),
    dayNumber: 1,
    places: [],
  },
  {
    timetableId: 102,
    date: new Date(2026, 7, 2),
    dayNumber: 2,
    places: [],
  },
];

const mount = () => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <ItineraryProvider>
        <Probe />
      </ItineraryProvider>,
    );
  });
  act(() => {
    ctx.setDays(seedDays());
  });
  return tree!;
};

const emit = (msg: any) => {
  act(() => {
    mockHandlers.forEach(h => h(msg));
  });
};

beforeEach(() => {
  mockHandlers.length = 0;
  mockSendMessage.mockClear();
});

describe('ItineraryContext WebSocket 수신 핸들러', () => {
  it('수신 핸들러는 하나만 등록된다 (중복 적용 방지)', () => {
    mount();
    expect(mockHandlers).toHaveLength(1);
  });

  it('date 없는 timetableplaceblock 응답을 timeTableId가 일치하는 날짜에만 반영한다', () => {
    mount();

    emit({
      type: 'create',
      target: 'timetableplaceblock',
      eventId: 'evt-1',
      data: {
        entity: 'timetableplaceblock',
        action: 'create',
        eventId: 'evt-1',
        timeTablePlaceBlockDtos: [
          {
            blockId: 5001,
            timeTableId: 101,
            placeName: '경복궁',
            blockStartTime: '10:00:00',
            blockEndTime: '11:00:00',
          },
        ],
      },
    });

    expect(ctx.days[0].places).toHaveLength(1);
    expect(ctx.days[0].places[0].id).toBe('5001');
    expect(ctx.days[0].places[0].name).toBe('경복궁');
    // 다른 날짜로 복제되지 않아야 한다
    expect(ctx.days[1].places).toHaveLength(0);
  });

  it('create 응답의 blockId로 임시 ID를 치환한다', () => {
    mount();

    act(() => {
      ctx.addPlaceToDay(0, {
        id: 'ext-1',
        name: '남산타워',
        type: '관광지',
        address: '서울',
        latitude: 37.5,
        longitude: 127.0,
        imageUrl: '',
        categoryId: 0,
      } as any);
    });

    const tempId = ctx.days[0].places[0].id;
    expect(tempId).toMatch(/^place_/);

    emit({
      type: 'create',
      target: 'timetableplaceblock',
      eventId: tempId,
      data: {
        entity: 'timetableplaceblock',
        action: 'create',
        eventId: tempId,
        timeTablePlaceBlockDtos: [{ blockId: 7001, timeTableId: 101 }],
      },
    });

    expect(ctx.days[0].places).toHaveLength(1);
    expect(ctx.days[0].places[0].id).toBe('7001');
  });

  it('다른 참여자의 create가 내 블록 시간을 로컬에서 밀어내지 않는다', () => {
    mount();

    emit({
      action: 'create',
      entity: 'timetableplaceblock',
      timeTablePlaceBlockDtos: [
        {
          blockId: 6001,
          timeTableId: 101,
          placeName: '기존 블록',
          blockStartTime: '10:30:00',
          blockEndTime: '11:30:00',
        },
      ],
    });

    // 겹치는 시간대에 블록이 들어왔다. 시간을 조정할 권한은 보낸 쪽에 있고,
    // 밀린 블록은 별도 update 브로드캐스트로 온다. 받는 쪽이 임의로 옮기면
    // 서버에 없는 시간이 화면에만 남는다.
    emit({
      action: 'create',
      entity: 'timetableplaceblock',
      timeTablePlaceBlockDtos: [
        {
          blockId: 6002,
          timeTableId: 101,
          placeName: '새 블록',
          blockStartTime: '10:00:00',
          blockEndTime: '11:00:00',
        },
      ],
    });

    const places = ctx.days[0].places;
    expect(places.map(p => p.id)).toEqual(['6002', '6001']);
    expect(places.find(p => p.id === '6001')).toMatchObject({
      startTime: '10:30',
      endTime: '11:30',
    });
  });

  it('update 응답의 이름·주소 변경을 반영한다', () => {
    mount();

    // 다른 참여자가 이미 만들어 둔 블록
    emit({
      action: 'create',
      entity: 'timetableplaceblock',
      timeTablePlaceBlockDtos: [
        {
          blockId: 5001,
          timeTableId: 101,
          placeName: '해운대',
          placeAddress: '부산 해운대구',
          blockStartTime: '10:00:00',
          blockEndTime: '11:00:00',
        },
      ],
    });

    // 그 참여자가 장소 정보를 고쳤다. 편집 화면은 이름·주소도 함께 보낸다.
    emit({
      action: 'update',
      entity: 'timetableplaceblock',
      timeTablePlaceBlockDtos: [
        {
          blockId: 5001,
          timeTableId: 101,
          placeName: '광안리',
          placeAddress: '부산 수영구',
          memo: '야경 보기',
          blockStartTime: '19:00:00',
          blockEndTime: '20:00:00',
        },
      ],
    });

    expect(ctx.days[0].places[0]).toMatchObject({
      id: '5001',
      name: '광안리',
      address: '부산 수영구',
      memo: '야경 보기',
      startTime: '19:00',
      endTime: '20:00',
    });
  });

  it('update 응답에 없는 필드는 기존 값을 유지한다', () => {
    mount();

    emit({
      action: 'create',
      entity: 'timetableplaceblock',
      timeTablePlaceBlockDtos: [
        {
          blockId: 5002,
          timeTableId: 101,
          placeName: '감천문화마을',
          placeAddress: '부산 사하구',
          blockStartTime: '10:00:00',
          blockEndTime: '11:00:00',
        },
      ],
    });

    // 시간만 바뀐 응답. 이름·주소를 지우면 안 된다.
    emit({
      action: 'update',
      entity: 'timetableplaceblock',
      timeTablePlaceBlockDtos: [
        {
          blockId: 5002,
          timeTableId: 101,
          blockStartTime: '13:00:00',
          blockEndTime: '14:00:00',
        },
      ],
    });

    expect(ctx.days[0].places[0]).toMatchObject({
      name: '감천문화마을',
      address: '부산 사하구',
      startTime: '13:00',
    });
  });

  it('timetable create 응답으로 해당 날짜에 timetableId를 주입한다', () => {
    mount();

    act(() => {
      ctx.setDays(prev => [
        ...prev,
        {
          date: new Date(2026, 7, 3),
          dayNumber: 3,
          places: [],
        },
      ]);
    });
    expect(ctx.days[2].timetableId).toBeUndefined();

    emit({
      type: 'create',
      target: 'timetable',
      data: {
        entity: 'timetable',
        action: 'create',
        timeTableDtos: [
          {
            timeTableId: 203,
            date: '2026-08-03',
            timeTableStartTime: '09:00:00',
            timeTableEndTime: '20:00:00',
          },
        ],
      },
    });

    expect(ctx.days[2].timetableId).toBe(203);
  });

  it('로컬에 없는 날짜의 timetable create 응답은 날짜순으로 삽입한다', () => {
    mount();

    emit({
      type: 'create',
      target: 'timetable',
      data: {
        entity: 'timetable',
        action: 'create',
        timeTableDtos: [
          { timeTableId: 100, date: '2026-07-31', timeTableStartTime: '08:00:00' },
        ],
      },
    });

    expect(ctx.days).toHaveLength(3);
    expect(ctx.days[0].timetableId).toBe(100);
    expect(ctx.days.map(d => d.dayNumber)).toEqual([1, 2, 3]);
  });

  it('undo 브로드캐스트의 timetableplaceblocks 키를 처리한다', () => {
    mount();

    // 서버 HistoryService는 payload 키를 '{entity}s'로 만든다.
    emit({
      type: 'delete',
      target: 'timetableplaceblock',
      eventId: '',
      data: {
        entity: 'timetableplaceblock',
        action: 'delete',
        eventId: '',
        isUndoRedo: true,
        timetableplaceblocks: [{ blockId: 5001, timeTableId: 101 }],
      },
    });
    expect(ctx.days[0].places).toHaveLength(0);

    // undo(CREATE) 결과로 다시 생성되는 경우
    emit({
      type: 'create',
      target: 'timetableplaceblock',
      eventId: '',
      data: {
        entity: 'timetableplaceblock',
        action: 'create',
        eventId: '',
        isUndoRedo: true,
        timetableplaceblocks: [
          {
            blockId: 5001,
            timeTableId: 101,
            placeName: '경복궁',
            blockStartTime: '10:00:00',
            blockEndTime: '11:00:00',
          },
        ],
      },
    });
    expect(ctx.days[0].places).toHaveLength(1);
    expect(ctx.days[0].places[0].id).toBe('5001');
    expect(ctx.days[1].places).toHaveLength(0);
  });

  it('undo 브로드캐스트의 timetables 키를 처리한다', () => {
    mount();

    emit({
      type: 'delete',
      target: 'timetable',
      data: {
        entity: 'timetable',
        action: 'delete',
        isUndoRedo: true,
        timetables: [{ timeTableId: 101, date: '2026-08-01' }],
      },
    });

    expect(ctx.days).toHaveLength(1);
    expect(ctx.days[0].timetableId).toBe(102);
  });

  it('timetable delete 응답으로 해당 날짜를 제거하고 dayNumber를 재부여한다', () => {
    mount();

    emit({
      type: 'delete',
      target: 'timetable',
      data: {
        entity: 'timetable',
        action: 'delete',
        timeTableDtos: [{ timeTableId: 101, date: '2026-08-01' }],
      },
    });

    expect(ctx.days).toHaveLength(1);
    expect(ctx.days[0].timetableId).toBe(102);
    expect(ctx.days[0].dayNumber).toBe(1);
  });
});
