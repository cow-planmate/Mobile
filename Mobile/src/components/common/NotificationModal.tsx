import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { theme } from '../../theme/theme';

export interface Invitation {
  requestId: number;
  senderNickname: string;
  planName: string;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  invitations: Invitation[];
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

const COLORS = theme.colors;

export default function NotificationModal({
  visible,
  onClose,
  invitations,
  onAccept,
  onReject,
}: NotificationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>알림</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {invitations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>새로운 알림이 없습니다.</Text>
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              {invitations.map(invite => (
                <View key={invite.requestId} style={styles.itemContainer}>
                  <View style={styles.textContainer}>
                    <Text style={styles.inviteText}>
                      <Text style={styles.highlight}>
                        {invite.senderNickname}
                      </Text>
                      님이{' '}
                      <Text style={styles.highlight}>{invite.planName}</Text>{' '}
                      일정에 초대했습니다.
                    </Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => onReject(invite.requestId)}
                    >
                      <Text style={styles.rejectButtonText}>거절</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => onAccept(invite.requestId)}
                    >
                      <Text style={styles.acceptButtonText}>수락</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '70%',
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
    padding: 4,
  },
  listContainer: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  itemContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  textContainer: {
    marginBottom: 12,
  },
  inviteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: 'bold',
    color: COLORS.primary || '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.primary || '#007AFF',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#F5F5F5',
  },
  rejectButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
});
