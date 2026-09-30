/**
 * 이미지 주소를 https로 올린다.
 *
 * 관광공사(TourAPI)가 같은 사진을 http와 https 양쪽으로 섞어 내려준다.
 * 안드로이드는 릴리스 빌드에서 http를 막으므로, 그대로 두면 어떤 장소는
 * 사진이 나오고 어떤 장소는 첫 글자만 나오는 상태가 된다.
 *
 * 같은 호스트가 https도 받아주므로 올려서 쓴다. 그래도 실패하면 부르는 쪽의
 * 대체 표시로 내려가니, 올려서 나빠질 일은 없다.
 */
export const toSecureImageUrl = (url?: string | null): string => {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '';
  return trimmed.replace(/^http:\/\//i, 'https://');
};
