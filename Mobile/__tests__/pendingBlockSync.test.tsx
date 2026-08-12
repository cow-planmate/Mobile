import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockSendMessage = jest.fn();
const mockHandlers: Array<(message: any) => void> = [];

jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: mockSendMessage,
    subscribeToMessages: (handler: (message: any) => void) =>
      mockHandlers.push(handler),
    unsubscribeFromMessages: (handler: (message: any) => void) => {
      const i = mockHandlers.indexOf(handler);
      if (i !== -1) mockHandlers.splice(i, 1);
    },
  }),
}));

import {
  ItineraryProvider,
  useItinerary,
} from '../src/contexts/ItineraryContext';

/**
 * 서버가 blockId를 확정하기 전 블록의 update/delete 보류 흐름.
 *
 * ID 없이 보낸 update는 서버에서 예외로 통째 폐기되고 delete는 조용히 무시되므로,
 * 확정 전 변경은 보류했다가 create 응답이 온 뒤 실제 ID로 다시 보내야 한다.
 */

let context: ReturnType<typeof useItinerary>;
const Probe = () => {
  context = useItinerary();
  return null;
};

const TIMETABLE_ID = 101;
const REAL_BLOCK_ID = 777;

const mount = () => {
  act(() => {
    renderer.create(
      <ItineraryProvider>
        <Probe />
      </ItineraryProvider>,
    );
  });
  act(() => {
    context.setDays([
      {
        timetableId: TIMETABLE_ID,
        date: new Date(2026, 7, 3),
        dayNumber: 1,
        places: [],
      },
    ]);
  });
};

const flushTimers = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

/** 장소를 하나 추가하고, 그때 부여된 임시 ID를 돌려준다. */
const addPlace = async (): Promise<string> => {
  act(() => {
    context.addPlaceToDay(0, {
      id: 'external-place',
      name: '해운대',
      type: '관광지',
      address: '부산',
      latitude: 35.1,
      longitude: 129.1,
      imageUrl: '',
      categoryId: 0,
    } as any);
  });
  await flushTimers();

  const createCall = mockSendMessage.mock.calls.find(
    call => call[0] === 'create' && call[1] === 'timetableplaceblock',
  );
  return createCall![3];
};

/** 서버가 create를 확정해 실제 blockId를 브로드캐스트한 상황 */
const emitCreateConfirmation = (tempId: string) => {
  act(() => {
    mockHandlers.forEach(handler =>
      handler({
        action: 'create',
        entity: 'timetableplaceblock',
        eventId: tempId,
        timeTablePlaceBlockDtos: [
          {
            blockId: REAL_BLOCK_ID,
            timeTableId: TIMETABLE_ID,
            placeName: '해운대',
            blockStartTime: '12:00:00',
            blockEndTime: '13:00:00',
          },
        ],
      }),
    );
  });
};

const callsOf = (action: string) =>
  mockSendMessage.mock.calls.filter(
    call => call[0] === action && call[1] === 'timetableplaceblock',
  );

describe('임시 ID 블록의 변경 보류', () => {
  beforeEach(() => {
    mockSendMessage.mockClear();
    mockHandlers.length = 0;
  });

  it('blockId가 확정되기 전 수정은 전송하지 않는다', async () => {
    mount();
    const tempId = await addPlace();

    act(() => {
      context.updatePlaceMemo(0, tempId, '가는 길에 들르기');
    });
    await flushTimers();

    expect(callsOf('update')).toHaveLength(0);
  });

  it('create가 확정되면 보류분을 실제 blockId로 다시 보낸다', async () => {
    mount();
    const tempId = await addPlace();

    act(() => {
      context.updatePlaceMemo(0, tempId, '가는 길에 들르기');
    });
    await flushTimers();

    emitCreateConfirmation(tempId);

    const updates = callsOf('update');
    expect(updates).toHaveLength(1);
    expect(updates[0][2]).toMatchObject({
      blockId: REAL_BLOCK_ID,
      timeTableId: TIMETABLE_ID,
      memo: '가는 길에 들르기',
    });
  });

  it('확정 전에 삭제하면 확정 후 delete가 실제 blockId로 나간다', async () => {
    mount();
    const tempId = await addPlace();

    act(() => {
      context.deletePlaceFromDay(0, tempId);
    });
    await flushTimers();

    // 아직 서버에 없는 블록이라 이 시점에는 아무것도 보내지 않는다.
    expect(callsOf('delete')).toHaveLength(0);

    emitCreateConfirmation(tempId);

    const deletes = callsOf('delete');
    expect(deletes).toHaveLength(1);
    expect(deletes[0][2]).toMatchObject({ blockId: REAL_BLOCK_ID });
    // 삭제가 예약된 블록에 update가 섞여 나가면 지운 블록이 되살아난다.
    expect(callsOf('update')).toHaveLength(0);
  });

  it('확정 전에 삭제한 블록이 create 브로드캐스트로 되살아나지 않는다', async () => {
    mount();
    const tempId = await addPlace();

    act(() => {
      context.deletePlaceFromDay(0, tempId);
    });
    await flushTimers();

    // 내가 보낸 create의 응답이다. 그사이 지웠으므로 목록에 다시 넣으면 안 된다.
    emitCreateConfirmation(tempId);

    expect(context.days[0].places).toHaveLength(0);
  });

  it('다른 일정으로 옮기면 보류분이 새 방으로 새어 나가지 않는다', async () => {
    mount();
    const tempId = await addPlace();

    act(() => {
      context.updatePlaceMemo(0, tempId, '메모');
    });
    await flushTimers();

    act(() => {
      context.resetItinerary();
    });
    emitCreateConfirmation(tempId);

    expect(callsOf('update')).toHaveLength(0);
  });
});
