import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import NotificationModal, { Invitation } from '../src/components/common/NotificationModal';

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    X: (props: any) => React.createElement(View, props),
  };
});

const getTestInstanceText = (node: any): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getTestInstanceText).join('');
  if (node.children) return node.children.map(getTestInstanceText).join('');
  if (node.props && node.props.children) return getTestInstanceText(node.props.children);
  return '';
};

describe('NotificationModal', () => {
  const mockInvitations: Invitation[] = [
    {
      requestId: 1,
      senderNickname: '홍길동',
      planName: '제주도 여행',
    },
  ];

  it('renders correctly when not visible', () => {
    let component: any;
    act(() => {
      component = renderer.create(
        <NotificationModal
          visible={false}
          onClose={jest.fn()}
          invitations={mockInvitations}
          onAccept={jest.fn()}
          onReject={jest.fn()}
        />
      );
    });
    expect(component.toJSON()).toBeNull();
  });

  it('renders invitations list when visible and has invitations', () => {
    let component: any;
    act(() => {
      component = renderer.create(
        <NotificationModal
          visible={true}
          onClose={jest.fn()}
          invitations={mockInvitations}
          onAccept={jest.fn()}
          onReject={jest.fn()}
        />
      );
    });
    const json = component.toJSON();
    expect(json).toBeDefined();
    
    // Check if senderNickname and planName are rendered
    const textJoined = getTestInstanceText(component.root);
    expect(textJoined).toContain('홍길동');
    expect(textJoined).toContain('제주도 여행');
    // type이 없으면 기존과 동일하게 초대로 본다
    expect(textJoined).toContain('일정에 초대했습니다.');
  });

  it('renders edit-access wording for REQUEST type', () => {
    let component: any;
    act(() => {
      component = renderer.create(
        <NotificationModal
          visible={true}
          onClose={jest.fn()}
          invitations={[{ ...mockInvitations[0], type: 'REQUEST' }]}
          onAccept={jest.fn()}
          onReject={jest.fn()}
        />
      );
    });
    const textJoined = getTestInstanceText(component.root);
    expect(textJoined).toContain('일정의 편집 권한을 요청했습니다.');
    expect(textJoined).not.toContain('초대했습니다.');
  });

  it('renders empty message when no invitations are present', () => {
    let component: any;
    act(() => {
      component = renderer.create(
        <NotificationModal
          visible={true}
          onClose={jest.fn()}
          invitations={[]}
          onAccept={jest.fn()}
          onReject={jest.fn()}
        />
      );
    });
    const textJoined = getTestInstanceText(component.root);
    expect(textJoined).toContain('새로운 알림이 없습니다.');
  });

  it('calls onClose when close button is pressed', () => {
    const onCloseMock = jest.fn();
    let component: any;
    act(() => {
      component = renderer.create(
        <NotificationModal
          visible={true}
          onClose={onCloseMock}
          invitations={mockInvitations}
          onAccept={jest.fn()}
          onReject={jest.fn()}
        />
      );
    });
    
    const touchables = component.root.findAllByType(TouchableOpacity);
    const closeButton = touchables.find((t: any) => {
      try {
        t.findByType(Text);
        return false;
      } catch {
        return true;
      }
    });

    expect(closeButton).toBeDefined();
    act(() => {
      closeButton?.props.onPress();
    });
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onAccept and onReject with the correct requestId', () => {
    const onAcceptMock = jest.fn();
    const onRejectMock = jest.fn();
    let component: any;
    act(() => {
      component = renderer.create(
        <NotificationModal
          visible={true}
          onClose={jest.fn()}
          invitations={mockInvitations}
          onAccept={onAcceptMock}
          onReject={onRejectMock}
        />
      );
    });

    const touchables = component.root.findAllByType(TouchableOpacity);
    
    const rejectButton = touchables.find((t: any) => {
      try {
        const text = t.findByType(Text);
        return getTestInstanceText(text) === '거절';
      } catch {
        return false;
      }
    });
    const acceptButton = touchables.find((t: any) => {
      try {
        const text = t.findByType(Text);
        return getTestInstanceText(text) === '수락';
      } catch {
        return false;
      }
    });

    expect(rejectButton).toBeDefined();
    expect(acceptButton).toBeDefined();

    act(() => {
      rejectButton?.props.onPress();
    });
    expect(onRejectMock).toHaveBeenCalledWith(1);

    act(() => {
      acceptButton?.props.onPress();
    });
    expect(onAcceptMock).toHaveBeenCalledWith(1);
  });
});
