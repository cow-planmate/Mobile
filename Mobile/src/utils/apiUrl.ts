import { API_URL } from '@env';

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export function resolveApiUrl(path: string, baseUrl?: string): string {
  const trimmedPath = (path ?? '').trim();

  if (ABSOLUTE_URL_PATTERN.test(trimmedPath)) {
    return trimmedPath;
  }

  // .env 누락 등으로 API_URL이 undefined일 수 있으므로 방어한다.
  const trimmedBaseUrl = (baseUrl ?? API_URL ?? '').trim();
  if (!trimmedBaseUrl) {
    return trimmedPath;
  }

  const normalizedBaseUrl = trimmedBaseUrl.endsWith('/')
    ? trimmedBaseUrl
    : `${trimmedBaseUrl}/`;
  const relativePath = trimmedPath.startsWith('/')
    ? trimmedPath.slice(1)
    : trimmedPath;

  return new URL(relativePath, normalizedBaseUrl).toString();
}
