import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Toast from 'react-native-toast-message';
import ChecklistSheet from '../ChecklistSheet';

const mockRefetch = jest.fn(() => Promise.resolve([]));
const mockReorderMutate = jest.fn();

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = () => ReactModule.createElement(View);

  return {
    Check: Icon,
    CheckCircle2: Icon,
    ChevronDown: Icon,
    ChevronUp: Icon,
    Circle: Icon,
    Pencil: Icon,
    RefreshCw: Icon,
    Trash2: Icon,
    X: Icon,
  };
});

jest.mock('../../../hooks/useChecklistQueries', () => ({
  getChecklistErrorMessage: () => '순서 변경에 실패했습니다.',
  useCreateChecklistItem: () => ({ isPending: false, mutate: jest.fn() }),
  useDeleteChecklistItem: () => ({ isPending: false, mutate: jest.fn() }),
  useEditChecklistItemContent: () => ({ isPending: false, mutate: jest.fn() }),
  usePlanChecklists: () => ({
    sharedItems: [
      { itemId: 1, content: '여권', isChecked: false, sortOrder: 0 },
      { itemId: 2, content: '충전기', isChecked: false, sortOrder: 1 },
      { itemId: 3, content: '상비약', isChecked: false, sortOrder: 2 },
    ],
    personalItems: [],
    counts: {
      shared: { done: 0, total: 3 },
      personal: { done: 0, total: 0 },
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mockRefetch,
  }),
  useReorderChecklistItems: () => ({
    isPending: false,
    mutate: mockReorderMutate,
  }),
  useToggleChecklistItem: () => ({ isPending: false, mutate: jest.fn() }),
}));

describe('ChecklistSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('항목을 위로 이동할 때 전체 ID 순서를 전송한다', () => {
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <ChecklistSheet visible onClose={jest.fn()} planId="plan-id" />,
      );
    });

    act(() => {
      component!.root
        .findByProps({ accessibilityLabel: '충전기 위로 이동' })
        .props.onPress();
    });

    expect(mockReorderMutate).toHaveBeenCalledWith(
      [2, 1, 3],
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('새로고침 버튼으로 두 범위 목록을 다시 조회한다', () => {
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <ChecklistSheet visible onClose={jest.fn()} planId="plan-id" />,
      );
    });

    act(() => {
      component!.root
        .findByProps({ accessibilityLabel: '체크리스트 새로고침' })
        .props.onPress();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('순서 변경 실패를 사용자에게 알린다', () => {
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <ChecklistSheet visible onClose={jest.fn()} planId="plan-id" />,
      );
    });

    act(() => {
      component!.root
        .findByProps({ accessibilityLabel: '충전기 위로 이동' })
        .props.onPress();
    });

    const options = mockReorderMutate.mock.calls[0][1];
    options.onError(new Error('request failed'));

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: '순서 변경에 실패했습니다.',
      position: 'bottom',
    });
  });
});
