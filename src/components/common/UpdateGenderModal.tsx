import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PopupModal from './PopupModal';
import { normalize } from '../../utils/normalize';
import { tokens } from '../../theme/tokens';

type UpdateGenderModalProps = {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

const OPTIONS = ['남자', '여자'];

export default function UpdateGenderModal({
  visible,
  initialValue,
  onClose,
  onConfirm,
}: UpdateGenderModalProps) {
  const [gender, setGender] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setGender(initialValue);
    }
  }, [visible, initialValue]);

  return (
    <PopupModal
      visible={visible}
      title="성별 변경"
      onClose={onClose}
      onDone={() => onConfirm(gender)}
      doneLabel="확인"
    >
      <View style={styles.row}>
        {OPTIONS.map(option => {
          const selected = gender === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.option, selected && styles.optionOn]}
              onPress={() => setGender(option)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option}
            >
              <Text style={[styles.optionText, selected && styles.optionTextOn]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: normalize(10),
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(4),
  },
  option: {
    flex: 1,
    height: normalize(48),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionOn: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  optionText: {
    fontSize: normalize(14),
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.textSecondary,
  },
  optionTextOn: {
    color: tokens.colors.white,
    fontFamily: tokens.fontFamily.bold,
  },
});
