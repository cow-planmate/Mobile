import React from 'react';
import renderer, { act } from 'react-test-renderer';
import NotificationModal from '../NotificationModal';

describe('NotificationModal', () => {
  it('처리 중인 초대의 수락 요청을 중복 실행하지 않는다', async () => {
    let resolveAccept: (() => void) | undefined;
    const onAccept = jest.fn(
      () =>
        new Promise<void>(resolve => {
          resolveAccept = resolve;
        }),
    );

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <NotificationModal
          visible
          onClose={jest.fn()}
          invitations={[
            {
              requestId: 7,
              senderNickname: '민영',
              planName: '서울 여행',
              type: 'INVITE',
            },
          ]}
          onAccept={onAccept}
          onReject={jest.fn()}
        />,
      );
    });

    const acceptButton = tree!.root.findByProps({
      accessibilityLabel: '민영님의 요청 수락',
    });
    let first: Promise<unknown>;
    let second: Promise<unknown>;
    act(() => {
      first = acceptButton.props.onPress();
      second = acceptButton.props.onPress();
    });

    await act(async () => {
      resolveAccept?.();
      await Promise.all([first!, second!]);
    });
    act(() => tree!.unmount());
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
