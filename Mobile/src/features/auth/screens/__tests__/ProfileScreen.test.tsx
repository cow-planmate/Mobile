import React from 'react';
import renderer, { act } from 'react-test-renderer';
import axios from 'axios';
import ProfileScreen from '../ProfileScreen';
import { changeProfileVisibility } from '../../../../api/user';

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
    refetch: jest.fn(),
  }),
}));

jest.mock('../../../community/hooks/queries', () => ({
  useMyStats: () => ({ data: undefined, isLoading: false }),
}));

jest.mock('../../../../api/user', () => ({
  changeProfileVisibility: jest.fn(),
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

const mockChangeProfileVisibility =
  changeProfileVisibility as jest.MockedFunction<
    typeof changeProfileVisibility
  >;
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

  it('sends only one profile visibility request for same-render toggles', async () => {
    let resolveChange: (() => void) | undefined;
    mockChangeProfileVisibility.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveChange = resolve;
        }),
    );

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ProfileScreen route={{ params: {} }} />);
    });
    const props = tree!.root.findByType('ProfileScreenView' as any).props;

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = props.onChangeProfileVisibility(true);
      second = props.onChangeProfileVisibility(false);
    });

    await act(async () => {
      resolveChange?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(mockChangeProfileVisibility).toHaveBeenCalledTimes(1);
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
