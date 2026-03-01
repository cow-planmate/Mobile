import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';

import { styles, COLORS } from './ShareModal.styles';

type ShareModalProps = {
  visible: boolean;
  onClose: () => void;
  planId?: number;
};

interface SimpleEditorVO {
  userId: number;
  nickName: string;
}

export default function ShareModal({
  visible,
  onClose,
  planId,
}: ShareModalProps) {
  const [nickname, setNickname] = useState('');
  const [editors, setEditors] = useState<SimpleEditorVO[]>([]);
  const shareUrl = `https://www.planmate.site/plan/${planId}`;

  const fetchEditors = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/plan/${planId}/editors`);
      if (response.data && response.data.simpleEditorVOs) {
        setEditors(response.data.simpleEditorVOs);
      }
    } catch (error) {
      console.error('Failed to fetch editors:', error);
    }
  }, [planId]);

  useEffect(() => {
    if (visible && planId) {
      fetchEditors();
    }
  }, [visible, planId, fetchEditors]);

  const handleCopy = () => {
    Alert.alert('복사 완료', '공유 URL이 클립보드에 복사되었습니다.');
  };

  const handleInvite = async () => {
    if (!nickname) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }
    if (!planId) return;

    try {
      await axios.post(`${API_URL}/api/plan/${planId}/invite`, {
        receiverNickname: nickname,
      });
      Alert.alert('초대 완료', `${nickname}님을 일정에 초대했습니다.`);
      setNickname('');
    } catch (error: any) {
      console.error('Invite error:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || '초대에 실패했습니다.',
      );
    }
  };

  const handleRemoveEditor = async (userId: number) => {
    if (!planId) return;
    try {
      await axios.delete(`${API_URL}/api/plan/${planId}/editors/${userId}`);
      Alert.alert('성공', '편집 권한이 회수되었습니다.');
      fetchEditors();
    } catch (error: any) {
      Alert.alert('오류', '편집 권한 회수에 실패했습니다.');
    }
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
            {editors.length === 0 ? (
              <Text style={styles.emptyUserText}>
                편집 권한을 가진 사용자가 없습니다
              </Text>
            ) : (
              <FlatList
                data={editors}
                keyExtractor={item => String(item.userId)}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: COLORS.text, fontSize: 14 }}>
                      {item.nickName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveEditor(item.userId)}
                    >
                      <Text style={{ color: COLORS.error, fontSize: 12 }}>
                        내보내기
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
              />
            )}
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
