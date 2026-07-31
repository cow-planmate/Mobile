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

const place = (id: string, startTime: string, endTime: string, memo = '') => ({
  id,
  placeRefId: 'ref-' + id,
  name: '장소' + id,
  type: '관광지' as const,
  startTime,
  endTime,
  address: '주소',
  latitude: 37.5,
  longitude: 127.0,
  imageUrl: '',
  categoryId: 0,
  memo,
});

const seedDays = (): Day[] => [
  {
    timetableId: 101,
    date: new Date(2026, 7, 1),
    dayNumber: 1,
    places: [
      place('1001', '09:00', '10:00'),
      place('1002', '11:00', '12:00'),
      place('1003', '14:00', '15:00', '원본메모'),
      place('1004', '17:00', '18:00'),
    ] as any,
  },
];

const mount = (days: Day[] = seedDays()) => {
  act(() => {
    renderer.create(
      <ItineraryProvider>
        <Probe />
      </ItineraryProvider>,
    );
  });
  act(() => {
    ctx.setDays(days);
  });
};

const emit = (msg: any) => {
  act(() => {
    mockHandlers.forEach(h => h(msg));
  });
};

const flushTimers = () => {
  act(() => {
    jest.runAllTimers();
  });
};

const blockSends = () =>
  mockSendMessage.mock.calls.filter(c => c[1] === 'timetableplaceblock');

beforeEach(() => {
  jest.useFakeTimers();
  mockHandlers.length = 0;
  mockSendMessage.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('전송 대상 축소 (F-4)', () => {
  it('겹치지 않는 시간 변경은 해당 블록 1건만 전송한다', () => {
    mount();

    act(() => {
      ctx.updatePlaceTimes(0, '1002', '11:30', '12:30');
    });
    flushTimers();

    const sends = blockSends();
    expect(sends).toHaveLength(1);
    expect(sends[0][0]).toBe('update');
    expect(sends[0][2].blockId).toBe(1002);
  });

  it('밀려난 블록만 함께 전송하고 무관한 블록은 건드리지 않는다', () => {
    mount();

    // 1002를 14:30까지 늘리면 1003(14:00~15:00)만 뒤로 밀린다.
    act(() => {
      ctx.updatePlaceTimes(0, '1002', '11:00', '14:30');
    });
    flushTimers();

    const ids = blockSends().map(c => c[2].blockId).sort();
    expect(ids).toEqual([1002, 1003]);
    // 09:00 블록과 17:00 블록은 영향이 없다
    expect(ids).not.toContain(1001);
    expect(ids).not.toContain(1004);
  });

  it('메모만 수정하면 대상 블록 1건만 전송한다', () => {
    mount();

    act(() => {
      ctx.updatePlaceDetails(0, '1003', { memo: '변경메모' });
    });
    flushTimers();

    const sends = blockSends();
    expect(sends).toHaveLength(1);
    expect(sends[0][2].blockId).toBe(1003);
    expect(sends[0][2].memo).toBe('변경메모');
  });

  it('시간과 메모를 함께 바꾸면 편집 대상이 반드시 포함된다', () => {
    mount();

    act(() => {
      ctx.updatePlaceDetails(0, '1003', {
        startTime: '14:00',
        endTime: '15:00',
        memo: '변경메모',
      });
    });
    flushTimers();

    const sends = blockSends();
    const target = sends.find(c => c[2].blockId === 1003);
    expect(target).toBeDefined();
    expect(target![2].memo).toBe('변경메모');
  });
});

describe('임시 ID 전송 보류 (F-5)', () => {
  const addPlace = () => {
    act(() => {
      ctx.addPlaceToDay(0, {
        id: 'ext-9',
        name: '신규장소',
        type: '관광지',
        address: '주소',
        latitude: 37.5,
        longitude: 127.0,
        imageUrl: '',
        categoryId: 0,
        startTime: '20:00',
        endTime: '21:00',
      } as any);
    });
    flushTimers();
    return ctx.days[0].places.find(p => p.id.startsWith('place_'))!.id;
  };

  it('blockId가 없는 블록의 update는 전송하지 않고 보류한다', () => {
    mount();
    const tempId = addPlace();
    mockSendMessage.mockClear();

    act(() => {
      ctx.updatePlaceMemo(0, tempId, '보류메모');
    });
    flushTimers();

    expect(blockSends()).toHaveLength(0);
  });

  it('create 응답으로 blockId가 확정되면 보류분을 실제 ID로 전송한다', () => {
    mount();
    const tempId = addPlace();
    mockSendMessage.mockClear();

    act(() => {
      ctx.updatePlaceMemo(0, tempId, '보류메모');
    });
    flushTimers();
    expect(blockSends()).toHaveLength(0);

    emit({
      type: 'create',
      target: 'timetableplaceblock',
      eventId: tempId,
      data: {
        entity: 'timetableplaceblock',
        action: 'create',
        eventId: tempId,
        timeTablePlaceBlockDtos: [{ blockId: 9001, timeTableId: 101 }],
      },
    });

    const sends = blockSends();
    expect(sends).toHaveLength(1);
    expect(sends[0][0]).toBe('update');
    expect(sends[0][2].blockId).toBe(9001);
    expect(sends[0][2].memo).toBe('보류메모');
  });

  it('보류 중 삭제되면 update 대신 delete가 확정 ID로 전송된다', () => {
    mount();
    const tempId = addPlace();
    mockSendMessage.mockClear();

    act(() => {
      ctx.updatePlaceMemo(0, tempId, '보류메모');
    });
    flushTimers();
    act(() => {
      ctx.deletePlaceFromDay(0, tempId);
    });
    flushTimers();
    expect(blockSends()).toHaveLength(0);

    emit({
      type: 'create',
      target: 'timetableplaceblock',
      eventId: tempId,
      data: {
        entity: 'timetableplaceblock',
        action: 'create',
        eventId: tempId,
        timeTablePlaceBlockDtos: [{ blockId: 9002, timeTableId: 101 }],
      },
    });

    const sends = blockSends();
    expect(sends).toHaveLength(1);
    expect(sends[0][0]).toBe('delete');
    expect(sends[0][2].blockId).toBe(9002);
  });
});

describe('blockId 판별 (F-18)', () => {
  it('숫자형 외부 placeId가 blockId로 새지 않는다', () => {
    mount([
      {
        timetableId: 101,
        date: new Date(2026, 7, 1),
        dayNumber: 1,
        places: [
          {
            ...place('place_1700000000000_0.42', '09:00', '10:00'),
            placeRefId: '126508',
          },
        ] as any,
      },
    ]);

    act(() => {
      ctx.updatePlaceMemo(0, 'place_1700000000000_0.42', '메모');
    });
    flushTimers();

    // 임시 ID이므로 전송 자체가 보류되어야 한다
    expect(blockSends()).toHaveLength(0);
  });

  it('실제 blockId는 숫자로 전송된다', () => {
    mount();

    act(() => {
      ctx.updatePlaceMemo(0, '1001', '메모');
    });
    flushTimers();

    const sends = blockSends();
    expect(sends).toHaveLength(1);
    expect(sends[0][2].blockId).toBe(1001);
    expect(sends[0][2].timetablePlaceBlockId).toBe(1001);
  });
});
