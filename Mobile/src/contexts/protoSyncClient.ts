import protobuf from 'protobufjs';
import { sha256 } from 'js-sha256';

/**
 * raw WebSocket + protobuf 전송 어댑터.
 *
 * STOMP Client와 **같은 표면**(connected / active / publish / deactivate)을 노출한다.
 * 그래서 WebSocketContext의 발행부는 그대로 두고 전송 계층만 갈아끼울 수 있다.
 *
 * 코드 생성(buf/protoc)을 하지 않는다. 서버가 `/ws/schema.proto`로 스키마를 내려주므로
 * 런타임에 파싱한다. 빌드 파이프라인을 건드리지 않아도 되고, 서버가 준 그 스키마로
 * 인코딩하니 스키마 스큐도 구조적으로 생기지 않는다.
 *
 * 웹의 planmate2.0/src/websocket/protoClient.js를 옮긴 것이다. 동작이 달라지면
 * 양쪽이 같은 서버와 말이 어긋나므로 고칠 때 함께 본다.
 */

/** BigDecimal은 wire에서 문자열이다. 앱은 숫자를 기대하므로 되돌린다. */
const DECIMAL_FIELDS = new Set(['latitude', 'longitude']);

const RECONNECT_DELAY_MS = 3000;

/** BlockCategory -> BLOCK_CATEGORY (proto enum 값 접두사 규칙) */
const enumPrefix = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

interface SchemaEntity {
  key: string;
  arm: string;
  dtoKey: string;
  itemType: protobuf.Type;
}

interface LoadedSchema {
  hash: string;
  ClientFrame: protobuf.Type;
  ServerFrame: protobuf.Type;
  SyncEvent: protobuf.Type;
  PresenceEvent: protobuf.Type;
  entityByKey: Record<string, SchemaEntity>;
  entityByArm: Record<string, SchemaEntity>;
}

export interface ProtoSyncClient {
  connected: boolean;
  active: boolean;
  publish: (frame: { destination?: string; body: string }) => void;
  deactivate: () => void;
}

interface ProtoSyncOptions {
  baseUrl: string;
  token: string;
  roomId: string;
  onSync?: (body: any) => void;
  onPresence?: (body: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onLog?: (...args: unknown[]) => void;
}

/** 서버(ProtoSchemaGenerator)와 같은 규칙: SHA-256의 앞 8바이트를 소문자 16진수로. */
const sha256Prefix = (text: string) => sha256(text).slice(0, 16);

/**
 * 서버가 서빙하는 .proto를 받아 런타임에 파싱한다.
 *
 * 엔티티 목록도 스키마에서 유도한다 — SyncRequest의 payload oneof에 있는 `<Entity>List`가
 * 그대로 엔티티 집합이다. 서버에 엔티티가 추가돼도 앱 코드는 바뀌지 않는다.
 */
async function loadSchema(baseUrl: string): Promise<LoadedSchema> {
  const response = await fetch(`${baseUrl}/ws/schema.proto`);
  if (!response.ok) {
    throw new Error(`스키마 응답 ${response.status}`);
  }
  const text = await response.text();
  // 해시는 직접 계산한다. "내가 인코딩에 쓴 바이트의 해시"를 주장하는 것이 계약이다.
  const hash = sha256Prefix(text);

  const parsed = protobuf.parse(text); // keepCase=false → 필드명이 camelCase로 온다
  const root = parsed.root;
  // 이걸 빼면 field.resolvedType이 전부 null이라 enum·중첩 타입 처리가 통째로 죽는다.
  root.resolveAll();
  const pkg = parsed.package;
  const type = (name: string) => root.lookupType(`${pkg}.${name}`);

  const SyncRequest = type('SyncRequest');
  const entityByKey: Record<string, SchemaEntity> = {};
  const entityByArm: Record<string, SchemaEntity> = {};

  const payloadOneof = SyncRequest.oneofsArray.find(o => o.name === 'payload');
  if (!payloadOneof) {
    throw new Error('스키마에 SyncRequest.payload oneof가 없다');
  }

  payloadOneof.fieldsArray.forEach(field => {
    const listType = (field.resolvedType ??
      root.lookupType(`${pkg}.${field.type}`)) as protobuf.Type;
    // TimeTablePlaceBlockList -> TimeTablePlaceBlock
    const entityName = listType.name.replace(/List$/, '');
    const camel = entityName.charAt(0).toLowerCase() + entityName.slice(1);
    const entry: SchemaEntity = {
      key: entityName.toLowerCase(), // 기존 wire의 entity 문자열과 같다
      arm: field.name,
      dtoKey: `${camel}Dtos`, // 기존 wire의 리스트 필드명과 같다
      itemType: (listType.fields.items.resolvedType ??
        type(entityName)) as protobuf.Type,
    };
    entityByKey[entry.key] = entry;
    entityByArm[entry.arm] = entry;
  });

  return {
    hash,
    ClientFrame: type('ClientFrame'),
    ServerFrame: type('ServerFrame'),
    SyncEvent: type('SyncEvent'),
    PresenceEvent: type('PresenceEvent'),
    entityByKey,
    entityByArm,
  };
}

export function createProtoSyncClient({
  baseUrl: rawBaseUrl,
  token,
  roomId,
  onSync,
  onPresence,
  onConnect,
  onDisconnect,
  onLog,
}: ProtoSyncOptions): ProtoSyncClient {
  // resolveApiUrl('')는 끝에 슬래시를 남긴다. 그대로 두면 `//ws/...`가 되어 400이 난다.
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  let ws: WebSocket | null = null;
  let schema: LoadedSchema | null = null;
  let disposed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const log = (...args: unknown[]) => onLog?.(...args);

  const adapter: ProtoSyncClient = {
    connected: false,
    active: true,
    publish,
    deactivate,
  };

  void start();
  return adapter;

  // ---------- 연결 ----------

  async function start() {
    if (disposed) return;
    try {
      if (!schema) {
        schema = await loadSchema(baseUrl);
      }
      connect();
    } catch (error) {
      console.warn('[proto] 스키마 로드 실패:', error);
      scheduleReconnect();
    }
  }

  function connect() {
    if (disposed || !schema) return;

    const url = `${baseUrl.replace(/^http/, 'ws')}/ws/v2`;
    // 토큰을 쿼리스트링이 아니라 서브프로토콜로 보낸다. URL은 액세스 로그에 그대로 남는다.
    ws = new WebSocket(url, ['sharedsync.v1', `bearer.${token}`]);
    ws.binaryType = 'arraybuffer';

    ws.onmessage = event => {
      try {
        handleFrame(new Uint8Array(event.data as ArrayBuffer));
      } catch (error) {
        console.warn('[proto] 프레임 처리 실패:', error);
      }
    };

    ws.onclose = () => {
      adapter.connected = false;
      if (!disposed) {
        log('[proto] 연결 종료 — 재연결 예약');
        onDisconnect?.();
        scheduleReconnect();
      }
    };

    ws.onerror = error => console.warn('[proto] 소켓 오류:', error);
  }

  function scheduleReconnect() {
    if (disposed || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void start();
    }, RECONNECT_DELAY_MS);
  }

  function deactivate() {
    disposed = true;
    adapter.active = false;
    adapter.connected = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    try {
      ws?.close();
    } catch (error) {
      console.warn('[proto] 소켓 닫기 실패:', error);
    }
  }

  // ---------- 수신 ----------

  function handleFrame(bytes: Uint8Array) {
    if (!schema) return;
    const frame: any = schema.ServerFrame.decode(bytes);

    switch (frame.frame) {
      case 'hello':
        // 내가 인코딩에 쓴 스키마의 해시를 주장한다. 서버가 준 값을 되돌려주면
        // 검사가 항상 통과해 스키마 스큐 검사 자체가 무력해진다.
        send({ join: { roomId, schemaHash: schema.hash } });
        adapter.connected = true;
        log(
          `[proto] 연결 완료 (client ${schema.hash} / server ${frame.hello?.schemaHash})`,
        );
        onConnect?.();
        break;

      case 'sync':
        onSync?.(toSyncBody(frame.sync));
        break;

      case 'presence':
        onPresence?.(
          schema.PresenceEvent.toObject(frame.presence, {
            enums: String,
            defaults: true,
          }),
        );
        break;

      case 'error':
        console.warn(
          `[proto] 서버 오류 ${frame.error?.code}: ${frame.error?.message}`,
        );
        if (frame.error?.code === 'NOT_JOINED') {
          send({ join: { roomId, schemaHash: schema.hash } });
        } else if (frame.error?.code === 'SCHEMA_MISMATCH') {
          // 서버가 배포되며 스키마가 바뀌었다. 캐시를 버리고 다시 받아야 한다 —
          // 그대로 재연결하면 같은 이유로 계속 끊긴다.
          console.warn('[proto] 서버 스키마가 바뀌었다. 다시 받는다.');
          schema = null;
        }
        break;

      default:
        break;
    }
  }

  /** SyncEvent -> 기존 핸들러가 받던 JSON 모양 그대로. */
  function toSyncBody(event: any) {
    if (!schema) return {};
    const arm = event.payload; // oneof로 설정된 필드명 (예: timeTablePlaceBlocks)
    const entity = schema.entityByArm[arm];
    const actionEnum: any = schema.SyncEvent.fields.action.resolvedType;
    const body: any = {
      eventId: event.eventId,
      action: stripActionPrefix(actionEnum?.valuesById?.[event.action]),
      isUndoRedo: event.isUndoRedo,
    };

    if (entity) {
      body.entity = entity.key;
      body[entity.dtoKey] = (event[arm]?.items ?? []).map((item: any) =>
        decodeDto(entity.itemType, item),
      );
    }
    return body;
  }

  // ---------- 송신 ----------

  /** STOMP의 publish와 같은 시그니처. body는 기존 발행부가 만든 JSON 문자열이다. */
  function publish({ body }: { destination?: string; body: string }) {
    if (!adapter.connected || !schema) return;

    const message = typeof body === 'string' ? JSON.parse(body) : body;
    const action = String(message.action ?? '').toLowerCase();

    const request: any = {
      eventId: message.eventId ?? '',
      action: `SYNC_ACTION_${action.toUpperCase()}`,
    };

    // undo/redo는 페이로드 없이 action만 보낸다.
    if (action !== 'undo' && action !== 'redo') {
      const entity = schema.entityByKey[String(message.entity ?? '').toLowerCase()];
      if (!entity) {
        console.warn('[proto] 스키마에 없는 엔티티:', message.entity);
        return;
      }
      const dtos = message[entity.dtoKey] ?? [];
      request[entity.arm] = {
        items: dtos.map((dto: any) => encodeDto(entity.itemType, dto)),
      };
    }

    send({ sync: request });
  }

  function send(clientFrame: any) {
    if (!schema || !ws || ws.readyState !== 1 /* OPEN */) return;
    const buffer = schema.ClientFrame.encode(
      schema.ClientFrame.fromObject(clientFrame),
    ).finish();
    ws.send(buffer);
  }

  // ---------- DTO 변환 ----------

  /**
   * 앱 객체 -> proto 메시지.
   *
   * 설정하지 않은 필드는 서버에서 보존된다. 그래서 undefined/null은 넣지 않는다 —
   * 빈 문자열이나 0을 넣으면 그 값으로 덮인다.
   */
  function encodeDto(type: protobuf.Type, dto: any) {
    const plain: any = {};
    type.fieldsArray.forEach(field => {
      const value = dto[field.name];
      if (value === undefined || value === null) return;

      if (field.resolvedType instanceof protobuf.Enum) {
        plain[field.name] = withEnumPrefix(field.resolvedType, value);
      } else if (DECIMAL_FIELDS.has(field.name)) {
        plain[field.name] = String(value);
      } else {
        plain[field.name] = value;
      }
    });
    return type.fromObject(plain);
  }

  /** proto 메시지 -> 앱 객체. 기존 JSON 페이로드와 같은 타입이 되도록 되돌린다. */
  function decodeDto(type: protobuf.Type, message: any) {
    // longs: Number — int64를 그대로 두면 Long 객체가 되어 비교·연산이 전부 깨진다.
    const object: any = type.toObject(message, {
      enums: String,
      longs: Number,
      defaults: false,
    });

    type.fieldsArray.forEach(field => {
      const value = object[field.name];
      if (value === undefined) return;

      if (field.resolvedType instanceof protobuf.Enum) {
        object[field.name] = stripEnumPrefix(field.resolvedType, value);
      } else if (DECIMAL_FIELDS.has(field.name)) {
        object[field.name] = Number(value);
      }
    });
    return object;
  }

  function withEnumPrefix(enumType: protobuf.Enum, value: unknown) {
    const prefix = `${enumPrefix(enumType.name)}_`;
    const name = String(value).toUpperCase();
    return name.startsWith(prefix) ? name : prefix + name;
  }

  function stripEnumPrefix(enumType: protobuf.Enum, value: unknown) {
    const prefix = `${enumPrefix(enumType.name)}_`;
    const name = String(value);
    const stripped = name.startsWith(prefix) ? name.slice(prefix.length) : name;
    return stripped === 'UNSPECIFIED' ? null : stripped;
  }

  function stripActionPrefix(value: unknown) {
    const name = String(value ?? '')
      .replace(/^SYNC_ACTION_/, '')
      .toLowerCase();
    return name === 'unspecified' ? '' : name;
  }
}
