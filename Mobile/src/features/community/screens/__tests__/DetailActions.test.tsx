import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import FeedDetailScreen from '../FeedDetailScreen';
import PostDetailScreen from '../PostDetailScreen';
import { styles as feedStyles } from '../FeedDetailScreen.styles';
import { styles as postStyles } from '../PostDetailScreen.styles';

const mockShowAlert = jest.fn();
const mockUsePost = jest.fn();
const mockReactRequest = jest.fn();
const mockJoinRequest = jest.fn();
const mockLeaveRequest = jest.fn();
const mockChangeStatusRequest = jest.fn();
const mockUpdateAnsweredRequest = jest.fn();

const mutation = (request = jest.fn()) => ({
  isPending: false,
  mutate: request,
  mutateAsync: request,
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
  useRoute: () => ({ params: { postId: '7' } }),
}));

jest.mock('../../../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { userId: 'viewer' } }),
}));

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock('../../hooks/queries', () => ({
  usePost: (...args: unknown[]) => mockUsePost(...args),
  useReactToPost: () => mutation(mockReactRequest),
  useForkItinerary: () => mutation(),
  useJoinMate: () => mutation(mockJoinRequest),
  useLeaveMate: () => mutation(mockLeaveRequest),
  useChangeMateStatus: () => mutation(mockChangeStatusRequest),
  useUpdateAnswered: () => mutation(mockUpdateAnsweredRequest),
  useDeletePost: () => mutation(),
}));

jest.mock('../../components/PostContentView', () => () => null);
jest.mock('../../components/CommentSection', () => () => null);
jest.mock('../../components/PublicProfileModal', () => () => null);
jest.mock('../../../../components/common/UserAvatar', () => () => null);
jest.mock('../../../../components/common/FallbackImage', () => () => null);
jest.mock('../../../../components/common', () => ({
  CalendarModal: () => null,
}));

const basePost = {
  id: 7,
  userId: 'author',
  category: 'free',
  title: 'title',
  author: 'author',
  level: 1,
  likes: 0,
  dislikes: 0,
  comments: 0,
  views: 0,
  createdAt: 'today',
  createdAtIso: '2026-08-27T00:00:00Z',
  content: null,
  contentText: 'body',
  myReaction: null,
};

const findButtonByStyle = (
  tree: renderer.ReactTestRenderer,
  targetStyle: unknown,
) =>
  tree.root.findAllByType(TouchableOpacity).find(node => {
    const style = node.props.style;
    return (
      style === targetStyle ||
      (Array.isArray(style) && style[0] === targetStyle)
    );
  })!;

describe('community detail action locks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePost.mockReturnValue({
      data: basePost,
      isLoading: false,
      isError: false,
    });
  });

  it('sends only one feed reaction for same-render presses', async () => {
    let resolveRequest: (() => void) | undefined;
    mockReactRequest.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveRequest = resolve;
        }),
    );

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<FeedDetailScreen />);
    });
    const button = findButtonByStyle(tree!, feedStyles.reactionButton);

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = button.props.onPress();
      second = button.props.onPress();
    });

    await act(async () => {
      resolveRequest?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(mockReactRequest).toHaveBeenCalledTimes(1);
  });

  it('sends only one mate join request for same-render presses', async () => {
    let resolveRequest: (() => void) | undefined;
    mockJoinRequest.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveRequest = resolve;
        }),
    );
    mockUsePost.mockReturnValue({
      data: {
        ...basePost,
        category: 'mate',
        status: 'recruiting',
        participants: 1,
        maxParticipants: 4,
      },
      isLoading: false,
      isError: false,
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<PostDetailScreen />);
    });
    const button = findButtonByStyle(tree!, postStyles.mateButton);

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = button.props.onPress();
      second = button.props.onPress();
    });

    await act(async () => {
      resolveRequest?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(mockJoinRequest).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'mate status',
      { category: 'mate', status: 'recruiting' },
      mockChangeStatusRequest,
    ],
    [
      'Q&A answer status',
      { category: 'qna', isAnswered: false },
      mockUpdateAnsweredRequest,
    ],
  ])(
    'sends only one %s update for same-render presses',
    async (_name, patch, request) => {
      let resolveRequest: (() => void) | undefined;
      request.mockImplementationOnce(
        () =>
          new Promise<void>(resolve => {
            resolveRequest = resolve;
          }),
      );
      mockUsePost.mockReturnValue({
        data: { ...basePost, ...patch, userId: 'viewer' },
        isLoading: false,
        isError: false,
      });

      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<PostDetailScreen />);
      });
      const authorButtons = tree!.root
        .findAllByType(TouchableOpacity)
        .filter(node => {
          const style = node.props.style;
          return (
            style === postStyles.authorActionButton ||
            (Array.isArray(style) && style[0] === postStyles.authorActionButton)
          );
        });
      const button = authorButtons[0];

      let first: Promise<unknown>;
      let second: Promise<unknown>;
      act(() => {
        first = button.props.onPress();
        second = button.props.onPress();
      });

      await act(async () => {
        resolveRequest?.();
        await Promise.all([first!, second!]);
      });
      act(() => tree!.unmount());
      expect(request).toHaveBeenCalledTimes(1);
    },
  );
});
