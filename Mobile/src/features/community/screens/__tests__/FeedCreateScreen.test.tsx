import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import FeedCreateScreen from '../FeedCreateScreen';

const mockShowAlert = jest.fn();
const mockNavigation = { goBack: jest.fn(), replace: jest.fn() };
const mockRouteParams: { postId?: string } = {};
const mockCreatePostMutateAsync = jest.fn();
const mockUpdatePostMutateAsync = jest.fn();
const mockUploadCommunityImage = jest.fn();
const mockDeleteCommunityImage = jest.fn();
let mockExistingPostData: any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock('../../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    data: { myPlans: [] },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('../../hooks/queries', () => ({
  useCreatePost: () => ({ isPending: false, mutateAsync: mockCreatePostMutateAsync }),
  usePost: () => ({ data: mockExistingPostData, isLoading: false, isError: false }),
  useUpdatePost: () => ({ isPending: false, mutateAsync: mockUpdatePostMutateAsync }),
}));

jest.mock('../../services/communityApi', () => ({
  uploadCommunityImage: (...args: unknown[]) => mockUploadCommunityImage(...args),
  deleteCommunityImage: (...args: unknown[]) => mockDeleteCommunityImage(...args),
}));

jest.mock('../../../../hooks/useUnsavedChangesPrompt', () => ({
  useUnsavedChangesPrompt: () => ({ allowLeave: jest.fn() }),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

const mockedLaunchImageLibrary = launchImageLibrary as jest.Mock;

describe('FeedCreateScreen thumbnail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete mockRouteParams.postId;
    mockExistingPostData = undefined;
    mockDeleteCommunityImage.mockResolvedValue(undefined);
  });

  it('기기에서 썸네일 이미지를 선택할 수 있다', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({
      assets: [
        {
          uri: 'file:///feed.jpg',
          type: 'image/jpeg',
          fileName: 'feed.jpg',
          fileSize: 1024,
        },
      ],
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<FeedCreateScreen />);
    });

    const selectButton = tree!.root.findByProps({
      accessibilityLabel: '썸네일 이미지 선택',
    });
    await act(async () => {
      await selectButton.props.onPress();
    });

    expect(mockedLaunchImageLibrary).toHaveBeenCalledWith({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    expect(
      tree!.root.findAllByProps({ children: 'feed.jpg' }).length,
    ).toBeGreaterThan(0);
    act(() => tree!.unmount());
  });

  it('업로드 중 화면을 이탈하면 게시글을 수정하지 않고 업로드 이미지를 정리한다', async () => {
    mockRouteParams.postId = '42';
    mockExistingPostData = {
      category: 'feed',
      title: '여행기',
      contentText: '내용',
      tags: [],
      image: null,
      itinerary: { days: [] },
    };
    let resolveUpload: (url: string) => void = () => undefined;
    mockUploadCommunityImage.mockReturnValue(
      new Promise(resolve => {
        resolveUpload = resolve;
      }),
    );
    mockedLaunchImageLibrary.mockResolvedValue({
      assets: [
        {
          uri: 'file:///feed.jpg',
          type: 'image/jpeg',
          fileName: 'feed.jpg',
          fileSize: 1024,
        },
      ],
    });

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<FeedCreateScreen />);
    });
    await act(async () => {
      await tree!.root.findByProps({
        accessibilityLabel: '썸네일 이미지 선택',
      }).props.onPress();
    });

    const submitButton = tree!.root.findAllByType(TouchableOpacity).at(-1)!;
    act(() => {
      submitButton.props.onPress();
    });
    expect(mockUploadCommunityImage).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());

    await act(async () => {
      resolveUpload('https://cdn.example.com/feed.jpg');
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockUpdatePostMutateAsync).not.toHaveBeenCalled();
    expect(mockDeleteCommunityImage).toHaveBeenCalledWith(
      'https://cdn.example.com/feed.jpg',
    );
  });
});

// 웹 CreatePostPage에 맞춘 자리들. 되돌아가면 여기서 걸린다.
describe('웹에 맞춘 여행기 쓰기 화면', () => {
  const textsOf = (tree: renderer.ReactTestRenderer): string[] =>
    tree.root
      .findAllByType(Text)
      .flatMap(node => {
        const children = node.props.children;
        return Array.isArray(children) ? children : [children];
      })
      .filter(child => typeof child === 'string' || typeof child === 'number')
      .map(String);

  const placeholders = (tree: renderer.ReactTestRenderer): string[] =>
    tree.root
      .findAllByType(TextInput)
      .map(node => node.props.placeholder)
      .filter(Boolean);

  const render = () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<FeedCreateScreen />);
    });
    return tree!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete mockRouteParams.postId;
    mockExistingPostData = undefined;
  });

  it('머리에 제목과 부제를 함께 보여준다', () => {
    const tree = render();
    const texts = textsOf(tree);

    expect(texts).toContain('여행기 작성');
    expect(texts).toContain('당신의 여행을 다른 사람들과 공유해보세요');
    expect(texts).not.toContain('여행기 발행');

    act(() => tree.unmount());
  });

  it('여행 정보와 기본 정보로 나눈다', () => {
    const tree = render();
    const texts = textsOf(tree);

    expect(texts).toContain('여행 정보');
    expect(texts).toContain('기본 정보');

    act(() => tree.unmount());
  });

  it('제목 빈칸과 제출 버튼이 웹 문구를 쓴다', () => {
    const tree = render();

    expect(placeholders(tree)).toContain('예: 서울 3박 4일 완벽 여행 코스');
    expect(textsOf(tree)).toContain('피드 등록하기');

    act(() => tree.unmount());
  });

  // 웹이 먼저 없앴고 앱은 태그를 어느 화면에서도 그리지 않았다.
  it('태그 입력칸을 더 이상 두지 않는다', () => {
    const tree = render();

    expect(placeholders(tree)).not.toContain('#뚜벅이, #가족여행');
    expect(textsOf(tree)).not.toContain('태그');

    act(() => tree.unmount());
  });

  it('일정을 고르면 기간과 메모 공개 선택이 따라 나온다', () => {
    mockRouteParams.postId = '42';
    mockExistingPostData = {
      category: 'feed',
      title: '제주 3박 4일',
      contentText: '내용',
      image: null,
      itinerary: { days: [{ day: 1, items: [] }, { day: 2, items: [] }] },
    };

    const tree = render();
    const texts = textsOf(tree);

    expect(texts).toContain('여행 기간');
    expect(texts).toContain('1박 2일');
    expect(texts).toContain('블록 메모도 함께 공개');

    act(() => tree.unmount());
  });

  it('메모 공개는 켠 채로 시작한다 — 지금 동작을 그대로 지킨다', () => {
    mockRouteParams.postId = '42';
    mockExistingPostData = {
      category: 'feed',
      title: '제주 3박 4일',
      contentText: '내용',
      image: null,
      itinerary: { days: [{ day: 1, items: [] }] },
    };

    const tree = render();
    const box = tree.root.findByProps({
      accessibilityLabel: '블록 메모도 함께 공개',
    });
    expect(box.props.accessibilityState.checked).toBe(true);

    act(() => box.props.onPress());
    expect(
      tree.root.findByProps({ accessibilityLabel: '블록 메모도 함께 공개' })
        .props.accessibilityState.checked,
    ).toBe(false);

    act(() => tree.unmount());
  });
});
