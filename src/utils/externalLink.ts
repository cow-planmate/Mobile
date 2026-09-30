import { Linking } from 'react-native';

const SAFE_URL_PATTERN = /^https?:\/\/\S/i;

export function isSafeExternalUrl(url: unknown): url is string {
  return typeof url === 'string' && SAFE_URL_PATTERN.test(url.trim());
}

export function openExternalUrl(url: unknown): boolean {
  if (!isSafeExternalUrl(url)) {
    if (__DEV__) {
      console.warn('[externalLink] 웹 링크가 아니라 열지 않습니다:', url);
    }
    return false;
  }

  Linking.openURL(url.trim()).catch(() => {

  });
  return true;
}
