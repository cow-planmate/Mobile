import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import DatePicker from 'react-native-date-picker';
import PopupModal from '../../../../components/common/PopupModal';
import PlaceEditModal from '../PlaceEditModal';
import { timeToDate } from '../../../../utils/timeUtils';

const mockShowAlert = jest.fn();
jest.mock('../../../../contexts/AlertContext', () => ({ useAlert: () => ({ showAlert: mockShowAlert }) }));
jest.mock('../../../../components/common/PopupModal', () => ({ children, footer }: any) => <>{children}{footer}</>);
jest.mock('../../../../components/common/FallbackImage', () => () => null);
jest.mock('react-native-date-picker', () => () => null);

const place = { id: '1', name: '장소', memo: '', startTime: '09:00:00', endTime: '10:00:00', categoryId: 0 };
const render = () => {
  const onSave = jest.fn();
  const onClose = jest.fn();
  let tree: renderer.ReactTestRenderer;
  act(() => { tree = renderer.create(<PlaceEditModal visible place={place} dayStartTime="09:00" dayEndTime="18:00" onSave={onSave} onClose={onClose} onDelete={jest.fn()} />); });
  return { tree: tree!, onSave, onClose };
};
beforeEach(() => jest.clearAllMocks());

it('범위 밖 시간은 보정값을 확인한 뒤에만 저장한다', () => {
  const { tree, onSave } = render();
  act(() => tree.root.findAllByType(DatePicker)[0].props.onConfirm(timeToDate('08:00')));
  act(() => tree.root.findByProps({ accessibilityLabel: '저장' }).props.onPress());
  expect(onSave).not.toHaveBeenCalled();
  const alert = mockShowAlert.mock.calls[0][0];
  expect(alert.message).toContain('09:00–11:00');
  act(() => alert.buttons[1].onPress());
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ startTime: '09:00:00', endTime: '11:00:00' }));
  act(() => tree.unmount());
});

it('종료가 시작보다 빠르면 저장을 막는다', () => {
  const { tree, onSave } = render();
  act(() => tree.root.findAllByType(DatePicker)[1].props.onConfirm(timeToDate('08:00')));
  act(() => tree.root.findByProps({ accessibilityLabel: '저장' }).props.onPress());
  expect(onSave).not.toHaveBeenCalled();
  expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ title: '시간 설정 오류' }));
  act(() => tree.unmount());
});

it('실제로 변경한 메모만 닫기 전에 보호한다', () => {
  const { tree, onClose } = render();
  act(() => tree.root.findByType(PopupModal).props.onClose());
  expect(onClose).toHaveBeenCalledTimes(1);
  act(() => tree.root.findByType(TextInput).props.onChangeText('메모'));
  act(() => tree.root.findByType(PopupModal).props.onClose());
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ title: '변경사항 취소' }));
  act(() => tree.root.findByType(TextInput).props.onChangeText(''));
  act(() => tree.root.findByType(PopupModal).props.onClose());
  expect(onClose).toHaveBeenCalledTimes(2);
  act(() => tree.unmount());
});
