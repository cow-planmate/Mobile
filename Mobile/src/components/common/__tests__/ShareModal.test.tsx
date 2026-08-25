import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Switch } from 'react-native';
import ShareModal from '../ShareModal';
import {
  getEditors,
  getShareUrl,
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
});
