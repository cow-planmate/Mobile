import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import FeedEditor from '../FeedEditor';

const mockToolbar = jest.fn((_props: { items: any[] }) => null);
const mockSetLink = jest.fn();
const mockSetImage = jest.fn();
const mockLaunchImageLibrary = jest.fn();
const mockUploadImage = jest.fn();
const mockLinkSheet = jest.fn((_props: any) => null);

jest.mock('@10play/tentap-editor', () => ({
  Images: {},
  TenTapStartKit: [],
  PlaceholderBridge: { configureExtension: jest.fn(() => ({})) },
  RichText: () => null,
  Toolbar: (props: { items: any[] }) => mockToolbar(props),
  useEditorBridge: () => ({ setLink: mockSetLink, setImage: mockSetImage }),
  useEditorContent: () => undefined,
}));

jest.mock('../FeedLinkSheet', () => (props: any) => mockLinkSheet(props));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: (...args: unknown[]) => mockLaunchImageLibrary(...args),
}));
jest.mock('../../services/communityApi', () => ({
  uploadCommunityImage: (...args: unknown[]) => mockUploadImage(...args),
}));

const lastItems = () =>
  mockToolbar.mock.calls[mockToolbar.mock.calls.length - 1][0].items;
const lastLinkSheet = () =>
  mockLinkSheet.mock.calls[mockLinkSheet.mock.calls.length - 1][0];

describe('FeedEditor', () => {
  beforeEach(() => {
    mockToolbar.mockClear();
    mockSetLink.mockClear();
    mockLinkSheet.mockClear();
    mockSetImage.mockClear();
    mockLaunchImageLibrary.mockReset();
    mockUploadImage.mockReset();
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
          onImageUploaded={jest.fn()}
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
          onImageUploaded={jest.fn()}
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
  describe('본문 사진', () => {
    const photo = (name: string, overrides: object = {}) => ({
      uri: `file:///${name}`,
      type: 'image/jpeg',
      fileName: name,
      fileSize: 1000,
      ...overrides,
    });
    const renderEditor = (onImageUploaded = jest.fn()) => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <FeedEditor
            initialHtml=""
            editable
            placeholder="여행기를 적어 주세요"
            onChangeHtml={jest.fn()}
            onImageUploaded={onImageUploaded}
          />,
        );
      });
      return { tree, onImageUploaded };
    };
    const photoButton = (tree: renderer.ReactTestRenderer) =>
      tree.root.findByProps({ accessibilityLabel: '사진 삽입' });
    const press = async (tree: renderer.ReactTestRenderer) => {
      await act(async () => {
        await photoButton(tree).props.onPress();
      });
    };

    it('고른 사진을 올리고 고른 순서대로 본문에 넣는다', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [photo('a.jpg'), photo('b.jpg')],
      });
      mockUploadImage.mockImplementation(
        async (file: { name: string }) => `https://cdn/${file.name}`,
      );
      const { tree, onImageUploaded } = renderEditor();

      await press(tree);

      expect(mockSetImage.mock.calls).toEqual([
        ['https://cdn/a.jpg'],
        ['https://cdn/b.jpg'],
      ]);
      expect(onImageUploaded.mock.calls).toEqual([
        ['https://cdn/a.jpg'],
        ['https://cdn/b.jpg'],
      ]);
      act(() => tree.unmount());
    });

    it('선택을 취소하면 아무것도 올리지 않는다', async () => {
      mockLaunchImageLibrary.mockResolvedValue({ didCancel: true });
      const { tree } = renderEditor();

      await press(tree);

      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(mockSetImage).not.toHaveBeenCalled();
      act(() => tree.unmount());
    });

    it('맞지 않는 사진이면 올리지 않고 이유를 보여 준다', async () => {
      mockLaunchImageLibrary.mockResolvedValue({
        assets: [photo('a.bmp', { type: 'image/bmp' })],
      });
      const { tree } = renderEditor();

      await press(tree);

      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(JSON.stringify(tree.toJSON())).toContain('JPG, PNG, GIF, WebP');
      act(() => tree.unmount());
    });

    it('올리는 동안은 불러오는 중으로 바뀌고 다시 누를 수 없다', async () => {
      let finish!: (url: string) => void;
      mockLaunchImageLibrary.mockResolvedValue({ assets: [photo('a.jpg')] });
      mockUploadImage.mockReturnValue(
        new Promise<string>(resolve => {
          finish = resolve;
        }),
      );
      const { tree } = renderEditor();

      let first!: Promise<void>;
      await act(async () => {
        first = photoButton(tree).props.onPress();
      });
      expect(JSON.stringify(tree.toJSON())).toContain('불러오는 중');
      expect(photoButton(tree).props.disabled).toBe(true);

      await act(async () => {
        await photoButton(tree).props.onPress();
      });
      expect(mockLaunchImageLibrary).toHaveBeenCalledTimes(1);

      await act(async () => {
        finish('https://cdn/a.jpg');
        await first;
      });
      expect(JSON.stringify(tree.toJSON())).not.toContain('불러오는 중');
      expect(mockSetImage).toHaveBeenCalledWith('https://cdn/a.jpg');
      act(() => tree.unmount());
    });

    it('올리는 사이 화면을 떠나도 올라간 사진은 장부에 알린다', async () => {
      let finish!: (url: string) => void;
      mockLaunchImageLibrary.mockResolvedValue({ assets: [photo('a.jpg')] });
      mockUploadImage.mockReturnValue(
        new Promise<string>(resolve => {
          finish = resolve;
        }),
      );
      const { tree, onImageUploaded } = renderEditor();

      let pending!: Promise<void>;
      await act(async () => {
        pending = photoButton(tree).props.onPress();
      });
      act(() => tree.unmount());
      await act(async () => {
        finish('https://cdn/late.jpg');
        await pending;
      });

      expect(onImageUploaded).toHaveBeenCalledWith('https://cdn/late.jpg');
      expect(mockSetImage).not.toHaveBeenCalled();
    });
  });
});
