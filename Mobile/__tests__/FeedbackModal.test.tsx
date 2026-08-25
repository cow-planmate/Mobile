import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Modal, TextInput, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import FeedbackModal from '../src/features/auth/components/FeedbackModal';
import { submitFeedback } from '../src/api/feedback';

jest.mock('../src/api/feedback', () => ({
  FEEDBACK_EMPTY_MESSAGE: '피드백 내용을 입력해 주세요.',
  submitFeedback: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { X: (props: unknown) => React.createElement(View, props) };
});

const mockedSubmitFeedback = submitFeedback as jest.MockedFunction<
  typeof submitFeedback
>;

function findByLabel(component: renderer.ReactTestRenderer, label: string) {
  return component.root.find(
    node => node.props.accessibilityLabel === label,
  );
}

describe('FeedbackModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks blank feedback before making a request', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FeedbackModal visible onClose={jest.fn()} />,
      );
    });

    act(() => {
      findByLabel(component!, '피드백 내용').props.onChangeText('  \n ');
      findByLabel(component!, '피드백 제출').props.onPress();
    });

    expect(mockedSubmitFeedback).not.toHaveBeenCalled();
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ text1: '피드백 내용을 입력해 주세요.' }),
    );
  });

  it('closes and clears the input after a successful submission', async () => {
    const onClose = jest.fn();
    mockedSubmitFeedback.mockResolvedValueOnce(undefined);
    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(<FeedbackModal visible onClose={onClose} />);
    });

    await act(async () => {
      findByLabel(component!, '피드백 내용').props.onChangeText('개선 의견');
    });
    await act(async () => {
      await findByLabel(component!, '피드백 제출').props.onPress();
    });

    expect(mockedSubmitFeedback).toHaveBeenCalledWith('개선 의견');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(component!.root.findByType(TextInput).props.value).toBe('');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' }),
    );
  });

  it('preserves content and prevents duplicate requests when submission fails', async () => {
    let rejectRequest: ((error: Error) => void) | undefined;
    mockedSubmitFeedback.mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          rejectRequest = reject;
        }),
    );
    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(
        <FeedbackModal visible onClose={jest.fn()} />,
      );
    });

    act(() => {
      findByLabel(component!, '피드백 내용').props.onChangeText('전송 실패 내용');
    });
    act(() => {
      const submitButton = findByLabel(component!, '피드백 제출');
      submitButton.props.onPress();
      submitButton.props.onPress();
    });

    expect(mockedSubmitFeedback).toHaveBeenCalledTimes(1);
    expect(
      component!.root.findAllByType(TouchableOpacity).find(
        button => button.props.accessibilityLabel === '피드백 제출',
      )?.props.disabled,
    ).toBe(true);

    await act(async () => {
      rejectRequest?.(new Error('network failure'));
    });

    expect(component!.root.findByType(TextInput).props.value).toBe(
      '전송 실패 내용',
    );
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' }),
    );
  });

  it('제출 중에는 배경 탭과 Android 뒤로가기로 닫히지 않는다', async () => {
    let resolveRequest: (() => void) | undefined;
    mockedSubmitFeedback.mockImplementationOnce(
      () => new Promise<void>(resolve => {
        resolveRequest = resolve;
      }),
    );
    const onClose = jest.fn();
    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(<FeedbackModal visible onClose={onClose} />);
    });

    act(() => {
      findByLabel(component!, '피드백 내용').props.onChangeText('전송 중 내용');
    });
    act(() => {
      findByLabel(component!, '피드백 제출').props.onPress();
    });
    act(() => {
      component!.root.findByType(Modal).props.onRequestClose();
      findByLabel(component!, '피드백 모달 닫기 영역').props.onPress();
    });

    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      resolveRequest?.();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
