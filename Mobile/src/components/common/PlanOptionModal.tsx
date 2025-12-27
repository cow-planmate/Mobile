import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  white: '#FFFFFF',
  border: '#E5E5EA',
  danger: '#FF3B30',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

type PlanOptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onRename: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
};

const PlanOptionModal = ({
  visible,
  onClose,
  onRename,
  onEdit,
  onDelete,
  onShare,
}: PlanOptionModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.handle} />

              <TouchableOpacity style={styles.optionItem} onPress={onRename}>
                <Icon
                  name="edit"
                  size={24}
                  color={COLORS.text}
                  style={styles.icon}
                />
                <Text style={styles.optionText}>제목 바꾸기</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem} onPress={onEdit}>
                <Icon
                  name="tune"
                  size={24}
                  color={COLORS.text}
                  style={styles.icon}
                />
                <Text style={styles.optionText}>수정하기</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem} onPress={onShare}>
                <Icon
                  name="share"
                  size={24}
                  color={COLORS.text}
                  style={styles.icon}
                />
                <Text style={styles.optionText}>공유 및 초대</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.optionItem} onPress={onDelete}>
                <Icon
                  name="delete"
                  size={24}
                  color={COLORS.danger}
                  style={styles.icon}
                />
                <Text style={[styles.optionText, styles.dangerText]}>
                  삭제하기
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  icon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  dangerText: {
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
});

export default PlanOptionModal;
