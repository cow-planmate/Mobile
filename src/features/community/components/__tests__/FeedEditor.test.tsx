import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import FeedEditor from '../FeedEditor';

const mockToolbar = jest.fn((_props: { items: any[] }) => null);
const mockSetLink = jest.fn();
const mockLinkSheet = jest.fn((_props: any) => null);

jest.mock('@10play/tentap-editor', () => ({
  Images: {},
  TenTapStartKit: [],
  PlaceholderBridge: { configureExtension: jest.fn(() => ({})) },
  RichText: () => null,
  Toolbar: (props: { items: any[] }) => mockToolbar(props),
  useEditorBridge: () => ({ setLink: mockSetLink }),
  useEditorContent: () => undefined,
}));

jest.mock('../FeedLinkSheet', () => (props: any) => mockLinkSheet(props));

const lastItems = () =>
  mockToolbar.mock.calls[mockToolbar.mock.calls.length - 1][0].items;
const lastLinkSheet = () =>
  mockLinkSheet.mock.calls[mockLinkSheet.mock.calls.length - 1][0];

describe('FeedEditor', () => {
  beforeEach(() => {
    mockToolbar.mockClear();
    mockSetLink.mockClear();
    mockLinkSheet.mockClear();
  });

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
    ).toHaveLength(7);
    act(() =>
      tree.root
        .findByProps({
          accessibilityLabel: '서식 도구 더보기',
        })
        .props.onPress(),
    );
    expect(
      mockToolbar.mock.calls[mockToolbar.mock.calls.length - 1][0].items,
    ).toHaveLength(12);
    expect(
      tree.root
        .findAllByType(TouchableOpacity)
        .some(node => node.props.accessibilityLabel === '서식 도구 접기'),
    ).toBe(true);
    act(() => tree.unmount());
  });
  describe('링크', () => {
    const LINK_ITEM_INDEX = 4;
    const renderEditor = () => {
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
      return tree;
    };
    const state = (overrides: object) => ({
      editorState: { canSetLink: false, isLinkActive: false, ...overrides },
    });

    it('글자를 고르지 않았고 링크 위도 아니면 누를 수 없다', () => {
      const tree = renderEditor();
      const item = lastItems()[LINK_ITEM_INDEX];

      expect(item.disabled(state({}))).toBe(true);
      expect(item.disabled(state({ canSetLink: true }))).toBe(false);
      expect(item.disabled(state({ isLinkActive: true }))).toBe(false);
      act(() => tree.unmount());
    });

    it('눌러서 연 창에서 주소를 적용하면 선택한 글자에 링크를 건다', () => {
      const tree = renderEditor();
      expect(lastLinkSheet().visible).toBe(false);

      act(() =>
        lastItems()[LINK_ITEM_INDEX].onPress(state({ canSetLink: true }))(),
      );
      expect(lastLinkSheet().visible).toBe(true);
      expect(lastLinkSheet().initialUrl).toBe('');
      expect(lastLinkSheet().onRemove).toBeUndefined();

      act(() => lastLinkSheet().onApply('https://planmate.site'));
      expect(mockSetLink).toHaveBeenCalledWith('https://planmate.site');
      expect(lastLinkSheet().visible).toBe(false);
      act(() => tree.unmount());
    });

    it('이미 링크가 걸린 글자는 현재 주소를 보여 주고 지울 수 있다', () => {
      const tree = renderEditor();

      act(() =>
        lastItems()[LINK_ITEM_INDEX].onPress(
          state({ isLinkActive: true, activeLink: 'https://old.com' }),
        )(),
      );
      expect(lastLinkSheet().initialUrl).toBe('https://old.com');

      act(() => lastLinkSheet().onRemove());
      expect(mockSetLink).toHaveBeenCalledWith('');
      expect(lastLinkSheet().visible).toBe(false);
      act(() => tree.unmount());
    });
  });
});
