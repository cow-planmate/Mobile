import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { BackHandler } from 'react-native';

const mockToastShow = jest.fn();

jest.mock('@react-navigation/native', () => {
  const ReactModule = require('react');
  return {
    useFocusEffect: (effect: React.EffectCallback) =>
      ReactModule.useEffect(effect, [effect]),
  };
});

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: (...args: any[]) => mockToastShow(...args) },
}));

import { useDoublePressExit } from '../useDoublePressExit';

const EXIT_WINDOW_MS = 2000;

let backHandlers: Array<() => boolean>;
let removeSpy: jest.Mock;

const pressBack = () => backHandlers[backHandlers.length - 1]();

const render = (enabled = true) => {
  const Probe = () => {
    useDoublePressExit(enabled);
    return null;
  };
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Probe />);
  });
  return tree!;
};

describe('useDoublePressExit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    backHandlers = [];
    removeSpy = jest.fn();
    mockToastShow.mockClear();

    jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation((_event: any, handler: any) => {
        backHandlers.push(handler);
        return { remove: removeSpy } as any;
      });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('첫 백은 종료를 막고 안내를 띄운다', () => {
    render();

    expect(pressBack()).toBe(true);
    expect(mockToastShow).toHaveBeenCalledTimes(1);
    expect(mockToastShow.mock.calls[0][0]).toMatchObject({
      text1: '한 번 더 누르면 종료돼요',
    });
  });

  it('창이 열려 있는 동안 두 번째 백은 종료로 넘긴다', () => {
    render();

    expect(pressBack()).toBe(true);
    expect(pressBack()).toBe(false);
  });

  it('확인 창이 지나면 다시 처음부터 확인받는다', () => {
    render();

    expect(pressBack()).toBe(true);
    act(() => {
      jest.advanceTimersByTime(EXIT_WINDOW_MS);
    });

    expect(pressBack()).toBe(true);
    expect(mockToastShow).toHaveBeenCalledTimes(2);
  });

  it('비활성화하면 백 버튼을 가로채지 않는다', () => {
    render(false);

    expect(backHandlers).toHaveLength(0);
  });

  it('화면을 벗어나면 리스너를 해제한다', () => {
    const tree = render();
    act(() => tree.unmount());

    expect(removeSpy).toHaveBeenCalledTimes(1);
  });
});
