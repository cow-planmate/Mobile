import { Linking } from 'react-native';

/**
 * 외부 링크 열기.
 *
 * 게시글 본문처럼 사용자가 쓴 내용에 담긴 URL을 그대로 Linking.openURL에
 * 넘기면 안 된다. 안드로이드에서 `intent://`는 다른 앱의 컴포넌트를 실행할 수
 * 있고, `file://`은 로컬 경로를 가리킨다. 웹 링크만 통과시킨다.
 */

/** 열어도 되는 스킴. 앞뒤 공백은 무시하고 시작 부분만 본다. */
const SAFE_URL_PATTERN = /^https?:\/\/\S/i;

/** 웹 링크로 열어도 되는 URL인지 판별한다. */
export function isSafeExternalUrl(url: unknown): url is string {
  return typeof url === 'string' && SAFE_URL_PATTERN.test(url.trim());
}

/**
 * 웹 링크면 연다. 아니면 아무 일도 하지 않는다.
 *
 * 열지 못하는 링크 때문에 화면이 막히면 안 되므로 실패는 조용히 넘긴다.
 *
 * @returns 실제로 열기를 시도했는지 여부
 */
export function openExternalUrl(url: unknown): boolean {
  if (!isSafeExternalUrl(url)) {
    if (__DEV__) {
      console.warn('[externalLink] 웹 링크가 아니라 열지 않습니다:', url);
    }
    return false;
  }

  Linking.openURL(url.trim()).catch(() => {
    // 기기에 처리할 앱이 없는 경우 등 — 무시한다.
  });
  return true;
}
