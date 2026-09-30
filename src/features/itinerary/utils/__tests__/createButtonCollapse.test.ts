import {
  CREATE_BUTTON_STEP,
  CREATE_BUTTON_TOP_ZONE,
  shouldOpenCreateButton,
} from '../createButtonCollapse';

describe('shouldOpenCreateButton', () => {
  it('맨 위 근처에서는 아래로 밀렸어도 펴 둔다', () => {
    expect(shouldOpenCreateButton(0, CREATE_BUTTON_TOP_ZONE, false)).toBe(true);
    expect(shouldOpenCreateButton(20, 40, false)).toBe(true);
  });

  it('아래로 문턱을 넘겨 밀면 접는다', () => {
    const from = 200;
    expect(
      shouldOpenCreateButton(from, from + CREATE_BUTTON_STEP + 1, true),
    ).toBe(false);
  });

  it('위로 문턱을 넘겨 올리면 다시 편다', () => {
    const from = 400;
    expect(
      shouldOpenCreateButton(from, from - CREATE_BUTTON_STEP - 1, false),
    ).toBe(true);
  });

  it('문턱을 넘지 못한 잔움직임에는 지금 모양을 지킨다', () => {
    expect(shouldOpenCreateButton(300, 304, false)).toBe(false);
    expect(shouldOpenCreateButton(300, 296, true)).toBe(true);
  });
});
