// 서버가 보내는 categoryId/contentTypeId는 관광지·숙소·식당 외에 세부
// 코드(12/14/15/28, 32, 39 등)가 섞여 오므로, 화면에 쓰는 0~4 범위로
// 정규화한다. 여러 화면(에디터, 추천 목록, 컨텍스트)이 각자 이 로직을
// 복붙해 쓰다 '직접 추가' 분기가 한쪽에서만 빠지는 등 갈라졌던 것을 여기
// 하나로 합친다.
export const normalizeCategoryId = (
  rawId: number | undefined,
  type?: string,
): number => {
  const id = rawId ?? 4;
  if ([0, 1, 2, 3, 4].includes(id)) return id;
  if ([12, 14, 15, 28].includes(id)) return 0;
  if (id === 32) return 1;
  if (id === 39) return 2;
  switch (type) {
    case '관광지':
      return 0;
    case '숙소':
      return 1;
    case '식당':
      return 2;
    case '직접 추가':
      return 3;
    default:
      return 4;
  }
};
