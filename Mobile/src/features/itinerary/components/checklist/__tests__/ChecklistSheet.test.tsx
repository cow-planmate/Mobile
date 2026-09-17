import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Toast from 'react-native-toast-message';
import { RefreshControl, TouchableOpacity } from 'react-native';
import ChecklistSheet from '../ChecklistSheet';

const mockRefetch = jest.fn(() => Promise.resolve([]));
const mockReorderMutate = jest.fn();
const mockDeleteMutate = jest.fn();
const mockCreateMutate = jest.fn();
const mockEditMutate = jest.fn();
const mockShowAlert = jest.fn();

jest.mock('../../../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: mockShowAlert }),
}));

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
  useCreateChecklistItem: () => ({
    isPending: false,
    mutate: mockCreateMutate,
  }),
  useDeleteChecklistItem: () => ({
    isPending: false,
    mutate: mockDeleteMutate,
  }),
  useEditChecklistItemContent: () => ({
    isPending: false,
    mutate: mockEditMutate,
  }),
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
        .findByProps({ accessibilityLabel: '충전기 순서 변경' })
        .props.onAccessibilityAction({
          nativeEvent: { actionName: 'decrement' },
        });
    });

    expect(mockReorderMutate).toHaveBeenCalledWith(
      [2, 1, 3],
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('목록을 당겨 두 범위 목록을 다시 조회한다', async () => {
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <ChecklistSheet visible onClose={jest.fn()} planId="plan-id" />,
      );
    });

    await act(async () => {
      component!.root.findByType(RefreshControl).props.onRefresh();
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
        .findByProps({ accessibilityLabel: '충전기 순서 변경' })
        .props.onAccessibilityAction({
          nativeEvent: { actionName: 'decrement' },
        });
    });

    const options = mockReorderMutate.mock.calls[0][1];
    options.onError(new Error('request failed'));

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: '순서 변경에 실패했습니다.',
      position: 'bottom',
    });
  });

  it('삭제는 확인을 받은 뒤에만 실행한다', () => {
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <ChecklistSheet visible onClose={jest.fn()} planId="plan-id" />,
      );
    });

    act(() => {
      component!.root
        .findByProps({ accessibilityLabel: '충전기 삭제' })
        .props.onPress();
    });

    expect(mockDeleteMutate).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledTimes(1);

    const confirm = mockShowAlert.mock.calls[0][0].buttons.find(
      (b: any) => b.style === 'destructive',
    );
    act(() => confirm.onPress());

    expect(mockDeleteMutate).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });
  it('카드의 수정 버튼으로 고쳐 저장하고 탭을 바꾸면 수정을 접는다', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <ChecklistSheet visible onClose={jest.fn()} planId="plan-id" />,
      );
    });

    // 더보기를 거치지 않고 두 버튼이 카드에 나란히 보인다.
    expect(
      component!.root.findByProps({ accessibilityLabel: '충전기 수정' }),
    ).toBeTruthy();
    expect(
      component!.root.findByProps({ accessibilityLabel: '충전기 삭제' }),
    ).toBeTruthy();

    act(() => {
      component!.root
        .findByProps({ accessibilityLabel: '충전기 수정' })
        .props.onPress();
    });
    act(() => {
      component!.root
        .findByProps({ accessibilityLabel: '준비물 내용 수정' })
        .props.onChangeText('충전 케이블');
    });
    act(() => {
      component!.root
        .findByProps({ accessibilityLabel: '수정 저장' })
        .props.onPress();
    });

    expect(mockEditMutate).toHaveBeenCalledWith(
      { itemId: 2, content: '충전 케이블' },
      expect.any(Object),
    );

    act(() => {
      mockEditMutate.mock.calls[0][1].onSuccess();
    });

    // 고치던 중에 탭을 바꾸면 입력칸을 접고 그 탭의 목록으로 넘어간다.
    act(() => {
      component!.root
        .findByProps({ accessibilityLabel: '충전기 수정' })
        .props.onPress();
    });
    act(() => {
      component!.root
        .findAllByType(TouchableOpacity)
        .filter(node => node.props.accessibilityRole === 'tab')[1]
        .props.onPress();
    });

    expect(
      component!.root.findAllByProps({ accessibilityLabel: '준비물 내용 수정' }),
    ).toHaveLength(0);
    expect(
      component!.root.findByProps({
        accessibilityLabel: '개인 준비물 항목 추가',
      }),
    ).toBeTruthy();
  });

  it('빈 입력은 전송하지 않고 추가 실패 시 입력을 유지한다', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <ChecklistSheet visible onClose={jest.fn()} planId="plan-id" />,
      );
    });
    const input = () =>
      component!.root.findByProps({
        accessibilityLabel: '공동 준비물 항목 추가',
      });
    act(() => {
      input().props.onChangeText('   ');
    });
    act(() => {
      input().props.onSubmitEditing();
    });
    expect(mockCreateMutate).not.toHaveBeenCalled();
    act(() => {
      input().props.onChangeText(' 보조배터리 ');
    });
    act(() => {
      input().props.onSubmitEditing();
    });
    expect(mockCreateMutate).toHaveBeenCalledWith(
      '보조배터리',
      expect.any(Object),
    );
    act(() => {
      mockCreateMutate.mock.calls[0][1].onError(new Error('offline'));
    });
    expect(input().props.value).toBe(' 보조배터리 ');
    act(() => {
      mockCreateMutate.mock.calls[0][1].onSuccess();
    });
    expect(input().props.value).toBe('');
  });
});
