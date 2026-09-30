import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockNav = {
  listeners: new Map<string, (e: any) => void>(),
  dispatch: jest.fn(),
};

const mockShowAlert = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    addListener: (event: string, cb: (e: any) => void) => {
      mockNav.listeners.set(event, cb);
      return () => mockNav.listeners.delete(event);
    },
    dispatch: (...args: any[]) => mockNav.dispatch(...args),
  }),
}));

jest.mock('../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

import { useUnsavedChangesPrompt } from '../useUnsavedChangesPrompt';

const LEAVE_ACTION = { type: 'POP' };

const fireBeforeRemove = () => {
  const event = {
    preventDefault: jest.fn(),
    data: { action: LEAVE_ACTION },
  };
  act(() => {
    mockNav.listeners.get('beforeRemove')?.(event);
  });
  return event;
};

const render = (hasUnsavedChanges: boolean) => {
  const holder: { current: ReturnType<typeof useUnsavedChangesPrompt> | null } = {
    current: null,
  };

  const Probe = () => {
    holder.current = useUnsavedChangesPrompt({ hasUnsavedChanges });
    return null;
  };

  act(() => {
    renderer.create(<Probe />);
  });
  return holder;
};

describe('useUnsavedChangesPrompt', () => {
  beforeEach(() => {
    mockNav.listeners.clear();
    mockNav.dispatch.mockClear();
    mockShowAlert.mockClear();
  });

  it('작성 중인 내용이 없으면 이탈을 막지 않는다', () => {
    render(false);
    const event = fireBeforeRemove();

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it('작성 중인 내용이 있으면 이탈을 막고 확인을 띄운다', () => {
    render(true);
    const event = fireBeforeRemove();

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledTimes(1);
  });

  it('확인창에서 나가기를 고르면 원래 이동을 그대로 실행한다', () => {
    render(true);
    fireBeforeRemove();

    const leaveButton = mockShowAlert.mock.calls[0][0].buttons.find(
      (b: any) => b.style === 'destructive',
    );
    act(() => leaveButton.onPress());

    expect(mockNav.dispatch).toHaveBeenCalledWith(LEAVE_ACTION);
  });

  it('allowLeave 이후에는 확인 없이 통과시킨다', () => {
    const holder = render(true);
    act(() => holder.current!.allowLeave());

    const event = fireBeforeRemove();

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockShowAlert).not.toHaveBeenCalled();
  });
});
