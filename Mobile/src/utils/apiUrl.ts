import { API_URL } from '@env';

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export function resolveApiUrl(path: string, baseUrl: string = API_URL): string {
  const trimmedPath = path.trim();

  if (ABSOLUTE_URL_PATTERN.test(trimmedPath)) {
    return trimmedPath;
  }

  const trimmedBaseUrl = baseUrl.trim();
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
