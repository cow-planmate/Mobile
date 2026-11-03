/**
 * 공공 관광 정보의 이용·영업 시간을 읽기 좋게 나눈다.
 *
 * 원문은 "[하절기(4월~9월)]- 10:00~19:00- 입장 마감 18:00[동절기(10월~3월)]- ..."처럼
 * 계절 이름이 대괄호로 묶이고 항목이 하이픈으로 이어져 한 덩어리로 나온다.
 * 대괄호마다 줄을 나누고, 이름 뒤 하이픈은 지우고, 항목 사이 하이픈은 가운뎃점으로 바꾼다.
 * "09:00 - 18:00"처럼 앞뒤가 모두 띄어진 범위의 하이픈은 건드리지 않는다.
 */
export function formatUseTime(value: string): string {
  if (!value.includes('[')) return value;

  return value
    .split(/(?=\[)/)
    .map(part =>
      part
        .trim()
        .replace(/\]\s*-\s+/g, '] ')
        .replace(/(\S)-\s+(?=[^\d\s])/g, '$1 · '),
    )
    .filter(Boolean)
    .join('\n');
}
