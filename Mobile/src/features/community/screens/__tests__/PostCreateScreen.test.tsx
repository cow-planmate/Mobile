import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import PostCreateScreen from '../PostCreateScreen';
import { BOARD_TIPS } from '../../constants/board';

const mockNavigation = {
  goBack: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
};
const mockRouteParams: { category?: string; postId?: string } = {};
const mockUnsavedChanges = jest.fn();
let mockExistingPost: any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: jest.fn() }),
}));

jest.mock('../../hooks/queries', () => ({
  useCreatePost: () => ({ isPending: false, mutateAsync: jest.fn() }),
  usePost: () => ({ data: mockExistingPost, isLoading: false, isError: false }),
  useUpdatePost: () => ({ isPending: false, mutateAsync: jest.fn() }),
}));

jest.mock('../../../../hooks/useUnsavedChangesPrompt', () => ({
  useUnsavedChangesPrompt: (options: unknown) => {
    mockUnsavedChanges(options);
    return { allowLeave: jest.fn() };
  },
}));

const render = (category?: string) => {
  mockRouteParams.category = category;
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<PostCreateScreen />);
  });
  return tree!;
};

const textsOf = (tree: renderer.ReactTestRenderer): string[] =>
  tree.root
    .findAllByType(Text)
    .flatMap(node => {
      const children = node.props.children;
      return Array.isArray(children) ? children : [children];
    })
    .filter(child => typeof child === 'string' || typeof child === 'number')
    .map(String);

it('수정 화면의 기존 내용은 미저장 변경으로 취급하지 않는다', async () => {
  mockRouteParams.postId = '7';
  mockExistingPost = {
    category: 'free',
    title: '기존 제목',
    contentText: '내용',
  };
  let tree: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<PostCreateScreen />);
  });
  expect(mockUnsavedChanges).toHaveBeenLastCalledWith(
    expect.objectContaining({ hasUnsavedChanges: false }),
  );
  act(() => tree!.unmount());
  mockExistingPost = undefined;
  delete mockRouteParams.postId;
});

describe('작성 팁', () => {
  it('고른 게시판의 팁을 이름과 함께 보여준다', () => {
    const tree = render('qna');

    const texts = textsOf(tree);
    expect(texts).toContain('질문게시판 작성 팁');
    BOARD_TIPS.qna.forEach(tip => expect(texts).toContain(tip));

    act(() => tree.unmount());
  });

  // 앱 본문은 평문이라 서식과 이미지 첨부를 안내하면 거짓말이 된다.
  it('앱에 없는 기능을 안내하는 웹 팁은 담지 않는다', () => {
    const all = [...BOARD_TIPS.free, ...BOARD_TIPS.qna];
    expect(all.some(tip => tip.includes('이미지'))).toBe(false);
    expect(all.some(tip => tip.includes('사진을 첨부'))).toBe(false);
    expect(all.some(tip => tip.includes('텍스트 스타일'))).toBe(false);
  });
});
