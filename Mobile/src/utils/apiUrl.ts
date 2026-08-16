import { API_URL } from '@env';

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export function resolveApiUrl(path: string, baseUrl?: string): string {
  const trimmedPath = (path ?? '').trim();
  if (ABSOLUTE_URL_PATTERN.test(trimmedPath)) {
    return trimmedPath;
  }

  const trimmedBaseUrl = (baseUrl ?? API_URL ?? '').trim();
  if (!trimmedBaseUrl) {
    return trimmedPath;
  }

  const normalizedBase = trimmedBaseUrl.replace(/\/+$/, '');
  const normalizedPath = trimmedPath.replace(/^\/+/, '');
  return `${normalizedBase}/${normalizedPath}`;
}
