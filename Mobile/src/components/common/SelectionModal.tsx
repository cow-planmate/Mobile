// src/components/common/SelectionModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';

const COLORS = {
  primary: '#007AFF',
  text: '#1C1C1E',
  white: '#FFFFFF',
  border: '#E5E5EA',
  lightGray: '#F0F0F0',
  placeholder: '#8E8E93',
};

// 옵션이 아이콘을 포함하도록 타입 정의
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

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginLeft: 24, // X 버튼 너비만큼 왼쪽으로 밀어 중앙 정렬
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.placeholder,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  optionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
