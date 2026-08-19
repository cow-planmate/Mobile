/**
 * SNS 로그인 WebView는 제공자 페이지를 거쳐 여러 번 이동한다. 콜백 URL의
 * 쿼리에 실린 code는 토큰으로 교환되는 자격 증명이므로, 우리 API와 같은
 * 출처에서 온 URL만 신뢰해야 한다. 출처를 확인하지 않으면 리다이렉트 체인에
 * 끼어든 다른 페이지가 code를 흘려넣을 수 있다.
 */
const ORIGIN_PATTERN = /^(https?:\/\/[^/?#]+)/i;

const originOf = (url: string): string | null => {
  const matched = ORIGIN_PATTERN.exec((url ?? '').trim());
  return matched ? matched[1].toLowerCase() : null;
};

export const isTrustedSnsCallbackUrl = (
  url: string | null | undefined,
  apiBaseUrl: string | null | undefined,
): boolean => {
  const target = originOf(url ?? '');
  const expected = originOf(apiBaseUrl ?? '');
  if (!target || !expected) return false;
  return target === expected;
};
