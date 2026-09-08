import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import UpdatePasswordModal from '../UpdatePasswordModal';
import UpdateThemeModal from '../UpdateThemeModal';
import PlanInfoModal from '../PlanInfoModal';
import ThemeSelector from '../ThemeSelector';

jest.mock('../../../contexts/AlertContext', () => ({
  useAlert: () => ({ showAlert: jest.fn() }),
}));
const mockQueryClient = { getQueryData: () => ({ preferredThemes: [] }) };
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));
jest.mock('../ThemeSelector', () => ({
  __esModule: true,
  default: () => null,
  CATEGORY_MAP: {
    ATTRACTION: { id: 0 },
    ACCOMMODATION: { id: 1 },
    RESTAURANT: { id: 2 },
  },
}));

describe('profile editing modals', () => {
  it('비밀번호 불일치 시 저장을 막고 저장 실패 시 입력을 유지한다', async () => {
    const onConfirm = jest.fn().mockRejectedValue(new Error('network'));
    const onClose = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <UpdatePasswordModal visible onConfirm={onConfirm} onClose={onClose} />,
      );
    });
    const fields = tree!.root.findAllByType(TextInput);
    act(() => {
      fields[0].props.onChangeText('OldPass1!');
      fields[1].props.onChangeText('NewPass2!');
      fields[2].props.onChangeText('different');
    });
    expect(
      tree!.root.findByProps({ accessibilityLabel: '비밀번호 변경' }).props
        .disabled,
    ).toBe(true);
    act(() => fields[2].props.onChangeText('NewPass2!'));
    expect(
      tree!.root.findByProps({ accessibilityLabel: '비밀번호 변경' }).props
        .disabled,
    ).toBe(false);
    await act(async () => {
      await tree!.root
        .findByProps({ accessibilityLabel: '비밀번호 변경' })
        .props.onPress();
    });
    expect(onConfirm).toHaveBeenCalledWith('OldPass1!', 'NewPass2!');
    expect(onClose).not.toHaveBeenCalled();
    expect(tree!.root.findAllByType(TextInput)[1].props.value).toBe(
      'NewPass2!',
    );
    act(() => tree!.unmount());
  });

  it('선호 테마를 열면 요약 대신 선택 단계로 진입한다', async () => {
    const onClose = jest.fn();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <UpdateThemeModal visible onClose={onClose} onConfirm={jest.fn()} />,
      );
    });
    const selector = tree!.root.findByType(ThemeSelector);
    expect(selector.props.visible).toBe(true);
    act(() => selector.props.onClose());
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });

  it('일정 정보에서 이름과 기간 편집을 실행한다', () => {
    const onEditName = jest.fn();
    const onEditPeriod = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PlanInfoModal
          visible
          onClose={jest.fn()}
          planName="제주 여행"
          destination="제주"
          adultCount={2}
          childCount={0}
          onEditName={onEditName}
          onEditPeriod={onEditPeriod}
        />,
      );
    });
    act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: '이름 편집' })
        .props.onPress();
      tree!.root
        .findByProps({ accessibilityLabel: '기간 편집' })
        .props.onPress();
    });
    expect(onEditName).toHaveBeenCalledTimes(1);
    expect(onEditPeriod).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });
});
