import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { styles } from './MenuModal.styles';

export type MenuOption = {
  label: string;
  action: string;
  isDestructive?: boolean;
};

type MenuModalProps = {
  visible: boolean;
  title: string;
  options: MenuOption[];
  onClose: () => void;
  onSelect: (action: string) => void;
};

export default function MenuModal({
  visible,
  title,
  options,
  onClose,
  onSelect,
}: MenuModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.centeredView} onPress={onClose}>
        <Pressable style={styles.modalView} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.optionRow,
                  index !== options.length - 1 && styles.borderBottom,
                ]}
                onPress={() => onSelect(option.action)}
              >
                <Text
                  style={[
                    styles.optionText,
                    option.isDestructive && styles.destructiveText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
