import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import PublicProfileModal from '../PublicProfileModal';

const mockQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({ useQuery: () => mockQuery() }));
jest.mock('../../../../components/common/PopupModal', () => ({ children }: any) => children);
jest.mock('../UserAvatar', () => () => null);
jest.mock('../../../../api/user', () => ({ fetchPublicProfile: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
let mockMyUserId: string | null = null;
jest.mock('../../../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: mockMyUserId ? { userId: mockMyUserId } : null }),
}));
jest.mock('../../../../contexts/AlertContext', () => ({ useAlert: () => ({ showAlert: jest.fn() }) }));
const mockSendRequest = jest.fn(() => Promise.resolve({ status: 'PENDING' }));
jest.mock('../../../social/hooks', () => ({
  useSendFriendRequest: () => ({ mutateAsync: mockSendRequest, isPending: false }),
}));

it.each([
  [503, undefined, true, '불러오지 못했어요'],
  [403, 'USER_002', false, '비공개 프로필이에요'],
  [404, 'USER_001', false, '찾을 수 없어요'],
])('public profile HTTP %s recovery', (status, code, retryable, message) => {
  const refetch = jest.fn();
  mockQuery.mockReturnValue({ isError: true, error: { response: { status, data: { code } } }, refetch });
  let tree: renderer.ReactTestRenderer;
  act(() => { tree = renderer.create(<PublicProfileModal visible userId="user" onClose={() => {}} />); });
  expect(JSON.stringify(tree!.toJSON())).toContain(message);
  const buttons = tree!.root.findAllByType(TouchableOpacity);
  expect(buttons).toHaveLength(retryable ? 1 : 0);
  if (retryable) {
    act(() => buttons[0].props.onPress());
    expect(refetch).toHaveBeenCalledTimes(1);
  }
  act(() => tree!.unmount());
});

it('다른 사용자 프로필에서 친구 요청과 쪽지를 보낼 수 있다', () => {
  mockMyUserId = 'me';
  mockQuery.mockReturnValue({ isError: false, data: { nickname: '상대', profileImageUrl: null, myPlanCount: 0, editablePlanCount: 0, preferredThemes: [] } });
  const onClose = jest.fn();
  let tree: renderer.ReactTestRenderer;
  act(() => { tree = renderer.create(<PublicProfileModal visible userId="other" onClose={onClose} />); });
  const [friend, message] = tree!.root.findAllByType(TouchableOpacity);
  act(() => friend.props.onPress());
  expect(mockSendRequest).toHaveBeenCalledWith('other');
  act(() => message.props.onPress());
  expect(onClose).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('Chat', expect.objectContaining({ userId: 'other', nickname: '상대' }));

  // 내 프로필에서는 보이지 않는다
  act(() => tree!.unmount());
  act(() => { tree = renderer.create(<PublicProfileModal visible userId="me" onClose={onClose} />); });
  expect(JSON.stringify(tree!.toJSON())).not.toContain('쪽지 보내기');
  act(() => tree!.unmount());
  mockMyUserId = null;
});
