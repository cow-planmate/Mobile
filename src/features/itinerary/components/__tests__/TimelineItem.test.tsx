import React from 'react';
import renderer, { act } from 'react-test-renderer';
import TimelineItem, { Place } from '../TimelineItem';
import { openExternalUrl } from '../../../../utils/externalLink';

jest.mock('../../../../utils/externalLink', () => ({
  openExternalUrl: jest.fn(),
}));

const basePlace: Place = {
  id: '1',
  name: '석봉도자기미술관',
  type: '관광지',
  categoryId: 0,
  startTime: '09:00',
  endTime: '10:00',
  address: '강원특별자치도 속초시 엑스포로 156',
  imageUrl: '',
  latitude: 38.19,
  longitude: 128.58,
};

const collect = (node: any, out: string[]) => {
  if (typeof node === 'string') {
    out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach(child => collect(child, out));
    return;
  }
  if (node?.children) collect(node.children, out);
};

const textsOf = (place: Place, isReadOnly = false) => {
  let tree: renderer.ReactTestRenderer | undefined;
  act(() => {
    tree = renderer.create(
      <TimelineItem item={place} isReadOnly={isReadOnly} />,
    );
  });
  const out: string[] = [];
  collect(tree!.toJSON(), out);
  return out.join('').replace(/\s+/g, ' ').trim();
};

/** ⋯를 눌러 동작 목록을 연다. 목록은 열기 전에는 그려지지 않는다. */
const openMenu = (tree: renderer.ReactTestRenderer) => {
  act(() => {
    tree.root
      .findByProps({ accessibilityLabel: '장소 옵션 열기' })
      .props.onPress();
  });
};

describe('TimelineItem 메모', () => {
  it('메모가 있으면 카드에 보인다', () => {
    expect(textsOf({ ...basePlace, memo: '표 예매함' })).toContain('표 예매함');
  });

  it('완성된 일정에서도 보인다', () => {
    expect(textsOf({ ...basePlace, memo: '표 예매함' }, true)).toContain(
      '표 예매함',
    );
  });

  it('앞뒤 공백을 털고 보여준다', () => {
    expect(textsOf({ ...basePlace, memo: '  표 예매함  ' })).toContain(
      '표 예매함',
    );
  });

  it('메모가 없거나 공백뿐이면 자리를 차지하지 않는다', () => {
    const withoutMemo = textsOf(basePlace);
    expect(textsOf({ ...basePlace, memo: '   ' })).toBe(withoutMemo);
    expect(textsOf({ ...basePlace, memo: '' })).toBe(withoutMemo);
  });

  it('카드가 짧으면 메모를 접는다', () => {
    const short = { ...basePlace, endTime: '09:15', memo: '표 예매함' };
    expect(textsOf(short)).not.toContain('표 예매함');
  });
});

describe('TimelineItem 튜토리얼 앵커 버튼 동작', () => {
  it('튜토리얼 실행 중일 때 일정 수정과 장소 정보는 동작하고 삭제는 비활성화된다', () => {
    const onEditPlace = jest.fn();
    const onShowDetail = jest.fn();
    const onDelete = jest.fn();

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem
          item={basePlace}
          isTourAnchor
          isTourRunning
          onEditPlace={onEditPlace}
          onShowDetail={onShowDetail}
          onDelete={onDelete}
        />,
      );
    });

    // 동작을 하나 고르면 목록이 닫히므로 그때마다 다시 연다.
    openMenu(tree);
    act(() => {
      tree.root
        .findByProps({ accessibilityLabel: '일정 수정' })
        .props.onPress();
    });
    expect(onEditPlace).toHaveBeenCalledTimes(1);

    openMenu(tree);
    act(() => {
      tree.root
        .findByProps({ accessibilityLabel: '장소 정보 보기' })
        .props.onPress();
    });
    expect(onShowDetail).toHaveBeenCalled();

    openMenu(tree);
    const deleteBtn = tree.root.findByProps({
      accessibilityLabel: '장소 삭제',
    });
    expect(deleteBtn.props.disabled).toBe(true);
    act(() => {
      if (deleteBtn.props.onPress) {
        deleteBtn.props.onPress();
      }
    });
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('메뉴에서 수정을 고르면 onEditPlace를 호출하고 메뉴를 닫는다', () => {
    const onEditPlace = jest.fn();
    const onPress = jest.fn();

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem
          item={basePlace}
          onEditPlace={onEditPlace}
          onPress={onPress}
        />,
      );
    });

    openMenu(tree);
    const editBtn = tree.root.findByProps({ accessibilityLabel: '일정 수정' });
    act(() => {
      editBtn.props.onPress();
    });
    expect(onEditPlace).toHaveBeenCalledTimes(1);
    expect(
      tree.root.findAllByProps({ accessibilityLabel: '일정 수정' }),
    ).toHaveLength(0);
  });

  it('카드 본문을 누르면 바로 수정 창이 열린다', () => {
    const onEditPlace = jest.fn();

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem item={basePlace} onEditPlace={onEditPlace} />,
      );
    });

    const body = tree.root.findByProps({
      accessibilityLabel: `${basePlace.name} 수정`,
    });
    act(() => {
      body.props.onPress();
    });
    expect(onEditPlace).toHaveBeenCalledTimes(1);
  });

  it('완성된 일정(읽기 전용)에서는 ⋯도 본문 누르기도 없다', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem item={basePlace} isReadOnly onEditPlace={jest.fn()} />,
      );
    });

    expect(
      tree.root.findAllByProps({ accessibilityLabel: '장소 옵션 열기' }),
    ).toHaveLength(0);
    expect(
      tree.root.findAllByProps({
        accessibilityLabel: `${basePlace.name} 수정`,
      }),
    ).toHaveLength(0);
  });

  it('튜토리얼이 아닌 실제 상황에서는 앵커 카드여도 삭제 버튼이 활성화된다', () => {
    const onDelete = jest.fn();

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem
          item={basePlace}
          isTourAnchor
          isTourRunning={false}
          onDelete={onDelete}
        />,
      );
    });

    openMenu(tree);
    const deleteBtn = tree.root.findByProps({
      accessibilityLabel: '장소 삭제',
    });

    expect(deleteBtn.props.disabled).toBe(false);
    act(() => {
      deleteBtn.props.onPress();
    });
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});

describe('TimelineItem ⋯ 동작 목록', () => {
  it('블록에는 ⋯ 하나만 보이고, 열면 웹과 같은 순서로 4개의 동작이 나온다', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem
          item={basePlace}
          onShowDetail={jest.fn()}
          onEditPlace={jest.fn()}
          onDelete={jest.fn()}
        />,
      );
    });

    const actionContainer = tree.root.findByProps({
      testID: 'timeline-item-actions',
    });
    const closedLabels = React.Children.toArray(actionContainer.props.children)
      .filter(React.isValidElement)
      .map((c: any) => c.props.accessibilityLabel);
    expect(closedLabels).toEqual(['장소 옵션 열기']);

    openMenu(tree);
    const wanted = [
      '장소 정보 보기',
      '지도에서 보기',
      '일정 수정',
      '장소 삭제',
    ];
    const labels = tree.root
      .findAll(node => wanted.includes(node.props.accessibilityLabel))
      .map(node => node.props.accessibilityLabel);

    expect(Array.from(new Set(labels))).toEqual(wanted);
  });

  it('장소 정보를 열 수 없는 장소(직접 추가)에는 정보 동작이 없다', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem item={basePlace} onEditPlace={jest.fn()} />,
      );
    });

    openMenu(tree);
    expect(
      tree.root.findAllByProps({ accessibilityLabel: '장소 정보 보기' }),
    ).toHaveLength(0);
  });

  it('지도 버튼을 누르면 기본적으로 네이버 지도 검색 URL을 openExternalUrl로 연다', () => {
    (openExternalUrl as jest.Mock).mockClear();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem
          item={basePlace}
          onShowDetail={jest.fn()}
          onEditPlace={jest.fn()}
          onDelete={jest.fn()}
        />,
      );
    });

    openMenu(tree);
    const mapBtn = tree.root.findByProps({
      accessibilityLabel: '지도에서 보기',
    });
    act(() => {
      mapBtn.props.onPress();
    });

    expect(openExternalUrl).toHaveBeenCalledWith(
      expect.stringContaining('https://map.naver.com/p/search/'),
    );
  });

  it('onOpenMap이 주어지면 기본 링크 대신 onOpenMap 콜백을 호출한다', () => {
    const onOpenMap = jest.fn();
    (openExternalUrl as jest.Mock).mockClear();

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem
          item={basePlace}
          onShowDetail={jest.fn()}
          onOpenMap={onOpenMap}
          onEditPlace={jest.fn()}
          onDelete={jest.fn()}
        />,
      );
    });

    openMenu(tree);
    const mapBtn = tree.root.findByProps({
      accessibilityLabel: '지도에서 보기',
    });
    act(() => {
      mapBtn.props.onPress();
    });

    expect(onOpenMap).toHaveBeenCalledTimes(1);
    expect(openExternalUrl).not.toHaveBeenCalled();
  });
});
