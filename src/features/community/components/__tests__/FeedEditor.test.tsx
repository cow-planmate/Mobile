import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import FeedEditor from '../FeedEditor';

const mockToolbar = jest.fn((_props: { items: unknown[] }) => null);

jest.mock('@10play/tentap-editor', () => ({
  Images: {},
  TenTapStartKit: [],
  PlaceholderBridge: { configureExtension: jest.fn(() => ({})) },
  RichText: () => null,
  Toolbar: (props: { items: unknown[] }) => mockToolbar(props),
  useEditorBridge: () => ({}),
  useEditorContent: () => undefined,
}));

describe('FeedEditor', () => {
  beforeEach(() => mockToolbar.mockClear());

  it('자주 쓰는 서식만 먼저 보이고 나머지는 사용자가 펼친다', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <FeedEditor
          initialHtml=""
          editable
          placeholder="여행기를 적어 주세요"
          onChangeHtml={jest.fn()}
        />,
      );
    });

    expect(
      mockToolbar.mock.calls[mockToolbar.mock.calls.length - 1][0].items,
    ).toHaveLength(6);
    act(() =>
      tree.root
        .findByProps({
          accessibilityLabel: '서식 도구 더보기',
        })
        .props.onPress(),
    );
    expect(
      mockToolbar.mock.calls[mockToolbar.mock.calls.length - 1][0].items,
    ).toHaveLength(11);
    expect(
      tree.root
        .findAllByType(TouchableOpacity)
        .some(node => node.props.accessibilityLabel === '서식 도구 접기'),
    ).toBe(true);
    act(() => tree.unmount());
  });
});
