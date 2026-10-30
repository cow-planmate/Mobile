const WITH_SCHEME = /^(https?:\/\/[^\s/?#]+\S*|mailto:[^\s@]+@[^\s@]+)$/i;
const DOMAIN_LIKE = /^[\w-]+(\.[\w-]+)+(:\d+)?([/?#]\S*)?$/;

/**
 * 링크 입력을 저장할 주소로 다듬는다. 쓸 수 없는 값이면 null.
 *
 * 웹처럼 http·https·mailto만 받는다. 'naver.com'처럼 주소창에 흔히 치는 꼴은
 * 틀린 입력이 아니므로 https를 붙여 준다.
 */
export function normalizeLinkUrl(input: string): string | null {
  const value = input.trim();
  if (!value || /\s/.test(value)) return null;
  if (WITH_SCHEME.test(value)) return value;
  if (DOMAIN_LIKE.test(value)) return `https://${value}`;
  return null;
}
