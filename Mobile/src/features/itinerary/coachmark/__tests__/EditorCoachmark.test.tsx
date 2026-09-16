import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

type MeasureInWindow = (
  cb: (x: number, y: number, width: number, height: number) => void,
) => void;
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
function FakeTarget({
  id,
  top,
  enabled = true,
}: {
  id: CoachmarkTargetId;
  top: number;
  /** 같은 이름표를 달고도 스스로 꺼져 있는 대상 - 시간표의 둘째 블록이 그렇다. */
  enabled?: boolean;
}) {
  const attach = useCoachmarkTarget(id, enabled);
  useEffect(() => {
    attach({
      measureInWindow: (
        cb: (x: number, y: number, width: number, height: number) => void,
      ) => cb(20, top, 60, 40),
    });
  }, [attach, top]);
  return null;
}

/** 시간표에 담긴 것 한 줄. 담겼는지·시간이 바뀌었는지만 보므로 이만큼이면 된다. */
const place = (id: string, startTime = '10:00', endTime = '11:00') => ({
  id,
  startTime,
  endTime,
});

const tourTree = (
  children: React.ReactNode,
  enabled: boolean = true,
  places: ReturnType<typeof place>[] = [],
) => (
  <CoachmarkProvider>
    {children}
    <TutorialLauncher />
    <EditorCoachmark enabled={enabled} places={places} />
  </CoachmarkProvider>
);

/**
 * 안내가 그려지는 판이 창 어디에 놓여 있는지.
 *
 * 테스트용 View는 제 자리를 재지 못하므로 여기서 대신 대답하게 한다. 0이면
 * 판과 창이 겹쳐 있는 것이고, 음수면 판이 창보다 위에서 시작한다 - 안드로이드는
 * 화면이 상태바 아래까지 깔리는데 measureInWindow는 상태바를 뺀 자리를
 * 돌려주어 실제로 이렇게 잡힌다.
 */
let hostTop = 0;

function renderTour(
  children: React.ReactNode,
  places: ReturnType<typeof place>[] = [],
) {
  return renderer.create(tourTree(children, true, places));
}

/**
 * 시간표가 달라진 것처럼 만들고, 알아서 넘어가기까지 두는 틈만큼 시계를 민다.
 */
const setPlaces = async (
  tree: renderer.ReactTestRenderer,
  children: React.ReactNode,
  places: ReturnType<typeof place>[],
) => {
  await act(async () => {
    tree.update(tourTree(children, true, places));
    await Promise.resolve();
  });
  await act(async () => {
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();
  });
};

/** 짚은 자리를 두르는 흰 테두리가 놓인 곳. */
const ringTop = (tree: renderer.ReactTestRenderer) => {
  const ring = tree.root.find(node => {
    if (node.type !== View) return false;
    const style = Array.isArray(node.props.style)
      ? node.props.style
      : [node.props.style];
    return style.some(
      entry => entry?.borderColor === 'rgba(255, 255, 255, 0.95)',
    );
  });
  const style = Array.isArray(ring.props.style)
    ? Object.assign({}, ...ring.props.style)
    : ring.props.style;
  return style.top;
};

/** '1 / 2'처럼 조각으로 나뉘어 들어온 children도 한 줄로 이어 붙인다. */
const visibleTexts = (tree: renderer.ReactTestRenderer): string[] =>
  tree.root.findAllByType(Text).map(node => {
    const children = node.props.children;
    return Array.isArray(children) ? children.join('') : String(children ?? '');
  });

const press = async (tree: renderer.ReactTestRenderer, label: string) => {
  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: label }).props.onPress();
    await Promise.resolve();
    await Promise.resolve();
  });
};

/**
 * 짚어 준 자리를 실제로 눌렀다 뗀 것처럼 만든다.
 *
 * 안내는 화면을 감싼 겹이 흘려보내는 좌표만 보므로, 그 겹에 직접 손가락을
 * 얹었다 뗀다. 넘어가기까지 두는 틈만큼 시계도 함께 민다.
 */
const touchAt = async (
  tree: renderer.ReactTestRenderer,
  x: number,
  y: number,
) => {
  const host = tree.root.find(
    node => node.type === View && typeof node.props.onTouchStart === 'function',
  );
  await act(async () => {
    host.props.onTouchStart({ nativeEvent: { pageX: x, pageY: y } });
    host.props.onTouchEnd({ nativeEvent: { pageX: x, pageY: y } });
  });
  await act(async () => {
    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();
  });
};

/** 짚어 준 것이 덮여 있는지. 눌러 보면 안 되는 단계만 덮는다. */
const isHoleBlocked = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByProps({ testID: 'coachmark-hole-block' }).length > 0;

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
    hostTop = 0;
    (
      View.prototype as unknown as { measureInWindow: MeasureInWindow }
    ).measureInWindow = cb => cb(0, hostTop, 360, 800);
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
          <FakeTarget id="planInfo" top={100} />
          <FakeTarget id="dayTabs" top={100} />
        </>,
      );
    });
    await settle(tree);
    // 스스로 뜨지 않는다 - 눌러야 시작한다.
    expect(visibleTexts(tree)).not.toContain('일정 정보');
    await openTour(tree);

    const texts = visibleTexts(tree);
    expect(texts).toContain('일정 정보');
    // 열셋 중 둘만 잴 수 있으면 '1 / 2'다. 못 잰 것을 세면 번호가 건너뛴다.
    expect(texts).toContain('1 / 2');
  });

  it('짚은 자리를 흰 테두리와 파란 링 두 겹으로 두른다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planInfo" top={100} />);
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
      tree = renderTour(<FakeTarget id="dayTabs" top={100} />);
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
          <FakeTarget id="planInfo" top={100} />
          <FakeTarget id="dayTabs" top={100} />
        </>,
      );
    });
    await settle(tree);
    await openTour(tree);

    await press(tree, '다음 안내');

    const texts = visibleTexts(tree);
    expect(texts).toContain('며칠차 고르기');
    expect(texts).toContain('2 / 2');
  });

  it('마지막에서 완료하면 안내를 닫고 단추는 남긴다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planInfo" top={100} />);
    });
    await settle(tree);
    await openTour(tree);

    // 자리가 하나뿐이면 첫 스텝이 곧 마지막이다.
    await press(tree, '안내 완료');

    expect(visibleTexts(tree)).not.toContain('일정 정보');
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
      tree = renderTour(<FakeTarget id="planInfo" top={100} />);
    });
    await settle(tree);
    await openTour(tree);
    await press(tree, '안내 완료');

    await openTour(tree);
    expect(visibleTexts(tree)).toContain('일정 정보');
  });

  it('건너뛰면 남은 스텝을 버린다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="planInfo" top={100} />
          <FakeTarget id="dayTabs" top={100} />
        </>,
      );
    });
    await settle(tree);
    await openTour(tree);

    await press(tree, '안내 건너뛰기');

    expect(visibleTexts(tree)).not.toContain('일정 정보');
  });

  it('처음 온 사람에게만 사용법을 권한다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planInfo" top={100} />);
    });
    await settle(tree);

    expect(visibleTexts(tree)).toContain('일정 만들기가 처음인가요?');
  });

  it('말풍선을 닫으면 기록하고 다시 권하지 않는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(<FakeTarget id="planInfo" top={100} />);
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
      tree = renderTour(<FakeTarget id="planInfo" top={100} />);
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

  it('눌러 볼 수 있는 단계는 구멍을 비우고 되돌릴 수 없는 단계는 덮는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="planInfo" top={100} />
          <FakeTarget id="complete" top={100} />
        </>,
      );
    });
    await settle(tree);
    await openTour(tree);

    // 일정 정보는 눌러 봐도 잃을 것이 없다 - 구멍이 비어 있어야 한다.
    expect(visibleTexts(tree)).toContain('일정 정보');
    expect(isHoleBlocked(tree)).toBe(false);

    await press(tree, '다음 안내');

    // 일정 완성은 누르면 저장하고 화면을 떠난다 - 보여 주기만 한다.
    expect(visibleTexts(tree)).toContain('일정 완성');
    expect(isHoleBlocked(tree)).toBe(true);
  });

  it('짚어 준 것을 직접 누르면 다음으로 넘어간다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="planInfo" top={100} />
          <FakeTarget id="dayTabs" top={100} />
        </>,
      );
    });
    await settle(tree);
    await openTour(tree);

    // 잰 자리가 (20, 100, 60, 40)이므로 구멍은 그보다 조금 넉넉하다.
    await touchAt(tree, 50, 120);

    const texts = visibleTexts(tree);
    expect(texts).toContain('며칠차 고르기');
    expect(texts).toContain('2 / 2');
  });

  it('구멍 밖을 눌러서는 넘어가지 않는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="planInfo" top={100} />
          <FakeTarget id="dayTabs" top={100} />
        </>,
      );
    });
    await settle(tree);
    await openTour(tree);

    await touchAt(tree, 300, 400);

    expect(visibleTexts(tree)).toContain('일정 정보');
  });

  it('되돌릴 수 없는 단계는 구멍을 눌러도 넘어가지 않는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="undo" top={100} />
          <FakeTarget id="complete" top={100} />
        </>,
      );
    });
    await settle(tree);
    await openTour(tree);

    await touchAt(tree, 50, 120);

    // 덮여 있으므로 애초에 눌리지도 않지만, 넘어가지도 않아야 한다.
    expect(visibleTexts(tree)).toContain('되돌리기');
  });

  it('판이 창과 어긋나 있어도 짚은 자리를 그대로 두른다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      hostTop = -48;
      tree = renderTour(<FakeTarget id="planInfo" top={100} />);
    });
    await settle(tree);
    await openTour(tree);

    // 창 기준 100은 판 기준 148이다. 판이 창보다 48만큼 위에서 시작하므로
    // 그만큼 되돌려 놓지 않으면 테두리가 실제 버튼보다 48 위에 그려진다.
    // 동그란 버튼은 구멍을 6만큼 넉넉히 뚫는다.
    expect(ringTop(tree)).toBe(148 - 6);
  });

  it('판이 어긋나 있어도 실제 버튼 자리를 누르면 넘어간다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      hostTop = -48;
      tree = renderTour(
        <>
          <FakeTarget id="planInfo" top={100} />
          <FakeTarget id="dayTabs" top={100} />
        </>,
      );
    });
    await settle(tree);
    await openTour(tree);

    // 손가락 자리는 판 기준으로 들어온다 - 창 기준 자리를 눌러서는 안 넘어간다.
    await touchAt(tree, 50, 120);
    expect(visibleTexts(tree)).toContain('일정 정보');

    await touchAt(tree, 50, 168);
    expect(visibleTexts(tree)).toContain('며칠차 고르기');
  });

  it('손짓을 보여 주는 단계에서만 손가락 자국이 뜬다', async () => {
    const targets = (
      <>
        <FakeTarget id="placeSheet" top={100} />
        <FakeTarget id="checklist" top={100} />
      </>
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(targets);
    });
    await settle(tree);
    await openTour(tree);

    // 장소 담기는 어디를 잡아 어느 쪽으로 끄는지가 말로 안 그려진다.
    expect(visibleTexts(tree)).toContain('장소 담기');
    expect(
      tree.root.findAllByProps({ testID: 'coachmark-gesture' }).length,
    ).toBeGreaterThan(0);

    // 장소 담기는 직접 담아야 넘어간다.
    await setPlaces(tree, targets, [place('p1')]);

    // 그냥 누르면 되는 단추에는 손짓을 얹지 않는다.
    expect(visibleTexts(tree)).toContain('체크리스트');
    expect(tree.root.findAllByProps({ testID: 'coachmark-gesture' })).toEqual(
      [],
    );
  });

  it('장소를 담아 보라고 권하되 막지는 않는다', async () => {
    const targets = (
      <>
        <FakeTarget id="placeSheet" top={100} />
        <FakeTarget id="checklist" top={100} />
      </>
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(targets);
    });
    await settle(tree);
    await openTour(tree);

    // 무엇을 해보면 되는지 권하고, '다음'은 언제든 열어 둔다.
    const texts = visibleTexts(tree);
    expect(texts).toContain('장소를 하나 담아 보세요. 담으면 바로 넘어가요.');
    expect(texts).not.toContain('직접 눌러 보면 다음으로 넘어가요.');
    expect(
      tree.root.findByProps({ accessibilityLabel: '다음 안내' }).props.disabled,
    ).toBeFalsy();

    // 패널을 한 번 건드린 것은 담은 것이 아니다 - 그것으로는 넘어가지 않는다.
    await touchAt(tree, 50, 120);
    expect(visibleTexts(tree)).toContain('장소 담기');

    await press(tree, '다음 안내');
    expect(visibleTexts(tree)).toContain('체크리스트');
  });

  it('장소를 담으면 한 번 더 누르지 않아도 넘어간다', async () => {
    const targets = (
      <>
        <FakeTarget id="placeSheet" top={100} />
        <FakeTarget id="checklist" top={100} />
      </>
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(targets);
    });
    await settle(tree);
    await openTour(tree);

    await setPlaces(tree, targets, [place('p1')]);
    expect(visibleTexts(tree)).toContain('체크리스트');
  });

  it('있던 블록의 시간이 달라졌을 때만 시간 조절을 해낸 것으로 친다', async () => {
    const targets = (
      <>
        <FakeTarget id="timelineBlock" top={100} />
        <FakeTarget id="checklist" top={100} />
      </>
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(targets, [place('p1')]);
    });
    await settle(tree);
    await openTour(tree);

    expect(visibleTexts(tree)).toContain(
      '시간을 한 번 바꿔 보세요. 바꾸면 바로 넘어가요.',
    );

    // 장소를 하나 더 담은 것은 시간 조절이 아니다.
    await setPlaces(tree, targets, [place('p1'), place('p2', '13:00', '14:00')]);
    expect(visibleTexts(tree)).toContain('시간 조절');

    await setPlaces(tree, targets, [
      place('p1', '10:00', '11:30'),
      place('p2', '13:00', '14:00'),
    ]);
    expect(visibleTexts(tree)).toContain('체크리스트');
  });

  it('담긴 것이 없으면 시간을 바꿔 보라고 권하지 않는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      // 시간표가 비면 그 자리에는 눈에만 있는 예시 블록이 떠 있다.
      // 끌 수 없는 것을 끌어 보라고 하면 안내가 거짓말이 된다.
      tree = renderTour(<FakeTarget id="timelineBlock" top={100} />);
    });
    await settle(tree);
    await openTour(tree);

    const texts = visibleTexts(tree);
    expect(texts).toContain('시간 조절');
    expect(texts).not.toContain(
      '시간을 한 번 바꿔 보세요. 바꾸면 바로 넘어가요.',
    );
    expect(texts).not.toContain('직접 눌러 보면 다음으로 넘어가요.');
  });

  it('첫 단계에는 이전이 없고 넘어간 뒤에는 되돌아갈 수 있다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(
        <>
          <FakeTarget id="planInfo" top={100} />
          <FakeTarget id="dayTabs" top={100} />
        </>,
      );
    });
    await settle(tree);
    await openTour(tree);

    // 첫 단계에서는 돌아갈 곳이 없다.
    expect(tree.root.findAllByProps({ accessibilityLabel: '이전 안내' })).toEqual(
      [],
    );

    await press(tree, '다음 안내');
    expect(visibleTexts(tree)).toContain('며칠차 고르기');

    await press(tree, '이전 안내');
    const texts = visibleTexts(tree);
    expect(texts).toContain('일정 정보');
    expect(texts).toContain('1 / 2');
  });

  it('같은 이름표를 단 둘째가 첫째의 등록을 지우지 않는다', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      // 시간표 블록은 그날 첫 블록만 짚는다 - 둘째 블록도 같은 이름표를 달고
      // 있지만 스스로 꺼져 있다. 그 둘째가 첫째의 등록까지 지우면 안 된다.
      tree = renderTour(
        <>
          <FakeTarget id="timelineBlock" top={100} />
          <FakeTarget id="timelineBlock" top={300} enabled={false} />
        </>,
        [place('p1')],
      );
    });
    await settle(tree);
    await openTour(tree);

    expect(visibleTexts(tree)).toContain('시간 조절');
  });

  it('안내 도중 화면 밖으로 밀려난 자리는 건너뛰지 않고 다시 끌어온다', async () => {
    // 화면이 끌어올 수 있다고 답하는 자리만 - 시간표 블록이 그런 자리다.
    const reveal = jest.fn((target: CoachmarkTargetId) => target === 'dayTabs');
    /** 시간표가 굴러가면 짚으려던 블록이 위로 밀려난다 - top으로 그것을 흉내 낸다. */
    const tree2 = (dayTabsTop: number) => (
      <CoachmarkProvider>
        <FakeTarget id="planInfo" top={100} />
        <FakeTarget id="dayTabs" top={dayTabsTop} />
        <TutorialLauncher />
        <EditorCoachmark enabled onRevealTarget={reveal} />
      </CoachmarkProvider>
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(tree2(100));
    });
    await settle(tree);
    await openTour(tree);
    expect(visibleTexts(tree)).toContain('1 / 2');

    // 다음 단계로 가기 직전에 그 자리가 화면 밖으로 밀려난다.
    await act(async () => {
      tree.update(tree2(-200));
      await Promise.resolve();
    });
    await press(tree, '다음 안내');

    // 없어진 것으로 치고 넘겨 버리지 않는다 - 끌어와 달라고 먼저 부탁한다.
    expect(reveal).toHaveBeenCalledWith('dayTabs');
    expect(visibleTexts(tree)).not.toContain('며칠차 고르기');

    // 끌어와서 다시 보이면 그 단계를 그대로 짚는다.
    await act(async () => {
      tree.update(tree2(100));
      jest.advanceTimersByTime(600);
      await Promise.resolve();
      await Promise.resolve();
    });

    const texts = visibleTexts(tree);
    expect(texts).toContain('며칠차 고르기');
    expect(texts).toContain('2 / 2');
  });

  it('끌어와도 끝내 안 보이면 그 단계는 건너뛴다', async () => {
    // 화면이 끌어올 수 있다고 답하는 자리만 - 시간표 블록이 그런 자리다.
    const reveal = jest.fn((target: CoachmarkTargetId) => target === 'dayTabs');
    const tree3 = (dayTabsTop: number) => (
      <CoachmarkProvider>
        <FakeTarget id="planInfo" top={100} />
        <FakeTarget id="dayTabs" top={dayTabsTop} />
        <FakeTarget id="dayPeriod" top={100} />
        <TutorialLauncher />
        <EditorCoachmark enabled onRevealTarget={reveal} />
      </CoachmarkProvider>
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(tree3(100));
    });
    await settle(tree);
    await openTour(tree);

    await act(async () => {
      tree.update(tree3(-200));
      await Promise.resolve();
    });
    await press(tree, '다음 안내');

    await act(async () => {
      jest.advanceTimersByTime(600);
      await Promise.resolve();
      await Promise.resolve();
    });

    // 한 단계에 한 번만 부탁하고, 그래도 안 보이면 다음으로 넘어간다.
    expect(reveal.mock.calls.filter(([t]) => t === 'dayTabs')).toHaveLength(1);
    expect(visibleTexts(tree)).toContain('여행 기간 바꾸기');
  });

  it('가려지는 동안 숨었다가 다시 보이면 같은 단계로 돌아온다', async () => {
    const targets = (
      <>
        <FakeTarget id="planInfo" top={100} />
        <FakeTarget id="dayTabs" top={100} />
      </>
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderTour(targets);
    });
    await settle(tree);
    await openTour(tree);
    await press(tree, '다음 안내');
    expect(visibleTexts(tree)).toContain('며칠차 고르기');

    // 모달이 덮으면 짚을 자리가 가려진다 - 그동안은 숨는다.
    await act(async () => {
      tree.update(tourTree(targets, false));
      await Promise.resolve();
    });
    expect(visibleTexts(tree)).not.toContain('며칠차 고르기');

    // 모달을 닫으면 그 자리를 다시 재서 보던 단계로 돌아온다.
    await act(async () => {
      tree.update(tourTree(targets, true));
      await Promise.resolve();
      await Promise.resolve();
    });
    const texts = visibleTexts(tree);
    expect(texts).toContain('며칠차 고르기');
    expect(texts).toContain('2 / 2');
  });
});
