/* eslint-disable no-bitwise -- base64/UTF-8 디코딩은 비트 연산이 본질이다 */

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

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

      i += 4;
    }
  }

  return result;
};

const readEpochClaimMs = (
  token: string | null | undefined,
  claim: 'exp' | 'iat',
): number | null => {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const json = decodeBase64Url(parts[1]);
  if (!json) return null;

  try {
    const payload = JSON.parse(json);
    const value = payload?.[claim];
    return typeof value === 'number' ? value * 1000 : null;
  } catch (_error) {
    return null;
  }
};

export function getJwtExpiryMs(token: string | null | undefined): number | null {
  return readEpochClaimMs(token, 'exp');
}

export function getJwtIssuedAtMs(
  token: string | null | undefined,
): number | null {
  return readEpochClaimMs(token, 'iat');
}

export function isTokenExpiringSoon(
  token: string | null | undefined,
  leewayMs: number,
  clockSkewMs = 0,
): boolean {
  const expiryMs = getJwtExpiryMs(token);
  if (expiryMs === null) return false;
  return expiryMs - (Date.now() - clockSkewMs) <= leewayMs;
}
