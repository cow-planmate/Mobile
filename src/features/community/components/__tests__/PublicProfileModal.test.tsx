import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import PublicProfileModal from '../PublicProfileModal';

const mockQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({ useQuery: () => mockQuery() }));
jest.mock('../../../../components/common/PopupModal', () => ({ children }: any) => children);
jest.mock('../../../../components/common/UserAvatar', () => () => null);
jest.mock('../../../../api/user', () => ({ fetchPublicProfile: jest.fn() }));

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
