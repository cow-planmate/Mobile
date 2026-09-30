jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: jest.fn(),
    subscribeToMessages: jest.fn(),
    unsubscribeFromMessages: jest.fn(),
  }),
}));

import { Day, isFetchAtLeastAsComplete } from '../src/contexts/ItineraryContext';

const day = (memo: string, startTime = '09:00'): Day => ({
  timetableId: 1,
  date: new Date(2026, 7, 1),
  dayNumber: 1,
  startTime: '09:00',
  endTime: '20:00',
  places: [
    {
      id: '101',
      placeRefId: 'place-101',
      name: 'Museum',
      type: '관광지',
      startTime,
      endTime: '10:00',
      address: 'Seoul',
      latitude: 0,
      longitude: 0,
      imageUrl: '',
      categoryId: 0,
      memo,
    },
  ] as any,
});

describe('fetched itinerary content guard', () => {
  it('rejects an equal-count response with an older memo', () => {
    expect(isFetchAtLeastAsComplete([day('old memo')], [day('new memo')])).toBe(false);
  });

  it('rejects an equal-count response with an older time range', () => {
    expect(isFetchAtLeastAsComplete([day('memo')], [day('memo', '11:00')])).toBe(false);
  });
});
