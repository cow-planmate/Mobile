// src/components/common/ShareModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const COLORS = {
  primary: '#1344FF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  white: '#FFFFFF',
  border: '#E5E5EA',
  lightGray: '#F0F2F5',
  gray: '#E5E5EA',
};

type ShareModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ShareModal({ visible, onClose }: ShareModalProps) {
  const [nickname, setNickname] = useState('');
  const shareUrl = 'https://www.planmate.site/';

  const handleCopy = () => {
    Alert.alert('복사 완료', '공유 URL이 클립보드에 복사되었습니다.');
  };

  const handleInvite = () => {
    if (!nickname) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }
    Alert.alert('초대 완료', `${nickname}님을 일정에 초대했습니다.`);
    setNickname('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalView} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>공유 및 초대</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>완성본 공유 URL</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={shareUrl}
                editable={false}
              />
              <TouchableOpacity
                style={[styles.button, styles.copyButton]}
                onPress={handleCopy}
              >
                <Text style={styles.copyButtonText}>복사</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>편집 권한이 있는 사용자</Text>
            <Text style={styles.emptyUserText}>
              편집 권한을 가진 사용자가 없습니다
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>일정 편집 초대</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="닉네임"
                value={nickname}
                onChangeText={setNickname}
                placeholderTextColor={COLORS.placeholder}
              />
              <TouchableOpacity
                style={[styles.button, styles.inviteButton]}
                onPress={handleInvite}
              >
                <Text style={styles.inviteButtonText}>초대</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.placeholder,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.placeholder,
  },
  button: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  copyButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copyButtonText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 14,
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
  },
  inviteButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyUserText: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
});
