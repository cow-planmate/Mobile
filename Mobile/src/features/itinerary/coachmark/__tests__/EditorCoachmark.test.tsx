import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Path } from 'react-native-svg';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditorCoachmark from '../EditorCoachmark';
import TutorialLauncher from '../TutorialLauncher';
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
      <TutorialLauncher />
      <EditorCoachmark enabled />
    </CoachmarkProvider>,
  );
}

/** '1 / 2'처럼 조각으로 나뉘어 들어온 children도 한 줄로 이어 붙인다. */
const visibleTexts = (tree: renderer.ReactTestRenderer): string[] =>
  tree.root.findAllByType(Text).map(node => {
    const children = node.props.children;
    return Array.isArray(children) ? children.join('') : String(children ?? '');
  });

const press = (tree: renderer.ReactTestRenderer, label: string) =>
  act(() => {
    tree.root.findByProps({ accessibilityLabel: label }).props.onPress();
  });

/** 저장소 확인이 끝나 말풍선 여부가 정해지도록 민다. */
const settle = async (tree: renderer.ReactTestRenderer) => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return tree;
};

/** 사용법 단추를 눌러 안내를 연다. 열세 자리를 다 재고 나서야 첫 스텝이 뜬다. */
const openTour = async (tree: renderer.ReactTestRenderer) => {
  await press(tree, '사용법 보기');
  await act(async () => {
    await Promise.resolve();
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
    // 스스로 뜨지 않는다 - 눌러야 시작한다.
    expect(visibleTexts(tree)).not.toContain('일정 이름');
    await openTour(tree);

    const texts = visibleTexts(tree);
    expect(texts).toContain('일정 이름');
    // 열셋 중 둘만 잴 수 있으면 '1 / 2'다. 못 잰 것을 세면 번호가 건너뛴다.
    expect(texts).toContain('1 / 2');
  });

  it('짚은 자리를 흰 테두리와 파란 링 두 겹으로 두른다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planName" top={100} />);
    });
    await settle(tree);
    await openTour(tree);

    const borderColors = tree.root
      .findAllByType(View)
      .flatMap(node =>
        (Array.isArray(node.props.style)
          ? node.props.style
          : [node.props.style]
        ).map(entry => entry?.borderColor),
      )
      .filter(Boolean);

    // 웹 스포트라이트와 같은 두 겹 - 흰 줄 하나만으로는 어두운 바탕에 묻힌다.
    expect(borderColors).toContain('rgba(255, 255, 255, 0.95)');
    expect(borderColors).toContain('rgba(19, 68, 255, 0.72)');
  });

  it('어두운 막은 길 하나로 덮고 구멍만 비운다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      // 툴바 아이콘은 동그랗게 짚는다 - 네모로 뚫으면 귀퉁이가 흰 채로 남는다.
      tree = renderTour(<FakeTarget id="planInfo" top={100} />);
    });
    await settle(tree);
    await openTour(tree);

    const path = tree.root.findAllByType(Path)[0];

    // 겉과 구멍을 한 길에 담고 evenodd로 칠해야 구멍만 비워진다.
    expect(path.props.fillRule).toBe('evenodd');
    expect(path.props.fill).toBe('rgba(2, 6, 23, 0.65)');
    // 구멍 모서리는 호(A)로 돈다 - 네모로 뚫으면 이 글자가 없다.
    expect(path.props.d).toContain('A');
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
    await openTour(tree);

    await press(tree, '다음 안내');

    const texts = visibleTexts(tree);
    expect(texts).toContain('일정 정보');
    expect(texts).toContain('2 / 2');
  });

  it('마지막에서 완료하면 안내를 닫고 단추는 남긴다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planName" top={100} />);
    });
    await settle(tree);
    await openTour(tree);

    // 자리가 하나뿐이면 첫 스텝이 곧 마지막이다.
    await press(tree, '안내 완료');

    expect(visibleTexts(tree)).not.toContain('일정 이름');
    // 다시 볼 수 있어야 하므로 '봤다'는 기록은 남기지 않는다.
    expect(storage.setItem).not.toHaveBeenCalledWith(
      'editorCoachmarkSeen',
      '1',
    );
    expect(
      tree.root.findAllByProps({ accessibilityLabel: '사용법 보기' }).length,
    ).toBeGreaterThan(0);
  });

  it('닫은 뒤에도 다시 열 수 있다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planName" top={100} />);
    });
    await settle(tree);
    await openTour(tree);
    await press(tree, '안내 완료');

    await openTour(tree);
    expect(visibleTexts(tree)).toContain('일정 이름');
  });

  it('건너뛰면 남은 스텝을 버린다', async () => {
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
    await openTour(tree);

    await press(tree, '안내 건너뛰기');

    expect(visibleTexts(tree)).not.toContain('일정 이름');
  });

  it('처음 온 사람에게만 사용법을 권한다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planName" top={100} />);
    });
    await settle(tree);

    expect(visibleTexts(tree)).toContain('일정 만들기가 처음인가요?');
  });

  it('말풍선을 닫으면 기록하고 다시 권하지 않는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planName" top={100} />);
    });
    await settle(tree);

    await press(tree, '사용법 안내 닫기');

    expect(visibleTexts(tree)).not.toContain('일정 만들기가 처음인가요?');
    expect(storage.setItem).toHaveBeenCalledWith(
      'editorTutorialNudgeDismissed',
      '1',
    );
    // 닫았어도 단추는 남아 있어야 한다.
    expect(
      tree.root.findAllByProps({ accessibilityLabel: '사용법 보기' }).length,
    ).toBeGreaterThan(0);
  });

  it('옛 자동 안내를 이미 본 사람에게는 권하지 않는다', async () => {
    // 새 키는 비어 있고 옛 키만 있는 상태 - 예전 버전에서 안내를 끝까지 본 사람.
    storage.getItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'editorCoachmarkSeen' ? '1' : null),
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planName" top={100} />);
    });
    await settle(tree);

    expect(visibleTexts(tree)).not.toContain('일정 만들기가 처음인가요?');
  });

  it('잴 수 있는 자리가 하나도 없으면 조용히 닫는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(null);
    });
    await settle(tree);
    await openTour(tree);

    // 빈 말풍선을 띄우지 않는다. 단추는 그대로라 다시 누르면 된다.
    expect(visibleTexts(tree)).not.toContain('1 / 1');
    expect(
      tree.root.findAllByProps({ accessibilityLabel: '사용법 보기' }).length,
    ).toBeGreaterThan(0);
  });
});
