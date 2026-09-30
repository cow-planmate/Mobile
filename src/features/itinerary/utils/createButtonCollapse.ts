/**
 * 여행기 목록의 "여행기 쓰기" 단추를 펴 둘지 접을지 정한다.
 *
 * 목록을 내리는 동안에는 단추가 카드 오른쪽 아래를 가리므로 동그랗게 접고,
 * 다시 올리거나 맨 위에 닿으면 글자를 달아 편다.
 */

/** 손가락이 조금 떨렸다고 단추가 깜빡이지 않을 만큼의 거리 */
export const CREATE_BUTTON_STEP = 8;

/** 맨 위 근처에서는 가릴 카드가 없으므로 늘 펴 둔다 */
export const CREATE_BUTTON_TOP_ZONE = 60;

/** 접힌 단추의 지름. 원이어야 하므로 가로·세로가 같다. */
export const CREATE_BUTTON_COLLAPSED = 48;

export function shouldOpenCreateButton(
  previousOffset: number,
  offset: number,
  isOpen: boolean,
): boolean {
  if (offset <= CREATE_BUTTON_TOP_ZONE) return true;
  if (offset > previousOffset + CREATE_BUTTON_STEP) return false;
  if (offset < previousOffset - CREATE_BUTTON_STEP) return true;
  // 문턱을 넘지 못한 잔움직임에는 지금 모양을 그대로 지킨다.
  return isOpen;
}
