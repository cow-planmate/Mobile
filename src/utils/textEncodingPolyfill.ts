/**
 * Hermes에는 TextEncoder/TextDecoder가 없다.
 *
 * protobufjs가 스키마를 파싱할 때 TextDecoder를 쓰므로 모듈 로드보다 먼저 깔려 있어야 한다.
 * index.js 맨 위에서 이 파일을 부른다.
 */
declare const global: { TextEncoder?: unknown; TextDecoder?: unknown };

// text-encoding은 타입 선언이 없어 require로 받는다.
const TextEncoding = require('text-encoding');

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoding.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextEncoding.TextDecoder;
}

export {};
