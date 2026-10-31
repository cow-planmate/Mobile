import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import Toast from 'react-native-toast-message';

import FeedbackModal from '../FeedbackModal';
import { submitFeedback } from '../../../../api/feedback';

jest.mock('../../../../api/feedback', () => ({
  FEEDBACK_MAX_LENGTH: 1000,
  submitFeedback: jest.fn(),
}));

const mockedSubmit = submitFeedback as jest.Mock;

const mount = (onClose = jest.fn()) => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<FeedbackModal visible onClose={onClose} />);
  });
  return tree;
};

const type = (tree: renderer.ReactTestRenderer, text: string) =>
  act(() => {
    tree.root.findByType(TextInput).props.onChangeText(text);
  });

// 겹친 래퍼 말고 실제 눌리는 노드 하나를 고른다.
const sendButton = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityLabel === '의견 보내기' &&
      typeof n.props.onPress === 'function',
  )[0];

const send = async (tree: renderer.ReactTestRenderer) => {
  await act(async () => {
    sendButton(tree).props.onPress();
  });
};

describe('FeedbackModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('내용이 비어 있으면 보내기가 잠겨 있다', () => {
    const tree = mount();
    expect(sendButton(tree).props.disabled).toBe(true);

    type(tree, '   ');
    expect(sendButton(tree).props.disabled).toBe(true);

    type(tree, '좋아요');
    expect(sendButton(tree).props.disabled).toBe(false);
  });

  it('보내기에 성공하면 닫고 안내 토스트를 띄운다', async () => {
    mockedSubmit.mockResolvedValue(undefined);
    const onClose = jest.fn();
    const tree = mount(onClose);

    type(tree, '지도가 더 컸으면 좋겠어요');
    await send(tree);

    expect(mockedSubmit).toHaveBeenCalledWith('지도가 더 컸으면 좋겠어요');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' }),
    );
  });

  it('보내기에 실패하면 닫지 않고 입력한 내용을 남긴다', async () => {
    mockedSubmit.mockRejectedValue(new Error('network'));
    const onClose = jest.fn();
    const tree = mount(onClose);

    type(tree, '길게 쓴 의견');
    await send(tree);

    expect(onClose).not.toHaveBeenCalled();
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' }),
    );
    expect(tree.root.findByType(TextInput).props.value).toBe('길게 쓴 의견');
    expect(sendButton(tree).props.disabled).toBe(false);
  });
});
