import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import FeedLinkSheet from '../FeedLinkSheet';

jest.mock('../../../../components/modals/SheetModal', () => ({
  __esModule: true,
  default: ({ visible, children, footer }: any) =>
    visible ? (
      <>
        {children}
        {footer}
      </>
    ) : null,
}));

const textOf = (node: renderer.ReactTestInstance): string =>
  node.children.map(c => (typeof c === 'string' ? c : textOf(c))).join('');

const findButton = (tree: renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAllByProps({ accessibilityRole: 'button' })
    .find(node => typeof node.type !== 'string' && textOf(node).includes(label))!;

const render = (props: Partial<React.ComponentProps<typeof FeedLinkSheet>> = {}) => {
  const handlers = { onApply: jest.fn(), onClose: jest.fn() };
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <FeedLinkSheet visible initialUrl="" {...handlers} {...props} />,
    );
  });
  return { tree, ...handlers };
};

describe('FeedLinkSheet', () => {
  it('주소를 다듬어서 적용한다', () => {
    const { tree, onApply } = render();

    act(() => tree.root.findByType(TextInput).props.onChangeText('naver.com'));
    act(() => findButton(tree, '적용').props.onPress());

    expect(onApply).toHaveBeenCalledWith('https://naver.com');
  });

  it('쓸 수 없는 주소는 적용하지 않고 안내한다', () => {
    const { tree, onApply } = render();

    act(() => tree.root.findByType(TextInput).props.onChangeText('링크'));
    act(() => findButton(tree, '적용').props.onPress());

    expect(onApply).not.toHaveBeenCalled();
    expect(JSON.stringify(tree.toJSON())).toContain('올바른 링크 주소를 입력해 주세요.');

    act(() => tree.root.findByType(TextInput).props.onChangeText('https://a.com'));
    expect(JSON.stringify(tree.toJSON())).not.toContain('올바른 링크 주소');
  });

  it('처음 주소를 채워 열고, 링크 삭제는 지울 수 있을 때만 보인다', () => {
    const onRemove = jest.fn();
    const { tree } = render({ initialUrl: 'https://old.com', onRemove });

    expect(tree.root.findByType(TextInput).props.value).toBe('https://old.com');
    act(() => findButton(tree, '링크 삭제').props.onPress());
    expect(onRemove).toHaveBeenCalledTimes(1);

    const { tree: fresh } = render();
    expect(JSON.stringify(fresh.toJSON())).not.toContain('링크 삭제');
  });
});
