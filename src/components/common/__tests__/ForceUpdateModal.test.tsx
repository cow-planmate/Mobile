import React from 'react';
import { Modal } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import ForceUpdateModal from '../ForceUpdateModal';

it('업데이트 단추만 있고 뒤로 가기로 닫히지 않는다', () => {
  const onUpdate = jest.fn();
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<ForceUpdateModal visible onUpdate={onUpdate} />);
  });
  const modal = tree!.root.findByType(Modal);
  expect(modal.props.visible).toBe(true);
  expect(modal.props.onRequestClose()).toBeUndefined();

  act(() =>
    tree!.root.findByProps({ accessibilityLabel: '업데이트' }).props.onPress(),
  );
  expect(onUpdate).toHaveBeenCalledTimes(1);
  act(() => tree!.unmount());
});
