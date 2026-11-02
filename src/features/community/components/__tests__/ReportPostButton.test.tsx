import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import ReportPostButton from '../ReportPostButton';

const mockShowAlert = jest.fn();
const mockMutateAsync = jest.fn();
let mockUser: { userId: string } | null = { userId: 'me' };

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));
jest.mock('../../../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) => selector({ user: mockUser }),
}));
jest.mock('../../hooks/queries', () => ({
  useReportPost: () => ({ mutateAsync: mockMutateAsync }),
}));
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
    .findAllByType(TouchableOpacity)
    .find(button => textOf(button).includes(label))!;

const openMenu = (tree: renderer.ReactTestRenderer) =>
  act(() =>
    tree.root
      .findAllByType(TouchableOpacity)
      .find(button => button.props.accessibilityLabel === '더보기')!
      .props.onPress(),
  );

const render = (props: Partial<React.ComponentProps<typeof ReportPostButton>> = {}) => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<ReportPostButton postId={7} {...props} />);
  });
  return tree!;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { userId: 'me' };
});

describe('ReportPostButton', () => {
  it('로그인하지 않았으면 신고 창 대신 로그인 안내를 띄운다', () => {
    mockUser = null;
    const tree = render();

    openMenu(tree);
    act(() => findButton(tree, '신고하기').props.onPress());

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ message: '로그인 후 신고할 수 있습니다.' }),
    );
    expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
  });

  it('사유를 고르기 전에는 접수 버튼이 눌리지 않는다', () => {
    const tree = render();
    openMenu(tree);
    act(() => findButton(tree, '신고하기').props.onPress());

    expect(findButton(tree, '신고 접수').props.disabled).toBe(true);
  });

  it('사유를 고르고 접수하면 사유와 상세 내용을 보내고 완료 화면을 보여 준다', async () => {
    mockMutateAsync.mockResolvedValueOnce({ message: 'ok' });
    const tree = render();
    openMenu(tree);
    act(() => findButton(tree, '신고하기').props.onPress());

    act(() => findButton(tree, '스팸 / 광고').props.onPress());
    act(() => tree.root.findByType(TextInput).props.onChangeText('광고예요'));
    await act(async () => {
      await findButton(tree, '신고 접수').props.onPress();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({ reason: 'SPAM', details: '광고예요' });
    expect(JSON.stringify(tree.toJSON())).toContain('신고가 접수되었습니다');
  });

  it('기타는 상세 내용을 적어야 접수할 수 있다', () => {
    const tree = render();
    openMenu(tree);
    act(() => findButton(tree, '신고하기').props.onPress());

    act(() => findButton(tree, '기타').props.onPress());
    expect(findButton(tree, '신고 접수').props.disabled).toBe(true);

    act(() => tree.root.findByType(TextInput).props.onChangeText('이유를 적어요'));
    expect(findButton(tree, '신고 접수').props.disabled).toBe(false);
  });

  it('접수에 실패하면 오류 문구를 보여 주고 입력은 그대로 둔다', async () => {
    mockMutateAsync.mockRejectedValueOnce({
      response: { status: 500, data: { message: '잠시 후 다시 시도해 주세요.' } },
    });
    const tree = render();
    openMenu(tree);
    act(() => findButton(tree, '신고하기').props.onPress());
    act(() => findButton(tree, '스팸 / 광고').props.onPress());

    await act(async () => {
      await findButton(tree, '신고 접수').props.onPress();
    });

    expect(JSON.stringify(tree.toJSON())).not.toContain('신고가 접수되었습니다');
    expect(tree.root.findAllByType(TextInput)).toHaveLength(1);
    expect(findButton(tree, '신고 접수').props.disabled).toBe(false);
  });
});
