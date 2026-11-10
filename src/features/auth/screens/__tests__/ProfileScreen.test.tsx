import React from 'react';
import renderer, { act } from 'react-test-renderer';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import ProfileScreen from '../ProfileScreen';

const mockNetInfoFetch = NetInfo.fetch as jest.Mock;

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    delete: jest.fn(),
    patch: jest.fn(),
    isAxiosError: jest.fn(() => false),
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-fast-image', () => ({
  __esModule: true,
  default: { clearMemoryCache: jest.fn() },
}));

const mockShowAlert = jest.fn();
const mockDisconnect = jest.fn();
const mockClearSession = jest.fn();
const mockRevokeRefreshToken = jest.fn();
const mockSetQueryData = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockRefetchQueries = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
    invalidateQueries: mockInvalidateQueries,
    refetchQueries: mockRefetchQueries,
  }),
}));

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

jest.mock('../../../../contexts/WebSocketContext', () => ({
  useWebSocket: () => ({ disconnect: mockDisconnect }),
}));

jest.mock('../../../../store/useAuthStore', () => ({
  useAuthStore: Object.assign(
    (selector: (state: unknown) => unknown) =>
      selector({ user: { userId: 'user-1' } }),
    {
      getState: () => ({
        clearSession: mockClearSession,
        revokeRefreshToken: mockRevokeRefreshToken,
      }),
    },
  ),
}));

const mockRefetch = jest.fn();
let mockProfileState: Record<string, unknown> = {};

jest.mock('../../../../hooks/useUserProfile', () => ({
  USER_PROFILE_QUERY_KEY: ['userProfile'],
  useUserProfile: () => ({
    data: {
      name: 'PlanMate',
      email: 'planmate@example.com',
      profileImageUrl: '',
      profilePublic: false,
      birthdate: '',
      gender: '',
      preferredThemes: [],
      socialLogin: false,
      myPlans: [],
    },
    isLoading: false,
    isError: false,
    isPending: false,
    isPaused: false,
    refetch: mockRefetch,
    ...mockProfileState,
  }),
}));

jest.mock('../../../community/hooks/queries', () => ({
  useMyStats: () => ({ data: undefined, isLoading: false }),
}));

jest.mock('../../../../api/user', () => ({
  deleteProfileImage: jest.fn(),
  uploadProfileImage: jest.fn(),
}));

jest.mock('../ProfileScreen.view', () => {
  const ReactModule = require('react');
  return {
    __esModule: true,
    default: (props: unknown) =>
      ReactModule.createElement('ProfileScreenView', props),
  };
});

const mockAxiosDelete = axios.delete as jest.MockedFunction<
  typeof axios.delete
>;

describe('ProfileScreen mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockResolvedValue(undefined);
    mockRefetchQueries.mockResolvedValue(undefined);
    mockClearSession.mockResolvedValue(undefined);
    mockRevokeRefreshToken.mockResolvedValue(undefined);
    mockAxiosDelete.mockResolvedValue({ status: 204 } as any);
  });

  it('clears the local session before the account deletion success alert is confirmed', async () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ProfileScreen route={{ params: {} }} />);
    });
    const props = tree!.root.findByType('ProfileScreenView' as any).props;

    act(() => props.handleResign());
    const destructiveButton = mockShowAlert.mock.calls[0][0].buttons[1];
    await act(async () => {
      await destructiveButton.onPress();
    });

    act(() => tree!.unmount());
    expect(mockRevokeRefreshToken).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockClearSession).toHaveBeenCalledWith({ forgetLoginMethod: true });
    expect(mockShowAlert).toHaveBeenCalledTimes(2);
  });
});

describe('ProfileScreen 오프라인', () => {
  const offlineState = { data: undefined, isPending: true, isPaused: true };

  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileState = {};
  });

  const viewProps = (tree: renderer.ReactTestRenderer) =>
    tree.root.findByType('ProfileScreenView' as any).props;

  it('처음 받는 프로필이 멈춰 있으면 오프라인으로 넘기고, 연결이 돌아오면 알린다', () => {
    mockProfileState = offlineState;
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ProfileScreen route={{ params: {} }} />);
    });
    expect(viewProps(tree).offline).toBe(true);
    expect(Toast.show).not.toHaveBeenCalled();

    mockProfileState = { data: undefined, isPending: true, isPaused: false };
    act(() => {
      tree.update(<ProfileScreen route={{ params: {} }} />);
    });
    expect(viewProps(tree).offline).toBe(false);
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        text1: '다시 연결됐어요. 최신 내용을 불러오고 있어요.',
      }),
    );
    act(() => tree.unmount());
  });

  it('이미 받아 둔 프로필이 있으면 오프라인이어도 그대로 보여 준다', () => {
    mockProfileState = { isPending: false, isPaused: true };
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ProfileScreen route={{ params: {} }} />);
    });
    expect(viewProps(tree).offline).toBe(false);
    act(() => tree.unmount());
  });

  it('다시 시도는 연결돼 있으면 다시 불러오고, 아니면 안내만 띄운다', async () => {
    mockProfileState = offlineState;
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ProfileScreen route={{ params: {} }} />);
    });

    mockNetInfoFetch.mockResolvedValueOnce({ isConnected: false });
    await act(async () => {
      await viewProps(tree).onRetryOffline();
    });
    expect(mockRefetch).not.toHaveBeenCalled();
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ text1: '아직 인터넷에 연결되지 않았어요.' }),
    );

    mockNetInfoFetch.mockResolvedValueOnce({ isConnected: true });
    await act(async () => {
      await viewProps(tree).onRetryOffline();
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
});
