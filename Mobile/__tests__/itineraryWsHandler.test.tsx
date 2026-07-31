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
