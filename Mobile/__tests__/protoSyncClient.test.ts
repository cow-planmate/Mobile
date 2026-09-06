import protobuf from 'protobufjs';
import { createProtoSyncClient } from '../src/contexts/protoSyncClient';

const schema = "syntax = \"proto3\";\npackage sync;\nenum SyncAction { SYNC_ACTION_UNSPECIFIED = 0; SYNC_ACTION_UPDATE = 2; }\nmessage Plan { optional string plan_id = 1; optional string plan_name = 2; optional int32 child_count = 3; }\nmessage PlanList { repeated Plan items = 1; }\nmessage SyncRequest { string event_id = 1; SyncAction action = 2; oneof payload { PlanList plans = 11; } }\nmessage SyncEvent { string event_id = 1; SyncAction action = 2; bool is_undo_redo = 3; oneof payload { PlanList plans = 11; } }\nmessage Join { string room_id = 1; string schema_hash = 2; }\nmessage Hello { string schema_hash = 1; }\nmessage Error { string code = 1; string message = 2; }\nmessage PresenceEvent { repeated string users = 1; }\nmessage ClientFrame { oneof frame { Join join = 1; SyncRequest sync = 2; } }\nmessage ServerFrame { oneof frame { Hello hello = 1; SyncEvent sync = 2; PresenceEvent presence = 3; Error error = 4; } }";
const root = protobuf.parse(schema).root;
root.resolveAll();
const ServerFrame = root.lookupType('sync.ServerFrame');
const ClientFrame = root.lookupType('sync.ClientFrame');

describe('Protobuf 일정 편집 연결', () => {
  const originalWebSocket = global.WebSocket;
  const originalFetch = global.fetch;
  let socket: any;
  let client: ReturnType<typeof createProtoSyncClient>;
  const onConnect = jest.fn();
  const onSync = jest.fn();

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => schema });
    global.WebSocket = class {
      readyState = 1;
      binaryType = '';
      send = jest.fn();
      onclose?: () => void;
      close = jest.fn(() => this.onclose?.());
      constructor() { socket = this; }
    } as any;
    client = createProtoSyncClient({ baseUrl: 'http://localhost/', token: 'token', roomId: 'room', onConnect, onSync });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });

  afterEach(() => {
    client.deactivate();
    global.WebSocket = originalWebSocket;
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  const receive = (frame: any) => {
    const bytes = ServerFrame.encode(ServerFrame.fromObject(frame)).finish();
    socket.onmessage({ data: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  };

  it('hello만 받은 동안은 전송하지 않고 입장이 확인되면 연결을 알린다', () => {
    receive({ hello: { schemaHash: 'hash' } });
    expect(client.connected).toBe(false);
    expect(onConnect).not.toHaveBeenCalled();
    client.publish({ body: JSON.stringify({ entity: 'plan', action: 'update', planDtos: [{ planName: '이름' }] }) });
    expect(socket.send).toHaveBeenCalledTimes(1);
    receive({ presence: { users: [] } });
    expect(client.connected).toBe(true);
    expect(onConnect).toHaveBeenCalledTimes(1);
    receive({ presence: { users: [] } });
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('부분 수정에서 생략한 필드와 명시적인 0을 구분한다', () => {
    receive({ hello: {} });
    receive({ presence: {} });
    client.publish({ body: JSON.stringify({ entity: 'plan', action: 'update', planDtos: [{ planId: 'room', childCount: 0 }] }) });
    const frames = socket.send.mock.calls.map((call: any[]) => ClientFrame.decode(call[0]) as any);
    const dto = frames[1].sync.plans.items[0];
    expect(Object.prototype.hasOwnProperty.call(dto, 'planName')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(dto, 'childCount')).toBe(true);
    receive({ sync: { action: 2, plans: { items: [{ planId: 'room', planName: '원격' }] } } });
    expect(onSync).toHaveBeenCalledWith(expect.objectContaining({ entity: 'plan', action: 'update', planDtos: [{ planId: 'room', planName: '원격' }] }));
  });

  it('스키마 변경 오류 시 연결을 닫고 새 스키마로 재접속한다', async () => {
    receive({ hello: {} });
    receive({ presence: {} });
    const previous = socket;
    receive({ error: { code: 'SCHEMA_MISMATCH' } });
    expect(previous.close).toHaveBeenCalledTimes(1);
    expect(client.connected).toBe(false);
    await jest.advanceTimersByTimeAsync(3000);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(socket).not.toBe(previous);
  });

  it('기존 서버의 일반 정수 인원 필드로도 이름과 인원수를 전송한다', async () => {
    client.deactivate();
    const legacySchema = schema.replace('optional int32 child_count = 3;', 'int32 adult_count = 3; int32 child_count = 4;');
    const legacyRoot = protobuf.parse(legacySchema).root;
    legacyRoot.resolveAll();
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => legacySchema });
    client = createProtoSyncClient({ baseUrl: 'http://localhost', token: 'token', roomId: 'room', onSync });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    receive({ hello: {} });
    receive({ presence: {} });
    client.publish({ body: JSON.stringify({ entity: 'plan', action: 'update', planDtos: [
      { planId: 'room', planName: '새 이름', adultCount: 3, childCount: 0 },
    ] }) });
    const frame = legacyRoot.lookupType('sync.ClientFrame').decode(socket.send.mock.calls[1][0]) as any;
    expect(frame.sync.plans.items[0]).toMatchObject({ planId: 'room', planName: '새 이름', adultCount: 3, childCount: 0 });
  });
});
