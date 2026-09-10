import React, { useEffect } from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditorCoachmark from '../EditorCoachmark';
import { CoachmarkProvider, useCoachmarkTarget } from '../CoachmarkContext';
import type { CoachmarkTargetId } from '../coachmarkSteps';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(() => Promise.resolve()),
  },
}));

const storage = AsyncStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
};

/**
 * 실제 화면 대신 잴 수 있는 자리만 등록해 둔다. 안내는 대상이 무엇인지 모르고
 * 위치만 알면 되므로 measureInWindow 하나면 충분하다.
 */
function FakeTarget({ id, top }: { id: CoachmarkTargetId; top: number }) {
  const attach = useCoachmarkTarget(id);
  useEffect(() => {
    attach({
      measureInWindow: (
        cb: (x: number, y: number, width: number, height: number) => void,
      ) => cb(20, top, 60, 40),
    });
  }, [attach, top]);
  return null;
}

function renderTour(children: React.ReactNode) {
  return renderer.create(
    <CoachmarkProvider>
      {children}
      <EditorCoachmark enabled />
    </CoachmarkProvider>,
  );
}

/** '1 / 2'처럼 조각으로 나뉘어 들어온 children도 한 줄로 이어 붙인다. */
const visibleTexts = (tree: renderer.ReactTestRenderer): string[] =>
  tree.root.findAllByType(Text).map(node => {
    const children = node.props.children;
    return Array.isArray(children)
      ? children.join('')
      : String(children ?? '');
  });

const press = (tree: renderer.ReactTestRenderer, label: string) =>
  act(() => {
    tree.root.findByProps({ accessibilityLabel: label }).props.onPress();
  });

/** 저장소 확인과 시작 대기가 모두 지나가도록 민다. */
const settle = async (tree: renderer.ReactTestRenderer) => {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  // Promise.all로 열세 자리를 한 번에 재고 나서야 첫 스텝이 뜬다.
  await act(async () => {
    await Promise.resolve();
  });
  return tree;
};

describe('EditorCoachmark', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    storage.getItem.mockReset().mockResolvedValue(null);
    storage.setItem.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('잴 수 있는 자리만 세어 번호를 이어 붙인다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="planName" top={100} />
          <FakeTarget id="planInfo" top={100} />
        </>,
      );
    });
    await settle(tree);

    const texts = visibleTexts(tree);
    expect(texts).toContain('일정 이름');
    // 열셋 중 둘만 잴 수 있으면 '1 / 2'다. 못 잰 것을 세면 번호가 건너뛴다.
    expect(texts).toContain('1 / 2');
  });

  it('다음을 누르면 그 다음 버튼으로 넘어간다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="planName" top={100} />
          <FakeTarget id="planInfo" top={100} />
        </>,
      );
    });
    await settle(tree);

    await press(tree, '다음 안내');

    const texts = visibleTexts(tree);
    expect(texts).toContain('일정 정보');
    expect(texts).toContain('2 / 2');
  });

  it('마지막에서 완료하면 안내를 닫고 봤다고 남긴다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planName" top={100} />);
    });
    await settle(tree);

    // 자리가 하나뿐이면 첫 스텝이 곧 마지막이다.
    await press(tree, '안내 완료');

    expect(visibleTexts(tree)).not.toContain('일정 이름');
    expect(storage.setItem).toHaveBeenCalledWith('editorCoachmarkSeen', '1');
  });

  it('건너뛰면 남은 스텝을 버리고 다시 뜨지 않게 한다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="planName" top={100} />
          <FakeTarget id="planInfo" top={100} />
        </>,
      );
    });
    await settle(tree);

    await press(tree, '안내 건너뛰기');

    expect(visibleTexts(tree)).not.toContain('일정 이름');
    expect(storage.setItem).toHaveBeenCalledWith('editorCoachmarkSeen', '1');
  });

  it('이미 본 사람에게는 뜨지 않는다', async () => {
    storage.getItem.mockResolvedValue('1');

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planName" top={100} />);
    });
    await settle(tree);

    expect(visibleTexts(tree)).not.toContain('일정 이름');
  });

  it('잴 수 있는 자리가 하나도 없으면 봤다고 치지 않는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(null);
    });
    await settle(tree);

    expect(visibleTexts(tree)).toHaveLength(0);
    // 다음 진입에 다시 시도해야 하므로 기록을 남기지 않는다.
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
