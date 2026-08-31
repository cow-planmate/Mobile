import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CalendarModal from '../CalendarModal';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 2026-09-01(화)에 고정한다. 지난 날짜는 누를 수 없으므로 기준일이 흔들리면 안 된다.
const FIXED_NOW = new Date(2026, 8, 1, 9, 0, 0);

const dayLabel = (y: number, m: number, d: number) =>
  `${y}년 ${m + 1}월 ${d}일 ${WEEK_DAYS[new Date(y, m, d).getDay()]}요일`;

const press = (tree: renderer.ReactTestRenderer, label: string) =>
  act(() => {
    tree.root.findByProps({ accessibilityLabel: label }).props.onPress();
  });

const mount = (
  onConfirm: jest.Mock,
  onClose = jest.fn(),
  applyOn: 'select' | 'done' = 'select',
) => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <CalendarModal
        visible
        onClose={onClose}
        onConfirm={onConfirm}
        applyOn={applyOn}
      />,
    );
  });
  return tree;
};

describe('CalendarModal', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('끝 날짜를 고른 순간 확인 버튼 없이 반영한다', () => {
    const onConfirm = jest.fn();
    const tree = mount(onConfirm);

    press(tree, dayLabel(2026, 8, 12));
    expect(onConfirm).not.toHaveBeenCalled();

    press(tree, dayLabel(2026, 8, 14));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const { startDate, endDate } = onConfirm.mock.calls[0][0];
    expect(startDate.getDate()).toBe(12);
    expect(endDate.getDate()).toBe(14);

    act(() => tree.unmount());
  });

  it('시작일만 고르고 완료하면 당일치기로 확정한다', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    const tree = mount(onConfirm, onClose);

    press(tree, dayLabel(2026, 8, 12));
    // 생성 흐름에서는 다음 팝업으로 이어지므로 버튼이 "다음"이다.
    press(tree, '다음 단계로');

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const { startDate, endDate } = onConfirm.mock.calls[0][0];
    expect(startDate.getTime()).toBe(endDate.getTime());
    expect(onClose).toHaveBeenCalled();

    act(() => tree.unmount());
  });

  it('30일을 넘기면 반영하지 않고 경고를 보여준다', () => {
    const onConfirm = jest.fn();
    const tree = mount(onConfirm);

    // 9월 2일 → 10월 3일은 32일이라 한도를 넘는다. 10월 3일은 9월 격자의 다음 달 칸에 있다.
    press(tree, dayLabel(2026, 8, 2));
    press(tree, dayLabel(2026, 9, 3));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      tree.root.findAllByProps({
        children: '한 번에 최대 30일까지 선택할 수 있어요',
      }).length,
    ).toBeGreaterThan(0);

    act(() => tree.unmount());
  });

  describe("applyOn='done' (기본값)", () => {
    it('끝 날짜를 골라도 완료를 누르기 전에는 반영하지 않는다', () => {
      const onConfirm = jest.fn();
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <CalendarModal
            visible
            onClose={jest.fn()}
            onConfirm={onConfirm}
          />,
        );
      });

      press(tree, dayLabel(2026, 8, 12));
      press(tree, dayLabel(2026, 8, 14));
      expect(onConfirm).not.toHaveBeenCalled();

      press(tree, '선택 완료');
      expect(onConfirm).toHaveBeenCalledTimes(1);
      const { startDate, endDate } = onConfirm.mock.calls[0][0];
      expect(startDate.getDate()).toBe(12);
      expect(endDate.getDate()).toBe(14);

      act(() => tree.unmount());
    });

    it('배경을 눌러 닫으면 아무것도 반영하지 않는다', () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();
      const tree = mount(onConfirm, onClose, 'done');

      press(tree, dayLabel(2026, 8, 12));
      press(tree, '닫기');

      expect(onConfirm).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();

      act(() => tree.unmount());
    });
  });

  it('생성 흐름이면 다음, 가져오기면 완료로 문구가 갈린다', () => {
    const inFlow = mount(jest.fn(), jest.fn(), 'select');
    expect(
      inFlow.root.findAllByProps({ accessibilityLabel: '다음 단계로' }).length,
    ).toBeGreaterThan(0);
    expect(
      inFlow.root.findAllByProps({ accessibilityLabel: '선택 완료' }),
    ).toHaveLength(0);
    act(() => inFlow.unmount());

    const standalone = mount(jest.fn(), jest.fn(), 'done');
    expect(
      standalone.root.findAllByProps({ accessibilityLabel: '선택 완료' }).length,
    ).toBeGreaterThan(0);
    act(() => standalone.unmount());
  });

  it('지난 날짜는 누를 수 없다', () => {
    const onConfirm = jest.fn();
    const tree = mount(onConfirm);

    // 9월 1일 기준으로 8월 31일은 지난 날짜다.
    expect(
      tree.root.findByProps({ accessibilityLabel: dayLabel(2026, 7, 31) }).props
        .disabled,
    ).toBe(true);

    act(() => tree.unmount());
  });
});
