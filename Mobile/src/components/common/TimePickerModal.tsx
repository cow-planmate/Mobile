
import React from 'react';
import DatePicker from 'react-native-date-picker';

type TimePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate: Date;
};

export default function TimePickerModal({
  visible,
  onClose,
  onConfirm,
  initialDate,
}: TimePickerModalProps) {
  return (
    <DatePicker
      modal
      open={visible}
      date={initialDate}
      mode="time"
      onConfirm={date => {
        onClose();
        onConfirm(date);
      }}
      onCancel={onClose}
      title="시간 선택"
      confirmText="확인"
      cancelText="취소"
    />
  );
}
