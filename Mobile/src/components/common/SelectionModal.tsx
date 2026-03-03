import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { X, Check } from 'lucide-react-native';

import { styles, COLORS } from './SelectionModal.styles';

export type OptionType = {
  label: string;
  icon: React.ReactNode;
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
            <TouchableOpacity
              style={styles.closeButtonContainer}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color={COLORS.placeholder} strokeWidth={1.5} />
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
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.optionIconContainer,
                      isSelected && styles.optionIconContainerSelected,
                    ]}
                  >
                    {option.icon}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Check size={14} color={COLORS.white} strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
