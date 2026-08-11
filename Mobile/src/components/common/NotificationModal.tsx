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
import { X } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import {
  CollaborationRequestType,
  describeCollaborationRequest,
} from '../../utils/collaborationRequest';

export interface Invitation {
  requestId: number;
  senderNickname: string;
  planName: string;
  /** INVITE(초대받음) / REQUEST(편집 권한 요청받음). 없으면 초대로 본다. */
  type?: CollaborationRequestType;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  invitations: Invitation[];
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

const COLORS = theme.colors;
const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

const NotificationModal = ({
  visible,
  onClose,
  invitations = [],
  onAccept,
  onReject,
}: NotificationModalProps) => {
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
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <X size={20} color="#9CA3AF" strokeWidth={1.5} />
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
                      {describeCollaborationRequest(invite.type)}
                    </Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => onReject(invite.requestId)}
                      accessibilityRole="button"
                      accessibilityLabel={`${invite.senderNickname}님의 요청 거절`}
                    >
                      <Text style={styles.rejectButtonText}>거절</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => onAccept(invite.requestId)}
                      accessibilityRole="button"
                      accessibilityLabel={`${invite.senderNickname}님의 요청 수락`}
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

export default React.memo(NotificationModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)', // 0.45 백드롭 투명도 통일
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // 둥글기 20 통일
    padding: 24,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6', // 둥근 회색 닫기 버튼 통일
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  itemContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  textContainer: {
    marginBottom: 12,
  },
  inviteText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  highlight: {
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.primary,
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
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rejectButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
});
