import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockSendMessage = jest.fn();
const mockHandlers: Array<(message: any) => void> = [];

jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: mockSendMessage,
    subscribeToMessages: (handler: (message: any) => void) => mockHandlers.push(handler),
    unsubscribeFromMessages: jest.fn(),
  }),
}));

import { ItineraryProvider, useItinerary } from '../src/contexts/ItineraryContext';

let context: ReturnType<typeof useItinerary>;
const Probe = () => {
  context = useItinerary();
  return null;
};

describe('pending place create', () => {
  beforeEach(() => {
    mockSendMessage.mockClear();
    mockHandlers.length = 0;
  });

  it('flushes a place added before its timetable id is assigned', async () => {
    act(() => {
      renderer.create(
        <ItineraryProvider>
          <Probe />
        </ItineraryProvider>,
      );
    });
    act(() => {
      context.setDays([
        { date: new Date(2026, 7, 3), dayNumber: 1, places: [] },
      ]);
      context.addPlaceToDay(0, {
        id: 'external-place',
        name: 'Museum',
        type: '관광지',
        address: '',
        latitude: 0,
        longitude: 0,
        imageUrl: '',
        categoryId: 0,
      } as any);
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    act(() => {
      mockHandlers[0]({
        type: 'create',
        target: 'timetable',
        data: { timeTableDtos: [{ timeTableId: 204, date: '2026-08-03' }] },
      });
    });
    expect(mockSendMessage).toHaveBeenCalledWith(
      'create',
      'timetableplaceblock',
      expect.objectContaining({ timeTableId: 204, placeName: 'Museum' }),
      expect.stringMatching(/^place_/),
    );
  });
});
