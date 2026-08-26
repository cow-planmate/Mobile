import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { launchImageLibrary } from 'react-native-image-picker';
import FeedCreateScreen from '../FeedCreateScreen';

const mockShowAlert = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn(), replace: jest.fn() }),
  useRoute: () => ({ params: {} }),
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
  useCreatePost: () => ({ isPending: false, mutateAsync: jest.fn() }),
  usePost: () => ({ data: undefined, isLoading: false, isError: false }),
  useUpdatePost: () => ({ isPending: false, mutateAsync: jest.fn() }),
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
});
