import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';

import { styles } from './SelectionModal.styles';

export type OptionType = {
  label: string;
  icon: string;
};

type SelectionModalProps = {
  visible: boolean;
  title: string;
  options: OptionType[];
  onClose: () => void;
  onSelect: (option: string) => void;
  currentValue: string;
};

export default function SelectionModal({
  visible,
  title,
  options,
  onClose,
  onSelect,
  currentValue,
}: SelectionModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.centeredView} onPress={onClose}>
        <Pressable style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {options.map(option => {
              const isSelected = currentValue === option.label;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => onSelect(option.label)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
