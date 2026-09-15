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
let mockUserProfileData: any = {
  myPlans: [
    {
      planId: 1,
      planName: '서울 여행',
      startDate: '2026-09-15',
      endDate: '2026-09-17',
    },
  ],
};
const mockUnsavedChanges = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: mockRouteParams }),
}));

// 지역 고르는 창은 서버에서 목록을 받아 온다. 이 화면 시험에서는 고른
// 결과만 있으면 되므로, 고르고 닫는 단추 하나로 세운다.
jest.mock('../../../../components/common/SearchLocationModal', () => {
  const rn = require('react-native');
  const react = require('react');
  return {
    __esModule: true,
    default: ({ visible, onSelect, onDone }: any) =>
      visible
        ? react.createElement(
            rn.TouchableOpacity,
            {
              accessibilityLabel: '지역 고르기 확인',
              onPress: () => {
                onSelect('속초');
                onDone?.();
              },
            },
            react.createElement(rn.Text, null, '지역 창'),
          )
        : null,
  };
});

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock('../../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    data: mockUserProfileData,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('../../hooks/queries', () => ({
  useCreatePost: () => ({
    isPending: false,
    mutateAsync: mockCreatePostMutateAsync,
  }),
  usePost: () => ({
    data: mockExistingPostData,
    isLoading: false,
    isError: false,
  }),
  useUpdatePost: () => ({
    isPending: false,
    mutateAsync: mockUpdatePostMutateAsync,
  }),
}));

jest.mock('../../services/communityApi', () => ({
  uploadCommunityImage: (...args: unknown[]) =>
    mockUploadCommunityImage(...args),
  deleteCommunityImage: (...args: unknown[]) =>
    mockDeleteCommunityImage(...args),
}));

jest.mock('../../../../hooks/useUnsavedChangesPrompt', () => ({
  useUnsavedChangesPrompt: (options: unknown) => {
    mockUnsavedChanges(options);
    return { allowLeave: jest.fn() };
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

const mockedLaunchImageLibrary = launchImageLibrary as jest.Mock;

describe('FeedCreateScreen thumbnail', () => {
  it('기존 글을 수정하지 않고 닫으면 변경 경고를 표시하지 않는다', async () => {
    mockRouteParams.postId = '42';
    mockExistingPostData = {
      category: 'feed',
      title: '여행기',
      contentText: '내용',
      image: '',
      itinerary: { days: [] },
    };
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<FeedCreateScreen />);
    });
    expect(mockUnsavedChanges).toHaveBeenLastCalledWith(
      expect.objectContaining({ hasUnsavedChanges: false }),
    );
    const title = tree!.root
      .findAllByType(TextInput)
      .find(node => node.props.value === '여행기')!;
    act(() => title.props.onChangeText('바뀐 제목'));
    expect(mockUnsavedChanges).toHaveBeenLastCalledWith(
      expect.objectContaining({ hasUnsavedChanges: true }),
    );
    act(() => title.props.onChangeText('여행기'));
    expect(mockUnsavedChanges).toHaveBeenLastCalledWith(
      expect.objectContaining({ hasUnsavedChanges: false }),
    );
    act(() => tree!.unmount());
  });
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
    expect(mockUnsavedChanges).toHaveBeenLastCalledWith(
      expect.objectContaining({ hasUnsavedChanges: true }),
    );
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
      await tree!.root
        .findByProps({
          accessibilityLabel: '썸네일 이미지 선택',
        })
        .props.onPress();
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

  /** 지역 창을 열어 한 곳을 고른다. */
  const pickRegion = (tree: renderer.ReactTestRenderer) => {
    act(() =>
      tree.root
        .findByProps({ accessibilityLabel: '지역 고르기' })
        .props.onPress(),
    );
    act(() =>
      tree.root
        .findByProps({ accessibilityLabel: '지역 고르기 확인' })
        .props.onPress(),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete mockRouteParams.postId;
    mockExistingPostData = undefined;
    mockUserProfileData = {
      myPlans: [
        {
          planId: 1,
          planName: '서울 여행',
          startDate: '2026-09-15',
          endDate: '2026-09-17',
        },
      ],
    };
  });

  it('상단에 여행기 쓰기 제목만 배치하고 보조텍스트를 두지 않는다', () => {
    const tree = render();
    const texts = textsOf(tree);

    expect(texts).toContain('여행기 쓰기');
    expect(texts).not.toContain('당신의 여행을 다른 사람들과 공유해보세요');
    expect(texts).not.toContain('여행기 작성');

    act(() => tree.unmount());
  });

  it('일정 선택 버튼과 서식 메뉴 트리거가 노출된다', () => {
    const tree = render();
    const texts = textsOf(tree);

    expect(texts).toContain('내 일정 불러오기');
    expect(texts).toContain('서식 메뉴');

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
      itinerary: {
        days: [
          { day: 1, items: [] },
          { day: 2, items: [] },
        ],
      },
    };

    const tree = render();
    const texts = textsOf(tree);

    expect(texts).toContain('1박 2일');
    expect(texts).toContain('블록 메모도 함께 공개');

    act(() => tree.unmount());
  });

  it('수정 중에는 일정 안내 띠 없이 미리보기 카드만 둔다', () => {
    mockRouteParams.postId = '42';
    mockExistingPostData = {
      category: 'feed',
      title: '부산 2박 3일',
      contentText: '내용',
      image: null,
      location: '부산',
      itinerary: {
        plan: { destinationName: '부산' },
        days: [
          { day: 1, items: [] },
          { day: 2, items: [] },
        ],
      },
    };

    const tree = render();
    const joined = textsOf(tree).join(' ');

    expect(joined).not.toContain('유지돼요');
    // 띠를 걷었다고 일정을 고르는 단추가 대신 나오면 안 된다.
    expect(joined).not.toContain('내 일정 불러오기');
    expect(textsOf(tree)).toContain('일정 미리보기');

    act(() => tree.unmount());
  });

  it('하루짜리 일정은 0박 1일 대신 당일치기로 적는다', () => {
    mockRouteParams.postId = '42';
    mockExistingPostData = {
      category: 'feed',
      title: '부산 하루',
      contentText: '내용',
      image: null,
      itinerary: {
        days: [{ day: 1, items: [] }],
      },
    };

    const tree = render();

    expect(textsOf(tree)).toContain('당일치기');

    act(() => tree.unmount());
  });

  it('일정을 고르지 않아도 제목과 지역만 있으면 올릴 수 있다', async () => {
    mockCreatePostMutateAsync.mockResolvedValue({ id: 7 });
    const tree = render();

    const inputBy = (placeholder: string) =>
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.placeholder === placeholder)!;

    act(() =>
      inputBy('예: 서울 3박 4일 완벽 여행 코스').props.onChangeText(
        '혼자 걸은 속초',
      ),
    );
    // 서버가 여행기에 지역을 요구하므로, 일정을 안 붙였으면 골라서 넣는다.
    pickRegion(tree);

    const submit = tree.root.findByProps({
      accessibilityLabel: '피드 등록하기',
    });
    expect(submit.props.disabled).toBe(false);

    await act(async () => {
      await submit.props.onPress();
    });

    expect(mockCreatePostMutateAsync).toHaveBeenCalledTimes(1);
    const payload = mockCreatePostMutateAsync.mock.calls[0][0];
    expect(payload.title).toBe('혼자 걸은 속초');
    expect(payload.region).toBe('속초');
    // 기간은 고른 일수를 그대로 보낸다. 서버가 1일 이상을 요구한다.
    expect(payload.durationDays).toBe(1);
    // 일정에서만 나오는 것들은 빠진다.
    expect(payload.itinerary).toBeUndefined();
    expect(payload.sourcePlanId).toBeUndefined();

    act(() => tree.unmount());
  });

  it('제목이나 지역이 비어 있으면 등록 단추를 잠근다', () => {
    const tree = render();
    const submit = () =>
      tree.root.findByProps({ accessibilityLabel: '피드 등록하기' });
    const inputBy = (placeholder: string) =>
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.placeholder === placeholder)!;

    expect(submit().props.disabled).toBe(true);

    act(() =>
      inputBy('예: 서울 3박 4일 완벽 여행 코스').props.onChangeText('제목만'),
    );
    // 지역이 비어 있으면 아직 잠겨 있다 - 서버가 받아 주지 않는다.
    expect(submit().props.disabled).toBe(true);

    pickRegion(tree);
    expect(submit().props.disabled).toBe(false);

    act(() => tree.unmount());
  });

  it('붙인 일정은 다시 뺄 수 있다', () => {
    mockRouteParams.postId = undefined;
    const tree = render();

    // 일정을 붙이지 않았으면 뺄 것도 없다.
    expect(textsOf(tree)).not.toContain('빼기');

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
