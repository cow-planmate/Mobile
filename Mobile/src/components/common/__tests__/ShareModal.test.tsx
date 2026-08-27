import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Switch } from 'react-native';
import ShareModal from '../ShareModal';
import {
  getEditors,
  getShareUrl,
  inviteEditor,
  updateShareStatus,
} from '../../../api/trips';

jest.mock('../../../api/trips', () => ({
  getEditors: jest.fn(),
  getShareUrl: jest.fn(),
  inviteEditor: jest.fn(),
  removeEditor: jest.fn(),
  updateShareStatus: jest.fn(),
}));

const mockShowAlert = jest.fn();

jest.mock('../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

const mockGetEditors = getEditors as jest.MockedFunction<typeof getEditors>;
const mockGetShareUrl = getShareUrl as jest.MockedFunction<typeof getShareUrl>;
const mockUpdateShareStatus = updateShareStatus as jest.MockedFunction<
  typeof updateShareStatus
>;
const mockInviteEditor = inviteEditor as jest.MockedFunction<
  typeof inviteEditor
>;

describe('ShareModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetShareUrl.mockResolvedValue({ shareUrl: 'https://example.com', isShared: true });
    mockGetEditors.mockResolvedValue([]);
  });

  it('모달이 닫히면 진행 중인 공유 정보 조회를 취소한다', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ShareModal visible onClose={jest.fn()} planId="plan-1" isOwner />,
      );
      await Promise.resolve();
    });

    const shareSignal = mockGetShareUrl.mock.calls[0][1];
    const editorsSignal = mockGetEditors.mock.calls[0][1];

    act(() => {
      tree!.update(
        <ShareModal visible={false} onClose={jest.fn()} planId="plan-1" isOwner />,
      );
    });

    expect(shareSignal?.aborted).toBe(true);
    expect(editorsSignal?.aborted).toBe(true);
    act(() => tree!.unmount());
  });

  it('공유 상태 저장 중에는 중복 변경을 막는다', async () => {
    let resolveUpdate: (() => void) | undefined;
    mockUpdateShareStatus.mockImplementationOnce(
      () => new Promise<void>(resolve => {
        resolveUpdate = resolve;
      }),
    );

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ShareModal visible onClose={jest.fn()} planId="plan-1" isOwner />,
      );
      await Promise.resolve();
    });

    act(() => {
      tree!.root.findByType(Switch).props.onValueChange(false);
    });
    expect(tree!.root.findByType(Switch).props.disabled).toBe(true);

    act(() => {
      tree!.root.findByType(Switch).props.onValueChange(true);
    });
    expect(mockUpdateShareStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveUpdate?.();
    });
    expect(tree!.root.findByType(Switch).props.disabled).toBe(false);
    act(() => tree!.unmount());
  });

  it('다른 일정으로 바뀌면 이전 링크와 편집자를 즉시 비운다', async () => {
    mockGetShareUrl.mockResolvedValueOnce({
      shareUrl: 'https://example.com/plan-1',
      isShared: true,
    });
    mockGetEditors.mockResolvedValueOnce([
      { userId: 'user-1', nickname: '이전 편집자' },
    ]);

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ShareModal visible onClose={jest.fn()} planId="plan-1" isOwner />,
      );
      await Promise.resolve();
    });

    mockGetShareUrl.mockImplementationOnce(() => new Promise(() => undefined));
    mockGetEditors.mockImplementationOnce(() => new Promise(() => undefined));
    act(() => {
      tree!.update(
        <ShareModal visible onClose={jest.fn()} planId="plan-2" isOwner />,
      );
    });

    expect(
      tree!.root.findAllByProps({ value: 'https://example.com/plan-1' }),
    ).toHaveLength(0);
    expect(
      tree!.root.findAllByProps({ children: '이전 편집자' }),
    ).toHaveLength(0);
    act(() => tree!.unmount());
  });

  it('같은 렌더에서 초대를 연속 실행해도 한 번만 요청한다', async () => {
    let resolveInvite: (() => void) | undefined;
    const pendingInvite = new Promise<void>(resolve => {
      resolveInvite = resolve;
    });
    mockInviteEditor.mockReturnValue(pendingInvite);

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ShareModal visible onClose={jest.fn()} planId="plan-1" isOwner />,
      );
      await Promise.resolve();
    });

    const nicknameInput = tree!.root.findByProps({
      placeholder: '친구 닉네임 입력',
    });
    act(() => nicknameInput.props.onChangeText('친구'));
    const inviteButton = tree!.root
      .findAllByType(require('react-native').TouchableOpacity)
      .find(node => node.findAllByProps({ children: '초대' }).length > 0)!;

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = inviteButton.props.onPress();
      second = inviteButton.props.onPress();
    });

    mockGetEditors.mockImplementationOnce(() => new Promise(() => undefined));
    await act(async () => {
      resolveInvite?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(mockInviteEditor).toHaveBeenCalledTimes(1);
  });

  it('같은 렌더의 공유 상태 변경은 한 번만 요청한다', async () => {
    let resolveUpdate: (() => void) | undefined;
    const pendingUpdate = new Promise<void>(resolve => {
      resolveUpdate = resolve;
    });
    mockUpdateShareStatus.mockReturnValue(pendingUpdate);

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ShareModal visible onClose={jest.fn()} planId="plan-1" isOwner />,
      );
      await Promise.resolve();
    });
    const shareSwitch = tree!.root.findByType(Switch);

    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = shareSwitch.props.onValueChange(false);
      second = shareSwitch.props.onValueChange(true);
    });

    await act(async () => {
      resolveUpdate?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(mockUpdateShareStatus).toHaveBeenCalledTimes(1);
  });
});
