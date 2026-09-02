import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import PopupModal from './PopupModal';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

type UpdateValueModalProps = {
  visible: boolean;
  title: string;
  label: string;
  initialValue: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address';

  maxLength?: number;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

export default function UpdateValueModal({
  visible,
  title,
  label,
  initialValue,
  keyboardType = 'default',
  maxLength,
  onClose,
  onConfirm,
}: UpdateValueModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible, initialValue]);

  return (
    <PopupModal
      visible={visible}
      title={title}
      onClose={onClose}
      onDone={() => onConfirm(value)}
      doneLabel="확인"
    >
      <View style={styles.group}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoFocus
          placeholderTextColor={tokens.colors.textTertiary}
        />
      </View>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  group: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  label: {
    marginBottom: normalize(6),
    fontSize: normalize(12),
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textTertiary,
  },
  input: {
    height: normalize(46),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: normalize(12),
    fontSize: normalize(14.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.text,
  },
});
