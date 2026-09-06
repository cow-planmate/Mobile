import React from 'react';
import renderer, { act } from 'react-test-renderer';
import axios from 'axios';
import { ItineraryProvider, useItinerary } from '../src/contexts/ItineraryContext';
import { useItineraryEditor } from '../src/hooks/useItineraryEditor';

jest.mock('axios', () => ({ get: jest.fn(), isCancel: () => false }));
jest.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({ removeQueries: jest.fn() }) }));
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));
jest.mock('../src/contexts/WebSocketContext', () => ({
  useWebSocket: () => ({ sendMessage: jest.fn(), subscribeToMessages: jest.fn(), unsubscribeFromMessages: jest.fn() }),
}));

let editor: ReturnType<typeof useItineraryEditor>;
let itinerary: ReturnType<typeof useItinerary>;
function Probe() {
  itinerary = useItinerary();
  editor = useItineraryEditor({ params: { planId: 'room', startDate: '2026-09-05', endDate: '2026-09-05' } }, {});
  return null;
}

const block = { blockId: 10, timeTableId: 1, placeName: '장소', blockStartTime: '10:00:00', blockEndTime: '11:00:00', memo: '이전' };
const snapshot = (blocks = [block], timetables = [{ timeTableId: 1, date: '2026-09-05', timeTableStartTime: '09:00:00', timeTableEndTime: '21:00:00' }]) => ({
  data: { planFrame: { planName: '여행' }, timetables, placeBlocks: blocks },
});

describe('일정 재접속 조회', () => {
  let tree: renderer.ReactTestRenderer;
  beforeEach(async () => {
    jest.clearAllMocks();
    (axios.get as jest.Mock).mockResolvedValue(snapshot());
    await act(async () => { tree = renderer.create(<ItineraryProvider><Probe /></ItineraryProvider>); });
  });
  afterEach(() => act(() => tree.unmount()));

  it('접속이 끊긴 동안 변경된 메모를 반영한다', async () => {
    (axios.get as jest.Mock).mockResolvedValue(snapshot([{ ...block, memo: '원격 수정' }]));
    await act(async () => { await editor.fetchPlanDetails(); });
    expect(itinerary.days[0].places[0].memo).toBe('원격 수정');
  });

  it('접속이 끊긴 동안 삭제된 블록과 일차를 반영한다', async () => {
    (axios.get as jest.Mock).mockResolvedValue(snapshot([]));
    await act(async () => { await editor.fetchPlanDetails(); });
    expect(itinerary.days[0].places).toHaveLength(0);
    (axios.get as jest.Mock).mockResolvedValue(snapshot([], []));
    await act(async () => { await editor.fetchPlanDetails(); });
    expect(itinerary.days).toHaveLength(0);
  });

  it('조회 대기 중 수신한 편집을 늦은 응답으로 덮어쓰지 않는다', async () => {
    let resolve: (value: any) => void = () => {};
    (axios.get as jest.Mock).mockImplementation(() => new Promise(done => { resolve = done; }));
    const request = editor.fetchPlanDetails();
    act(() => itinerary.setDays(days => days.map(day => ({ ...day, places: day.places.map(place => ({ ...place, memo: '최신' })) }))));
    await act(async () => { resolve(snapshot()); await request; });
    expect(itinerary.days[0].places[0].memo).toBe('최신');
  });

  it('재조회 실패 시 현재 일정을 지우지 않는다', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('offline'));
    await act(async () => { await editor.fetchPlanDetails(); });
    expect(itinerary.days[0].places[0].memo).toBe('이전');
  });

  it('조회 중 편집한 메모와 서버의 삭제 및 시간 변경을 함께 반영한다', async () => {
    (axios.get as jest.Mock).mockResolvedValue(snapshot([block, { ...block, blockId: 11 }]));
    await act(async () => { await editor.fetchPlanDetails(); });
    let resolve: (value: any) => void = () => {};
    (axios.get as jest.Mock).mockImplementation(() => new Promise(done => { resolve = done; }));
    const request = editor.fetchPlanDetails();
    act(() => itinerary.setDays(days => days.map(day => ({ ...day, places: day.places.map(place =>
      place.id === '10' ? { ...place, memo: '조회 중 수정' } : place) }))));
    await act(async () => {
      resolve(snapshot([{ ...block, blockStartTime: '12:00:00', blockEndTime: '13:00:00' }]));
      await request;
    });
    expect(itinerary.days[0].places).toHaveLength(1);
    expect(itinerary.days[0].places[0]).toMatchObject({ id: '10', memo: '조회 중 수정', startTime: '12:00' });
  });

  it('서버에서 겹친 블록을 조회할 때 앱만 시간을 옮기지 않는다', async () => {
    (axios.get as jest.Mock).mockResolvedValue(snapshot([block, { ...block, blockId: 11 }]));
    await act(async () => { await editor.fetchPlanDetails(); });
    expect(itinerary.days[0].places.map(place => place.startTime)).toEqual(['10:00', '10:00']);
  });
});
