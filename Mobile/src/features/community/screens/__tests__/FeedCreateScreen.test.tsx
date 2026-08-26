import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
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
