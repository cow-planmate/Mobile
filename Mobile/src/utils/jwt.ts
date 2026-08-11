/* eslint-disable no-bitwise -- base64/UTF-8 디코딩은 비트 연산이 본질이다 */
/**
 * JWT 페이로드에서 만료 시각만 읽어내는 최소 구현.
 *
 * 서명은 검증하지 않는다 — 검증은 서버 몫이고, 앱은 "언제 갱신을 걸어야 하는지"만
 * 알면 된다. atob/Buffer는 Hermes에서 보장되지 않아 base64url을 직접 디코딩한다.
 */

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** base64url 문자열을 UTF-8 문자열로 디코딩한다. 실패하면 null. */
const decodeBase64Url = (input: string): string | null => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const bytes: number[] = [];

  let buffer = 0;
  let bitsCollected = 0;

  for (const char of normalized) {
    if (char === '=') break;
    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) return null;

    buffer = (buffer << 6) | value;
    bitsCollected += 6;

    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      bytes.push((buffer >> bitsCollected) & 0xff);
    }
  }

  // UTF-8 디코딩. exp만 읽으므로 ASCII 범위면 충분하지만, 페이로드에 한글
  // 클레임이 섞여 있어도 JSON.parse가 깨지지 않도록 멀티바이트를 처리한다.
  let result = '';
  let i = 0;
  while (i < bytes.length) {
    const byte = bytes[i];
    if (byte < 0x80) {
      result += String.fromCharCode(byte);
      i += 1;
    } else if (byte >= 0xc0 && byte < 0xe0) {
      result += String.fromCharCode(((byte & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (byte >= 0xe0 && byte < 0xf0) {
      result += String.fromCharCode(
        ((byte & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else {
      // 4바이트(서로게이트 쌍) 문자는 exp 판독에 필요 없으므로 건너뛴다.
      i += 4;
    }
  }

  return result;
};

/**
 * 액세스 토큰의 만료 시각(ms)을 돌려준다.
 * 형식이 JWT가 아니거나 exp 클레임이 없으면 null.
 */
export function getJwtExpiryMs(token: string | null | undefined): number | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const json = decodeBase64Url(parts[1]);
  if (!json) return null;

  try {
    const payload = JSON.parse(json);
    // exp는 초 단위 epoch다.
    return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
  } catch (_error) {
    return null;
  }
}

/**
 * 토큰이 `leewayMs` 안에 만료되는지 판단한다.
 * exp를 읽을 수 없으면 false — 근거 없이 갱신을 유발하지 않는다.
 */
export function isTokenExpiringSoon(
  token: string | null | undefined,
  leewayMs: number,
): boolean {
  const expiryMs = getJwtExpiryMs(token);
  if (expiryMs === null) return false;
  return expiryMs - Date.now() <= leewayMs;
}
