import React from 'react';
import renderer, { act } from 'react-test-renderer';
import TimelineItem, { Place } from '../TimelineItem';

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
  it('튜토리얼 실행 중일 때 시간 수정과 장소 정보는 동작하고 삭제는 비활성화된다', () => {
    const onEditTime = jest.fn();
    const onShowDetail = jest.fn();
    const onDelete = jest.fn();

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TimelineItem
          item={basePlace}
          isTourAnchor
          isTourRunning
          onEditTime={onEditTime}
          onShowDetail={onShowDetail}
          onDelete={onDelete}
        />,
      );
    });

    const editBtn = tree.root.findByProps({ accessibilityLabel: '일정 수정' });
    const detailBtn = tree.root.findByProps({
      accessibilityLabel: '장소 정보 보기',
    });
    const deleteBtn = tree.root.findByProps({
      accessibilityLabel: '장소 삭제',
    });

    act(() => {
      editBtn.props.onPress();
    });
    expect(onEditTime).toHaveBeenCalledWith('startTime');

    act(() => {
      detailBtn.props.onPress();
    });
    expect(onShowDetail).toHaveBeenCalled();

    expect(deleteBtn.props.disabled).toBe(true);
    act(() => {
      if (deleteBtn.props.onPress) {
        deleteBtn.props.onPress();
      }
    });
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('연필 아이콘을 누르면 onEditPlace를 우선 호출하고 본문 텍스트는 클릭되지 않는다', () => {
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

    const editBtn = tree.root.findByProps({ accessibilityLabel: '일정 수정' });
    act(() => {
      editBtn.props.onPress();
    });
    expect(onEditPlace).toHaveBeenCalledTimes(1);
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
